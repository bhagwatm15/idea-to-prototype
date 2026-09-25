/**
 * Model comparison harness for the spec and prototype steps.
 *
 * Runs the live app's own prompts (read straight out of the API route files,
 * so they can't drift) against each configured model, and writes everything
 * under results/. Nothing here is imported by the app.
 *
 *   npm run compare-models -- --step spec --ideas 1 --runs 1 --out results/smoke   # smoke test
 *   npm run compare-models -- --step all                                           # full run
 *   npm run compare-models -- --step all --models deepseek,gptoss                  # run only some models (id or slug)
 *   npm run compare-models -- --step list-models                                   # list DeepSeek and Groq models
 *   npm run compare-models -- --step report                                        # rebuild runs.csv + review.html from runs.json
 *   npm run compare-models -- --step serve                                         # open review.html at http://localhost:4173
 *
 * Steps: spec | code | all | report | serve | list-models. `code` reads the specs
 * recorded by a previous `spec` run in the same --out directory.
 *
 * Runs are resumable: runs already recorded without an error are skipped, so an
 * interrupted run can simply be restarted. Pass --rerun to redo them anyway.
 */
import { transform } from "esbuild";
import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import type { Screen, Spec } from "../lib/types";
import { callWithRetries, COMPAT_PROVIDERS, listModels, type CallOutcome, type ProviderName } from "./providers";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** USD per million tokens. null leaves the cost column blank. */
interface Prices {
  /** Uncached input (DeepSeek: cache miss). */
  input: number | null;
  /** Cached input (DeepSeek: cache hit). null bills cached tokens at the input price. */
  cachedInput: number | null;
  output: number | null;
}

interface ModelConfig {
  /** Identifies the setup in results; unique per model + settings. */
  id: string;
  /** Model name sent to the API, when it differs from id. */
  apiModel?: string;
  /** Extra request fields (OpenAI-compatible providers only). */
  requestParams?: Record<string, unknown>;
  provider: ProviderName;
  /** Short name used in file names and --models. The review pages never show it. */
  slug: string;
  /** How the model reasons with the request the harness sends. */
  reasoningMode: string;
  pricePerMTok: Prices;
  /** DeepSeek only: off-peak prices. pricePerMTok is then the peak price. */
  offPeakPricePerMTok?: Prices;
}

/** deepseek-flash prices, shared by both DeepSeek setups. Fill in from api-docs.deepseek.com/quick_start/pricing. */
const DEEPSEEK_FLASH_PEAK: Prices = { input: null, cachedInput: null, output: null };
const DEEPSEEK_FLASH_OFF_PEAK: Prices = { input: null, cachedInput: null, output: null };

// Anthropic IDs checked against platform.claude.com/docs/en/about-claude/models/overview on 2026-09-24.
// DeepSeek and Groq IDs: see `--step list-models`.
const MODELS: ModelConfig[] = [
  {
    id: "claude-sonnet-5",
    provider: "anthropic",
    slug: "sonnet",
    reasoningMode: "adaptive thinking (API default, effort high)",
    pricePerMTok: { input: 2, cachedInput: null, output: 10 },
  },
  {
    id: "claude-haiku-4-5-20251001",
    provider: "anthropic",
    slug: "haiku",
    reasoningMode: "none (API default)",
    pricePerMTok: { input: 1, cachedInput: null, output: 5 },
  },
  {
    // Served by DeepSeek-V4.1-Flash. Its default thinking used up the app's limits in the
    // single-idea check (both steps truncated), so the comparison uses the setup below.
    id: "deepseek-flash",
    provider: "deepseek",
    slug: "deepseek",
    reasoningMode: "thinking (API default, effort high)",
    pricePerMTok: DEEPSEEK_FLASH_PEAK,
    offPeakPricePerMTok: DEEPSEEK_FLASH_OFF_PEAK,
  },
  {
    id: "deepseek-flash:no-thinking",
    apiModel: "deepseek-flash",
    requestParams: { thinking: { type: "disabled" } },
    provider: "deepseek",
    slug: "deepseek-nothink",
    reasoningMode: "none (thinking disabled)",
    pricePerMTok: DEEPSEEK_FLASH_PEAK,
    offPeakPricePerMTok: DEEPSEEK_FLASH_OFF_PEAK,
  },
  {
    // Fill in from groq.com/pricing.
    id: "openai/gpt-oss-120b",
    provider: "groq",
    slug: "gptoss",
    reasoningMode: "reasoning (API default, effort medium)",
    pricePerMTok: { input: null, cachedInput: null, output: null },
  },
];

/**
 * DeepSeek's peak window: 01:00-04:00 and 06:00-10:00 UTC, Monday-Friday,
 * except Chinese public holidays (list those dates here as "YYYY-MM-DD", UTC).
 * Everything else is off-peak.
 */
const DEEPSEEK_PEAK = {
  weekdaysUtc: [1, 2, 3, 4, 5],
  hoursUtc: [
    [1, 4],
    [6, 10],
  ],
  holidays: [] as string[],
};

const CONFIG = {
  models: MODELS,
  /** The three-way comparison: what `spec`/`code` run by default and what the -3way review pages show. */
  comparison: ["claude-sonnet-5", "deepseek-flash:no-thinking", "openai/gpt-oss-120b"],
  /**
   * The original two-way comparison; review.html and spec-review.html keep showing only these.
   * runs.csv and summary.csv cover only `comparison`, so Haiku's runs stay in runs.json but not the reports.
   */
  original: ["claude-sonnet-5", "claude-haiku-4-5-20251001"],
  runsPerModel: 2,
  /** The code step uses this model's first valid spec per idea as its fixed input. */
  codeStepSpecModel: "claude-sonnet-5",
  /** The idea form's defaults when the user leaves the optional fields blank. */
  specInputs: { platform: "web", mustHaveFeature: "", tone: "" },
  /** Latency is measured on the successful attempt only, excluding retries and waits. */
  retry: { maxErrorRetries: 3, maxRateLimitRetries: 10 },
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

const KEY_ENV: Record<ProviderName, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  deepseek: COMPAT_PROVIDERS.deepseek.keyEnv,
  groq: COMPAT_PROVIDERS.groq.keyEnv,
};

/** Explain why a provider's key wasn't found instead of letting every run fail with an auth error. */
function missingKeyMessage(provider: ProviderName): string | null {
  const name = KEY_ENV[provider];
  if (process.env[name]?.trim()) return null;
  if (provider === "anthropic" && process.env.ANTHROPIC_AUTH_TOKEN?.trim()) return null;
  if (!existsSync(ENV_FILE)) {
    const hint = existsSync(`${ENV_FILE}.txt`) ? ` Found ${ENV_FILE}.txt instead; rename it to drop ".txt".` : "";
    return `${name} is not set and ${ENV_FILE} does not exist.${hint}`;
  }
  const bytes = readFileSync(ENV_FILE);
  if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)) {
    return `${ENV_FILE} is saved as UTF-16, which Node can't read. Re-save it as UTF-8 or ASCII.`;
  }
  return `${ENV_FILE} exists but has no ${name}=... line.`;
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

function modelConfig(id: string): ModelConfig {
  const config = CONFIG.models.find((m) => m.id === id);
  if (!config) throw new Error(`Unknown model ${id}`);
  return config;
}

function callModel(model: ModelConfig, prompt: string, maxTokens: number): Promise<CallOutcome> {
  return callWithRetries(
    model.provider,
    model.apiModel ?? model.id,
    prompt,
    maxTokens,
    CONFIG.retry,
    (message) => console.warn(message),
    model.requestParams
  );
}

/** "peak" or "off-peak" for DeepSeek's time-based pricing; null for other providers. */
function pricingWindow(provider: ProviderName, at: Date): string | null {
  if (provider !== "deepseek") return null;
  const hour = at.getUTCHours() + at.getUTCMinutes() / 60;
  const peak =
    DEEPSEEK_PEAK.weekdaysUtc.includes(at.getUTCDay()) &&
    !DEEPSEEK_PEAK.holidays.includes(at.toISOString().slice(0, 10)) &&
    DEEPSEEK_PEAK.hoursUtc.some(([from, to]) => hour >= from && hour < to);
  return peak ? "peak" : "off-peak";
}

// ---------------------------------------------------------------------------
// Run records
// ---------------------------------------------------------------------------

type Step = "spec" | "code";
const STEP_ORDER: Step[] = ["spec", "code"];

interface RunRecord {
  step: Step;
  model: string;
  provider: ProviderName;
  reasoningMode: string;
  ideaId: number;
  idea: string;
  run: number;
  latencyMs: number | null;
  /** Time to first streamed token (reasoning or text); null for runs made without streaming. */
  ttftMs: number | null;
  inputTokens: number | null;
  cachedInputTokens: number | null;
  /** Includes reasoning tokens where the provider bills them as output. */
  outputTokens: number | null;
  /** Only where the API reports them separately (DeepSeek, Groq). */
  reasoningTokens: number | null;
  /** From the API response; null only when the call itself failed. */
  stopReason: string | null;
  /** stop_reason max_tokens (Anthropic) or finish_reason length (DeepSeek, Groq). Truncated runs fail their step's check. */
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
  /** Retries before the successful attempt (errors and rate limits). */
  retries: number | null;
  /** Time spent waiting on rate limits; not part of latencyMs. */
  rateLimitWaitMs: number | null;
  /** DeepSeek only: "peak" or "off-peak" when the successful attempt started. */
  pricingWindow: string | null;
  error: string | null;
  /** Relative to the results directory. */
  outputFile: string | null;
  /** Code step only: the spec file used as input. */
  inputSpecFile: string | null;
  /** UTC. Start of the successful attempt (older runs: when the run finished). */
  timestamp: string;
}

function blankRecord(step: Step, model: ModelConfig, ideaId: number, run: number): RunRecord {
  return {
    step,
    model: model.id,
    provider: model.provider,
    reasoningMode: model.reasoningMode,
    ideaId,
    idea: IDEAS[ideaId - 1],
    run,
    latencyMs: null,
    ttftMs: null,
    inputTokens: null,
    cachedInputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
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
    retries: null,
    rateLimitWaitMs: null,
    pricingWindow: null,
    error: null,
    outputFile: null,
    inputSpecFile: null,
    timestamp: new Date().toISOString(),
  };
}

function recordCall(record: RunRecord, outcome: CallOutcome) {
  record.latencyMs = outcome.latencyMs;
  record.ttftMs = outcome.ttftMs;
  record.inputTokens = outcome.inputTokens;
  record.cachedInputTokens = outcome.cachedInputTokens;
  record.outputTokens = outcome.outputTokens;
  record.reasoningTokens = outcome.reasoningTokens;
  record.stopReason = outcome.stopReason;
  record.truncated = outcome.truncated;
  record.contentBlocks = outcome.contentBlocks;
  record.retries = outcome.retries;
  record.attempts = outcome.retries + 1;
  record.rateLimitWaitMs = outcome.rateLimitWaitMs;
  record.timestamp = outcome.startedAt.toISOString();
  record.pricingWindow = pricingWindow(record.provider, outcome.startedAt);
}

/** Fill in fields for runs recorded before they existed. */
function backfill(r: RunRecord) {
  if (r.truncated === undefined) {
    r.truncated = r.stopReason === null ? null : r.stopReason === "max_tokens";
    if (r.truncated && r.specValid) r.specValid = false;
    r.codeValid = r.hasDefaultExport === null ? null : Boolean(r.hasDefaultExport && r.compiles && !r.truncated);
  }
  if (r.provider === undefined) {
    const config = CONFIG.models.find((m) => m.id === r.model);
    r.provider = config?.provider ?? "anthropic";
    r.reasoningMode = config?.reasoningMode ?? "";
    r.retries = r.attempts === null ? null : r.attempts - 1;
    r.rateLimitWaitMs = r.attempts === null ? null : 0;
    r.ttftMs = null;
    r.cachedInputTokens = null;
    r.reasoningTokens = null;
    r.pricingWindow = null;
  }
}

class RunStore {
  readonly records: RunRecord[];

  constructor(private readonly file: string) {
    this.records = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
    for (const r of this.records) backfill(r);
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

interface StepOptions {
  models: ModelConfig[];
  ideaIds: number[];
  runs: number;
  /** Redo runs that already completed. By default they're skipped, which makes reruns resume. */
  rerun: boolean;
}

/** Runs are skipped once recorded without an error, unless --rerun. */
function shouldRun(store: RunStore, rerun: boolean, step: Step, model: string, ideaId: number, run: number) {
  if (rerun) return true;
  const existing = store.records.find(
    (r) => r.step === step && r.model === model && r.ideaId === ideaId && r.run === run
  );
  return !existing || existing.error !== null;
}

async function runSpecStep(outDir: string, store: RunStore, { models, ideaIds, runs, rerun }: StepOptions) {
  mkdirSync(path.join(outDir, "specs"), { recursive: true });
  for (const ideaId of ideaIds) {
    const prompt = buildSpecPrompt(IDEAS[ideaId - 1]);
    for (const model of models) {
      for (let run = 1; run <= runs; run++) {
        if (!shouldRun(store, rerun, "spec", model.id, ideaId, run)) continue;
        const record = blankRecord("spec", model, ideaId, run);
        const base = `specs/idea${ideaId}-${model.slug}-run${run}`;
        try {
          const result = await callModel(model, prompt, specCall.maxTokens);
          recordCall(record, result);
          const raw = result.text;
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

async function runCodeStep(outDir: string, store: RunStore, { models, ideaIds, runs, rerun }: StepOptions) {
  mkdirSync(path.join(outDir, "code"), { recursive: true });
  for (const ideaId of ideaIds) {
    // Every code run for an idea, for every model, shares one input spec: the one the
    // idea's earlier code runs used, even if a later spec run is also valid.
    const earlierInput = store.records.find(
      (r) => r.step === "code" && r.ideaId === ideaId && r.inputSpecFile
    )?.inputSpecFile;
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

    for (const model of models) {
      for (let run = 1; run <= runs; run++) {
        if (!shouldRun(store, rerun, "code", model.id, ideaId, run)) continue;
        const record = blankRecord("code", model, ideaId, run);
        record.inputSpecFile = inputSpecFile;
        try {
          const result = await callModel(model, prompt, prototypeCall.maxTokens);
          recordCall(record, result);
          const code = stripCodeFences(result.text);
          record.hasDefaultExport = code.includes("export default");
          record.compileError = await compileError(code);
          record.compiles = record.compileError === null;
          record.codeValid = record.hasDefaultExport && record.compiles && !record.truncated;
          // Saved even when truncated or broken, so partial output can be inspected.
          record.outputFile = `code/idea${ideaId}-${model.slug}-run${run}.jsx`;
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
    `${r.step} idea${r.ideaId} ${r.model} run${r.run}: ${r.latencyMs ?? "-"}ms ttft=${r.ttftMs ?? "-"}ms ` +
      `in=${r.inputTokens ?? "-"} cached=${r.cachedInputTokens ?? "-"} out=${r.outputTokens ?? "-"} ` +
      `reasoning=${r.reasoningTokens ?? "-"} retries=${r.retries ?? "-"} stop=${r.stopReason ?? "-"} ` +
      `${r.pricingWindow ? `window=${r.pricingWindow} ` : ""}` +
      `${r.truncated ? "TRUNCATED " : ""}` +
      `blocks=${r.contentBlocks ?? "-"} ${status}`
  );
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function costUsd(r: RunRecord): number | null {
  const config = CONFIG.models.find((m) => m.id === r.model);
  if (!config || r.inputTokens === null || r.outputTokens === null) return null;
  const prices =
    r.pricingWindow === "off-peak" && config.offPeakPricePerMTok ? config.offPeakPricePerMTok : config.pricePerMTok;
  if (prices.input === null || prices.output === null) return null;
  // Output tokens already include reasoning tokens for every provider here.
  const cached = r.cachedInputTokens ?? 0;
  const cachedPrice = prices.cachedInput ?? prices.input;
  return ((r.inputTokens - cached) * prices.input + cached * cachedPrice + r.outputTokens * prices.output) / 1_000_000;
}

function writeCsv(outDir: string, records: RunRecord[]) {
  const columns: [string, (r: RunRecord) => unknown][] = [
    ["step", (r) => r.step],
    ["provider", (r) => r.provider],
    ["model", (r) => r.model],
    ["reasoning_mode", (r) => r.reasoningMode],
    ["idea_id", (r) => r.ideaId],
    ["idea", (r) => r.idea],
    ["run", (r) => r.run],
    ["timestamp_utc", (r) => r.timestamp],
    ["latency_ms", (r) => r.latencyMs],
    ["ttft_ms", (r) => r.ttftMs],
    ["input_tokens", (r) => r.inputTokens],
    ["cached_input_tokens", (r) => r.cachedInputTokens],
    ["output_tokens", (r) => r.outputTokens],
    ["reasoning_tokens", (r) => r.reasoningTokens],
    ["pricing_window", (r) => r.pricingWindow],
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
    ["retries", (r) => r.retries],
    ["rate_limit_wait_ms", (r) => r.rateLimitWaitMs],
    ["error", (r) => r.error],
    ["output_file", (r) => r.outputFile],
    ["input_spec_file", (r) => r.inputSpecFile],
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
    for (const model of CONFIG.comparison) {
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
 * Assign blind labels to one step's outputs: grouped by idea, shuffled within
 * each idea. An existing key is reused as-is when it covers the same files, so
 * rebuilding the page doesn't reshuffle labels you've already scored.
 */
function assignLabels(
  outDir: string,
  records: RunRecord[],
  step: Step,
  models: string[],
  keyName: string
): KeyEntry[] {
  const candidates = records.filter((r) => r.step === step && r.outputFile && models.includes(r.model));
  // Only ideas every model has outputs for, so a partial run doesn't produce a lopsided page.
  const outputs = candidates.filter((r) =>
    models.every((m) => candidates.some((c) => c.model === m && c.ideaId === r.ideaId))
  );
  if (outputs.length === 0) return [];
  const keyFile = path.join(outDir, keyName);
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

/** A blind review page, its key file, and which models it mixes. */
interface ReviewPage {
  html: string;
  key: string;
  models: string[];
  /** Browser storage key for the reviewer's answers; distinct per page so labels don't collide. */
  storage: string;
  title: string;
  /** File name the page's export button downloads; distinct per page. */
  exportName: string;
}

const PROTOTYPE_PAGES: ReviewPage[] = [
  {
    html: "review.html",
    key: "review-key.json",
    models: CONFIG.original,
    storage: "blind-review-scores",
    title: "Blind review",
    exportName: "review-scores.csv",
  },
  {
    html: "review-3way.html",
    key: "review-3way-key.json",
    models: CONFIG.comparison,
    storage: "blind-review-scores-3way",
    title: "Blind review (3 models)",
    exportName: "review-3way-scores.csv",
  },
];
const SPEC_PAGES: ReviewPage[] = [
  {
    html: "spec-review.html",
    key: "spec-review-key.json",
    models: CONFIG.original,
    storage: "blind-spec-review",
    title: "Blind spec review",
    exportName: "spec-review-scores.csv",
  },
  {
    html: "spec-review-3way.html",
    key: "spec-review-3way-key.json",
    models: CONFIG.comparison,
    storage: "blind-spec-review-3way",
    title: "Blind spec review (3 models)",
    exportName: "spec-review-3way-scores.csv",
  },
];

function fillTemplate(template: string, page: ReviewPage, data: string): string {
  return template
    .replace("__STORAGE__", () => page.storage)
    .replace("__EXPORT__", () => page.exportName)
    .replace(/__TITLE__/g, () => page.title)
    .replace("__DATA__", () => data);
}

function writeReviewPage(outDir: string, records: RunRecord[], page: ReviewPage) {
  const key = assignLabels(outDir, records, "code", page.models, page.key);
  if (key.length === 0) return;
  // Only what the reviewer needs: no model names, file names, or check results.
  const outputs = key.map((k) => ({
    label: k.label,
    ideaId: k.ideaId,
    idea: IDEAS[k.ideaId - 1],
    code: readFileSync(path.join(outDir, k.file), "utf8"),
  }));
  const data = JSON.stringify(outputs).replace(/</g, "\\u003c");
  writeFileSync(path.join(outDir, page.html), fillTemplate(REVIEW_HTML, page, data));
}

/**
 * Blind review page for the specs, with their own labels and key file
 * (spec-review-key.json), independent of the prototype review's labels.
 */
function writeSpecReviewPage(outDir: string, records: RunRecord[], page: ReviewPage) {
  const key = assignLabels(outDir, records, "spec", page.models, page.key);
  if (key.length === 0) return;
  const specs = key.map((k) => {
    const text = readFileSync(path.join(outDir, k.file), "utf8");
    // Specs that didn't parse were saved raw (.txt); show those as plain text.
    return k.file.endsWith(".json")
      ? { label: k.label, ideaId: k.ideaId, idea: IDEAS[k.ideaId - 1], spec: JSON.parse(text) }
      : { label: k.label, ideaId: k.ideaId, idea: IDEAS[k.ideaId - 1], raw: text };
  });
  const data = JSON.stringify(specs).replace(/</g, "\\u003c");
  writeFileSync(path.join(outDir, page.html), fillTemplate(SPEC_REVIEW_HTML, page, data));
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
const STORE = "__STORAGE__";

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
  a.download = "__EXPORT__";
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
      h("h1", null, "__TITLE__"),
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

/**
 * Sandpack's preview iframe can't connect when the page is opened from a
 * file:// URL, so serve review.html over http. Only the page is served; the
 * key file and outputs stay off the server.
 */
function serveReviewPage(outDir: string, port: number) {
  const pages = PROTOTYPE_PAGES.map((p) => p.html).filter((name) => existsSync(path.join(outDir, name)));
  if (pages.length === 0) throw new Error(`No review pages in ${outDir} yet; run the code step first.`);
  createServer((req, res) => {
    const name = req.url === "/" ? pages[0] : req.url?.slice(1);
    if (!name || !pages.includes(name)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(readFileSync(path.join(outDir, name)));
  }).listen(port, "127.0.0.1", () => {
    for (const name of pages) console.log(`Blind review page: http://localhost:${port}/${name}`);
    console.log("(Ctrl+C to stop)");
  });
}

const SPEC_REVIEW_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blind Spec Review</title>
<style>
  :root { --bg:#f7f7f5; --panel:#fff; --text:#1d1d1b; --muted:#6b6b66; --line:#e2e1dc; --accent:#3b5bdb; --done:#2f9e44; --chip:#eef0f7; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161615; --panel:#1f1f1d; --text:#ececea; --muted:#9a9a94; --line:#33332f; --accent:#7b93ff; --done:#51cf66; --chip:#2a2c36; } }
  * { box-sizing: border-box; }
  body { margin:0; font:15px/1.55 system-ui, sans-serif; background:var(--bg); color:var(--text); }
  .app { display:grid; grid-template-columns: 200px 1fr; min-height:100vh; }
  nav { border-right:1px solid var(--line); padding:16px; background:var(--panel); overflow-y:auto; }
  nav h1 { font-size:15px; margin:0 0 4px; }
  nav p { color:var(--muted); font-size:13px; margin:0 0 16px; }
  nav h2 { font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin:16px 0 6px; }
  nav button { display:flex; justify-content:space-between; width:100%; padding:6px 10px; margin:2px 0; border:1px solid transparent; border-radius:6px; background:none; color:inherit; font:inherit; cursor:pointer; text-align:left; }
  nav button:hover { border-color:var(--line); }
  nav button.active { border-color:var(--accent); }
  nav .tick { color:var(--done); font-weight:600; }
  main { padding:24px; min-width:0; display:grid; grid-template-columns: minmax(0, 1fr) 320px; gap:24px; align-items:start; }
  .idea { color:var(--muted); margin:4px 0 16px; }
  .spec { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:20px 24px; }
  .spec h2 { margin:0 0 2px; font-size:22px; }
  .spec .oneliner { color:var(--muted); margin:0 0 12px; font-size:16px; }
  .spec h3 { font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin:20px 0 6px; }
  .spec p { margin:0; }
  .chips span { display:inline-block; background:var(--chip); border-radius:999px; padding:2px 10px; margin:0 6px 6px 0; font-size:13px; }
  .spec ol, .spec ul { margin:0; padding-left:22px; }
  .spec li { margin:3px 0; }
  .screen { border:1px solid var(--line); border-radius:8px; padding:10px 12px; margin:8px 0; }
  .screen strong { display:block; }
  pre.raw { white-space:pre-wrap; margin:0; }
  aside { position:sticky; top:24px; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:16px 18px; }
  aside h2 { font-size:15px; margin:0 0 12px; }
  fieldset { border:0; padding:0; margin:0 0 16px; }
  legend { font-weight:600; margin-bottom:6px; padding:0; }
  .opts label { display:inline-flex; align-items:center; gap:4px; margin-right:12px; cursor:pointer; }
  textarea { width:100%; min-height:90px; padding:8px; border:1px solid var(--line); border-radius:6px; background:var(--bg); color:inherit; font:inherit; }
  .row { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
  .btn { padding:6px 14px; border-radius:6px; border:1px solid var(--line); background:var(--panel); color:inherit; font:inherit; cursor:pointer; }
  .btn.primary { background:var(--accent); border-color:var(--accent); color:#fff; }
  .btn:disabled { opacity:.5; cursor:default; }
  @media (max-width: 900px) { main { grid-template-columns: 1fr; } aside { position:static; } }
  @media (max-width: 640px) { .app { grid-template-columns: 1fr; } nav { border-right:0; border-bottom:1px solid var(--line); } main { padding:16px; } .spec { padding:16px; } }
</style>
</head>
<body>
<div class="app">
  <nav>
    <h1>__TITLE__</h1>
    <p id="progress"></p>
    <div id="list"></div>
    <div class="row"><button class="btn" id="export">Export rubric CSV</button></div>
  </nav>
  <main>
    <section>
      <h1 id="title" style="margin:0"></h1>
      <p class="idea" id="idea"></p>
      <article class="spec" id="spec"></article>
    </section>
    <aside>
      <h2>Rubric</h2>
      <fieldset><legend>Are the screens specific to the idea?</legend><div class="opts" data-q="screens"></div></fieldset>
      <fieldset><legend>Does the out-of-scope list make sense?</legend><div class="opts" data-q="outOfScope"></div></fieldset>
      <fieldset><legend>Would you approve it without major edits?</legend><div class="opts" data-q="approve"></div></fieldset>
      <textarea id="notes" placeholder="Notes"></textarea>
      <div class="row">
        <button class="btn" id="prev">Previous</button>
        <button class="btn primary" id="next">Next</button>
      </div>
    </aside>
  </main>
</div>
<script id="specs" type="application/json">__DATA__</script>
<script>
const specs = JSON.parse(document.getElementById("specs").textContent);
const STORE = "__STORAGE__";
const OPTIONS = { screens: ["Yes", "Partly", "No"], outOfScope: ["Yes", "Partly", "No"], approve: ["Yes", "No"] };
const QUESTIONS = Object.keys(OPTIONS);
let answers = {};
try { answers = JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) {}
let index = 0;

function save() { try { localStorage.setItem(STORE, JSON.stringify(answers)); } catch (e) {} }
function done(label) { const a = answers[label] || {}; return QUESTIONS.every((q) => a[q]); }
function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.assign(node, attrs || {});
  for (const child of [].concat(children || [])) node.append(child);
  return node;
}
function section(title, body) { return [el("h3", { textContent: title }), body]; }
function text(value) { return value === undefined || value === null || value === "" ? "(not given)" : String(value); }
function list(tag, items) { return el(tag, {}, (Array.isArray(items) ? items : []).map((item) => el("li", { textContent: text(item) }))); }

function renderSpec(entry) {
  const box = document.getElementById("spec");
  box.replaceChildren();
  if (entry.raw !== undefined) {
    box.append(el("p", { textContent: "This spec didn't parse as JSON. Raw output:" }), el("pre", { className: "raw", textContent: entry.raw }));
    return;
  }
  const s = entry.spec;
  const chips = el("div", { className: "chips" }, [
    el("span", { textContent: "Tone: " + text(s.tone) }),
    el("span", { textContent: "Platform: " + text(s.platform) }),
  ]);
  const screens = el("div", {}, (Array.isArray(s.screens) ? s.screens : []).map((sc) =>
    el("div", { className: "screen" }, [el("strong", { textContent: text(sc && sc.name) }), el("span", { textContent: text(sc && sc.purpose) })])));
  box.append(
    el("h2", { textContent: text(s.productName) }),
    el("p", { className: "oneliner", textContent: text(s.oneLiner) }),
    chips,
    ...section("Problem", el("p", { textContent: text(s.problem) })),
    ...section("Target user", el("p", { textContent: text(s.targetUser) })),
    ...section("Core flow", list("ol", s.coreFlow)),
    ...section("Screens", screens),
    ...section("Out of scope", list("ul", s.outOfScope)),
  );
}

function renderRubric(entry) {
  const a = answers[entry.label] || {};
  for (const box of document.querySelectorAll(".opts")) {
    const q = box.dataset.q;
    box.replaceChildren(...OPTIONS[q].map((opt) => {
      const input = el("input", { type: "radio", name: q, checked: a[q] === opt });
      input.addEventListener("change", () => { update(entry.label, { [q]: opt }); });
      return el("label", {}, [input, opt]);
    }));
  }
  document.getElementById("notes").value = a.notes || "";
}

function update(label, patch) {
  answers[label] = Object.assign({}, answers[label], patch);
  save();
  renderNav();
}

function renderNav() {
  const listBox = document.getElementById("list");
  listBox.replaceChildren();
  let lastIdea = null;
  specs.forEach((entry, i) => {
    if (entry.ideaId !== lastIdea) { listBox.append(el("h2", { textContent: "Idea " + entry.ideaId })); lastIdea = entry.ideaId; }
    const button = el("button", { className: i === index ? "active" : "" }, [
      "Spec " + entry.label, el("span", { className: "tick", textContent: done(entry.label) ? "✓" : "" })]);
    button.addEventListener("click", () => go(i));
    listBox.append(button);
  });
  document.getElementById("progress").textContent = specs.filter((s) => done(s.label)).length + " of " + specs.length + " reviewed";
}

function go(i) {
  index = i;
  const entry = specs[index];
  document.getElementById("title").textContent = "Spec " + entry.label;
  document.getElementById("idea").textContent = "Idea " + entry.ideaId + ": " + entry.idea;
  renderSpec(entry);
  renderRubric(entry);
  renderNav();
  document.getElementById("prev").disabled = index === 0;
  document.getElementById("next").disabled = index === specs.length - 1;
  window.scrollTo(0, 0);
}

document.getElementById("notes").addEventListener("input", (e) => update(specs[index].label, { notes: e.target.value }));
document.getElementById("prev").addEventListener("click", () => go(index - 1));
document.getElementById("next").addEventListener("click", () => go(index + 1));
document.getElementById("export").addEventListener("click", () => {
  const esc = (v) => { const s = v === undefined ? "" : String(v); return /[",\\n\\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = ["label,idea_id,screens_specific,out_of_scope_sensible,approve_without_major_edits,notes"].concat(specs.map((entry) => {
    const a = answers[entry.label] || {};
    return [entry.label, entry.ideaId, a.screens, a.outOfScope, a.approve, a.notes].map(esc).join(",");
  }));
  const link = el("a", { download: "__EXPORT__", href: URL.createObjectURL(new Blob([rows.join("\\n") + "\\n"], { type: "text/csv" })) });
  link.click();
});

go(0);
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
      models: { type: "string" },
      rerun: { type: "boolean", default: false },
      // Kept for older instructions: skipping completed runs is now the default.
      "retry-errors": { type: "boolean", default: false },
      port: { type: "string", default: "4173" },
    },
  });
  const step = values.step!;
  if (!["spec", "code", "all", "report", "serve", "list-models"].includes(step)) {
    throw new Error(`--step must be spec, code, all, report, serve, or list-models (got ${step})`);
  }
  const models = values.models
    ? values.models.split(",").map((name) => {
        const model = CONFIG.models.find((m) => m.id === name.trim() || m.slug === name.trim());
        if (!model) throw new Error(`Unknown model "${name}". Known: ${CONFIG.models.map((m) => m.slug).join(", ")}`);
        return model;
      })
    : CONFIG.comparison.map(modelConfig);
  const ideaIds = values.ideas ? values.ideas.split(",").map(Number) : IDEAS.map((_, i) => i + 1);
  if (ideaIds.some((id) => !Number.isInteger(id) || id < 1 || id > IDEAS.length)) {
    throw new Error(`--ideas must be a comma-separated list of 1-${IDEAS.length}`);
  }
  const runs = Number(values.runs);
  const outDir = path.resolve(ROOT, values.out!);
  mkdirSync(outDir, { recursive: true });

  if (step === "serve") {
    serveReviewPage(outDir, Number(values.port));
    return;
  }
  if (step === "list-models") {
    await printModelLists();
    return;
  }

  const store = new RunStore(path.join(outDir, "runs.json"));
  const options: StepOptions = { models, ideaIds, runs, rerun: values.rerun! };

  // Only providers with runs still to do need a key; completed runs are skipped.
  const steps: Step[] = step === "all" ? ["spec", "code"] : step === "report" ? [] : [step as Step];
  const pending = models.filter((m) =>
    steps.some((st) =>
      ideaIds.some((ideaId) =>
        Array.from({ length: runs }, (_, i) => i + 1).some((run) => shouldRun(store, options.rerun, st, m.id, ideaId, run))
      )
    )
  );
  for (const provider of new Set(pending.map((m) => m.provider))) {
    const problem = missingKeyMessage(provider);
    if (problem) {
      console.error(problem);
      process.exit(1);
    }
  }

  if (step === "spec" || step === "all") await runSpecStep(outDir, store, options);
  if (step === "code" || step === "all") await runCodeStep(outDir, store, options);

  const reported = store.records.filter((r) => CONFIG.comparison.includes(r.model));
  writeCsv(outDir, reported);
  writeSummary(outDir, reported);
  for (const page of PROTOTYPE_PAGES) writeReviewPage(outDir, store.records, page);
  for (const page of SPEC_PAGES) writeSpecReviewPage(outDir, store.records, page);
  console.log(`Wrote ${path.relative(ROOT, outDir)}/runs.csv (${reported.length} runs) and summary.csv`);
}

/** Print each provider's model list, marking the configured models. */
async function printModelLists() {
  for (const provider of ["deepseek", "groq"] as const) {
    const problem = missingKeyMessage(provider);
    if (problem) {
      console.log(`${provider}: skipped (${problem})\n`);
      continue;
    }
    const configured = [
      ...new Set(CONFIG.models.filter((m) => m.provider === provider).map((m) => m.apiModel ?? m.id)),
    ];
    const list = await listModels(provider);
    console.log(`${provider}: ${list.length} models`);
    for (const m of list.sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
      const extras = ["active", "context_window", "owned_by"]
        .filter((field) => m[field] !== undefined)
        .map((field) => `${field}=${m[field]}`)
        .join(" ");
      console.log(`  ${configured.includes(String(m.id)) ? "*" : " "} ${m.id}  ${extras}`);
    }
    const missing = configured.filter((id) => !list.some((m) => m.id === id));
    console.log(missing.length ? `  configured but NOT listed: ${missing.join(", ")}\n` : "  (* = configured)\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
