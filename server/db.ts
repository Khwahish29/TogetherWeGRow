// Postgres access. In production this uses DATABASE_URL (Vercel Postgres / Neon, or any Postgres).
// In local development without DATABASE_URL, it uses PGlite: a real Postgres stored in ./.data/pglite.
import { STARTER_QUESTIONS } from "./starterQuestions";

export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
}

let ready: Promise<Db> | null = null;

export function db(): Promise<Db> {
  ready ??= open().catch((err) => {
    ready = null; // let the next request try again
    throw err;
  });
  return ready;
}

async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  let conn: Db;
  if (url) {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000 });
    conn = {
      query: async (text, params) => (await pool.query(text, params as unknown[])).rows,
      exec: async (sql) => {
        await pool.query(sql);
      },
    };
  } else {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set. Add a Postgres database to this project (see README).");
    }
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdirSync } = await import("node:fs");
    const dir = process.env.PGLITE_DIR || ".data/pglite";
    mkdirSync(dir, { recursive: true });
    const lite = new PGlite(dir);
    conn = {
      query: async (text, params) => (await lite.query(text, params as unknown[])).rows as never,
      exec: async (sql) => {
        await lite.exec(sql);
      },
    };
  }
  await migrate(conn);
  return conn;
}

const SCHEMA = `
create table if not exists users (
  id text primary key,
  email text unique,
  password_hash text,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists sessions (
  token_hash text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists password_resets (
  token_hash text primary key,
  user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists listings (
  id text primary key,
  owner_id text not null references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists requests (
  id text primary key,
  from_id text not null references users(id) on delete cascade,
  to_id text not null references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists reflections (
  id text primary key,
  author_id text not null references users(id) on delete cascade,
  request_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  unique (author_id, request_id)
);
create table if not exists thanks (
  id text primary key,
  from_id text not null references users(id) on delete cascade,
  to_id text not null references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists opportunities (
  id text primary key,
  owner_id text not null references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists applications (
  id text primary key,
  opportunity_id text not null references opportunities(id) on delete cascade,
  worker_id text not null references users(id) on delete cascade,
  employer_id text not null references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists plans (
  user_id text primary key references users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists questions (
  id text primary key,
  asker_id text references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists answers (
  id text primary key,
  question_id text not null references questions(id) on delete cascade,
  author_id text references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists notes (
  id text primary key,
  to_id text not null references users(id) on delete cascade,
  from_id text references users(id) on delete cascade,
  data jsonb not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists feedback (
  id text primary key,
  flow text not null,
  rating int not null,
  comfortable boolean,
  created_at timestamptz not null default now()
);
create table if not exists first_times (
  id text primary key,
  flow text not null,
  seconds int not null,
  created_at timestamptz not null default now()
);
create table if not exists reports (
  id text primary key,
  reporter_id text references users(id) on delete set null,
  about_id text,
  reason text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists rate_events (
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_events_key_at on rate_events (key, at);
create index if not exists requests_from on requests (from_id);
create index if not exists requests_to on requests (to_id);
create index if not exists notes_to on notes (to_id);
create index if not exists answers_question on answers (question_id);
`;

async function migrate(conn: Db) {
  // One instance at a time, so parallel cold starts don't race to create the same tables.
  await conn.exec(`begin; select pg_advisory_xact_lock(160016); ${SCHEMA} commit;`);
  // Common questions people starting out ask, so there is always something to answer.
  for (const q of STARTER_QUESTIONS) {
    await conn.query("insert into questions (id, asker_id, data, created_at) values ($1, null, $2, $3) on conflict (id) do nothing", [
      q.id,
      JSON.stringify(q),
      q.createdAt,
    ]);
  }
}
