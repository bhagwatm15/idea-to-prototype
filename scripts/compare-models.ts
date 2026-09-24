/**
 * Model comparison harness for the spec and prototype steps.
 *
 * Runs the live app's own prompts (read straight out of the API route files,
 * so they can't drift) against each configured model, and writes everything
 * under results/. Nothing here is imported by the app.
 *
 *   npm run compare-models -- --step spec --ideas 1 --runs 1 --out results/smoke   # smoke test
 *   npm run compare-models -- --step all                                           # full run
 *   npm run compare-models -- --step all --retry-errors                            # re-run only failed or missing runs
 *   npm run compare-models -- --step report                                        # rebuild runs.csv + review.html from runs.json
 *
 * Steps: spec | code | all | report. `code` reads the specs recorded by a
 * previous `spec` run in the same --out directory.
 */
import Anthropic from "@anthropic-ai/sdk";
import { transform } from "esbuild";
import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import type { Screen, Spec } from "../lib/types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface ModelConfig {
  id: string;
  /** Short name used in file names. The review page never shows it. */
  slug: string;
  /** USD per million tokens. Fill in from https://www.anthropic.com/pricing. */
  pricePerMTok: { input: number | null; output: number | null };
}

// IDs checked against platform.claude.com/docs/en/about-claude/models/overview on 2026-09-24.
const MODELS: ModelConfig[] = [
  { id: "claude-sonnet-5", slug: "sonnet", pricePerMTok: { input: null, output: null } },
  { id: "claude-haiku-4-5-20251001", slug: "haiku", pricePerMTok: { input: null, output: null } },
];

const CONFIG = {
  models: MODELS,
  runsPerModel: 2,
  /** The code step uses this model's first valid spec per idea as its fixed input. */
  codeStepSpecModel: "claude-sonnet-5",
  /** The idea form's defaults when the user leaves the optional fields blank. */
  specInputs: { platform: "web", mustHaveFeature: "", tone: "" },
  /** Retries for 429 / 5xx / connection errors. Latency is measured on the successful attempt only. */
  maxAttempts: 4,
};

const IDEAS = [
  "A dashboard that helps PMs re-orient when switching between projects, showing the last decision made, blockers, and who's waiting on what.",
  "A tool that turns rough status bullets into a clean update, one version for execs and one for the team.",
  "A decision log that tracks what was decided, why, and when.",
  "An app that plans a week of meals around what's already in the fridge.",
  "A tool for splitting shared trip expenses without a spreadsheet.",
];

// ---------------------------------------------------------------------------
// Prompts and checks, taken from the live app
// ---------------------------------------------------------------------------

// fileURLToPath, not URL.pathname: on Windows the latter gives "/C:/..." and resolves to "C:\C:\...".
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPEC_ROUTE = path.join(ROOT, "app/api/generate-spec/route.ts");
const PROTOTYPE_ROUTE = path.join(ROOT, "app/api/generate-prototype/route.ts");

// Same key file the app uses; must be loaded before the client is created.
const ENV_FILE = path.join(ROOT, ".env.local");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

/** Explain why no key was found instead of letting every run fail with an auth error. */
function missingKeyMessage(): string | null {
  if (process.env.ANTHROPIC_API_KEY?.trim() || process.env.ANTHROPIC_AUTH_TOKEN?.trim()) return null;
  if (!existsSync(ENV_FILE)) {
    const hint = existsSync(`${ENV_FILE}.txt`) ? ` Found ${ENV_FILE}.txt instead; rename it to drop ".txt".` : "";
    return `ANTHROPIC_API_KEY is not set and ${ENV_FILE} does not exist.${hint}`;
  }
  const bytes = readFileSync(ENV_FILE);
  if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)) {
    return `${ENV_FILE} is saved as UTF-16, which Node can't read. Re-save it as UTF-8 or ASCII.`;
  }
  return `${ENV_FILE} exists but has no ANTHROPIC_API_KEY=... line.`;
}

interface RouteCall {
  buildPrompt: (...args: string[]) => string;
  maxTokens: number;
}

/**
 * Pull the `const prompt = `...`` template and max_tokens out of a route file
 * and turn the template into a function of the named variables. If the route
 * starts interpolating a variable not listed here, building the prompt throws.
 */
function loadRouteCall(file: string, vars: string[]): RouteCall {
  const src = readFileSync(file, "utf8");
  const template = src.match(/const prompt = `([\s\S]*?)`;/)?.[1];
  const maxTokens = Number(src.match(/max_tokens:\s*(\d+)/)?.[1]);
  if (!template || !maxTokens) {
    throw new Error(`Couldn't find the prompt template or max_tokens in ${file}`);
  }
  const buildPrompt = new Function(...vars, `return \`${template}\`;`) as RouteCall["buildPrompt"];
  return { buildPrompt, maxTokens };
}

const specCall = loadRouteCall(SPEC_ROUTE, ["idea", "platform", "mustHaveFeature", "tone"]);
const prototypeCall = loadRouteCall(PROTOTYPE_ROUTE, ["productName", "tone", "flowText", "screensText"]);

function buildSpecPrompt(idea: string): string {
  const { platform, mustHaveFeature, tone } = CONFIG.specInputs;
  return specCall.buildPrompt(idea, platform, mustHaveFeature, tone);
}

// Same derivations as app/api/generate-prototype/route.ts.
function buildPrototypePrompt(spec: Spec): string {
  const screens: Screen[] = Array.isArray(spec.screens) ? spec.screens : [];
  const coreFlow: string[] = Array.isArray(spec.coreFlow) ? spec.coreFlow : [];
  const screensText = screens.map((s) => `- ${s.name}: ${s.purpose}`).join("\n") || "Not specified.";
  const flowText = coreFlow.map((step, i) => `${i + 1}. ${step}`).join("\n") || "Not specified.";
  return prototypeCall.buildPrompt(spec.productName || "Untitled product", spec.tone || "", flowText, screensText);
}

// Copied from app/api/generate-spec/route.ts (not exported there).
function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

// Copied from app/api/generate-spec/route.ts (not exported there).
function isValidSpec(value: unknown): value is Spec {
  if (!value || typeof value !== "object") return false;
  const spec = value as Record<string, unknown>;
  return (
    typeof spec.productName === "string" &&
    spec.productName.length > 0 &&
    Array.isArray(spec.screens) &&
    spec.screens.length > 0 &&
    typeof spec.tone === "string" &&
    spec.tone.length > 0 &&
    Array.isArray(spec.outOfScope)
  );
}

// Copied from app/api/generate-prototype/route.ts (not exported there).
function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:jsx|tsx|js|javascript|typescript)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

async function compileError(code: string): Promise<string | null> {
  try {
    await transform(code, { loader: "jsx", format: "esm" });
    return null;
  } catch (error) {
    const errors = (error as { errors?: { text: string; location?: { line: number } | null }[] }).errors;
    if (errors?.length) {
      return errors.map((e) => (e.location ? `line ${e.location.line}: ${e.text}` : e.text)).join("; ");
    }
    return String(error);
  }
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

// Retries are done here instead of in the SDK so a retried call's latency
// doesn't include the failed attempts and backoff.
const client = new Anthropic({ maxRetries: 0 });

interface CallResult {
  message: Anthropic.Message;
  latencyMs: number;
  attempts: number;
}

async function callModel(model: string, prompt: string, maxTokens: number): Promise<CallResult> {
  for (let attempt = 1; ; attempt++) {
    const start = performance.now();
    try {
      const message = await client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
      return { message, latencyMs: Math.round(performance.now() - start), attempts: attempt };
    } catch (error) {
      const retryable =
        error instanceof Anthropic.RateLimitError ||
        error instanceof Anthropic.InternalServerError ||
        error instanceof Anthropic.APIConnectionError;
      if (!retryable || attempt >= CONFIG.maxAttempts) throw error;
      const waitMs = 2 ** attempt * 1000;
      console.warn(`  ${model}: ${(error as Error).message} (retrying in ${waitMs / 1000}s)`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

// ---------------------------------------------------------------------------
// Run records
// ---------------------------------------------------------------------------

type Step = "spec" | "code";
const STEP_ORDER: Step[] = ["spec", "code"];

interface RunRecord {
  step: Step;
  model: string;
  ideaId: number;
  idea: string;
  run: number;
  latencyMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  /** From the API response; null only when the call itself failed. */
  stopReason: string | null;
  /** stop_reason === "max_tokens". A truncated run fails its step's check even if the partial output passes. */
  truncated: boolean | null;
  /** Content block types in order, e.g. "text" or "thinking+text". The live app reads content[0] only. */
  contentBlocks: string | null;
  /** Raw check: the text parsed as JSON, regardless of truncation. */
  jsonParsed: boolean | null;
  /** Spec step pass: parsed, passed the app's validation, and not truncated. */
  specValid: boolean | null;
  /** Raw check: contains "export default", regardless of truncation. */
  hasDefaultExport: boolean | null;
  /** Raw check: esbuild compiled it, regardless of truncation. */
  compiles: boolean | null;
  compileError: string | null;
  /** Code step pass: has a default export, compiles, and not truncated. */
  codeValid: boolean | null;
  attempts: number | null;
  error: string | null;
  /** Relative to the results directory. */
  outputFile: string | null;
  /** Code step only: the spec file used as input. */
  inputSpecFile: string | null;
  timestamp: string;
}

function blankRecord(step: Step, model: string, ideaId: number, run: number): RunRecord {
  return {
    step,
    model,
    ideaId,
    idea: IDEAS[ideaId - 1],
    run,
    latencyMs: null,
    inputTokens: null,
    outputTokens: null,
    stopReason: null,
    truncated: null,
    contentBlocks: null,
    jsonParsed: null,
    specValid: null,
    hasDefaultExport: null,
    compiles: null,
    compileError: null,
    codeValid: null,
    attempts: null,
    error: null,
    outputFile: null,
    inputSpecFile: null,
    timestamp: new Date().toISOString(),
  };
}

function recordCall(record: RunRecord, { message, latencyMs, attempts }: CallResult) {
  record.latencyMs = latencyMs;
  record.inputTokens = message.usage.input_tokens;
  record.outputTokens = message.usage.output_tokens;
  record.stopReason = message.stop_reason;
  record.truncated = message.stop_reason === "max_tokens";
  record.contentBlocks = message.content.map((block) => block.type).join("+");
  record.attempts = attempts;
}

function slugFor(model: string): string {
  return CONFIG.models.find((m) => m.id === model)?.slug ?? model;
}

/** Fill in truncated/codeValid for runs recorded before those fields existed. */
function backfillTruncation(r: RunRecord) {
  if (r.truncated !== undefined) return;
  r.truncated = r.stopReason === null ? null : r.stopReason === "max_tokens";
  if (r.truncated && r.specValid) r.specValid = false;
  r.codeValid = r.hasDefaultExport === null ? null : Boolean(r.hasDefaultExport && r.compiles && !r.truncated);
}

class RunStore {
  readonly records: RunRecord[];

  constructor(private readonly file: string) {
    this.records = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
    for (const r of this.records) backfillTruncation(r);
  }

  /** Replace any earlier record for the same step/model/idea/run, then persist. */
  put(record: RunRecord) {
    const i = this.records.findIndex(
      (r) => r.step === record.step && r.model === record.model && r.ideaId === record.ideaId && r.run === record.run
    );
    if (i >= 0) this.records.splice(i, 1, record);
    else this.records.push(record);
    writeFileSync(this.file, JSON.stringify(this.records, null, 2) + "\n");
  }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

/** With --retry-errors, only runs that errored or were never recorded are re-run. */
function shouldRun(store: RunStore, retryErrors: boolean, step: Step, model: string, ideaId: number, run: number) {
  if (!retryErrors) return true;
  const existing = store.records.find(
    (r) => r.step === step && r.model === model && r.ideaId === ideaId && r.run === run
  );
  return !existing || existing.error !== null;
}

async function runSpecStep(outDir: string, store: RunStore, ideaIds: number[], runs: number, retryErrors: boolean) {
  mkdirSync(path.join(outDir, "specs"), { recursive: true });
  for (const ideaId of ideaIds) {
    const prompt = buildSpecPrompt(IDEAS[ideaId - 1]);
    for (const { id: model } of CONFIG.models) {
      for (let run = 1; run <= runs; run++) {
        if (!shouldRun(store, retryErrors, "spec", model, ideaId, run)) continue;
        const record = blankRecord("spec", model, ideaId, run);
        const base = `specs/idea${ideaId}-${slugFor(model)}-run${run}`;
        try {
          const result = await callModel(model, prompt, specCall.maxTokens);
          recordCall(record, result);
          const raw = textOf(result.message);
          let parsed: unknown;
          try {
            parsed = JSON.parse(stripJsonFences(raw));
            record.jsonParsed = true;
          } catch {
            record.jsonParsed = false;
          }
          record.specValid = record.jsonParsed && isValidSpec(parsed) && !record.truncated;
          // Parsed output is saved as JSON; anything else (including partial output) is saved raw.
          record.outputFile = record.jsonParsed ? `${base}.json` : `${base}.txt`;
          writeFileSync(
            path.join(outDir, record.outputFile),
            record.jsonParsed ? JSON.stringify(parsed, null, 2) + "\n" : raw
          );
        } catch (error) {
          record.error = (error as Error).message;
        }
        store.put(record);
        logRecord(record);
      }
    }
  }
}

async function runCodeStep(outDir: string, store: RunStore, ideaIds: number[], runs: number, retryErrors: boolean) {
  mkdirSync(path.join(outDir, "code"), { recursive: true });
  for (const ideaId of ideaIds) {
    // Every code run for an idea must share one input spec. When retrying, reuse the
    // spec the idea's earlier code runs used, even if a retried spec run is now valid.
    const earlierInput = retryErrors
      ? store.records.find((r) => r.step === "code" && r.ideaId === ideaId && r.inputSpecFile)?.inputSpecFile
      : undefined;
    const inputSpecFile =
      earlierInput ??
      store.records
        .filter((r) => r.step === "spec" && r.model === CONFIG.codeStepSpecModel && r.ideaId === ideaId && r.specValid)
        .sort((a, b) => a.run - b.run)[0]?.outputFile;
    if (!inputSpecFile) {
      console.warn(`idea ${ideaId}: no valid ${CONFIG.codeStepSpecModel} spec in ${outDir}, skipping the code step`);
      continue;
    }
    const spec = JSON.parse(readFileSync(path.join(outDir, inputSpecFile), "utf8")) as Spec;
    const prompt = buildPrototypePrompt(spec);

    for (const { id: model } of CONFIG.models) {
      for (let run = 1; run <= runs; run++) {
        if (!shouldRun(store, retryErrors, "code", model, ideaId, run)) continue;
        const record = blankRecord("code", model, ideaId, run);
        record.inputSpecFile = inputSpecFile;
        try {
          const result = await callModel(model, prompt, prototypeCall.maxTokens);
          recordCall(record, result);
          const code = stripCodeFences(textOf(result.message));
          record.hasDefaultExport = code.includes("export default");
          record.compileError = await compileError(code);
          record.compiles = record.compileError === null;
          record.codeValid = record.hasDefaultExport && record.compiles && !record.truncated;
          // Saved even when truncated or broken, so partial output can be inspected.
          record.outputFile = `code/idea${ideaId}-${slugFor(model)}-run${run}.jsx`;
          writeFileSync(path.join(outDir, record.outputFile), code + "\n");
        } catch (error) {
          record.error = (error as Error).message;
        }
        store.put(record);
        logRecord(record);
      }
    }
  }
}

function logRecord(r: RunRecord) {
  const status = r.error
    ? `ERROR ${r.error}`
    : r.step === "spec"
      ? `parsed=${r.jsonParsed} valid=${r.specValid}`
      : `export=${r.hasDefaultExport} compiles=${r.compiles} valid=${r.codeValid}`;
  console.log(
    `${r.step} idea${r.ideaId} ${r.model} run${r.run}: ${r.latencyMs ?? "-"}ms ` +
      `in=${r.inputTokens ?? "-"} out=${r.outputTokens ?? "-"} stop=${r.stopReason ?? "-"} ` +
      `${r.truncated ? "TRUNCATED " : ""}` +
      `blocks=${r.contentBlocks ?? "-"} ${status}`
  );
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function costUsd(r: RunRecord): number | null {
  const prices = CONFIG.models.find((m) => m.id === r.model)?.pricePerMTok;
  if (!prices || prices.input === null || prices.output === null) return null;
  if (r.inputTokens === null || r.outputTokens === null) return null;
  return (r.inputTokens * prices.input + r.outputTokens * prices.output) / 1_000_000;
}

function writeCsv(outDir: string, records: RunRecord[]) {
  const columns: [string, (r: RunRecord) => unknown][] = [
    ["step", (r) => r.step],
    ["model", (r) => r.model],
    ["idea_id", (r) => r.ideaId],
    ["idea", (r) => r.idea],
    ["run", (r) => r.run],
    ["latency_ms", (r) => r.latencyMs],
    ["input_tokens", (r) => r.inputTokens],
    ["output_tokens", (r) => r.outputTokens],
    ["cost_usd", (r) => costUsd(r)?.toFixed(6)],
    ["stop_reason", (r) => r.stopReason],
    ["truncated", (r) => r.truncated],
    ["content_blocks", (r) => r.contentBlocks],
    ["json_parsed", (r) => r.jsonParsed],
    ["spec_valid", (r) => r.specValid],
    ["has_default_export", (r) => r.hasDefaultExport],
    ["compiles", (r) => r.compiles],
    ["compile_error", (r) => r.compileError],
    ["code_valid", (r) => r.codeValid],
    ["attempts", (r) => r.attempts],
    ["error", (r) => r.error],
    ["output_file", (r) => r.outputFile],
    ["input_spec_file", (r) => r.inputSpecFile],
    ["timestamp", (r) => r.timestamp],
  ];
  const lines = [
    columns.map(([name]) => name).join(","),
    ...[...records]
      .sort(
        (a, b) =>
          STEP_ORDER.indexOf(a.step) - STEP_ORDER.indexOf(b.step) ||
          a.ideaId - b.ideaId ||
          a.model.localeCompare(b.model) ||
          a.run - b.run
      )
      .map((r) => columns.map(([, get]) => csvCell(get(r))).join(",")),
  ];
  writeFileSync(path.join(outDir, "runs.csv"), lines.join("\n") + "\n");
}

const csvCell = (value: unknown) => {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Per step and model: truncation count and pass rates. Rates are over all runs,
 * so API errors and truncated runs count as failures.
 */
function writeSummary(outDir: string, records: RunRecord[]) {
  const checks: Record<Step, [string, (r: RunRecord) => boolean | null][]> = {
    spec: [
      ["json_parsed", (r) => r.jsonParsed],
      ["spec_valid", (r) => r.specValid],
    ],
    code: [
      ["has_default_export", (r) => r.hasDefaultExport],
      ["compiles", (r) => r.compiles],
      ["code_valid", (r) => r.codeValid],
    ],
  };
  const header = ["step", "model", "runs", "api_errors", "truncated", "check", "passed", "pass_rate"];
  const rows: string[][] = [];
  for (const step of STEP_ORDER) {
    for (const { id: model } of CONFIG.models) {
      const group = records.filter((r) => r.step === step && r.model === model);
      if (group.length === 0) continue;
      const errors = group.filter((r) => r.error).length;
      const truncated = group.filter((r) => r.truncated).length;
      for (const [check, get] of checks[step]) {
        const passed = group.filter((r) => get(r) === true).length;
        rows.push([
          step,
          model,
          String(group.length),
          String(errors),
          String(truncated),
          check,
          String(passed),
          `${Math.round((passed / group.length) * 100)}%`,
        ]);
      }
    }
  }
  writeFileSync(
    path.join(outDir, "summary.csv"),
    [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n"
  );

  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i].length)));
  const line = (row: string[]) => row.map((cell, i) => cell.padEnd(widths[i])).join("  ");
  console.log(["", line(header), ...rows.map(line), ""].join("\n"));
}

interface KeyEntry {
  label: string;
  model: string;
  ideaId: number;
  run: number;
  file: string;
}

function labelFor(index: number): string {
  let label = "";
  for (let n = index; n >= 0; n = Math.floor(n / 26) - 1) label = String.fromCharCode(65 + (n % 26)) + label;
  return label;
}

/**
 * Assign blind labels to code outputs: grouped by idea, shuffled within each
 * idea. An existing key is reused as-is when it covers the same files, so
 * rebuilding the page doesn't reshuffle labels you've already scored.
 */
function assignLabels(outDir: string, records: RunRecord[]): KeyEntry[] {
  const outputs = records.filter((r) => r.step === "code" && r.outputFile);
  const keyFile = path.join(outDir, "review-key.json");
  if (existsSync(keyFile)) {
    const existing = JSON.parse(readFileSync(keyFile, "utf8")) as KeyEntry[];
    const files = new Set(outputs.map((r) => r.outputFile));
    if (existing.length === files.size && existing.every((e) => files.has(e.file))) return existing;
  }

  const shuffled: RunRecord[] = [];
  for (const ideaId of [...new Set(outputs.map((r) => r.ideaId))].sort((a, b) => a - b)) {
    const group = outputs.filter((r) => r.ideaId === ideaId);
    for (let i = group.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [group[i], group[j]] = [group[j], group[i]];
    }
    shuffled.push(...group);
  }
  const key = shuffled.map((r, i) => ({
    label: labelFor(i),
    model: r.model,
    ideaId: r.ideaId,
    run: r.run,
    file: r.outputFile!,
  }));
  writeFileSync(keyFile, JSON.stringify(key, null, 2) + "\n");
  return key;
}

function writeReviewPage(outDir: string, records: RunRecord[]) {
  const key = assignLabels(outDir, records);
  if (key.length === 0) return;
  // Only what the reviewer needs: no model names, file names, or check results.
  const outputs = key.map((k) => ({
    label: k.label,
    ideaId: k.ideaId,
    idea: IDEAS[k.ideaId - 1],
    code: readFileSync(path.join(outDir, k.file), "utf8"),
  }));
  const data = JSON.stringify(outputs).replace(/</g, "\\u003c");
  writeFileSync(path.join(outDir, "review.html"), REVIEW_HTML.replace("__DATA__", () => data));
}

const REVIEW_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blind Prototype Review</title>
<style>
  :root { --bg:#f7f7f5; --panel:#fff; --text:#1d1d1b; --muted:#6b6b66; --line:#e2e1dc; --accent:#3b5bdb; --done:#2f9e44; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161615; --panel:#1f1f1d; --text:#ececea; --muted:#9a9a94; --line:#33332f; --accent:#7b93ff; --done:#51cf66; } }
  * { box-sizing: border-box; }
  body { margin:0; font:15px/1.5 system-ui, sans-serif; background:var(--bg); color:var(--text); }
  .app { display:grid; grid-template-columns: 220px 1fr; min-height:100vh; }
  nav { border-right:1px solid var(--line); padding:16px; background:var(--panel); overflow-y:auto; }
  nav h1 { font-size:15px; margin:0 0 4px; }
  nav p { color:var(--muted); font-size:13px; margin:0 0 16px; }
  nav h2 { font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin:16px 0 6px; }
  nav button { display:flex; justify-content:space-between; width:100%; padding:6px 10px; margin:2px 0; border:1px solid transparent; border-radius:6px; background:none; color:inherit; font:inherit; cursor:pointer; text-align:left; }
  nav button:hover { border-color:var(--line); }
  nav button.active { border-color:var(--accent); }
  nav .score { color:var(--done); font-weight:600; }
  main { padding:24px; min-width:0; }
  .idea { color:var(--muted); margin:4px 0 16px; max-width:70ch; }
  .row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin:16px 0; }
  .btn { padding:6px 14px; border-radius:6px; border:1px solid var(--line); background:var(--panel); color:inherit; font:inherit; cursor:pointer; }
  .btn.primary { background:var(--accent); border-color:var(--accent); color:#fff; }
  .scores label { display:inline-flex; align-items:center; gap:4px; margin-right:10px; }
  textarea { width:100%; max-width:70ch; min-height:70px; padding:8px; border:1px solid var(--line); border-radius:6px; background:var(--panel); color:inherit; font:inherit; }
  @media (max-width: 720px) { .app { grid-template-columns: 1fr; } nav { border-right:0; border-bottom:1px solid var(--line); } main { padding:16px; } }
</style>
<script type="importmap">
{ "imports": {
  "react": "https://esm.sh/react@19.2.4",
  "react/": "https://esm.sh/react@19.2.4/",
  "react-dom": "https://esm.sh/react-dom@19.2.4",
  "react-dom/": "https://esm.sh/react-dom@19.2.4/",
  "@codesandbox/sandpack-react": "https://esm.sh/@codesandbox/sandpack-react@2.20.0?external=react,react-dom"
} }
</script>
</head>
<body>
<div id="root"></div>
<script id="outputs" type="application/json">__DATA__</script>
<script type="module">
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { SandpackProvider, SandpackLayout, SandpackPreview, SandpackCodeViewer } from "@codesandbox/sandpack-react";

const h = React.createElement;
const outputs = JSON.parse(document.getElementById("outputs").textContent);
const STORE = "blind-review-scores";

function loadScores() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
}
function saveScores(scores) {
  try { localStorage.setItem(STORE, JSON.stringify(scores)); } catch {}
}
function exportCsv(scores) {
  const esc = (s) => /[",\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  const rows = ["label,idea_id,score,notes"].concat(outputs.map((o) => {
    const s = scores[o.label] || {};
    return [o.label, o.ideaId, s.score ?? "", esc(s.notes ?? "")].join(",");
  }));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([rows.join("\\n") + "\\n"], { type: "text/csv" }));
  a.download = "review-scores.csv";
  a.click();
}

function App() {
  const [index, setIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [scores, setScores] = useState(loadScores);
  useEffect(() => saveScores(scores), [scores]);

  const current = outputs[index];
  const mine = scores[current.label] || {};
  const update = (patch) => setScores({ ...scores, [current.label]: { ...mine, ...patch } });
  const ideaIds = [...new Set(outputs.map((o) => o.ideaId))];

  return h("div", { className: "app" },
    h("nav", null,
      h("h1", null, "Blind review"),
      h("p", null, Object.values(scores).filter((s) => s.score).length + " of " + outputs.length + " scored"),
      ideaIds.map((id) => h(React.Fragment, { key: id },
        h("h2", null, "Idea " + id),
        outputs.map((o, i) => o.ideaId === id && h("button", {
          key: o.label, className: i === index ? "active" : "", onClick: () => { setIndex(i); setShowCode(false); },
        }, "Output " + o.label, h("span", { className: "score" }, scores[o.label]?.score ?? ""))),
      )),
      h("div", { className: "row" }, h("button", { className: "btn", onClick: () => exportCsv(scores) }, "Export scores CSV")),
    ),
    h("main", null,
      h("h1", { style: { margin: 0 } }, "Output " + current.label),
      h("p", { className: "idea" }, "Idea " + current.ideaId + ": " + current.idea),
      h(SandpackProvider, { key: current.label, template: "react", files: { "/App.js": current.code } },
        h(SandpackLayout, null,
          h(SandpackPreview, { showNavigator: false, showOpenInCodeSandbox: false, style: { height: 560, width: "100%" } })),
        showCode && h("div", { style: { marginTop: 12 } },
          h(SandpackLayout, null, h(SandpackCodeViewer, { showLineNumbers: true }))),
      ),
      h("div", { className: "row" },
        h("button", { className: "btn", onClick: () => setShowCode(!showCode) }, showCode ? "Hide code" : "Show code"),
        h("button", { className: "btn", disabled: index === 0, onClick: () => { setIndex(index - 1); setShowCode(false); } }, "Previous"),
        h("button", { className: "btn primary", disabled: index === outputs.length - 1, onClick: () => { setIndex(index + 1); setShowCode(false); } }, "Next"),
      ),
      h("div", { className: "row scores" },
        h("strong", null, "Quality"),
        [1, 2, 3, 4, 5].map((n) => h("label", { key: n },
          h("input", { type: "radio", name: "score", checked: mine.score === n, onChange: () => update({ score: n }) }), n)),
      ),
      h("textarea", { placeholder: "Notes", value: mine.notes ?? "", onChange: (e) => update({ notes: e.target.value }) }),
    ),
  );
}

createRoot(document.getElementById("root")).render(h(App));
</script>
</body>
</html>
`;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  const { values } = parseArgs({
    options: {
      step: { type: "string", default: "all" },
      ideas: { type: "string" },
      runs: { type: "string", default: String(CONFIG.runsPerModel) },
      out: { type: "string", default: "results" },
      "retry-errors": { type: "boolean", default: false },
    },
  });
  const step = values.step!;
  if (!["spec", "code", "all", "report"].includes(step)) {
    throw new Error(`--step must be spec, code, all, or report (got ${step})`);
  }
  const ideaIds = values.ideas ? values.ideas.split(",").map(Number) : IDEAS.map((_, i) => i + 1);
  if (ideaIds.some((id) => !Number.isInteger(id) || id < 1 || id > IDEAS.length)) {
    throw new Error(`--ideas must be a comma-separated list of 1-${IDEAS.length}`);
  }
  const runs = Number(values.runs);
  const outDir = path.resolve(ROOT, values.out!);
  mkdirSync(outDir, { recursive: true });

  const keyProblem = step === "report" ? null : missingKeyMessage();
  if (keyProblem) {
    console.error(keyProblem);
    process.exit(1);
  }

  const store = new RunStore(path.join(outDir, "runs.json"));
  const retryErrors = values["retry-errors"]!;
  if (step === "spec" || step === "all") await runSpecStep(outDir, store, ideaIds, runs, retryErrors);
  if (step === "code" || step === "all") await runCodeStep(outDir, store, ideaIds, runs, retryErrors);

  writeCsv(outDir, store.records);
  writeSummary(outDir, store.records);
  writeReviewPage(outDir, store.records);
  console.log(`Wrote ${path.relative(ROOT, outDir)}/runs.csv (${store.records.length} runs) and summary.csv`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
