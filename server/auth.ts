import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { db } from "./db.js";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function newId(prefix: string) {
  return `${prefix}-${randomBytes(9).toString("base64url")}`;
}

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

// ---- Passwords (scrypt, per-password salt) ----

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, n = N, r = R, p = P): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored) return false;
  const [scheme, n, r, p, salt, key] = stored.split("$");
  if (scheme !== "scrypt") return false;
  const expected = Buffer.from(key, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// ---- Sessions (random token in an httpOnly cookie; only its hash is stored) ----

const COOKIE = "twg_session";
const SESSION_DAYS = 180;

function cookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isSecure(req: Request) {
  return req.secure || req.headers["x-forwarded-proto"] === "https" || Boolean(process.env.VERCEL);
}

function setCookie(req: Request, res: Response, value: string, maxAgeSeconds: number) {
  const parts = [`${COOKIE}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAgeSeconds}`];
  if (isSecure(req)) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export async function startSession(req: Request, res: Response, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const conn = await db();
  await conn.query("insert into sessions (token_hash, user_id, expires_at) values ($1, $2, now() + make_interval(days => $3))", [
    sha256(token),
    userId,
    SESSION_DAYS,
  ]);
  setCookie(req, res, token, SESSION_DAYS * 86400);
}

export async function endSession(req: Request, res: Response) {
  const token = cookies(req)[COOKIE];
  if (token) await (await db()).query("delete from sessions where token_hash = $1", [sha256(token)]);
  setCookie(req, res, "", 0);
}

export async function sessionUserId(req: Request): Promise<string | null> {
  const token = cookies(req)[COOKIE];
  if (!token) return null;
  const rows = await (await db()).query<{ user_id: string }>("select user_id from sessions where token_hash = $1 and expires_at > now()", [sha256(token)]);
  return rows[0]?.user_id ?? null;
}

// ---- Password reset tokens ----

export async function createResetToken(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const conn = await db();
  await conn.query("insert into password_resets (token_hash, user_id, expires_at) values ($1, $2, now() + interval '1 hour')", [sha256(token), userId]);
  return token;
}

export async function useResetToken(token: string): Promise<string | null> {
  const conn = await db();
  const rows = await conn.query<{ user_id: string }>("delete from password_resets where token_hash = $1 and expires_at > now() returning user_id", [sha256(token)]);
  return rows[0]?.user_id ?? null;
}

// ---- Rate limiting (stored in the database, so it works across serverless instances) ----

export function clientIp(req: Request) {
  const fwd = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  return fwd || req.socket.remoteAddress || "unknown";
}

/** Throws 429 once `key` has been used `max` times in the last `windowSeconds`. */
export async function rateLimit(key: string, max: number, windowSeconds: number, message = "That's a lot of requests. Please wait a little while and try again.") {
  const conn = await db();
  // Local development (and its tests) all come from one address, so allow far more there.
  const limit = process.env.VERCEL || process.env.NODE_ENV === "production" ? max : max * 50;
  const [{ n }] = await conn.query<{ n: number }>("select count(*)::int as n from rate_events where key = $1 and at > now() - make_interval(secs => $2)", [
    key,
    windowSeconds,
  ]);
  if (n >= limit) throw new HttpError(429, message);
  await conn.query("insert into rate_events (key) values ($1)", [key]);
  if (Math.random() < 0.02) await conn.query("delete from rate_events where at < now() - interval '1 day'");
}

export async function countRecent(key: string, windowSeconds: number) {
  const [{ n }] = await (await db()).query<{ n: number }>("select count(*)::int as n from rate_events where key = $1 and at > now() - make_interval(secs => $2)", [
    key,
    windowSeconds,
  ]);
  return n;
}

export async function recordEvent(key: string) {
  await (await db()).query("insert into rate_events (key) values ($1)", [key]);
}
