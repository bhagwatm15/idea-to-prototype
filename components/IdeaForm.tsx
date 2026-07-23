"use client";

import { useState } from "react";
import type { IdeaInput, Platform } from "@/lib/types";

interface IdeaFormProps {
  onSubmit: (input: IdeaInput) => void;
  error: string | null;
}

export default function IdeaForm({ onSubmit, error }: IdeaFormProps) {
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState<Platform>("web");
  const [mustHaveFeature, setMustHaveFeature] = useState("");
  const [tone, setTone] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) return;
    onSubmit({ idea: idea.trim(), platform, mustHaveFeature: mustHaveFeature.trim(), tone: tone.trim() });
  }

  return (
    <div className="shell">
      <div className="header-block">
        <div className="eyebrow">idea → prototype</div>
        <h1 className="title">What are you building?</h1>
        <p className="subtitle">
          Describe your idea in a sentence. We&apos;ll turn it into a structured spec and a clickable prototype.
        </p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="idea">
            Idea
          </label>
          <textarea
            id="idea"
            className="textarea"
            required
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="A habit tracker that turns your streaks into a garden that grows"
          />
        </div>

        <div className="field-row field-row--two">
          <div className="field">
            <label className="field-label" htmlFor="platform">
              Platform
            </label>
            <select
              id="platform"
              className="select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="tone">
              Tone <span className="field-hint">(optional)</span>
            </label>
            <input
              id="tone"
              className="input"
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="playful, enterprise-serious..."
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="mustHaveFeature">
            Must-have feature <span className="field-hint">(optional)</span>
          </label>
          <input
            id="mustHaveFeature"
            className="input"
            type="text"
            value={mustHaveFeature}
            onChange={(e) => setMustHaveFeature(e.target.value)}
            placeholder="Offline mode, voice input..."
          />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="btn-row">
          <button type="submit" className="btn btn-primary btn-block" disabled={!idea.trim()}>
            Generate spec
          </button>
        </div>
      </form>
    </div>
  );
}
