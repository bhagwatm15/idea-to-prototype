"use client";

import { useState } from "react";
import type { PrototypeFile, Spec } from "@/lib/types";

interface ResultsViewProps {
  spec: Spec;
  prototypeLoading: boolean;
  prototypeFiles: PrototypeFile[];
  prototypeWebUrl: string | null;
  prototypeFailed: boolean;
  prototypeVersion: number;
  onRetryPrototype: () => void;
  onStartOver: () => void;
}

function CodeViewer({ files, webUrl }: { files: PrototypeFile[]; webUrl: string | null }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = files[activeIndex] ?? files[0];

  return (
    <div>
      {webUrl && (
        <div className="prototype-cta">
          <p className="prototype-cta-copy">
            Your prototype is live and clickable — open it in v0 to try it for real.
          </p>
          <a href={webUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Open live prototype ↗
          </a>
        </div>
      )}
      <div className="code-section-label">Generated code</div>
      <div className="code-viewer">
        <div className="code-tabs">
          {files.map((file, i) => (
            <button
              key={file.name}
              type="button"
              className={i === activeIndex ? "code-tab code-tab-active" : "code-tab"}
              onClick={() => setActiveIndex(i)}
            >
              {file.name}
            </button>
          ))}
        </div>
        <pre className="code-block">
          <code>{active?.content}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ResultsView({
  spec,
  prototypeLoading,
  prototypeFiles,
  prototypeWebUrl,
  prototypeFailed,
  prototypeVersion,
  onRetryPrototype,
  onStartOver,
}: ResultsViewProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  function handleStartOver() {
    if (window.confirm("Start over? This will discard the current spec and prototype.")) {
      onStartOver();
    }
  }

  return (
    <div className="shell shell--wide">
      <div className="results-header">
        <button type="button" className="back-link" onClick={handleStartOver}>
          ← Start over
        </button>
      </div>

      <h1 className="title">{spec.productName}</h1>

      <button type="button" className="summary-toggle" onClick={() => setSummaryOpen((v) => !v)}>
        {summaryOpen ? "Hide spec summary" : "Show spec summary"}
      </button>

      {summaryOpen && (
        <div className="summary-body">
          <div className="summary-item">
            <span className="field-label">Problem</span>
            <p>{spec.problem}</p>
          </div>
          <div className="summary-item">
            <span className="field-label">Target user</span>
            <p>{spec.targetUser}</p>
          </div>
          <div className="summary-item">
            <span className="field-label">Tone</span>
            <p>{spec.tone}</p>
          </div>
        </div>
      )}

      <div className="prototype-section">
        <div className="panel-title">Prototype</div>
        {prototypeLoading ? (
          <div className="prototype-fallback">
            <div className="spinner" />
            <p className="loading-copy">Building your prototype... this can take a little longer</p>
          </div>
        ) : prototypeFiles.length > 0 ? (
          <CodeViewer key={prototypeVersion} files={prototypeFiles} webUrl={prototypeWebUrl} />
        ) : (
          <div className="prototype-fallback">
            <p>{prototypeFailed ? "Prototype generation failed." : "No prototype generated."}</p>
            <button type="button" className="btn btn-secondary" onClick={onRetryPrototype}>
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="out-of-scope-block">
        <div className="section-heading">Out of scope</div>
        <div className="pill-group">
          {spec.outOfScope.map((item, i) => (
            <span className="pill" key={i}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
