import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Accessibility, Flag, Lock, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { PageHeader } from "../components/ui";

const BELIEFS = [
  {
    title: "Start by listening",
    body: "Before suggesting anything, we ask what work suits you now, what feels comfortable, and what you'd rather avoid. Then we design around the answers.",
  },
  {
    title: "Pay people for what they know",
    body: "A mentor's decades of experience is professional knowledge. It's priced by the mentor, shown up front, and never swapped for 'help with the computer'.",
  },
  {
    title: "Make it easy to ask for help",
    body: "Asking a question is never a sign of falling behind. Our AI companion repeats itself happily, and our buddies sign up because they enjoy explaining things.",
  },
  {
    title: "Leave room for second chances",
    body: "Missed a session? Pressed the wrong button? Said no and regretted it? You can withdraw, reschedule, or reconsider. Life happens.",
  },
  {
    title: "Tell the truth, even when it's less exciting",
    body: "Career ideas are suggestions, not promises. AI drafts are labelled. Demo listings say they're demos. Nothing is published until you approve it.",
  },
  {
    title: "Pause and notice",
    body: "After each session there's a quiet space to note what you learned and which assumptions changed. And a chance to say thank you.",
  },
];

export default function About() {
  const { hash } = useLocation();
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  function report(e: FormEvent) {
    e.preventDefault();
    setReported(true);
  }

  return (
    <>
      <PageHeader eyebrow="Our story" title="Built so that nobody's experience goes to waste">
        Imagine a carpenter with 40 years at the bench. The lifting is getting harder, the job ads are all online, and
        employers prefer younger hands. A few streets away, a student wishes someone would show them how real furniture is
        made. TogetherWeGrow introduces them.
      </PageHeader>

      <section className="container-page py-14" aria-labelledby="beliefs">
        <h2 id="beliefs" className="text-3xl font-bold">
          How we try to treat people
        </h2>
        <ol className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {BELIEFS.map((b, i) => (
            <li key={b.title} className="flex gap-5 border-t border-warm-200 pt-6">
              <span className="font-serif text-4xl font-bold text-warm-400" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-bold">{b.title}</h3>
                <p className="mt-2 text-ink/80">{b.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-brand-50 py-14" aria-labelledby="impact">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="impact" className="text-3xl font-bold">
              The difference we hope to make
            </h2>
            <p className="mt-3 text-lg text-ink/80">
              Older workers earning from their knowledge with dignity. Younger people gaining skills and mentors they
              wouldn't otherwise meet. And fewer people, of any age, feeling embarrassed to ask how something works.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {[
              ["Income", "from knowledge, not physical strain"],
              ["Confidence", "with technology, at each person's own pace"],
              ["Connection", "between generations who rarely meet"],
            ].map(([big, small]) => (
              <li key={big} className="rounded-3xl bg-white p-6 text-center shadow-sm">
                <p className="font-serif text-2xl font-bold text-brand-800">{big}</p>
                <p className="mt-1 text-sm text-ink/75">{small}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page pb-4 pt-14" aria-labelledby="limits">
        <div className="rounded-3xl border border-warm-200 bg-white p-7 sm:p-9">
          <h2 id="limits" className="text-3xl">
            What this prototype can and can't do yet
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <p className="font-semibold text-brand-900">Works today</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
                <li>Voice or text profiles, career ideas, plans, résumés and learning help, drafted by AI (Groq) with built-in fallbacks</li>
                <li>Matching, requests, applications, reflections and thank-you notes</li>
                <li>Everything is saved in this browser only</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-brand-900">Not yet</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
                <li>Real accounts, a shared database, or messages between devices</li>
                <li>Payments, verified organisations, or a staffed safety team</li>
                <li>Real members: every person, organisation and story here is fictional demo data</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="safety" className="container-page scroll-mt-24 py-14" aria-labelledby="safety-title">
        <h2 id="safety-title" className="text-3xl font-bold">
          Safety & support
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="card">
            <Lock aria-hidden="true" className="h-8 w-8 text-brand-700" />
            <h3 className="mt-3 text-xl font-bold">Your privacy</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
              <li>We never save voice recordings.</li>
              <li>Only what you approve appears on your profile.</li>
              <li>Your session notes are private to you.</li>
              <li>We never ask your age.</li>
              <li>
                Text you type or speak into AI features (your story, job descriptions, questions) is sent to our AI service
                provider to create suggestions. Leave out private details like bank, health or ID numbers.
              </li>
              <li>Work preferences are hidden from organisations unless you choose to share them.</li>
            </ul>
          </div>
          <div className="card">
            <ShieldCheck aria-hidden="true" className="h-8 w-8 text-brand-700" />
            <h3 className="mt-3 text-xl font-bold">Meeting safely</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
              <li>Meet in public places or online for first sessions.</li>
              <li>Never share bank details or passwords in messages.</li>
              <li>You can decline or withdraw any request, any time.</li>
            </ul>
            <Link to="/learn/ai" className="mt-3 inline-block font-bold text-brand-700 underline">
              Learn to spot suspicious messages
            </Link>
          </div>
          <div className="card">
            <Accessibility aria-hidden="true" className="h-8 w-8 text-brand-700" />
            <h3 className="mt-3 text-xl font-bold">Accessibility</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
              <li>Larger text with one tap (footer or Help).</li>
              <li>Speak instead of typing where you see a microphone.</li>
              <li>Steps can be read aloud.</li>
              <li>Works with a keyboard and screen readers.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <form onSubmit={report} className="card space-y-4" aria-labelledby="report-title">
            <div className="flex items-center gap-3">
              <Flag aria-hidden="true" className="h-6 w-6 text-warm-700" />
              <h3 id="report-title" className="text-xl font-bold">
                Report a concern
              </h3>
            </div>
            {reported ? (
              <p role="status" className="rounded-xl bg-brand-100 p-4">
                Thank you for telling us. In the full version, our team reviews every report. In this demo, nothing is sent.
              </p>
            ) : (
              <>
                <p className="text-ink/75">If something didn't feel right, tell us. You won't be judged for raising it.</p>
                <p className="rounded-xl bg-warm-100 p-3 text-sm text-warm-900">
                  <strong>Demo only:</strong> this prototype doesn't send reports anywhere yet. A real launch needs a staffed
                  review and response process.
                </p>
                <div>
                  <label htmlFor="concern" className="label">
                    What happened?
                  </label>
                  <textarea id="concern" rows={4} className="input" required />
                </div>
                <button className="btn-secondary" type="submit">
                  Send report (demo: nothing is sent)
                </button>
              </>
            )}
          </form>
          <div className="card flex flex-col justify-center bg-warm-100/60">
            <MessageCircleHeart aria-hidden="true" className="h-8 w-8 text-warm-700" />
            <h3 className="mt-3 text-xl font-bold">Prefer to talk it through?</h3>
            <p className="mt-2 text-ink/80">
              A digital buddy can sit with you (online or in person) and help with anything on this site.
            </p>
            <Link to="/learn/buddies" className="btn-primary mt-4 self-start">
              Find a buddy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
