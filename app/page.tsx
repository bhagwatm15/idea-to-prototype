"use client";

import { useState } from "react";
import IdeaForm from "@/components/IdeaForm";
import LoadingStage from "@/components/LoadingStage";
import SpecReview from "@/components/SpecReview";
import ResultsView from "@/components/ResultsView";
import type { IdeaInput, PrototypeFile, PrototypeResult, Spec, Stage } from "@/lib/types";

export default function Home() {
  const [stage, setStage] = useState<Stage>("input");
  const [ideaInput, setIdeaInput] = useState<IdeaInput | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [specError, setSpecError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [prototypeFiles, setPrototypeFiles] = useState<PrototypeFile[]>([]);
  const [prototypeWebUrl, setPrototypeWebUrl] = useState<string | null>(null);
  const [prototypeOpenRequiresLogin, setPrototypeOpenRequiresLogin] = useState(false);
  const [prototypeFailed, setPrototypeFailed] = useState(false);
  const [prototypeLoading, setPrototypeLoading] = useState(false);
  const [prototypeVersion, setPrototypeVersion] = useState(0);

  async function fetchSpec(input: IdeaInput): Promise<Spec | null> {
    try {
      const res = await fetch("/api/generate-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        setSpecError(data?.error ?? "Failed to generate spec.");
        return null;
      }
      return data as Spec;
    } catch {
      setSpecError("Failed to reach the spec generation service.");
      return null;
    }
  }

  async function handleIdeaSubmit(input: IdeaInput) {
    setIdeaInput(input);
    setSpecError(null);
    setStage("generating-spec");
    const result = await fetchSpec(input);
    if (result) {
      setSpec(result);
      setStage("review");
    } else {
      setStage("input");
    }
  }

  async function handleRegenerate() {
    if (!ideaInput) return;
    setRegenerating(true);
    setSpecError(null);
    const result = await fetchSpec(ideaInput);
    if (result) {
      setSpec(result);
      setRegenerateCount((c) => c + 1);
    }
    setRegenerating(false);
  }

  async function runPrototype(targetSpec: Spec) {
    setPrototypeLoading(true);
    setPrototypeVersion((v) => v + 1);
    try {
      const res = await fetch("/api/generate-prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: targetSpec.productName,
          screens: targetSpec.screens,
          coreFlow: targetSpec.coreFlow,
          tone: targetSpec.tone,
        }),
      });
      const data: PrototypeResult = await res.json();
      setPrototypeFiles(data.files);
      setPrototypeWebUrl(data.webUrl);
      setPrototypeOpenRequiresLogin(Boolean(data.openRequiresLogin));
      setPrototypeFailed(data.files.length === 0);
    } catch {
      setPrototypeFiles([]);
      setPrototypeWebUrl(null);
      setPrototypeOpenRequiresLogin(false);
      setPrototypeFailed(true);
    } finally {
      setPrototypeLoading(false);
    }
  }

  async function handleContinue(finalSpec: Spec) {
    setSpec(finalSpec);
    setStage("generating-prototype");
    await runPrototype(finalSpec);
    setStage("results");
  }

  function handleRetryPrototype() {
    if (!spec) return;
    runPrototype(spec);
  }

  function handleStartOver() {
    setStage("input");
    setIdeaInput(null);
    setSpec(null);
    setSpecError(null);
    setRegenerating(false);
    setRegenerateCount(0);
    setPrototypeFiles([]);
    setPrototypeWebUrl(null);
    setPrototypeOpenRequiresLogin(false);
    setPrototypeFailed(false);
    setPrototypeLoading(false);
  }

  if (stage === "input") {
    return <IdeaForm onSubmit={handleIdeaSubmit} error={specError} />;
  }

  if (stage === "generating-spec") {
    return <LoadingStage copy="Creating your product spec..." />;
  }

  if (stage === "review" && spec) {
    return (
      <SpecReview
        key={regenerateCount}
        spec={spec}
        onRegenerate={handleRegenerate}
        onContinue={handleContinue}
        regenerating={regenerating}
      />
    );
  }

  if ((stage === "generating-prototype" || stage === "results") && spec) {
    return (
      <ResultsView
        spec={spec}
        prototypeLoading={stage === "generating-prototype" || prototypeLoading}
        prototypeFiles={prototypeFiles}
        prototypeWebUrl={prototypeWebUrl}
        prototypeOpenRequiresLogin={prototypeOpenRequiresLogin}
        prototypeVersion={prototypeVersion}
        prototypeFailed={prototypeFailed}
        onRetryPrototype={handleRetryPrototype}
        onStartOver={handleStartOver}
      />
    );
  }

  return <IdeaForm onSubmit={handleIdeaSubmit} error={specError} />;
}
