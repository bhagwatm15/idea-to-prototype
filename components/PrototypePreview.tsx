"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

interface PrototypePreviewProps {
  code: string;
}

export default function PrototypePreview({ code }: PrototypePreviewProps) {
  return (
    <Sandpack
      template="react"
      theme="dark"
      files={{ "/App.js": code }}
      options={{
        showLineNumbers: false,
        showNavigator: false,
        editorHeight: 480,
        layout: "preview",
      }}
    />
  );
}
