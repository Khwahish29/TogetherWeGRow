// Optional email (password resets and "you have a new message" alerts) through Resend's HTTP API.
// Set RESEND_API_KEY and EMAIL_FROM to turn it on. Without them, the site works and simply sends no email.
import { db } from "./db";

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(to: string, subject: string, text: string) {
  if (!emailEnabled()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Email failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("Email failed", err);
    return false;
  }
}

/** Lets someone know there's something waiting for them, if they gave us an email. Never includes private details. */
export async function notifyUser(userId: string, siteUrl: string, what: string) {
  if (!emailEnabled()) return;
  const rows = await (await db()).query<{ email: string | null; name: string }>("select email, data->>'name' as name from users where id = $1", [userId]);
  const person = rows[0];
  if (!person?.email) return;
  const first = (person.name || "there").split(" ")[0];
  await sendEmail(
    person.email,
    `${what} on TogetherWeGrow`,
    `Hi ${first},\n\n${what}. You can read it here:\n${siteUrl}/inbox\n\nWith warm wishes,\nTogetherWeGrow\n\nYou're receiving this because you have an account on TogetherWeGrow.`,
  );
}
