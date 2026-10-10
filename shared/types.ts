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

export interface ResumeJob {
  title: string;
  employer: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ResumeJobResult extends ResumeJob {
  /** A gentle question that could draw out more detail about this job. */
  followUp: string;
}

export interface ResumeSummaryInput {
  name: string;
  jobs: ResumeJob[];
  skills: string[];
  training: string[];
}

/** Someone who could help: a mentor or a digital buddy. */
export interface MatchPerson {
  id: string;
  name: string;
  /** What they offer: skills, or topics they can help with. */
  offers: string[];
  about: string;
  location: string;
  format: string;
  /** What they'd like to learn themselves (for optional two-way exchange). */
  wantsToLearn: string[];
}

export interface MatchRequest {
  /** Free-text need typed by the seeker, e.g. "fix my bike" or "join a zoom call". */
  need: string;
  seeker?: { skills: string[]; wantToLearn: string[]; location: string; format: string };
  people: MatchPerson[];
}

export interface MatchResult {
  id: string;
  score: number;
  /** Items from the person's `offers` that fit the need. */
  matched: string[];
  /** 1-3 short reasons, addressed to the seeker. */
  reasons: string[];
}
