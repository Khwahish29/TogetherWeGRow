export type Role = "mentor" | "learner" | "buddy" | "employer";
export type Format = "online" | "in-person" | "both";
export type BuddyPricing = "free" | "volunteer" | "paid";

export interface BuddyOffer {
  topics: string[];
  availability: string;
  mode: Format;
  pricing: BuddyPricing;
  rate?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  /** Demo only: stored locally in plain text. Never do this with real accounts. */
  password: string;
  roles: Role[];
  location: string;
  bio: string;
  skills: string[];
  yearsExperience: number | null;
  industries: string[];
  workPreferences: string[];
  wantToLearn: string[];
  /** Language codes this person can talk in (Google Translate codes, e.g. "en", "es", "hi"). */
  languages?: string[];
  /** The language they would most like sessions in. */
  preferredLanguage?: string;
  format: Format;
  profileApproved: boolean;
  buddy?: BuddyOffer;
  /** Things that make using the site easier for this person (larger text, voice, a patient helper...). */
  comfort?: string[];
  /** Optional "what kind of work feels right for you" answers. Preferences, never medical information. */
  workComfort?: WorkComfort;
  /** For employers, schools and community organisations. */
  org?: Organisation;
  isDemo?: boolean;
  createdAt: string;
}

export type Posture = "sitting" | "standing" | "mix" | "";
export type WorkSetting = "remote" | "in-person" | "flexible" | "";

export interface WorkComfort {
  posture: Posture;
  /** true = would like to avoid routine heavy lifting; null = no preference given. */
  avoidHeavyLifting: boolean | null;
  hoursPerWeek: "" | "up-to-10" | "10-20" | "20-30" | "full-time";
  setting: WorkSetting;
  moreOf: string[];
  lessOf: string[];
  /** Whether employers may see these preferences when searching. Off by default. */
  shareWithEmployers: boolean;
}

export interface Organisation {
  name: string;
  kind: "workshop" | "school" | "community" | "business";
  about: string;
  /** Demo organisations are never verified. */
  verified: false;
}

export type OpportunityType = "mentoring" | "training" | "advisory" | "consulting";
export type PhysicalLevel = "none" | "occasional" | "regular" | "unspecified";

export interface Opportunity {
  id: string;
  employerId: string;
  orgName: string;
  title: string;
  type: OpportunityType;
  summary: string;
  responsibilities: string[];
  pay: { amount: number; unit: "hour" | "session" | "project" | "month" };
  hoursPerWeek: string;
  schedule: string;
  duration: string;
  setting: "on-site" | "remote" | "hybrid";
  location: string;
  physical: { posture: Posture | "unspecified"; heavyLifting: PhysicalLevel; notes: string };
  qualificationsRequired: string;
  qualificationsMaybe: string;
  paymentTerms: string;
  cancellationTerms: string;
  status: "open" | "closed";
  isDemo?: boolean;
  createdAt: string;
}

export type ApplicationStatus = "submitted" | "reviewing" | "invited" | "closed";

export interface Application {
  id: string;
  opportunityId: string;
  workerId: string;
  employerId: string;
  /** Who started it: the worker applied, or the employer invited them. */
  initiatedBy: "worker" | "employer";
  message: string;
  /** Optional reply from the other side (e.g. the worker answering an invitation). */
  reply?: string;
  helperRequested?: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  mentorId: string;
  title: string;
  category: string;
  description: string;
  format: Format;
  durationMins: number;
  price: number;
  /** Shown before booking. */
  cancellation?: string;
  isDemo?: boolean;
  createdAt: string;
}

export type RequestStatus = "pending" | "accepted" | "declined" | "withdrawn";

export interface ConnectionRequest {
  id: string;
  kind: "session" | "buddy";
  fromId: string;
  toId: string;
  listingId?: string;
  topic?: string;
  message: string;
  proposedAt: string;
  status: RequestStatus;
  createdAt: string;
}

/** Private notes a person keeps after a session. Only the author can see them. */
export interface Reflection {
  id: string;
  requestId: string;
  authorId: string;
  learned: string;
  surprised: string;
  feltRespected: "yes" | "mostly" | "not-really" | "";
  next: string;
  createdAt: string;
}

/** A public note of thanks shown on the recipient's profile. */
export interface ThankYou {
  id: string;
  fromId: string;
  toId: string;
  requestId?: string;
  message: string;
  /** Seeded example notes are fictional and labelled as such. */
  isDemo?: boolean;
  createdAt: string;
}
