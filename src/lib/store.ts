// The site's data layer. Every function talks to the server (/api/auth and /api/data), so pages never
// deal with HTTP directly. Reads are cached briefly and refreshed whenever something changes.
import { browserLangCode } from "../i18n/languages";
import type { NextChapterPlan } from "../../shared/types";
import type {
  Application,
  ApplicationStatus,
  ConnectionRequest,
  Listing,
  Opportunity,
  PracticalQuestion,
  Reflection,
  RequestStatus,
  ThankYou,
  User,
} from "./types";

// ---- Plumbing ----

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "We couldn't connect. Please check your internet connection and try again.");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (json as { error?: string }).error ?? "Something went wrong. Please try again.");
  return json as T;
}

const cache = new Map<string, { at: number; value: Promise<unknown> }>();
const FRESH_MS = 3000;

function get<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < FRESH_MS) return hit.value as Promise<T>;
  const value = call<T>("GET", path).catch((err) => {
    cache.delete(path);
    throw err;
  });
  cache.set(path, { at: Date.now(), value });
  return value;
}

function notify() {
  cache.clear();
  window.dispatchEvent(new Event("twg:change"));
}

async function change<T>(method: string, path: string, body?: unknown): Promise<T> {
  const out = await call<T>(method, path, body);
  notify();
  return out;
}

/** Quietly returns a fallback when a read fails, so one hiccup doesn't break a whole page. */
const soft = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- Accounts ----

let me: User | null = null;
let meLoaded = false;

export function currentUserId(): string | null {
  return me?.id ?? null;
}

export async function currentUser(): Promise<User | null> {
  const out = await soft(get<{ user: User | null; emailEnabled: boolean }>("auth/me"), { user: me, emailEnabled: false });
  me = out.user;
  meLoaded = true;
  emailOn = out.emailEnabled;
  return me;
}

let emailOn = false;
/** Whether the site can send email (password resets, message alerts). */
export function emailEnabled() {
  return emailOn;
}

export function authLoaded() {
  return meLoaded;
}

type SignUpInput = Pick<User, "name" | "email" | "roles" | "location"> & {
  password: string;
  comfort?: string[];
  org?: User["org"];
  languages?: string[];
  preferredLanguage?: string;
};

export async function signUp(input: SignUpInput): Promise<User> {
  const languages = input.languages?.length ? input.languages : [browserLangCode()];
  const { user } = await change<{ user: User }>("POST", "auth/signup", {
    ...input,
    languages,
    preferredLanguage: input.preferredLanguage ?? languages[0],
  });
  me = user;
  return user;
}

/** Joins with just a first name (or adds roles to the person already signed in). */
export async function quickJoin(name: string, roles: User["roles"] = []): Promise<User> {
  const { user } = await change<{ user: User }>("POST", "auth/quick", { name, roles });
  me = user;
  return user;
}

/** Adds an email and password to a first-name-only account, so it can be used on other devices. */
export async function claimAccount(email: string, password: string): Promise<User> {
  if (!me) throw new ApiError(401, "Please sign in first.");
  const { user } = await change<{ user: User }>("POST", "auth/signup", { ...me, email, password });
  me = user;
  return user;
}

export async function logIn(email: string, password: string): Promise<User> {
  const { user } = await change<{ user: User }>("POST", "auth/login", { email, password });
  me = user;
  return user;
}

export async function logOut() {
  await change("POST", "auth/logout");
  me = null;
}

export async function forgotPassword(email: string) {
  return call<{ ok: boolean; emailEnabled: boolean }>("POST", "auth/forgot", { email });
}

export async function resetPassword(token: string, password: string) {
  const { user } = await change<{ user: User }>("POST", "auth/reset", { token, password });
  me = user;
  return user;
}

export async function changePassword(current: string, password: string) {
  await call("POST", "auth/password", { current, password });
}

export async function changeEmail(email: string, password: string) {
  const { user } = await change<{ user: User }>("POST", "auth/email", { email, password });
  me = user;
  return user;
}

/** Signs out on every device, including this one. */
export async function logOutEverywhere() {
  await change("POST", "auth/logout-all");
  me = null;
}

export async function deleteAccount() {
  await change("DELETE", "auth/account");
  me = null;
}

export const EXPORT_URL = "/api/auth/export";

// ---- People ----

export async function getUsers(): Promise<User[]> {
  return soft(get<User[]>("data/users"), []);
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await getUsers()).find((u) => u.id === id);
}

/** Saves your own profile. */
export async function saveUser(user: User): Promise<User> {
  const saved = await change<User>("PUT", "data/users/me", user);
  me = saved;
  return saved;
}

// ---- Listings ----

export async function getListings(): Promise<Listing[]> {
  return soft(get<Listing[]>("data/listings"), []);
}

export async function createListing(listing: Omit<Listing, "id" | "createdAt">): Promise<Listing> {
  return change<Listing>("POST", "data/listings", listing);
}

export async function deleteListing(id: string) {
  await change("DELETE", `data/listings/${encodeURIComponent(id)}`);
}

// ---- Requests (mentoring sessions and buddy help) ----

export async function getRequests(): Promise<ConnectionRequest[]> {
  return soft(get<ConnectionRequest[]>("data/requests"), []);
}

export async function createRequest(req: Omit<ConnectionRequest, "id" | "createdAt" | "status">): Promise<ConnectionRequest> {
  return change<ConnectionRequest>("POST", "data/requests", req);
}

export async function setRequestStatus(id: string, status: RequestStatus) {
  await change("PATCH", `data/requests/${encodeURIComponent(id)}`, { status });
}

/** Suggest a new time. The request goes back to "pending" so the other person can say yes again. */
export async function rescheduleRequest(id: string, proposedAt: string) {
  await change("PATCH", `data/requests/${encodeURIComponent(id)}`, { proposedAt });
}

// ---- Reflections (private) and thank-you notes (public) ----

export async function getReflections(_authorId: string): Promise<Reflection[]> {
  return soft(get<Reflection[]>("data/reflections"), []);
}

export async function saveReflection(reflection: Omit<Reflection, "id" | "createdAt">): Promise<Reflection> {
  return change<Reflection>("POST", "data/reflections", reflection);
}

export async function getThanks(): Promise<ThankYou[]> {
  return soft(get<ThankYou[]>("data/thanks"), []);
}

export async function sendThanks(note: Omit<ThankYou, "id" | "createdAt">): Promise<ThankYou> {
  return change<ThankYou>("POST", "data/thanks", note);
}

// ---- Paid opportunities and applications ----

export async function getOpportunities(): Promise<Opportunity[]> {
  return soft(get<Opportunity[]>("data/opportunities"), []);
}

export async function saveOpportunity(opp: Omit<Opportunity, "id" | "createdAt"> & { id?: string; createdAt?: string }): Promise<Opportunity> {
  return change<Opportunity>("POST", "data/opportunities", opp);
}

export async function getApplications(): Promise<Application[]> {
  return soft(get<Application[]>("data/applications"), []);
}

export async function createApplication(
  app: Omit<Application, "id" | "createdAt" | "updatedAt" | "status"> & { status?: ApplicationStatus },
): Promise<Application> {
  return change<Application>("POST", "data/applications", app);
}

export async function updateApplication(id: string, patch: Partial<Pick<Application, "status" | "reply" | "helperRequested">>) {
  await change("PATCH", `data/applications/${encodeURIComponent(id)}`, patch);
}

// ---- My Next Chapter plans (one per person, private) ----

export interface SavedPlan extends NextChapterPlan {
  source: "ai" | "fallback";
  updatedAt: string;
}

export async function getPlan(_userId: string): Promise<SavedPlan | null> {
  return soft(get<SavedPlan | null>("data/plan"), null);
}

export async function savePlan(_userId: string, plan: SavedPlan | null) {
  if (plan) await change("PUT", "data/plan", plan);
  else await change("DELETE", "data/plan");
}

// ---- Practical questions (the question-first way in) ----

export async function getQuestions(): Promise<PracticalQuestion[]> {
  return soft(get<PracticalQuestion[]>("data/questions"), []);
}

export async function askQuestion(input: { text: string; trade: string; askerLabel: string; askerId?: string }) {
  return change<PracticalQuestion>("POST", "data/questions", input);
}

export async function answerQuestion(questionId: string, _authorId: string | null, text: string) {
  return change<{ id: string; authorId: string | null; text: string; createdAt: string }>(
    "POST",
    `data/questions/${encodeURIComponent(questionId)}/answers`,
    { text },
  );
}

export async function updateAnswer(_questionId: string, answerId: string, text: string | null) {
  if (text === null) await change("DELETE", `data/answers/${encodeURIComponent(answerId)}`);
  else await change("PATCH", `data/answers/${encodeURIComponent(answerId)}`, { text });
}

/** A guest's first answer, kept in this tab so it can start their profile if they choose to join. */
const FIRST_ANSWER = "twg.firstAnswer";
export function saveFirstAnswer(question: string, answer: string) {
  try {
    sessionStorage.setItem(FIRST_ANSWER, JSON.stringify({ question, answer }));
  } catch {
    // ignore
  }
}
export function takeFirstAnswer(): { question: string; answer: string } | null {
  try {
    return JSON.parse(sessionStorage.getItem(FIRST_ANSWER) ?? "null");
  } catch {
    return null;
  }
}
export function clearFirstAnswer() {
  try {
    sessionStorage.removeItem(FIRST_ANSWER);
  } catch {
    // ignore
  }
}

// ---- Messages: questions, help requests, booking requests and replies ----

export interface SimpleNote {
  id: string;
  toId: string;
  fromId?: string;
  fromName: string;
  kind: "question" | "help" | "session" | "interest" | "reply";
  text: string;
  contact?: string;
  replyTo?: string;
  read?: boolean;
  createdAt: string;
}

export async function getNotes(): Promise<SimpleNote[]> {
  return soft(get<SimpleNote[]>("data/notes"), []);
}

export async function addNote(note: Omit<SimpleNote, "id" | "createdAt" | "read" | "fromId">) {
  return change<SimpleNote>("POST", "data/notes", note);
}

export async function markNoteRead(id: string) {
  await change("POST", `data/notes/${encodeURIComponent(id)}/read`);
}

// ---- Safety ----

export async function sendReport(input: { aboutId?: string; reason: string; details: string }) {
  await call("POST", "data/reports", input);
}

// ---- Measuring what matters (anonymous) ----

export async function addFeedback(f: { flow: string; rating: number; comfortable?: boolean }) {
  await call("POST", "data/feedback", f).catch(() => undefined);
}

export interface SiteStats {
  elders: number;
  helpers: number;
  connections: number;
  sessionsAccepted: number;
  listings: number;
  returningPairs: number;
  firstTimes: number;
  firstUnder5: number;
  comfortAsked: number;
  comfortable: number;
  rated: number;
  ratedGood: number;
}

export async function getStats(): Promise<SiteStats | null> {
  return soft(get<SiteStats>("data/stats"), null);
}

const VISIT_START = "twg.visitStart";

/** Called when someone first picks who they are. */
export function startVisitClock() {
  try {
    if (!sessionStorage.getItem(VISIT_START)) sessionStorage.setItem(VISIT_START, String(Date.now()));
  } catch {
    // ignore
  }
}

/** Records how long the first completed interaction of this visit took (once per visit, anonymously). */
export function markFirstInteraction(flow: string) {
  try {
    const start = Number(sessionStorage.getItem(VISIT_START));
    if (!start || sessionStorage.getItem("twg.firstDone")) return;
    sessionStorage.setItem("twg.firstDone", "1");
    const seconds = Math.round((Date.now() - start) / 1000);
    void call("POST", "data/first-time", { flow, seconds }).catch(() => undefined);
  } catch {
    // ignore
  }
}
