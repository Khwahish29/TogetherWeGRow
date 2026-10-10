# TogetherWeGrow

An accessible, AI-assisted website where experienced workers turn decades of know-how into paid mentoring,
advisory, and teaching work, and where anyone can learn technology with AI or a friendly human buddy.

## Run it

```bash
npm install
cp .env.example .env      # optional: add XAI_API_KEY (Grok) or GROQ_API_KEY (Groq)
npm run dev               # web on http://localhost:5173, API on :8787
```

Without an API key, every AI feature falls back to built-in rules, so the demo always works. Each result is labelled
"AI-generated draft" or "Suggested by built-in rules".

Demo accounts (password `demo1234`): `robert@demo.twg` (carpenter mentor), `maya@demo.twg` (student + buddy) and
`hiring@woodcenter.demo` (a fictional employer). All organisations, opportunities and thank-you notes in the demo data
are fictional and labelled as such.
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
| Résumé builder: guided questions with a live preview, AI-written bullet points, print or save as PDF | `/resume` |
| Personal dashboard ("What would you like to do today?") | `/dashboard` |
| After-session notes (private) and thank-you notes (shown on profiles) | `/requests` |
| Our story, safety & support, report a concern (demo-only) | `/about` |
| My Next Chapter: AI-written, editable 5-step career transition plan | `/next-chapter` |
| Paid opportunities with "Know before you accept" and a preference fit check | `/opportunities`, `/opportunities/:id` |
| Employer portal: post roles (pay, duties, physical requirements and terms required), review applications, find and invite people | `/employer`, `/employer/new` |
| Work comfort preferences (optional, private unless shared) | `/profile#work-comfort` |

Other touches: a Help panel on every page, a bottom tab bar on phones, a "how are you feeling?" check-in that
adjusts the AI companion's tone, an "easy on the body" career filter, a sign-up question about what would make things
easier, and the option to withdraw, reconsider, or reschedule any request.

## Design system

- **Palette** (in `tailwind.config.js`): deep forest `#234638` (primary), warm ivory `#FAF8F3` (page), soft sage
  `#E4EDE5`, golden accent `#D8AB67`, terracotta `#C97758` (decorative) / `#A4553A` (text and buttons, AA contrast),
  charcoal `#25312C` text and gray-green `#5F6C64` secondary text.
- **Type**: Fraunces (editorial serif) for headlines, Inter for everything else; 18px base with a three-step text-size control.
- **Components** live in `src/index.css` (`.btn-*`, `.card`, `.input`, `.badge`, `.chip`, `.notice`, `.eyebrow`, `.link`)
  and `src/components/ui.tsx` (`PageHeader`, `SectionTabs`, `Reveal`, `PhotoSlot`, `EmptyState`, badges, avatars).
- **Motion**: gentle fade-ins only, all disabled under `prefers-reduced-motion`.
- **Imagery**: `public/images/workshop-tools.jpg` is CC0 (credit in `public/images/CREDITS.md`). The homepage has two
  clearly marked "Photo to come" slots for real, consented photos of members.

## How it's put together

- `src/`: React + TypeScript + Tailwind + React Router.
- `src/lib/store.ts`: data layer backed by localStorage. All functions are async, so Supabase can replace it later.
- `src/lib/matching.ts`: mentor scoring, a pure function.
- `server/lib/ai.ts`: one client for any OpenAI-compatible API. It uses xAI Grok if `XAI_API_KEY` is set, otherwise
  Groq if `GROQ_API_KEY` is set (Groq has a free tier). It picks a suitable model automatically (override with
  `AI_MODEL`) and checks every reply against a schema.
- `server/handlers/`: the AI endpoints (profile draft, careers, companion, résumé).
  They fall back to `server/fallback/*` when there's no key, an error, or a refusal.
- `server/dev.ts`: Express server for local dev. `api/*.ts` holds Vercel serverless wrappers around the same handlers.

The API key is read only on the server. Voice is transcribed by the browser's speech service, and recordings are
never sent to or stored by TogetherWeGrow. Voice input works in Chrome and Edge, and typing always works.

## Deploy (Vercel)

Import the repo, set `XAI_API_KEY` or `GROQ_API_KEY` in project settings, and deploy. `vercel.json` routes the SPA.

## Not in this prototype

Real authentication and database (Supabase), payments, community feed, and employer job postings.

## Any language (Google Translate)

The floating globe button (bottom-right) lets anyone read the whole site in any language Google Translate supports. It uses Google's free Website Translator, so it needs an internet connection and no API key. Nothing else in the app depends on it.

People also list the languages they speak when they sign up or edit their profile. Mentors and digital buddies are ranked with a shared language first, and when two people share none, the request form offers short two-language phrases.
