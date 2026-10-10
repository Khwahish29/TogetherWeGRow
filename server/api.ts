// The site's data API. Every route checks who is asking: people can only change their own things,
// and private details (emails, contact info, reflections, comfort settings) are never shown to others.
import { Router, type Request, type Response } from "express";
import {
  HttpError,
  clientIp,
  countRecent,
  createResetToken,
  endSession,
  hashPassword,
  newId,
  rateLimit,
  recordEvent,
  sessionUserId,
  startSession,
  useResetToken,
  verifyPassword,
} from "./auth";
import { db } from "./db";
import { emailEnabled, notifyUser, sendEmail } from "./email";

type Json = Record<string, unknown>;

// ---- Helpers ----------------------------------------------------------------

/** Trims strings, caps list lengths and depth, and drops anything that isn't plain data. */
function clean(value: unknown, depth = 0): unknown {
  if (depth > 6) return null;
  if (typeof value === "string") return value.slice(0, 4000);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 60).map((v) => clean(v, depth + 1));
  if (typeof value === "object" && value) {
    const out: Json = {};
    for (const [k, v] of Object.entries(value).slice(0, 80)) if (!k.startsWith("__") && v !== undefined) out[k] = clean(v, depth + 1);
    return out;
  }
  return null;
}

const body = (req: Request) => (clean(req.body ?? {}) ?? {}) as Json;
const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const now = () => new Date().toISOString();

function uid(res: Response): string | null {
  return (res.locals.userId as string | null) ?? null;
}

function requireUser(res: Response): string {
  const id = uid(res);
  if (!id) throw new HttpError(401, "Please sign in first.");
  return id;
}

function siteUrl(req: Request) {
  return process.env.SITE_URL || `${req.headers["x-forwarded-proto"] ?? req.protocol}://${req.headers["x-forwarded-host"] ?? req.headers.host}`;
}

const ROLES = ["mentor", "learner", "buddy", "employer", "family"];

/** What anyone may see about a person. */
const PUBLIC_FIELDS = [
  "id",
  "name",
  "roles",
  "location",
  "bio",
  "skills",
  "yearsExperience",
  "industries",
  "workPreferences",
  "wantToLearn",
  "languages",
  "preferredLanguage",
  "format",
  "profileApproved",
  "buddy",
  "org",
  "createdAt",
];

function publicUser(data: Json): Json {
  const out: Json = {};
  for (const k of PUBLIC_FIELDS) if (data[k] !== undefined) out[k] = data[k];
  out.email = "";
  const wc = data.workComfort as Json | undefined;
  if (wc?.shareWithEmployers) out.workComfort = wc;
  return out;
}

/** Fields a person may set on their own profile. */
const EDITABLE_FIELDS = [...PUBLIC_FIELDS.filter((f) => f !== "id" && f !== "createdAt"), "comfort", "workComfort"];

function applyProfile(current: Json, patch: Json): Json {
  const next: Json = { ...current };
  for (const k of EDITABLE_FIELDS) if (patch[k] !== undefined) next[k] = patch[k];
  next.name = str(next.name, 80) || "A TogetherWeGrow member";
  next.roles = Array.isArray(next.roles) ? (next.roles as string[]).filter((r) => ROLES.includes(r)) : [];
  if (next.org && typeof next.org === "object") next.org = { ...(next.org as Json), verified: false };
  return next;
}

function blankProfile(id: string, name: string, roles: string[]): Json {
  return {
    id,
    name: str(name, 80) || "A TogetherWeGrow member",
    roles: roles.filter((r) => ROLES.includes(r)),
    location: "",
    bio: "",
    skills: [],
    yearsExperience: null,
    industries: [],
    workPreferences: [],
    wantToLearn: [],
    format: "both",
    languages: [],
    comfort: [],
    profileApproved: false,
    createdAt: now(),
  };
}

async function loadUser(id: string) {
  const rows = await (await db()).query<{ data: Json; email: string | null; password_hash: string | null }>(
    "select data, email, password_hash from users where id = $1",
    [id],
  );
  return rows[0] ?? null;
}

/** Your own full record: everything public plus your private settings. Never the password. */
async function ownRecord(id: string) {
  const row = await loadUser(id);
  if (!row) return null;
  return { ...row.data, email: row.email ?? "", hasLogin: Boolean(row.email && row.password_hash) };
}

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200;

function checkPassword(password: string) {
  if (password.length < 8) throw new HttpError(400, "Please choose a password with at least 8 characters.");
  if (password.length > 200) throw new HttpError(400, "That password is too long.");
}

// ---- Auth -------------------------------------------------------------------

export const authRouter = Router();

authRouter.get("/me", async (_req, res) => {
  const id = uid(res);
  res.json({ user: id ? await ownRecord(id) : null, emailEnabled: emailEnabled() });
});

/** Full sign-up with email and password. If you already have a first-name-only account here, it's upgraded. */
authRouter.post("/signup", async (req, res) => {
  const b = body(req);
  const email = str(b.email, 200).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!str(b.name)) throw new HttpError(400, "Please tell us your name.");
  if (!validEmail(email)) throw new HttpError(400, "Please check your email address.");
  checkPassword(password);
  await rateLimit(`signup:${clientIp(req)}`, 10, 3600);
  const conn = await db();
  const taken = await conn.query("select 1 from users where email = $1", [email]);
  if (taken.length) throw new HttpError(409, "An account with this email already exists. Try signing in instead.");

  const hash = await hashPassword(password);
  const existing = uid(res) ? await loadUser(uid(res)!) : null;
  if (existing && !existing.email) {
    const data = applyProfile(existing.data, { ...b, roles: [...new Set([...((existing.data.roles as string[]) ?? []), ...((b.roles as string[]) ?? [])])] });
    await conn.query("update users set email = $2, password_hash = $3, data = $4 where id = $1", [uid(res), email, hash, JSON.stringify(data)]);
    return res.json({ user: await ownRecord(uid(res)!) });
  }
  const id = newId("u");
  const data = applyProfile(blankProfile(id, str(b.name), []), b);
  await conn.query("insert into users (id, email, password_hash, data) values ($1, $2, $3, $4)", [id, email, hash, JSON.stringify(data)]);
  await startSession(req, res, id);
  res.json({ user: await ownRecord(id) });
});

/** The gentle way in: a first name is enough. The account lives on this device until an email is added. */
authRouter.post("/quick", async (req, res) => {
  const b = body(req);
  const roles = Array.isArray(b.roles) ? (b.roles as string[]) : [];
  const conn = await db();
  const current = uid(res);
  if (current) {
    const row = await loadUser(current);
    if (row) {
      const data: Json = { ...row.data, roles: [...new Set([...((row.data.roles as string[]) ?? []), ...roles.filter((r) => ROLES.includes(r))])] };
      if (str(b.name) && !row.email) data.name = str(b.name, 80);
      await conn.query("update users set data = $2 where id = $1", [current, JSON.stringify(data)]);
      return res.json({ user: await ownRecord(current) });
    }
  }
  if (!str(b.name)) throw new HttpError(400, "Please tell us your first name.");
  await rateLimit(`quick:${clientIp(req)}`, 20, 3600);
  const id = newId("u");
  await conn.query("insert into users (id, data) values ($1, $2)", [id, JSON.stringify(blankProfile(id, str(b.name), roles))]);
  await startSession(req, res, id);
  res.json({ user: await ownRecord(id) });
});

authRouter.post("/login", async (req, res) => {
  const email = str(req.body?.email, 200).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const key = `login-fail:${email}`;
  if ((await countRecent(key, 900)) >= 8) throw new HttpError(429, "Too many tries. For your safety, please wait 15 minutes and try again.");
  const rows = await (await db()).query<{ id: string; password_hash: string | null }>("select id, password_hash from users where email = $1", [email]);
  if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) {
    await recordEvent(key);
    throw new HttpError(401, "That email and password don't match. Please try again.");
  }
  await startSession(req, res, rows[0].id);
  res.json({ user: await ownRecord(rows[0].id) });
});

authRouter.post("/logout", async (req, res) => {
  await endSession(req, res);
  res.json({ ok: true });
});

authRouter.post("/password", async (req, res) => {
  const id = requireUser(res);
  const row = await loadUser(id);
  const next = typeof req.body?.password === "string" ? req.body.password : "";
  checkPassword(next);
  if (row?.password_hash && !(await verifyPassword(String(req.body?.current ?? ""), row.password_hash))) {
    throw new HttpError(401, "Your current password isn't right.");
  }
  await (await db()).query("update users set password_hash = $2 where id = $1", [id, await hashPassword(next)]);
  res.json({ ok: true });
});

authRouter.post("/forgot", async (req, res) => {
  const email = str(req.body?.email, 200).toLowerCase();
  await rateLimit(`forgot:${clientIp(req)}`, 5, 3600);
  const rows = await (await db()).query<{ id: string }>("select id from users where email = $1", [email]);
  if (rows[0] && emailEnabled()) {
    const token = await createResetToken(rows[0].id);
    await sendEmail(
      email,
      "Choose a new password for TogetherWeGrow",
      `Hello,\n\nSomeone (hopefully you) asked to reset your TogetherWeGrow password. Choose a new one here within the next hour:\n${siteUrl(req)}/reset?token=${token}\n\nIf this wasn't you, you can ignore this email. Your password won't change.\n\nTogetherWeGrow`,
    );
  }
  // Same answer either way, so nobody can find out who has an account.
  res.json({ ok: true, emailEnabled: emailEnabled() });
});

authRouter.post("/reset", async (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  checkPassword(password);
  const userId = await useResetToken(str(req.body?.token, 200));
  if (!userId) throw new HttpError(400, "This link has expired or was already used. Please ask for a new one.");
  const conn = await db();
  await conn.query("update users set password_hash = $2 where id = $1", [userId, await hashPassword(password)]);
  await conn.query("delete from sessions where user_id = $1", [userId]);
  await startSession(req, res, userId);
  res.json({ user: await ownRecord(userId) });
});

authRouter.get("/export", async (_req, res) => {
  const id = requireUser(res);
  const conn = await db();
  const q = (sql: string) => conn.query<{ data: Json }>(sql, [id]).then((r) => r.map((x) => x.data));
  res.setHeader("Content-Disposition", 'attachment; filename="my-togetherwegrow-data.json"');
  res.json({
    exportedAt: now(),
    profile: await ownRecord(id),
    listings: await q("select data from listings where owner_id = $1"),
    requests: await q("select data from requests where from_id = $1 or to_id = $1"),
    reflections: await q("select data from reflections where author_id = $1"),
    thanks: await q("select data from thanks where from_id = $1 or to_id = $1"),
    opportunities: await q("select data from opportunities where owner_id = $1"),
    applications: await q("select data from applications where worker_id = $1 or employer_id = $1"),
    plan: (await q("select data from plans where user_id = $1"))[0] ?? null,
    questions: await q("select data from questions where asker_id = $1"),
    answers: await q("select data from answers where author_id = $1"),
    messages: await q("select data from notes where to_id = $1 or from_id = $1"),
  });
});

authRouter.delete("/account", async (req, res) => {
  const id = requireUser(res);
  await endSession(req, res);
  await (await db()).query("delete from users where id = $1", [id]);
  res.json({ ok: true });
});

// ---- Data -------------------------------------------------------------------

export const dataRouter = Router();

// People
dataRouter.get("/users", async (_req, res) => {
  const rows = await (await db()).query<{ data: Json }>("select data from users order by created_at desc limit 2000");
  const me = uid(res);
  const list = rows.map((r) => publicUser(r.data));
  if (me) {
    const own = await ownRecord(me);
    const i = list.findIndex((u) => u.id === me);
    if (own && i >= 0) list[i] = own;
  }
  res.json(list);
});

dataRouter.put("/users/me", async (req, res) => {
  const id = requireUser(res);
  const row = await loadUser(id);
  if (!row) throw new HttpError(404, "We couldn't find your account.");
  const data = applyProfile(row.data, body(req));
  await (await db()).query("update users set data = $2 where id = $1", [id, JSON.stringify(data)]);
  res.json(await ownRecord(id));
});

// Paid sessions people offer
dataRouter.get("/listings", async (_req, res) => {
  const rows = await (await db()).query<{ data: Json }>("select data from listings order by created_at desc");
  res.json(rows.map((r) => r.data));
});

dataRouter.post("/listings", async (req, res) => {
  const me = requireUser(res);
  const b = body(req);
  const price = Number(b.price);
  const minutes = Number(b.durationMins);
  if (!str(b.title)) throw new HttpError(400, "Please give your session a title.");
  if (!(price >= 0 && price <= 1000)) throw new HttpError(400, "Please choose a price between $0 and $1,000.");
  if (!(minutes >= 10 && minutes <= 480)) throw new HttpError(400, "Please choose a length between 10 minutes and 8 hours.");
  await rateLimit(`listing:${me}`, 20, 86400);
  const data = { ...b, id: newId("l"), mentorId: me, price, durationMins: minutes, title: str(b.title, 120), createdAt: now() };
  delete (data as Json).isDemo;
  await (await db()).query("insert into listings (id, owner_id, data) values ($1, $2, $3)", [data.id, me, JSON.stringify(data)]);
  res.json(data);
});

dataRouter.delete("/listings/:id", async (req, res) => {
  const me = requireUser(res);
  await (await db()).query("delete from listings where id = $1 and owner_id = $2", [req.params.id, me]);
  res.json({ ok: true });
});

// Session and help requests between two people
dataRouter.get("/requests", async (_req, res) => {
  const me = uid(res);
  if (!me) return res.json([]);
  const rows = await (await db()).query<{ data: Json }>("select data from requests where from_id = $1 or to_id = $1 order by created_at desc", [me]);
  res.json(rows.map((r) => r.data));
});

dataRouter.post("/requests", async (req, res) => {
  const me = requireUser(res);
  const b = body(req);
  const toId = str(b.toId, 100);
  if (!toId || toId === me || !(await loadUser(toId))) throw new HttpError(400, "We couldn't find that person.");
  await rateLimit(`request:${me}`, 30, 3600);
  const data = {
    id: newId("r"),
    kind: b.kind === "buddy" ? "buddy" : "session",
    fromId: me,
    toId,
    listingId: str(b.listingId, 100) || undefined,
    topic: str(b.topic, 200) || undefined,
    message: str(b.message, 2000),
    proposedAt: str(b.proposedAt, 40),
    status: "pending",
    createdAt: now(),
  };
  await (await db()).query("insert into requests (id, from_id, to_id, data) values ($1, $2, $3, $4)", [data.id, me, toId, JSON.stringify(data)]);
  await notifyUser(toId, siteUrl(req), data.kind === "buddy" ? "Someone has asked for your help" : "Someone has asked to book a session with you");
  res.json(data);
});

dataRouter.patch("/requests/:id", async (req, res) => {
  const me = requireUser(res);
  const conn = await db();
  const rows = await conn.query<{ data: Json; from_id: string; to_id: string }>("select data, from_id, to_id from requests where id = $1", [req.params.id]);
  const row = rows[0];
  if (!row || (row.from_id !== me && row.to_id !== me)) throw new HttpError(404, "We couldn't find that request.");
  const b = body(req);
  const data = { ...row.data };
  if (typeof b.proposedAt === "string" && b.proposedAt) {
    data.proposedAt = str(b.proposedAt, 40);
    data.status = "pending";
  }
  if (typeof b.status === "string") {
    const allowed = row.to_id === me ? ["accepted", "declined"] : ["withdrawn"];
    if (!allowed.includes(b.status)) throw new HttpError(403, "You can't make that change.");
    data.status = b.status;
  }
  await conn.query("update requests set data = $2 where id = $1", [req.params.id, JSON.stringify(data)]);
  const other = row.from_id === me ? row.to_id : row.from_id;
  if (data.status === "accepted") await notifyUser(other, siteUrl(req), "Good news: your request was accepted");
  res.json(data);
});

// Private reflections (only the author ever sees them)
dataRouter.get("/reflections", async (_req, res) => {
  const me = uid(res);
  if (!me) return res.json([]);
  const rows = await (await db()).query<{ data: Json }>("select data from reflections where author_id = $1 order by created_at desc", [me]);
  res.json(rows.map((r) => r.data));
});

dataRouter.post("/reflections", async (req, res) => {
  const me = requireUser(res);
  const b = body(req);
  const requestId = str(b.requestId, 100);
  const data = { ...b, id: newId("rf"), authorId: me, requestId, createdAt: now() };
  await (await db()).query(
    `insert into reflections (id, author_id, request_id, data) values ($1, $2, $3, $4)
     on conflict (author_id, request_id) do update set data = excluded.data, created_at = now()`,
    [data.id, me, requestId, JSON.stringify(data)],
  );
  res.json(data);
});

// Public thank-you notes
dataRouter.get("/thanks", async (_req, res) => {
  const rows = await (await db()).query<{ data: Json }>("select data from thanks order by created_at desc limit 500");
  res.json(rows.map((r) => r.data));
});

dataRouter.post("/thanks", async (req, res) => {
  const me = requireUser(res);
  const b = body(req);
  const toId = str(b.toId, 100);
  if (!toId || toId === me || !(await loadUser(toId))) throw new HttpError(400, "We couldn't find that person.");
  if (!str(b.message)) throw new HttpError(400, "Please write a few words.");
  await rateLimit(`thanks:${me}`, 20, 86400);
  const data = { id: newId("ty"), fromId: me, toId, requestId: str(b.requestId, 100) || undefined, message: str(b.message, 1000), createdAt: now() };
  await (await db()).query("insert into thanks (id, from_id, to_id, data) values ($1, $2, $3, $4)", [data.id, me, toId, JSON.stringify(data)]);
  await notifyUser(toId, siteUrl(req), "Someone sent you a thank-you note");
  res.json(data);
});

// Paid opportunities posted by organizations
dataRouter.get("/opportunities", async (_req, res) => {
  const rows = await (await db()).query<{ data: Json }>("select data from opportunities where data->>'status' = 'open' or owner_id = $1 order by created_at desc", [
    uid(res) ?? "",
  ]);
  res.json(rows.map((r) => r.data));
});

dataRouter.post("/opportunities", async (req, res) => {
  const me = requireUser(res);
  const b = body(req);
  if (!str(b.title)) throw new HttpError(400, "Please give the role a title.");
  const conn = await db();
  const id = str(b.id, 100);
  if (id) {
    const rows = await conn.query<{ owner_id: string; data: Json }>("select owner_id, data from opportunities where id = $1", [id]);
    if (rows[0]) {
      if (rows[0].owner_id !== me) throw new HttpError(403, "You can only change roles you posted.");
      const data = { ...b, id, employerId: me, createdAt: rows[0].data.createdAt };
      delete (data as Json).isDemo;
      await conn.query("update opportunities set data = $2 where id = $1", [id, JSON.stringify(data)]);
      return res.json(data);
    }
  }
  await rateLimit(`opportunity:${me}`, 20, 86400);
  const data = { ...b, id: newId("o"), employerId: me, status: b.status === "closed" ? "closed" : "open", createdAt: now() };
  delete (data as Json).isDemo;
  await conn.query("insert into opportunities (id, owner_id, data) values ($1, $2, $3)", [data.id, me, JSON.stringify(data)]);
  res.json(data);
});

// Applications and invitations
dataRouter.get("/applications", async (_req, res) => {
  const me = uid(res);
  if (!me) return res.json([]);
  const rows = await (await db()).query<{ data: Json }>("select data from applications where worker_id = $1 or employer_id = $1 order by created_at desc", [me]);
  res.json(rows.map((r) => r.data));
});

dataRouter.post("/applications", async (req, res) => {
  const me = requireUser(res);
  const b = body(req);
  const conn = await db();
  const opp = (await conn.query<{ owner_id: string }>("select owner_id from opportunities where id = $1", [str(b.opportunityId, 100)]))[0];
  if (!opp) throw new HttpError(404, "We couldn't find that role.");
  let workerId: string;
  let employerId: string;
  if (b.initiatedBy === "employer") {
    if (opp.owner_id !== me) throw new HttpError(403, "You can only invite people to roles you posted.");
    workerId = str(b.workerId, 100);
    if (!(await loadUser(workerId))) throw new HttpError(400, "We couldn't find that person.");
    employerId = me;
  } else {
    workerId = me;
    employerId = opp.owner_id;
  }
  if (workerId === employerId) throw new HttpError(400, "You can't apply to your own role.");
  await rateLimit(`application:${me}`, 30, 86400);
  const t = now();
  const data = {
    id: newId("a"),
    opportunityId: str(b.opportunityId, 100),
    workerId,
    employerId,
    initiatedBy: b.initiatedBy === "employer" ? "employer" : "worker",
    message: str(b.message, 3000),
    helperRequested: Boolean(b.helperRequested),
    status: b.initiatedBy === "employer" ? "invited" : "submitted",
    createdAt: t,
    updatedAt: t,
  };
  await conn.query("insert into applications (id, opportunity_id, worker_id, employer_id, data) values ($1, $2, $3, $4, $5)", [
    data.id,
    data.opportunityId,
    workerId,
    employerId,
    JSON.stringify(data),
  ]);
  await notifyUser(b.initiatedBy === "employer" ? workerId : employerId, siteUrl(req), b.initiatedBy === "employer" ? "You've been invited to a role" : "Someone is interested in your role");
  res.json(data);
});

dataRouter.patch("/applications/:id", async (req, res) => {
  const me = requireUser(res);
  const conn = await db();
  const row = (await conn.query<{ data: Json; worker_id: string; employer_id: string }>("select data, worker_id, employer_id from applications where id = $1", [req.params.id]))[0];
  if (!row || (row.worker_id !== me && row.employer_id !== me)) throw new HttpError(404, "We couldn't find that.");
  const b = body(req);
  const data: Json = { ...row.data, updatedAt: now() };
  if (typeof b.status === "string" && ["submitted", "reviewing", "invited", "closed"].includes(b.status)) data.status = b.status;
  if (typeof b.reply === "string") data.reply = str(b.reply, 3000);
  if (typeof b.helperRequested === "boolean") data.helperRequested = b.helperRequested;
  await conn.query("update applications set data = $2 where id = $1", [req.params.id, JSON.stringify(data)]);
  res.json(data);
});

// My Next Chapter plan (private)
dataRouter.get("/plan", async (_req, res) => {
  const me = uid(res);
  if (!me) return res.json(null);
  const rows = await (await db()).query<{ data: Json }>("select data from plans where user_id = $1", [me]);
  res.json(rows[0]?.data ?? null);
});

dataRouter.put("/plan", async (req, res) => {
  const me = requireUser(res);
  const data = { ...body(req), updatedAt: now() };
  await (await db()).query(
    "insert into plans (user_id, data) values ($1, $2) on conflict (user_id) do update set data = excluded.data, updated_at = now()",
    [me, JSON.stringify(data)],
  );
  res.json(data);
});

dataRouter.delete("/plan", async (_req, res) => {
  const me = requireUser(res);
  await (await db()).query("delete from plans where user_id = $1", [me]);
  res.json({ ok: true });
});

// Practical questions and answers
dataRouter.get("/questions", async (_req, res) => {
  const rows = await (await db()).query<{ data: Json; answers: Json[] | string }>(
    `select q.data,
            coalesce(json_agg(a.data order by a.created_at) filter (where a.id is not null), '[]'::json) as answers
       from questions q left join answers a on a.question_id = q.id
      group by q.id, q.data, q.created_at
      order by q.created_at desc
      limit 300`,
  );
  res.json(rows.map((r) => ({ ...r.data, answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers })));
});

dataRouter.post("/questions", async (req, res) => {
  const me = uid(res);
  const b = body(req);
  const text = str(b.text, 600);
  if (text.length < 5) throw new HttpError(400, "Please write your question.");
  await rateLimit(`question:${me ?? clientIp(req)}`, 15, 3600);
  const data = { id: newId("q"), text, trade: str(b.trade, 80), askerLabel: str(b.askerLabel, 120) || "Someone learning", askerId: me ?? undefined, createdAt: now() };
  await (await db()).query("insert into questions (id, asker_id, data) values ($1, $2, $3)", [data.id, me, JSON.stringify(data)]);
  res.json({ ...data, answers: [] });
});

dataRouter.post("/questions/:id/answers", async (req, res) => {
  const me = uid(res);
  const text = str(req.body?.text, 3000);
  if (text.length < 2) throw new HttpError(400, "Please write your answer.");
  const conn = await db();
  const q = (await conn.query<{ asker_id: string | null }>("select asker_id from questions where id = $1", [req.params.id]))[0];
  if (!q) throw new HttpError(404, "We couldn't find that question.");
  await rateLimit(`answer:${me ?? clientIp(req)}`, 30, 3600);
  const data = { id: newId("ans"), authorId: me, text, createdAt: now() };
  await conn.query("insert into answers (id, question_id, author_id, data) values ($1, $2, $3, $4)", [data.id, req.params.id, me, JSON.stringify(data)]);
  if (q.asker_id && q.asker_id !== me) await notifyUser(q.asker_id, siteUrl(req), "Someone answered your question");
  res.json(data);
});

dataRouter.patch("/answers/:id", async (req, res) => {
  const me = requireUser(res);
  const conn = await db();
  const row = (await conn.query<{ data: Json }>("select data from answers where id = $1 and author_id = $2", [req.params.id, me]))[0];
  if (!row) throw new HttpError(404, "We couldn't find that answer.");
  const data = { ...row.data, text: str(req.body?.text, 3000) };
  await conn.query("update answers set data = $2 where id = $1", [req.params.id, JSON.stringify(data)]);
  res.json(data);
});

dataRouter.delete("/answers/:id", async (req, res) => {
  const me = requireUser(res);
  await (await db()).query("delete from answers where id = $1 and author_id = $2", [req.params.id, me]);
  res.json({ ok: true });
});

// Messages: questions, help requests, booking requests and replies
dataRouter.get("/notes", async (_req, res) => {
  const me = uid(res);
  if (!me) return res.json([]);
  const rows = await (await db()).query<{ data: Json; read_at: string | null; to_id: string }>(
    "select data, read_at, to_id from notes where to_id = $1 or from_id = $1 order by created_at desc limit 500",
    [me],
  );
  // Contact details are only for the person the message was sent to.
  res.json(rows.map((r) => ({ ...r.data, contact: r.to_id === me ? r.data.contact : undefined, read: Boolean(r.read_at) })));
});

dataRouter.post("/notes", async (req, res) => {
  const me = uid(res);
  const b = body(req);
  const toId = str(b.toId, 100);
  if (!toId || toId === me || !(await loadUser(toId))) throw new HttpError(400, "We couldn't find that person.");
  const text = str(b.text, 3000);
  if (!text) throw new HttpError(400, "Please write a message.");
  await rateLimit(`note:${me ?? clientIp(req)}`, 30, 3600);
  const kinds = ["question", "help", "session", "interest", "reply"];
  const data = {
    id: newId("n"),
    toId,
    fromId: me ?? undefined,
    fromName: str(b.fromName, 80) || "Someone",
    kind: kinds.includes(String(b.kind)) ? b.kind : "question",
    text,
    contact: str(b.contact, 200) || undefined,
    replyTo: str(b.replyTo, 100) || undefined,
    createdAt: now(),
  };
  await (await db()).query("insert into notes (id, to_id, from_id, data) values ($1, $2, $3, $4)", [data.id, toId, me, JSON.stringify(data)]);
  await notifyUser(toId, siteUrl(req), "You have a new message");
  res.json(data);
});

dataRouter.post("/notes/:id/read", async (req, res) => {
  const me = requireUser(res);
  await (await db()).query("update notes set read_at = coalesce(read_at, now()) where id = $1 and to_id = $2", [req.params.id, me]);
  res.json({ ok: true });
});

// Reports (safety)
dataRouter.post("/reports", async (req, res) => {
  const b = body(req);
  if (!str(b.reason)) throw new HttpError(400, "Please tell us what happened.");
  await rateLimit(`report:${uid(res) ?? clientIp(req)}`, 10, 3600);
  await (await db()).query("insert into reports (id, reporter_id, about_id, reason, details) values ($1, $2, $3, $4, $5)", [
    newId("rp"),
    uid(res),
    str(b.aboutId, 100) || null,
    str(b.reason, 200),
    str(b.details, 3000),
  ]);
  res.json({ ok: true });
});

// Measuring what matters (anonymous)
dataRouter.post("/feedback", async (req, res) => {
  const b = body(req);
  const rating = Math.round(Number(b.rating));
  if (!(rating >= 1 && rating <= 5)) throw new HttpError(400, "Please choose a number from 1 to 5.");
  await rateLimit(`feedback:${clientIp(req)}`, 30, 3600);
  await (await db()).query("insert into feedback (id, flow, rating, comfortable) values ($1, $2, $3, $4)", [
    newId("f"),
    str(b.flow, 40) || "other",
    rating,
    typeof b.comfortable === "boolean" ? b.comfortable : null,
  ]);
  res.json({ ok: true });
});

dataRouter.post("/first-time", async (req, res) => {
  const b = body(req);
  const seconds = Math.round(Number(b.seconds));
  if (!(seconds >= 0 && seconds < 86400)) throw new HttpError(400, "Invalid time.");
  await rateLimit(`first:${clientIp(req)}`, 20, 3600);
  await (await db()).query("insert into first_times (id, flow, seconds) values ($1, $2, $3)", [newId("ft"), str(b.flow, 40) || "other", seconds]);
  res.json({ ok: true });
});

dataRouter.get("/stats", async (_req, res) => {
  const conn = await db();
  const one = async (sql: string) => (await conn.query<{ n: number }>(sql))[0]?.n ?? 0;
  res.json({
    elders: await one("select count(*)::int as n from users where data->'roles' ? 'mentor' and (data->>'profileApproved')::boolean"),
    helpers: await one("select count(*)::int as n from users where data->'roles' ? 'buddy'"),
    connections: await one("select ((select count(*) from requests) + (select count(*) from notes where data->>'kind' <> 'reply') + (select count(*) from answers))::int as n"),
    sessionsAccepted: await one("select count(*)::int as n from requests where data->>'status' = 'accepted'"),
    listings: await one("select count(distinct owner_id)::int as n from listings"),
    returningPairs: await one(`select count(*)::int as n from (
        select least(from_id, to_id), greatest(from_id, to_id) from requests where data->>'status' = 'accepted'
        group by 1, 2 having count(*) >= 2) t`),
    firstTimes: await one("select count(*)::int as n from first_times"),
    firstUnder5: await one("select count(*)::int as n from first_times where seconds <= 300"),
    comfortAsked: await one("select count(*)::int as n from feedback where comfortable is not null"),
    comfortable: await one("select count(*)::int as n from feedback where comfortable"),
    rated: await one("select count(*)::int as n from feedback"),
    ratedGood: await one("select count(*)::int as n from feedback where rating >= 4"),
  });
});

// ---- Middleware -------------------------------------------------------------

/** Who is signed in (if anyone). */
export async function attachUser(req: Request, res: Response, next: () => void) {
  res.locals.userId = await sessionUserId(req);
  next();
}

/** Blocks changes coming from other websites (cross-site request forgery). */
export function sameOrigin(req: Request, _res: Response, next: () => void) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "");
    let ok = false;
    try {
      ok = new URL(origin).host === host;
    } catch {
      ok = false;
    }
    if (!ok) throw new HttpError(403, "This request came from another website.");
  }
  next();
}
