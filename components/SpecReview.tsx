"use client";

import { useState } from "react";
import type { Spec } from "@/lib/types";

interface SpecReviewProps {
  spec: Spec;
  onRegenerate: () => void;
  onContinue: (spec: Spec) => void;
  regenerating: boolean;
}

export default function SpecReview({ spec, onRegenerate, onContinue, regenerating }: SpecReviewProps) {
  const [draft, setDraft] = useState<Spec>(spec);

  function updateScreen(index: number, field: "name" | "purpose", value: string) {
    setDraft((d) => ({
      ...d,
      screens: d.screens.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  }

  function removeScreen(index: number) {
    setDraft((d) => ({ ...d, screens: d.screens.filter((_, i) => i !== index) }));
  }

  function addScreen() {
    setDraft((d) => ({ ...d, screens: [...d.screens, { name: "", purpose: "" }] }));
  }

  function updateOutOfScope(index: number, value: string) {
    setDraft((d) => ({
      ...d,
      outOfScope: d.outOfScope.map((item, i) => (i === index ? value : item)),
    }));
  }

  function removeOutOfScope(index: number) {
    setDraft((d) => ({ ...d, outOfScope: d.outOfScope.filter((_, i) => i !== index) }));
  }

  function addOutOfScope() {
    setDraft((d) => ({ ...d, outOfScope: [...d.outOfScope, ""] }));
  }

  return (
    <div className="shell">
      <div className="header-block">
        <div className="eyebrow">review spec</div>
        <h1 className="title">{draft.productName || "Untitled product"}</h1>
        {spec.oneLiner && <p className="subtitle">{spec.oneLiner}</p>}
      </div>

      <div className="card">
        <div className="field-row field-row--two">
          <div className="field">
            <label className="field-label" htmlFor="productName">
              Product name
            </label>
            <input
              id="productName"
              className="input"
              value={draft.productName}
              onChange={(e) => setDraft((d) => ({ ...d, productName: e.target.value }))}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="targetUser">
              Target user
            </label>
            <input
              id="targetUser"
              className="input"
              value={draft.targetUser}
              onChange={(e) => setDraft((d) => ({ ...d, targetUser: e.target.value }))}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="tone">
            Tone
          </label>
          <input
            id="tone"
            className="input"
            value={draft.tone}
            onChange={(e) => setDraft((d) => ({ ...d, tone: e.target.value }))}
          />
        </div>
      </div>

      <div className="card">
        <div className="field-label">Screens</div>
        {draft.screens.map((screen, i) => (
          <div className="list-row" key={i}>
            <input
              className="input"
              placeholder="Screen name"
              value={screen.name}
              onChange={(e) => updateScreen(i, "name", e.target.value)}
            />
            <input
              className="input"
              placeholder="Purpose"
              value={screen.purpose}
              onChange={(e) => updateScreen(i, "purpose", e.target.value)}
            />
            <button
              type="button"
              className="btn-danger-ghost"
              onClick={() => removeScreen(i)}
              aria-label={`Remove screen ${screen.name || i + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost list-add" onClick={addScreen}>
          + Add screen
        </button>
      </div>

      <div className="card">
        <div className="field-label">Out of scope</div>
        {draft.outOfScope.map((item, i) => (
          <div className="list-row" key={i}>
            <input className="input" value={item} onChange={(e) => updateOutOfScope(i, e.target.value)} />
            <button
              type="button"
              className="btn-danger-ghost"
              onClick={() => removeOutOfScope(i)}
              aria-label={`Remove out of scope item ${i + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost list-add" onClick={addOutOfScope}>
          + Add item
        </button>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? "Regenerating..." : "Regenerate spec"}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={draft.screens.length === 0 || regenerating}
          onClick={() => onContinue(draft)}
        >
          Looks good, continue
        </button>
      </div>
    </div>
  );
}
