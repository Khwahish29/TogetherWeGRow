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
  /** Plain-language summary of the person's optional work-comfort answers. */
  comfort?: string[];
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
  /** What is being matched: people who can teach/help, paid opportunities for a worker, or workers for an employer. */
  kind?: "mentor" | "buddy" | "opportunity" | "worker";
  /** Free-text need typed by the seeker, e.g. "fix my bike" or "join a zoom call". */
  need: string;
  seeker?: { skills: string[]; wantToLearn: string[]; location: string; format: string; preferences?: string[] };
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

export type PlanActionKind = "profile" | "resume" | "careers" | "opportunities" | "offer" | "buddy" | "practise" | "mentors";

export interface PlanStep {
  title: string;
  detail: string;
  actions: { kind: PlanActionKind; label: string }[];
  done?: boolean;
}

export interface NextChapterPlan {
  from: string;
  to: string;
  intro: string;
  steps: PlanStep[];
}

export interface NextChapterInput {
  name: string;
  skills: string[];
  yearsExperience: number | null;
  industries: string[];
  workPreferences: string[];
  comfort?: {
    posture: string;
    avoidHeavyLifting: boolean | null;
    hoursPerWeek: string;
    setting: string;
    moreOf: string[];
    lessOf: string[];
  };
  targetRole?: string;
  opportunities: { title: string; org: string; type: string }[];
  hasResume: boolean;
  hasOffer: boolean;
}

export type ScamVerdict = "likely-scam" | "be-careful" | "no-signs";

/** Our best judgment about a message someone was worried about. Never a guarantee. */
export interface ScamCheckResult {
  verdict: ScamVerdict;
  /** One plain sentence. */
  summary: string;
  /** The warning signs found, each with why it matters. */
  signs: { sign: string; why: string }[];
  /** What to do next. Always our own fixed wording. */
  advice: string[];
}

export interface VibeCheckRequest {
  text: string;
  /** "explain": what does this message mean? "rephrase": help me say this clearly and kindly. */
  mode: "explain" | "rephrase";
}

export interface VibeCheckResult {
  /** Plain-language meaning (explain) or a suggested clearer version (rephrase). */
  meaning: string;
  /** How the message is likely to feel, e.g. "Warm and appreciative". */
  tone: string;
  /** How sure the explanation is. Uncertain readings are never presented as facts. */
  certainty: "clear" | "likely" | "unsure";
  /** Phrases that were explained, each with its plain meaning. */
  phrases: { phrase: string; meaning: string }[];
  /** A friendly possible reply (explain mode). */
  reply?: string;
  /** A gentle way to ask what they meant, when it's unclear. */
  askBack?: string;
}
