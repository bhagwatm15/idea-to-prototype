"use client";

import { useState } from "react";
import PrototypePreview from "@/components/PrototypePreview";
import type { Spec } from "@/lib/types";

interface ResultsViewProps {
  spec: Spec;
  prototypeLoading: boolean;
  prototypeCode: string | null;
  prototypeFailed: boolean;
  prototypeVersion: number;
  onRetryPrototype: () => void;
  onStartOver: () => void;
}

export default function ResultsView({
  spec,
  prototypeLoading,
  prototypeCode,
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
        <div className="card summary-body">
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
        ) : prototypeCode ? (
          <PrototypePreview key={prototypeVersion} code={prototypeCode} />
        ) : (
          <div className="prototype-fallback">
            <p>{prototypeFailed ? "Prototype generation failed." : "No prototype generated."}</p>
            <button type="button" className="btn btn-secondary" onClick={onRetryPrototype}>
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="card out-of-scope-block">
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
