import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { sendReport } from "../lib/store";
import { CONTACT_EMAIL } from "../data/team";
import { ErrorLine, Screen, useRun } from "./parts";

const UPDATED = "October 10, 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-sans text-2xl font-semibold text-brand-900">{title}</h2>
      <div className="mt-3 space-y-3 text-lg leading-relaxed">{children}</div>
    </section>
  );
}

function Contact() {
  return CONTACT_EMAIL ? (
    <>
      email us at <strong>{CONTACT_EMAIL}</strong>
    </>
  ) : (
    <>
      use the{" "}
      <Link to="/safety" className="link">
        contact form on our Safety page
      </Link>
    </>
  );
}

export function Privacy() {
  return (
    <Screen title="Your privacy" help={`In plain words: what we keep, why, and what you can do about it. Last updated ${UPDATED}.`}>
      <Section title="What we keep">
        <p>
          <strong>Your name</strong> and anything you choose to add to your profile: your work, skills, what you'd like to learn, languages, and
          where you're based.
        </p>
        <p>
          <strong>Your email and password</strong>, if you add them. Passwords are scrambled (hashed) before they're stored, so nobody, including
          us, can read them.
        </p>
        <p>
          <strong>What you send through the site</strong>: questions, answers, messages, help requests, session requests and roles. These are
          shared only with the people you send them to, except answers to public questions and thank-you notes, which anyone can read.
        </p>
        <p>
          <strong>Anonymous measurements</strong>: your optional 1-to-5 rating, whether you feel more comfortable asking for help, and how long
          your first visit took. These are never linked to your name.
        </p>
      </Section>

      <Section title="What we never do">
        <p>We don't sell your information, show adverts, or use tracking cookies.</p>
        <p>We never show your email address or phone number on your profile. Contact details you put in a message go only to that person.</p>
        <p>We never ask for your bank details or passwords to other services.</p>
      </Section>

      <Section title="Services that help run the site">
        <p>
          <strong>Hosting and database</strong>: the site and its database run on Vercel and a Postgres database provider.
        </p>
        <p>
          <strong>Suggestions and plain-language explanations</strong>: when you ask the site to suggest skills from your words, explain a message,
          or write step-by-step guidance, the text you entered is sent to a language service (Groq) to produce the answer. It isn't used to
          identify you.
        </p>
        <p>
          <strong>Translation</strong>: if you choose another language, the page text is translated by Google Translate.
        </p>
        <p>
          <strong>Speaking instead of typing</strong>: this uses your browser's own speech recognition. Some browsers, such as Chrome, send the
          audio to their maker to turn it into text. We never receive or keep recordings.
        </p>
        <p>
          <strong>Email</strong>: if email is switched on, we use an email service to send password reset links and let you know you have a new
          message.
        </p>
      </Section>

      <Section title="Cookies">
        <p>We use one cookie, only to keep you signed in. Your text size and language choices are kept in your browser.</p>
      </Section>

      <Section title="Your choices">
        <p>
          On{" "}
          <Link to="/account" className="link">
            Your account
          </Link>{" "}
          you can download everything we have about you, or delete your account. Deleting removes your profile, messages and everything you've
          shared, straight away.
        </p>
        <p>TogetherWeGrow is for adults aged 18 and over.</p>
        <p>
          Questions about your information? Please <Contact />.
        </p>
      </Section>
    </Screen>
  );
}

export function Terms() {
  return (
    <Screen title="How we look after each other" help={`The terms of using TogetherWeGrow, written to be read. Last updated ${UPDATED}.`}>
      <Section title="What TogetherWeGrow is">
        <p>
          A place where people with a lifetime of experience and people who want to learn can find each other, ask questions, and arrange help or
          paid sessions. We introduce people. We are not an employer, an employment agency or a school.
        </p>
      </Section>

      <Section title="Be kind, be honest">
        <p>Treat everyone with patience and respect, whatever their age, background or how quickly they pick things up.</p>
        <p>Describe your experience truthfully. Don't claim qualifications or licenses you don't have.</p>
        <p>No harassment, hateful content, pressure, or unwanted contact. If someone says no, that's the answer.</p>
        <p>Never ask anyone for passwords, bank details, or money up front.</p>
      </Section>

      <Section title="Meeting and paying">
        <p>
          We don't check people's identities or backgrounds, and we can't guarantee anyone's skills. Meet somewhere public the first time, tell
          someone you trust where you're going, and trust your instincts.
        </p>
        <p>
          Payments aren't handled through TogetherWeGrow yet. If you agree on a paid session, you arrange payment between yourselves. Our planned
          model is that mentors keep 90% and a 10% fee keeps the service running. That fee isn't charged today.
        </p>
        <p>
          Job roles are posted by the organizations themselves. Please check the details with them. Suggestions the site makes are ideas, never
          promises of work or income.
        </p>
      </Section>

      <Section title="What you share">
        <p>
          You own what you write. By posting it, you let us show it on the site to the people it's meant for. You can delete your account and
          everything with it at any time.
        </p>
        <p>We may remove content or close accounts that break these rules or put people at risk.</p>
      </Section>

      <Section title="The fine print">
        <p>
          TogetherWeGrow is provided as it is, and we can't promise it will always be available or error-free. As far as the law allows, we aren't
          responsible for what people agree or do between themselves.
        </p>
        <p>You must be 18 or over to use TogetherWeGrow. If these terms change, we'll update this page and the date at the top.</p>
        <p>
          Questions? Please <Contact />.
        </p>
      </Section>
    </Screen>
  );
}

const REASONS = ["Someone made me feel unsafe", "Someone asked for money or passwords", "Something false or misleading", "Something else"];

export function Safety() {
  const [params] = useSearchParams();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const { run, busy, error } = useRun();

  return (
    <Screen title="Staying safe" help="A few simple habits, and a way to tell us if something isn't right.">
      <ul className="space-y-3 text-xl leading-relaxed">
        {[
          "Meet somewhere public the first time, or start with a video call.",
          "Never share passwords, bank details or codes sent to your phone. Nobody here needs them.",
          "Never pay before you've met and agreed what you're paying for.",
          "Take your time. It's always fine to say “let me think about it.”",
          "If something feels wrong, stop, and tell someone you trust.",
        ].map((t) => (
          <li key={t} className="rounded-2xl bg-white p-5 ring-1 ring-warm-200">
            {t}
          </li>
        ))}
      </ul>

      <section className="mt-12" aria-labelledby="report-title">
        <h2 id="report-title" className="font-sans text-2xl font-semibold text-brand-900">
          Tell us about a concern
        </h2>
        {sent ? (
          <p role="status" className="mt-4 rounded-3xl bg-brand-100/70 p-6 text-xl">
            Thank you for telling us. We read every report. If you're in danger, please call 911 or your local emergency number.
          </p>
        ) : (
          <>
            <p className="mt-2 text-lg text-muted">You don't need to give your name. If you're in danger, please call 911 or your local emergency number first.</p>
            <fieldset className="mt-5">
              <legend className="label text-lg">What happened?</legend>
              <div className="mt-2 space-y-2">
                {REASONS.map((r) => (
                  <label key={r} className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-warm-200 bg-white px-4 text-lg has-[:checked]:border-brand-700">
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="h-5 w-5" />
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>
            <label htmlFor="report-details" className="label mt-5 text-lg">
              Tell us more <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea id="report-details" rows={4} className="input text-xl" value={details} onChange={(e) => setDetails(e.target.value)} />
            <ErrorLine error={error} />
            <button
              type="button"
              className="btn-primary mt-5 min-h-[60px] w-full text-xl"
              disabled={busy || !reason}
              onClick={() =>
                run(async () => {
                  await sendReport({ aboutId: params.get("about") ?? undefined, reason, details });
                  setSent(true);
                })
              }
            >
              Send to the TogetherWeGrow team
            </button>
          </>
        )}
        {CONTACT_EMAIL && (
          <p className="mt-6 text-lg">
            You can also email us at <strong>{CONTACT_EMAIL}</strong>.
          </p>
        )}
      </section>
    </Screen>
  );
}
