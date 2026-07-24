"use client";

import { useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";
import { buildFileSystemTree } from "./build-tree";
import reorientFiles from "./reorient-files.json";

type Status = "idle" | "booting" | "mounting" | "installing" | "starting" | "ready" | "error";

export default function WebContainerTestPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bootedRef = useRef(false);

  function appendLog(line: string) {
    setLog((prev) => [...prev.slice(-500), line]);
  }

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let container: WebContainer | null = null;

    async function run() {
      try {
        setStatus("booting");
        appendLog("Booting WebContainer...");
        container = await WebContainer.boot({ coep: "require-corp" });

        container.on("error", (e) => appendLog(`[webcontainer error] ${e.message}`));

        setStatus("mounting");
        appendLog("Mounting file system tree...");
        const tree = buildFileSystemTree(reorientFiles);
        await container.mount(tree);

        setStatus("installing");
        appendLog("Running npm install (this can take a while)...");
        const install = await container.spawn("npm", ["install"]);
        install.output.pipeTo(
          new WritableStream({
            write(chunk) {
              appendLog(chunk);
            },
          })
        );
        const installExit = await install.exit;
        if (installExit !== 0) {
          throw new Error(`npm install exited with code ${installExit}`);
        }

        setStatus("starting");
        // WebContainers only ships WASM Node bindings — Turbopack (Next 16's
        // `next dev` default) requires native bindings and fatally errors
        // right after boot. Force Webpack explicitly instead.
        appendLog("Starting dev server (next dev --webpack)...");
        const devServer = await container.spawn("npx", ["next", "dev", "--webpack"]);
        devServer.output.pipeTo(
          new WritableStream({
            write(chunk) {
              appendLog(chunk);
            },
          })
        );

        container.on("server-ready", (port, url) => {
          appendLog(`Server ready on port ${port}: ${url}`);
          setPreviewUrl(url);
          setStatus("ready");
        });
      } catch (err) {
        console.error(err);
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    }

    run();
  }, []);

  return (
    <div className="shell shell--wide">
      <div className="header-block">
        <div className="eyebrow">isolated spike — not wired into the pipeline</div>
        <h1 className="title">WebContainers Test</h1>
        <p className="subtitle">
          Booting a real v0-generated file set (&quot;Reorient&quot;, 10 files) inside an in-browser Node.js
          runtime, plus supplied Next.js boilerplate (tsconfig, next.config, postcss.config).
        </p>
      </div>

      <div className="card">
        <div className="field-label">Status: {status}</div>
        {errorMsg && <div className="error-banner">{errorMsg}</div>}
        <pre className="code-block" style={{ height: 320, marginTop: 12 }}>
          <code>{log.join("\n")}</code>
        </pre>
      </div>

      {previewUrl && (
        <div className="card">
          <div className="field-label">Live preview</div>
          <iframe
            src={previewUrl}
            title="WebContainer preview"
            style={{ width: "100%", height: 600, border: "1px solid var(--border-subtle)", borderRadius: 6, marginTop: 12 }}
          />
        </div>
      )}
    </div>
  );
}
