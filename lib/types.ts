export type Platform = "web" | "mobile" | "desktop";

export interface IdeaInput {
  idea: string;
  platform: Platform;
  mustHaveFeature: string;
  tone: string;
}

export interface Screen {
  name: string;
  purpose: string;
}

export interface Spec {
  productName: string;
  oneLiner: string;
  problem: string;
  targetUser: string;
  tone: string;
  platform: string;
  coreFlow: string[];
  screens: Screen[];
  outOfScope: string[];
}

export type Stage =
  | "input"
  | "generating-spec"
  | "review"
  | "generating-prototype"
  | "results";

export interface PrototypeFile {
  name: string;
  content: string;
}

export interface PrototypeResult {
  files: PrototypeFile[];
  webUrl: string | null;
  error?: string;
  raw?: unknown;
}
