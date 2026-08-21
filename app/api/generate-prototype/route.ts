import { NextResponse } from "next/server";
import type { PrototypeFile, PrototypeResult, Screen } from "@/lib/types";

const V0_CHATS_URL = "https://api.v0.dev/v1/chats";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 240_000;
const REQUEST_TIMEOUT_MS = 30_000;

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.V0_API_KEY}`,
  };
}

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const productName = typeof body?.productName === "string" ? body.productName : "Untitled product";
  const screens: Screen[] = Array.isArray(body?.screens) ? body.screens : [];
  const coreFlow: string[] = Array.isArray(body?.coreFlow) ? body.coreFlow : [];
  const tone = typeof body?.tone === "string" ? body.tone : "";

  const screensText = screens.map((s) => `- ${s.name}: ${s.purpose}`).join("\n") || "Not specified.";
  const flowText = coreFlow.map((step, i) => `${i + 1}. ${step}`).join("\n") || "Not specified.";

  const message = `Build a clickable prototype for "${productName}".

Visual/brand tone: ${tone || "unspecified"}

Core user flow:
${flowText}

Screens:
${screensText}

Implement each screen with a realistic layout and content matching the product's purpose, and wire up navigation between screens to match the core flow. Choose a color palette and visual style that fits the brand tone above.`;

  try {
    // v0's chat/completions endpoint (OpenAI-compatible) only returns generated
    // text/code — no deployed demo. The Platform API's /v1/chats endpoint is what
    // actually builds and deploys a live, iframe-able preview via latestVersion.demoUrl.
    //
    // responseMode: "sync" holds the connection open until the build finishes, which
    // for a multi-screen app can exceed an upstream proxy timeout (observed: the
    // socket was closed at exactly 60s with zero bytes read back). "async" returns
    // immediately with a pending version, which we then poll for.
    const createRes = await fetchWithTimeout(
      V0_CHATS_URL,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          message,
          modelConfiguration: { modelId: "v0-pro" },
          responseMode: "async",
          // Defaults to private (viewable only by the creator's v0 account).
          // "unlisted" makes the share link work for anyone who has it.
          chatPrivacy: "unlisted",
        }),
      },
      REQUEST_TIMEOUT_MS
    );

    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => "");
      console.error("generate-prototype: v0 create returned", createRes.status, errText);
      const payload: PrototypeResult = { files: [], webUrl: null, error: "prototype_failed" };
      return NextResponse.json(payload);
    }

    let latest = await createRes.json();
    const chatId: string | undefined = latest?.id;

    if (!chatId) {
      console.error("generate-prototype: v0 create response missing id", latest);
      const payload: PrototypeResult = { files: [], webUrl: null, error: "prototype_failed", raw: latest };
      return NextResponse.json(payload);
    }

    const deadline = Date.now() + MAX_POLL_MS;
    while (Date.now() < deadline) {
      const status = latest?.latestVersion?.status;
      if (status === "completed" || status === "failed") break;

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollRes = await fetchWithTimeout(`${V0_CHATS_URL}/${chatId}`, { headers: authHeaders() }, REQUEST_TIMEOUT_MS);
      if (!pollRes.ok) {
        console.error("generate-prototype: v0 poll returned", pollRes.status);
        break;
      }
      latest = await pollRes.json();
    }

    // v0-generated files have previously proven unreliable to embed directly
    // (a prior attempt to run them in an iframe/WebContainer hit build and
    // sandbox issues), so we show the generated files themselves plus a link
    // out to view the live version.
    const rawFiles = Array.isArray(latest?.latestVersion?.files) ? latest.latestVersion.files : [];
    const files: PrototypeFile[] = rawFiles
      .filter((f: unknown): f is { name: unknown; content: unknown } => typeof f === "object" && f !== null)
      .filter((f: { name: unknown; content: unknown }) => typeof f.name === "string" && typeof f.content === "string")
      .map((f: { name: unknown; content: unknown }) => ({ name: f.name as string, content: f.content as string }));

    // latestVersion.demoUrl is the public, no-login preview (vusercontent.net),
    // but it's currently unreliable for chats created via the Platform API —
    // v0's sandbox reproducibly fails to resolve imports (tailwindcss, etc.)
    // for these chats since a Feb 2026 sandbox update (confirmed as a known,
    // open v0 issue, not something on our end). latest.webUrl is the v0.app
    // chat/editor page, which always renders correctly but requires the
    // viewer to be signed into v0. Prefer the reliable editor link until v0
    // fixes the demo sandbox for API-created chats.
    const demoUrl: string | null =
      typeof latest?.latestVersion?.demoUrl === "string" ? latest.latestVersion.demoUrl : null;
    const chatWebUrl: string | null = typeof latest?.webUrl === "string" ? latest.webUrl : null;
    const webUrl = chatWebUrl ?? demoUrl;
    const openRequiresLogin = webUrl !== null && webUrl === chatWebUrl;

    const payload: PrototypeResult = { files, webUrl, openRequiresLogin, raw: latest };
    if (files.length === 0) {
      payload.error = "prototype_failed";
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("generate-prototype: v0 API call failed", error);
    const payload: PrototypeResult = { files: [], webUrl: null, error: "prototype_failed" };
    return NextResponse.json(payload);
  }
}
