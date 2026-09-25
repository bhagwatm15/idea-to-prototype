/**
 * Provider adapters for scripts/compare-models.ts. Each adapter makes one
 * streaming request and returns the text plus timing and usage; retries and
 * rate-limit waits are handled once, in callWithRetries.
 *
 * API shapes (checked 2026-09-25):
 * - Anthropic: @anthropic-ai/sdk messages.stream. Usage has input_tokens,
 *   output_tokens (thinking included, not broken out), cache_read_input_tokens.
 * - DeepSeek: OpenAI-compatible POST https://api.deepseek.com/chat/completions.
 *   Thinking is on by default (effort high); reasoning streams in
 *   delta.reasoning_content. Usage rides on the last chunk: prompt_tokens,
 *   completion_tokens, prompt_cache_hit_tokens,
 *   completion_tokens_details.reasoning_tokens.
 * - Groq: OpenAI-compatible POST https://api.groq.com/openai/v1/chat/completions
 *   with max_completion_tokens. gpt-oss reasons by default (effort medium);
 *   reasoning streams in delta.reasoning. Streaming usage is in the final
 *   chunk's x_groq.usage (prompt_tokens_details.cached_tokens,
 *   completion_tokens_details.reasoning_tokens). 429s carry retry-after (seconds).
 */
import Anthropic from "@anthropic-ai/sdk";

export type ProviderName = "anthropic" | "deepseek" | "groq";

export interface CallOutcome {
  /** Answer text only; reasoning is never included. */
  text: string;
  /** Wall time of the successful attempt, excluding earlier attempts and waits. */
  latencyMs: number;
  /** Time to the first streamed output token of any kind (reasoning or text). */
  ttftMs: number | null;
  /** Total input tokens, cached ones included. */
  inputTokens: number | null;
  /** All generated tokens, including reasoning where the provider bills it as output. */
  outputTokens: number | null;
  reasoningTokens: number | null;
  cachedInputTokens: number | null;
  stopReason: string | null;
  /** Anthropic max_tokens or OpenAI-style length. */
  truncated: boolean;
  /** e.g. "text", "thinking+text", "reasoning+text". */
  contentBlocks: string;
  /** UTC start time of the successful attempt. */
  startedAt: Date;
  retries: number;
  rateLimitWaitMs: number;
}

type AttemptResult = Omit<CallOutcome, "retries" | "rateLimitWaitMs" | "startedAt">;

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly retryAfterMs: number | null
  ) {
    super(message);
  }

  get isRateLimit() {
    return this.status === 429;
  }

  get isRetryable() {
    return this.status === null || this.status === 408 || this.status === 409 || this.status === 429 || this.status >= 500;
  }
}

/** retry-after is seconds or an HTTP date; retry-after-ms is milliseconds. */
function retryAfterMs(headers: Headers | undefined | null): number | null {
  const ms = Number(headers?.get("retry-after-ms"));
  if (ms > 0) return ms;
  const value = headers?.get("retry-after");
  if (!value) return null;
  const seconds = Number(value);
  if (!Number.isNaN(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

// ---------------------------------------------------------------------------
// Anthropic
// ---------------------------------------------------------------------------

let anthropicClient: Anthropic | null = null;

async function anthropicAttempt(model: string, prompt: string, maxTokens: number, start: number): Promise<AttemptResult> {
  anthropicClient ??= new Anthropic({ maxRetries: 0 });
  let ttftMs: number | null = null;
  try {
    const stream = anthropicClient.messages.stream({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    for await (const event of stream) {
      if (ttftMs === null && event.type === "content_block_delta") ttftMs = Math.round(performance.now() - start);
    }
    const message = await stream.finalMessage();
    return {
      text: message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join(""),
      latencyMs: Math.round(performance.now() - start),
      ttftMs,
      // Anthropic's input_tokens excludes cache reads/writes; count them in, so input
      // means total input for every provider (DeepSeek and Groq already do this).
      inputTokens:
        message.usage.input_tokens +
        (message.usage.cache_read_input_tokens ?? 0) +
        (message.usage.cache_creation_input_tokens ?? 0),
      outputTokens: message.usage.output_tokens,
      reasoningTokens: null,
      cachedInputTokens: message.usage.cache_read_input_tokens ?? null,
      stopReason: message.stop_reason,
      truncated: message.stop_reason === "max_tokens",
      contentBlocks: message.content.map((block) => block.type).join("+"),
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new ProviderError(error.message, error.status ?? null, retryAfterMs(error.headers as Headers | undefined));
    }
    throw new ProviderError((error as Error).message, null, null);
  }
}

// ---------------------------------------------------------------------------
// OpenAI-compatible (DeepSeek, Groq)
// ---------------------------------------------------------------------------

interface CompatProvider {
  url: string;
  keyEnv: string;
  /** Request field for the output cap. */
  maxTokensField: "max_tokens" | "max_completion_tokens";
  /** Delta field that carries streamed reasoning text. */
  reasoningField: string;
}

// DEEPSEEK_BASE_URL / GROQ_BASE_URL override the hosts (GROQ_BASE_URL is the Groq SDK's own name for this).
const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const GROQ_BASE = process.env.GROQ_BASE_URL ?? "https://api.groq.com";

export const COMPAT_PROVIDERS: Record<"deepseek" | "groq", CompatProvider & { modelsUrl: string }> = {
  deepseek: {
    url: `${DEEPSEEK_BASE}/chat/completions`,
    modelsUrl: `${DEEPSEEK_BASE}/models`,
    keyEnv: "DEEPSEEK_API_KEY",
    maxTokensField: "max_tokens",
    reasoningField: "reasoning_content",
  },
  groq: {
    url: `${GROQ_BASE}/openai/v1/chat/completions`,
    modelsUrl: `${GROQ_BASE}/openai/v1/models`,
    keyEnv: "GROQ_API_KEY",
    maxTokensField: "max_completion_tokens",
    reasoningField: "reasoning",
  },
};

interface CompatUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_cache_hit_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number } | null;
  completion_tokens_details?: { reasoning_tokens?: number } | null;
}

interface CompatChunk {
  choices?: { delta?: Record<string, unknown>; finish_reason?: string | null }[];
  usage?: CompatUsage | null;
  x_groq?: { usage?: CompatUsage | null; error?: string | null } | null;
  error?: { message?: string } | string;
}

async function compatAttempt(
  provider: CompatProvider,
  model: string,
  prompt: string,
  maxTokens: number,
  start: number
): Promise<AttemptResult> {
  const key = process.env[provider.keyEnv];
  let response: Response;
  try {
    response = await fetch(provider.url, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        [provider.maxTokensField]: maxTokens,
        stream: true,
      }),
      signal: AbortSignal.timeout(15 * 60 * 1000),
    });
  } catch (error) {
    throw new ProviderError(`Connection error: ${(error as Error).message}`, null, null);
  }
  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new ProviderError(
      `${response.status} ${body.slice(0, 300)}`.trim(),
      response.status,
      retryAfterMs(response.headers)
    );
  }

  let text = "";
  let sawReasoning = false;
  let ttftMs: number | null = null;
  let finishReason: string | null = null;
  let usage: CompatUsage | null = null;

  const handle = (data: string) => {
    if (data === "[DONE]") return;
    const chunk = JSON.parse(data) as CompatChunk;
    const streamError = chunk.x_groq?.error ?? (typeof chunk.error === "string" ? chunk.error : chunk.error?.message);
    if (streamError) throw new ProviderError(`Stream error: ${streamError}`, null, null);
    for (const choice of chunk.choices ?? []) {
      const content = choice.delta?.content;
      const reasoning = choice.delta?.[provider.reasoningField];
      if (typeof reasoning === "string" && reasoning) sawReasoning = true;
      if (typeof content === "string") text += content;
      if (ttftMs === null && ((typeof content === "string" && content) || (typeof reasoning === "string" && reasoning))) {
        ttftMs = Math.round(performance.now() - start);
      }
      if (choice.finish_reason) finishReason = choice.finish_reason;
    }
    usage = chunk.usage ?? chunk.x_groq?.usage ?? usage;
  };

  // Server-sent events: "data: <json>" lines; lines starting with ":" are keep-alive comments.
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for await (const bytes of response.body as unknown as AsyncIterable<Uint8Array>) {
      buffer += decoder.decode(bytes, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line.startsWith("data:")) handle(line.slice(5).trim());
      }
    }
    if (buffer.trim().startsWith("data:")) handle(buffer.trim().slice(5).trim());
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(`Stream interrupted: ${(error as Error).message}`, null, null);
  }

  const u = usage as CompatUsage | null;
  return {
    text,
    latencyMs: Math.round(performance.now() - start),
    ttftMs,
    inputTokens: u?.prompt_tokens ?? null,
    outputTokens: u?.completion_tokens ?? null,
    reasoningTokens: u?.completion_tokens_details?.reasoning_tokens ?? null,
    cachedInputTokens: u?.prompt_cache_hit_tokens ?? u?.prompt_tokens_details?.cached_tokens ?? null,
    stopReason: finishReason,
    truncated: finishReason === "length",
    contentBlocks: sawReasoning ? "reasoning+text" : "text",
  };
}

// ---------------------------------------------------------------------------
// Retries
// ---------------------------------------------------------------------------

export interface RetryPolicy {
  /** Retries for connection errors and 5xx, with exponential backoff. */
  maxErrorRetries: number;
  /** Retries for 429s, each waiting for retry-after (or backoff when it's missing). */
  maxRateLimitRetries: number;
}

export async function callWithRetries(
  provider: ProviderName,
  model: string,
  prompt: string,
  maxTokens: number,
  policy: RetryPolicy,
  log: (message: string) => void
): Promise<CallOutcome> {
  let errorRetries = 0;
  let rateLimitRetries = 0;
  let rateLimitWaitMs = 0;
  for (;;) {
    const startedAt = new Date();
    const start = performance.now();
    try {
      const result =
        provider === "anthropic"
          ? await anthropicAttempt(model, prompt, maxTokens, start)
          : await compatAttempt(COMPAT_PROVIDERS[provider], model, prompt, maxTokens, start);
      return { ...result, startedAt, retries: errorRetries + rateLimitRetries, rateLimitWaitMs };
    } catch (error) {
      const e = error instanceof ProviderError ? error : new ProviderError(String(error), null, null);
      if (e.isRateLimit && rateLimitRetries < policy.maxRateLimitRetries) {
        rateLimitRetries++;
        const waitMs = e.retryAfterMs ?? 2 ** rateLimitRetries * 1000;
        rateLimitWaitMs += waitMs;
        log(`  ${model}: rate limited, waiting ${(waitMs / 1000).toFixed(1)}s${e.retryAfterMs === null ? " (no retry-after)" : ""}`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      if (!e.isRateLimit && e.isRetryable && errorRetries < policy.maxErrorRetries) {
        errorRetries++;
        const waitMs = 2 ** errorRetries * 1000;
        log(`  ${model}: ${e.message} (retrying in ${waitMs / 1000}s)`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw e;
    }
  }
}

// ---------------------------------------------------------------------------
// Model listing
// ---------------------------------------------------------------------------

export async function listModels(provider: "deepseek" | "groq"): Promise<Record<string, unknown>[]> {
  const config = COMPAT_PROVIDERS[provider];
  const response = await fetch(config.modelsUrl, {
    headers: { authorization: `Bearer ${process.env[config.keyEnv]}` },
  });
  if (!response.ok) throw new Error(`${provider} models: ${response.status} ${(await response.text()).slice(0, 300)}`);
  const body = (await response.json()) as { data?: Record<string, unknown>[] };
  return body.data ?? [];
}
