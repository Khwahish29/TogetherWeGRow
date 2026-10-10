// Local demo data layer. Every function is async so it can be swapped for Supabase later
// without changing the pages that call it.
import { SEED_APPLICATIONS, SEED_LISTINGS, SEED_OPPORTUNITIES, SEED_REQUESTS, SEED_THANKS, SEED_USERS } from "../data/seed";
import type { NextChapterPlan } from "../../shared/types";
import type {
  Application,
  ApplicationStatus,
  ConnectionRequest,
  Listing,
  Opportunity,
  Reflection,
  RequestStatus,
  ThankYou,
  User,
} from "./types";

const KEYS = {
  users: "twg.users",
  listings: "twg.listings",
  requests: "twg.requests",
  reflections: "twg.reflections",
  thanks: "twg.thanks",
  opportunities: "twg.opportunities",
  applications: "twg.applications",
  plans: "twg.plans",
  session: "twg.session",
  seeded: "twg.seeded.v3",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode): the demo still runs for this page view.
  }
  window.dispatchEvent(new Event("twg:change"));
}

function ensureSeeded() {
  if (read(KEYS.seeded, false)) return;
  // Refresh the demo data but keep anything people created themselves.
  const keep = <T extends { id: string; isDemo?: boolean }>(key: string, seed: T[]) => [
    ...seed,
    ...read<T[]>(key, []).filter((item) => !item.isDemo && !seed.some((s) => s.id === item.id)),
  ];
  const keepById = <T extends { id: string }>(key: string, seed: T[]) => [
    ...seed,
    ...read<T[]>(key, []).filter((item) => !seed.some((s) => s.id === item.id)),
  ];
  write(KEYS.users, keep(KEYS.users, SEED_USERS));
  write(KEYS.listings, keep(KEYS.listings, SEED_LISTINGS));
  write(KEYS.requests, keepById(KEYS.requests, SEED_REQUESTS));
  write(KEYS.reflections, read(KEYS.reflections, []));
  write(KEYS.thanks, keepById(KEYS.thanks, SEED_THANKS));
  write(KEYS.opportunities, keep(KEYS.opportunities, SEED_OPPORTUNITIES));
  write(KEYS.applications, keepById(KEYS.applications, SEED_APPLICATIONS));
  write(KEYS.seeded, true);
}

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- Users & auth ----

export async function getUsers(): Promise<User[]> {
  ensureSeeded();
  return read<User[]>(KEYS.users, []);
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await getUsers()).find((u) => u.id === id);
}

export async function saveUser(user: User): Promise<User> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) users[index] = user;
  else users.push(user);
  write(KEYS.users, users);
  return user;
}

export function currentUserId(): string | null {
  return read<string | null>(KEYS.session, null);
}

export async function currentUser(): Promise<User | null> {
  const id = currentUserId();
  if (!id) return null;
  const user = await getUser(id);
  if (!user) {
    // The saved login points to an account that no longer exists (e.g. demo data was reset).
    write(KEYS.session, null);
    return null;
  }
  return user;
}

export async function signUp(
  input: Pick<User, "name" | "email" | "password" | "roles" | "location"> & { comfort?: string[]; org?: User["org"] },
): Promise<User> {
  const users = await getUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("An account with this email already exists. Try logging in instead.");
  }
  const user: User = {
    id: newId("u"),
    name: input.name.trim(),
    email,
    password: input.password,
    roles: input.roles,
    location: input.location.trim(),
    bio: "",
    skills: [],
    yearsExperience: null,
    industries: [],
    workPreferences: [],
    wantToLearn: [],
    format: "both",
    comfort: input.comfort ?? [],
    org: input.org,
    profileApproved: false,
    createdAt: new Date().toISOString(),
  };
  await saveUser(user);
  write(KEYS.session, user.id);
  return user;
}

export async function logIn(email: string, password: string): Promise<User> {
  const user = (await getUsers()).find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) throw new Error("That email and password don't match. Please try again.");
  write(KEYS.session, user.id);
  return user;
}

export async function logOut() {
  write(KEYS.session, null);
}

// ---- Listings ----

export async function getListings(): Promise<Listing[]> {
  ensureSeeded();
  return read<Listing[]>(KEYS.listings, []);
}

export async function createListing(listing: Omit<Listing, "id" | "createdAt">): Promise<Listing> {
  const created: Listing = { ...listing, id: newId("l"), createdAt: new Date().toISOString() };
  write(KEYS.listings, [created, ...(await getListings())]);
  return created;
}

export async function deleteListing(id: string) {
  write(KEYS.listings, (await getListings()).filter((l) => l.id !== id));
}

// ---- Requests (mentoring sessions and buddy help) ----

export async function getRequests(): Promise<ConnectionRequest[]> {
  ensureSeeded();
  return read<ConnectionRequest[]>(KEYS.requests, []);
}

export async function createRequest(
  req: Omit<ConnectionRequest, "id" | "createdAt" | "status">,
): Promise<ConnectionRequest> {
  const created: ConnectionRequest = { ...req, id: newId("r"), status: "pending", createdAt: new Date().toISOString() };
  write(KEYS.requests, [created, ...(await getRequests())]);
  return created;
}

export async function setRequestStatus(id: string, status: RequestStatus) {
  write(
    KEYS.requests,
    (await getRequests()).map((r) => (r.id === id ? { ...r, status } : r)),
  );
}

/** Suggest a new time. The request goes back to "pending" so the other person can say yes again. */
export async function rescheduleRequest(id: string, proposedAt: string) {
  write(
    KEYS.requests,
    (await getRequests()).map((r) => (r.id === id ? { ...r, proposedAt, status: "pending" as const } : r)),
  );
}

// ---- Reflections (private) and thank-you notes (public) ----

export async function getReflections(authorId: string): Promise<Reflection[]> {
  ensureSeeded();
  return read<Reflection[]>(KEYS.reflections, []).filter((r) => r.authorId === authorId);
}

export async function saveReflection(reflection: Omit<Reflection, "id" | "createdAt">): Promise<Reflection> {
  const all = read<Reflection[]>(KEYS.reflections, []).filter(
    (r) => !(r.requestId === reflection.requestId && r.authorId === reflection.authorId),
  );
  const created: Reflection = { ...reflection, id: newId("rf"), createdAt: new Date().toISOString() };
  write(KEYS.reflections, [created, ...all]);
  return created;
}

export async function getThanks(): Promise<ThankYou[]> {
  ensureSeeded();
  return read<ThankYou[]>(KEYS.thanks, []);
}

export async function sendThanks(note: Omit<ThankYou, "id" | "createdAt">): Promise<ThankYou> {
  const created: ThankYou = { ...note, id: newId("ty"), createdAt: new Date().toISOString() };
  write(KEYS.thanks, [created, ...(await getThanks())]);
  return created;
}

// ---- Paid opportunities and applications ----

export async function getOpportunities(): Promise<Opportunity[]> {
  ensureSeeded();
  return read<Opportunity[]>(KEYS.opportunities, []);
}

export async function saveOpportunity(
  opp: Omit<Opportunity, "id" | "createdAt"> & { id?: string; createdAt?: string },
): Promise<Opportunity> {
  const all = await getOpportunities();
  const saved: Opportunity = { ...opp, id: opp.id ?? newId("o"), createdAt: opp.createdAt ?? new Date().toISOString() };
  write(KEYS.opportunities, all.some((o) => o.id === saved.id) ? all.map((o) => (o.id === saved.id ? saved : o)) : [saved, ...all]);
  return saved;
}

export async function getApplications(): Promise<Application[]> {
  ensureSeeded();
  return read<Application[]>(KEYS.applications, []);
}

export async function createApplication(
  app: Omit<Application, "id" | "createdAt" | "updatedAt" | "status"> & { status?: ApplicationStatus },
): Promise<Application> {
  const now = new Date().toISOString();
  const created: Application = { status: "submitted", ...app, id: newId("a"), createdAt: now, updatedAt: now };
  write(KEYS.applications, [created, ...(await getApplications())]);
  return created;
}

export async function updateApplication(id: string, patch: Partial<Pick<Application, "status" | "reply" | "helperRequested">>) {
  write(
    KEYS.applications,
    (await getApplications()).map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a)),
  );
}

// ---- My Next Chapter plans (one per person) ----

export interface SavedPlan extends NextChapterPlan {
  source: "ai" | "fallback";
  updatedAt: string;
}

export async function getPlan(userId: string): Promise<SavedPlan | null> {
  return read<Record<string, SavedPlan>>(KEYS.plans, {})[userId] ?? null;
}

export async function savePlan(userId: string, plan: SavedPlan | null) {
  const all = read<Record<string, SavedPlan>>(KEYS.plans, {});
  if (plan) all[userId] = { ...plan, updatedAt: new Date().toISOString() };
  else delete all[userId];
  write(KEYS.plans, all);
}

export async function resetDemo() {
  for (const key of Object.values(KEYS)) localStorage.removeItem(key);
  ensureSeeded();
}
