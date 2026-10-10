# TogetherWeGrow

An accessible, AI-assisted website where experienced workers turn decades of know-how into paid mentoring,
advisory, and teaching work, and where anyone can learn technology with AI or a friendly human buddy.

## Run it

```bash
npm install
cp .env.example .env      # optional: add ANTHROPIC_API_KEY to use Claude
npm run dev               # web on http://localhost:5173, API on :8787
```

Without an API key, every AI feature falls back to built-in rules, so the demo always works. Each result is labelled
"AI-generated draft" or "Suggested by built-in rules".

Demo accounts (password `demo1234`): `robert@demo.twg` (carpenter mentor) and `maya@demo.twg` (student + buddy).
The login page has one-click buttons for both. Use "reset all demo data" at the bottom of the dashboard to start fresh.

## What's built

| Feature | Route |
|---|---|
| Homepage & navigation, text-size control | `/` |
| Sign up / log in with multi-role selection (never asks age) | `/signup`, `/login` |
| Voice or text → skills profile, with mandatory review before publishing | `/profile/create`, `/profile` |
| SkillBridge AI career recommendations | `/careers` |
| Mentor discovery with match scores | `/mentors`, `/mentors/:id` |
| Learn Your Way: AI companion (step-by-step, read aloud, explain simpler, ask by voice) or human buddies | `/learn`, `/learn/ai`, `/learn/buddies` |
| Paid mentoring listings, create offers, booking requests, accept/decline | `/marketplace`, `/requests` |
| Personal dashboard ("What would you like to do today?") | `/dashboard` |
| After-session notes (private) and thank-you notes (shown on profiles) | `/requests` |
| Our story, safety & support, report a concern | `/about` |

Other touches: a Help panel on every page, a bottom tab bar on phones, a "how are you feeling?" check-in that
adjusts the AI companion's tone, an "easy on the body" career filter, a sign-up question about what would make things
easier, and the option to withdraw, reconsider, or reschedule any request.

## How it's put together

- `src/`: React + TypeScript + Tailwind + React Router.
- `src/lib/store.ts`: data layer backed by localStorage. All functions are async, so Supabase can replace it later.
- `src/lib/matching.ts`: mentor scoring, a pure function.
- `server/handlers/`: AI endpoints that call Claude (`claude-opus-5-5`) with structured outputs via `@anthropic-ai/sdk`.
  They fall back to `server/fallback/*` when there's no key, an error, or a refusal.
- `server/dev.ts`: Express server for local dev. `api/*.ts` holds Vercel serverless wrappers around the same handlers.

The API key is read only on the server. Voice is transcribed by the browser's speech service, and recordings are
never sent to or stored by TogetherWeGrow. Voice input works in Chrome and Edge, and typing always works.

## Deploy (Vercel)

Import the repo, set `ANTHROPIC_API_KEY` in project settings, and deploy. `vercel.json` routes the SPA.

## Not in this prototype

Real authentication and database (Supabase), payments, community feed, and employer job postings.
