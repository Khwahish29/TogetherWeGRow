export type Role = "mentor" | "learner" | "buddy";
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
  format: Format;
  profileApproved: boolean;
  buddy?: BuddyOffer;
  isDemo?: boolean;
  createdAt: string;
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
  isDemo?: boolean;
  createdAt: string;
}

export type RequestStatus = "pending" | "accepted" | "declined";

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
