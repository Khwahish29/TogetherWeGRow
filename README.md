# TogetherWeGrow

After a lifetime of hard work, their bodies deserve rest, but their experience deserves to live on.

TogetherWeGrow connects people with a lifetime of experience ("Deep roots") to people starting out ("New growth")
who need what they know. Deep roots share their experience, offer paid sessions, find work that is easier on the
body, and learn technology at their own pace. New growth learn from them and offer patient help in return.
Nobody is asked their age, and the site never labels people as older or younger.

Built by Team #16 for Hacks for Humanity.

## Run it locally

```bash
npm install
cp .env.example .env      # optional: add GROQ_API_KEY for richer suggestions
npm run dev               # website on http://localhost:5173, API on :8787
```

No database setup is needed locally: without `DATABASE_URL`, a real Postgres (PGlite) is created in `./.data`.
Delete that folder to start fresh.

## Deploy to Vercel

1. Push this repository to GitHub and import it at https://vercel.com/new. The settings are read from
   `vercel.json` (Vite build, one serverless function).
2. In the project, open **Storage → Create Database → Postgres (Neon)** and connect it. This sets
   `DATABASE_URL` for you. If you add it by hand, use the **pooled** connection string.
3. In **Settings → Environment Variables**, add:
   - `GROQ_API_KEY` (optional but recommended): suggestions and plain-language explanations.
   - `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL` (optional): password-reset links and new-message emails.
4. Deploy. The tables are created automatically on the first request. Check `https://<your-site>/api/health`.

Before inviting people:

- Add your team's names and a contact email in `src/data/team.ts`.
- Read `/privacy` and `/terms` and adjust them to your situation. They are written in plain language and
  describe what the site actually does, but they have not been reviewed by a lawyer.
- Decide who reads safety reports. They are stored in the `reports` table.

## How it fits together

| Part | Where |
|---|---|
| Homepage (the project, for visitors and judges) | `src/pages/Landing.tsx` → `/` |
| The simple experience: one question per screen | `src/simple/*` → `/start`, `/roots/*`, `/growth/*`, `/family`, `/inbox`, `/account` |
| The fuller website (profiles, mentors, marketplace, roles, résumé, plans) | `src/pages/*` → `/explore`, `/mentors`, `/opportunities`, … |
| Browser data layer (every call to the server) | `src/lib/store.ts` |
| API: accounts, data, permissions, rate limits | `server/api.ts`, `server/auth.ts` |
| Database schema and connection | `server/db.ts` |
| Guidance endpoints (model call with rule-based fallback) | `server/handlers`, `server/fallback`, `server/lib/ai.ts` |
| The one Vercel function | `api/handler.ts` |

### Accounts

- **A first name is enough.** Sharing, asking or offering help creates an account kept by a sign-in cookie on that
  device. On `/account`, people can add an email and password to sign in anywhere.
- Passwords are hashed with scrypt. Sessions are random tokens in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie;
  only a hash of the token is stored.
- People can download everything stored about them, or delete their account and all its data, on `/account`.

### Privacy and safety rules enforced by the server

- Emails, comfort settings and private notes are never returned to other people. Contact details in a message go
  only to its recipient. Work preferences are visible to organizations only if the person chose to share them.
- People can change only their own profile, offers, roles, answers and requests. The server sets ids, owners and
  timestamps itself.
- Writes from other websites are refused, and sign-ups, messages and guidance calls are rate limited.

### What it does not do

- Payments. People agree payment between themselves; the 90% / 10% split is the planned model and is not charged.
- Identity or background checks. Organizations and members are labeled as not verified.
- Guaranteed jobs. Suggestions are ideas, never promises.

## Accessibility

Large text and controls, a text-size switch, one question per screen, voice input with typing always available,
steps read aloud, full keyboard support, visible focus, translation into many languages, and reduced-motion support.
Pages are checked with axe (WCAG 2.2 AA rules) and at widths from 320px to 1440px.

## Photos

See `public/images/CREDITS.md` for authors and licenses.
