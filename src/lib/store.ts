// Local demo data layer. Every function is async so it can be swapped for Supabase later
// without changing the pages that call it.
import { SEED_LISTINGS, SEED_REQUESTS, SEED_USERS } from "../data/seed";
import type { ConnectionRequest, Listing, RequestStatus, User } from "./types";

const KEYS = {
  users: "twg.users",
  listings: "twg.listings",
  requests: "twg.requests",
  session: "twg.session",
  seeded: "twg.seeded.v1",
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
  write(KEYS.users, SEED_USERS);
  write(KEYS.listings, SEED_LISTINGS);
  write(KEYS.requests, SEED_REQUESTS);
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
  return id ? ((await getUser(id)) ?? null) : null;
}

export async function signUp(input: Pick<User, "name" | "email" | "password" | "roles" | "location">): Promise<User> {
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

export async function resetDemo() {
  for (const key of Object.values(KEYS)) localStorage.removeItem(key);
  ensureSeeded();
}
