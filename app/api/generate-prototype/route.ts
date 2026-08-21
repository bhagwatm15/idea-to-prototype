import Anthropic from "@anthropic-ai/sdk";
import { parse } from "@babel/parser";
import { NextResponse } from "next/server";
import type { PrototypeResult, Screen } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:jsx|tsx|js|javascript|typescript)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const productName = typeof body?.productName === "string" ? body.productName : "Untitled product";
  const screens: Screen[] = Array.isArray(body?.screens) ? body.screens : [];
  const coreFlow: string[] = Array.isArray(body?.coreFlow) ? body.coreFlow : [];
  const tone = typeof body?.tone === "string" ? body.tone : "";

  const screensText = screens.map((s) => `- ${s.name}: ${s.purpose}`).join("\n") || "Not specified.";
  const flowText = coreFlow.map((step, i) => `${i + 1}. ${step}`).join("\n") || "Not specified.";

  const prompt = `Build a clickable prototype for "${productName}".

Visual/brand tone: ${tone || "unspecified"}

Core user flow:
${flowText}

Screens:
${screensText}

Write a single, self-contained React functional component named App, as the default export, in one file. Use useState to switch between the screens listed above, with a simple nav or tab bar to move between them. Use inline styles only — no external CSS, no Tailwind, no component libraries. Do not make any auth or backend calls. Give each screen realistic, specific placeholder content that fits the product's purpose (real-sounding names, numbers, labels) — never generic lorem ipsum text, but keep sample data lists short (3-5 items is plenty). Choose colors and typography (via inline styles) that fit the brand tone above.

This has a hard length budget, so structure it to stay compact:
- Do not define separate named sub-components (no NavBar, no Card, no per-item helper functions) — write everything directly inside App's body, with an if/else or switch on the current screen.
- Define shared style objects (colors, spacing, a couple of reusable style constants) once near the top and reuse them, rather than repeating inline style objects.
- No animations, transitions, or decorative effects (e.g. confetti, spinners).
- Aim for roughly 120-180 lines total. A smaller, fully complete component is much better than a larger, cut-off one.

Return ONLY the code for this component — no markdown fences, no commentary, no leading or trailing text.`;

  let rawText: string;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });
    if (message.stop_reason === "max_tokens") {
      console.error("generate-prototype: response truncated at max_tokens");
    }
    const block = message.content[0];
    rawText = block && block.type === "text" ? block.text : "";
  } catch (error) {
    console.error("generate-prototype: Anthropic API call failed", error);
    const payload: PrototypeResult = { code: null, error: "prototype_failed" };
    return NextResponse.json(payload, { status: 502 });
  }

  const code = stripFences(rawText);

  if (!code.includes("export default")) {
    console.error("generate-prototype: model output missing export default:", code);
    const payload: PrototypeResult = {
      code: null,
      error: "The prototype generator returned output that wasn't a valid component.",
    };
    return NextResponse.json(payload, { status: 502 });
  }

  // A substring check can't catch a response that's truncated or malformed
  // partway through — actually parse it so we never hand Sandpack code that
  // fails at runtime with a raw syntax error.
  try {
    parse(code, { sourceType: "module", plugins: ["jsx"] });
  } catch (error) {
    console.error("generate-prototype: model output failed to parse:", error, code);
    const payload: PrototypeResult = {
      code: null,
      error: "The prototype generator returned output that wasn't valid JavaScript.",
    };
    return NextResponse.json(payload, { status: 502 });
  }

  const payload: PrototypeResult = { code };
  return NextResponse.json(payload);
}
