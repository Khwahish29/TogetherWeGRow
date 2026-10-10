// Types shared by the browser app and the API server.

export type AiSource = "ai" | "fallback";

export interface ProfileDraft {
  skills: string[];
  yearsExperience: number | null;
  industries: string[];
  workPreferences: string[];
  suggestedRoles: string[];
  summary: string;
}

export type CareerType = "paid-mentoring" | "advisory" | "training" | "inspection" | "consulting";

export interface CareerRec {
  title: string;
  type: CareerType;
  why: string;
  transferableSkills: string[];
  qualificationsNeeded: string;
  physicalDemand: "low" | "medium";
  howToFind: string;
}

export interface CareerProfileInput {
  skills: string[];
  yearsExperience: number | null;
  workPreferences: string[];
  location?: string;
  interests?: string[];
}

export type CompanionAction = "guide" | "simpler" | "ask";

export interface CompanionRequest {
  action: CompanionAction;
  topic: string;
  step?: string;
  question?: string;
  /** How the learner says they feel about this topic today. */
  feeling?: "curious" | "nervous" | "frustrated" | "refresher";
}

export interface CompanionResponse {
  intro?: string;
  steps?: string[];
  reply?: string;
}

export interface ApiResult<T> {
  source: AiSource;
  data: T;
}
