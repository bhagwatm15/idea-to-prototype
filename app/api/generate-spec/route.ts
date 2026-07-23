import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { Spec } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idea = typeof body?.idea === "string" ? body.idea.trim() : "";

  if (!idea) {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  const platform = typeof body?.platform === "string" && body.platform ? body.platform : "web";
  const mustHaveFeature = typeof body?.mustHaveFeature === "string" ? body.mustHaveFeature.trim() : "";
  const tone = typeof body?.tone === "string" ? body.tone.trim() : "";

  const prompt = `You are a product strategist. Turn the following one-line product idea into a structured product spec.

Idea: ${idea}
Platform: ${platform}
Must-have feature: ${mustHaveFeature || "none specified - use your judgment"}
Desired tone: ${tone || "unspecified - infer one that fits the idea"}

Return ONLY a JSON object (no markdown fences, no commentary, no leading or trailing text) matching exactly this schema:

{
  "productName": string,
  "oneLiner": string,
  "problem": string,
  "targetUser": string,
  "tone": string (3-4 word visual/brand tone, e.g. "playful, warm, approachable"),
  "platform": string,
  "coreFlow": string[],
  "screens": [{ "name": string, "purpose": string }] (3-5 items),
  "outOfScope": string[]
}`;

  let rawText: string;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    rawText = block && block.type === "text" ? block.text : "";
  } catch (error) {
    console.error("generate-spec: Anthropic API call failed", error);
    return NextResponse.json(
      { error: "Failed to reach the spec generation service." },
      { status: 502 }
    );
  }

  const cleaned = stripFences(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("generate-spec: failed to parse model output:", cleaned);
    return NextResponse.json(
      { error: "The spec generator returned output that could not be parsed." },
      { status: 502 }
    );
  }

  if (!isValidSpec(parsed)) {
    console.error("generate-spec: model output missing required fields:", parsed);
    return NextResponse.json(
      { error: "The spec generator returned an incomplete spec." },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed);
}
