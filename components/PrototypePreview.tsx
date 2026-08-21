"use client";

import { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeViewer,
} from "@codesandbox/sandpack-react";

interface PrototypePreviewProps {
  code: string;
}

export default function PrototypePreview({ code }: PrototypePreviewProps) {
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <SandpackProvider template="react" theme="dark" files={{ "/App.js": code }}>
      <SandpackLayout>
        <SandpackPreview
          showNavigator={false}
          showOpenInCodeSandbox={false}
          style={{ height: 480, width: "100%" }}
        />
      </SandpackLayout>

      <button type="button" className="summary-toggle" onClick={() => setCodeOpen((v) => !v)}>
        {codeOpen ? "Hide code" : "Show code"}
      </button>

      {codeOpen && (
        <div className="card prototype-code-card">
          <SandpackLayout>
            <SandpackCodeViewer showLineNumbers={false} />
          </SandpackLayout>
        </div>
      )}
    </SandpackProvider>
  );
}
