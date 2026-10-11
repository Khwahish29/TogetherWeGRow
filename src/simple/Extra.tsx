import { useState } from "react";
import { Check, Copy, Heart, Mail, Users } from "lucide-react";
import { addFeedback, getStats, markFirstInteraction } from "../lib/store";
import { useStore } from "../lib/useStore";
import { VibeCheck } from "../components/VibeCheck";
import { Actions, BigChoice, Screen } from "./parts";
import { useWizard } from "./useWizard";

/* ------------------------------------------------------------------ */
/* A gentle, optional "how was this?" at the end of each journey.      */
/* ------------------------------------------------------------------ */

export function Feedback({ flow, askComfort = false }: { flow: string; askComfort?: boolean }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comfort, setComfort] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  // Reaching the end of a journey is the "first interaction" we measure.
  useState(() => {
    markFirstInteraction(flow);
    return null;
  });

  async function save(r: number, c: boolean | null) {
    await addFeedback({ flow, rating: r, comfortable: c ?? undefined });
    setDone(true);
  }

  if (done) return <p className="mt-8 rounded-2xl bg-white p-5 text-lg ring-1 ring-warm-200">Thank you for telling us.</p>;

  return (
    <section aria-labelledby={`fb-${flow}`} className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-warm-200">
      {rating === null ? (
        <>
          <h2 id={`fb-${flow}`} className="font-sans text-xl font-semibold">
            How was this for you? <span className="font-normal text-muted">(optional)</span>
          </h2>
          <div role="group" aria-label="Rate from 1 to 5" className="mt-4 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => (askComfort ? setRating(n) : save(n, null))}
                className="min-h-[60px] rounded-2xl border-2 border-warm-200 text-2xl font-semibold text-brand-900 hover:border-brand-600 hover:bg-brand-50"
                aria-label={`${n} out of 5${n === 1 ? ", not good" : n === 5 ? ", very good" : ""}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 flex justify-between text-sm text-muted">
            <span>Not good</span>
            <span>Very good</span>
          </p>
        </>
      ) : (
        <>
          <h2 id={`fb-${flow}`} className="font-sans text-xl font-semibold">
            Do you feel a little more comfortable asking for help now?
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              [true, "Yes"],
              [false, "Not yet"],
            ].map(([v, l]) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => {
                  setComfort(v as boolean);
                  save(rating, v as boolean);
                }}
                aria-pressed={comfort === v}
                className="min-h-[60px] rounded-2xl border-2 border-warm-200 text-xl font-semibold text-brand-900 hover:border-brand-600 hover:bg-brand-50"
              >
                {l as string}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Family: help someone you love take a first step.                    */
/* ------------------------------------------------------------------ */

export function FamilyFlow() {
  const w = useWizard("twg.simple.family", { name: "", work: "", years: "", gift: "", message: "" });
  const { step, go, data, set } = w;
  const [copied, setCopied] = useState(false);

  function build() {
    const who = data.name.trim() || "there";
    const work = data.work.trim();
    const years = data.years.trim();
    const experience = work ? (years ? `your ${years} years in ${work}` : `all your years in ${work}`) : "everything you've done over the years";
    return `Hi ${who},

I've been thinking about ${experience}${data.gift.trim() ? `, and how good you are at ${data.gift.trim()}` : ""}. You know things people only learn by doing.

I found a simple website called TogetherWeGrow, where younger people ask practical questions and people with experience like yours answer them. Some also offer paid advice, and there's work that's easier on the body.

There's no pressure, and it's completely your choice. If you'd like, we could look at it together.

${window.location.origin}`;
  }

  if (step === 0)
    return (
      <Screen step="1 of 3" title="Who would you like to invite?" help="What do you call them? Dad, Grandma Rose, Uncle Sam…">
        <label htmlFor="fname" className="sr-only">
          Their name
        </label>
        <input id="fname" className="input min-h-[64px] text-2xl" value={data.name} onChange={(e) => set("name", e.target.value)} />
        <Actions primary="Next" onPrimary={() => go(1)} disabled={!data.name.trim()} />
      </Screen>
    );

  if (step === 1)
    return (
      <Screen step="2 of 3" title={`What work has ${data.name.trim()} done?`} help="And for about how long, if you know.">
        <label htmlFor="fwork" className="label text-xl">
          Their work
        </label>
        <input id="fwork" className="input min-h-[60px] text-xl" placeholder="For example: carpentry" value={data.work} onChange={(e) => set("work", e.target.value)} />
        <label htmlFor="fyears" className="label mt-6 text-xl">
          About how many years? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="fyears" className="input min-h-[60px] text-xl" inputMode="numeric" value={data.years} onChange={(e) => set("years", e.target.value)} />
        <Actions primary="Next" onPrimary={() => go(2)} disabled={!data.work.trim()} />
      </Screen>
    );

  if (step === 2)
    return (
      <Screen step="3 of 3" title={`What is ${data.name.trim()} especially good at?`} help="Something you admire. This is optional.">
        <label htmlFor="fgift" className="sr-only">
          What they're good at
        </label>
        <input id="fgift" className="input min-h-[60px] text-xl" placeholder="For example: fixing what others give up on" value={data.gift} onChange={(e) => set("gift", e.target.value)} />
        <Actions
          primary="Write my invitation"
          onPrimary={() => {
            set("message", build());
            go(3);
          }}
          secondary="Skip this question"
          onSecondary={() => {
            set("gift", "");
            set("message", build());
            go(3);
          }}
        />
      </Screen>
    );

  return (
    <Screen title="Here's your invitation." help="Change any words you like. Then send it however you normally would.">
      <label htmlFor="fmsg" className="sr-only">
        Your invitation
      </label>
      <textarea
        id="fmsg"
        rows={12}
        className="input font-serif text-xl leading-relaxed"
        value={data.message}
        onChange={(e) => {
          set("message", e.target.value);
          setCopied(false);
        }}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="btn-primary min-h-[60px] text-lg"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(data.message);
              setCopied(true);
              markFirstInteraction("family");
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check aria-hidden="true" className="h-5 w-5" /> : <Copy aria-hidden="true" className="h-5 w-5" />}
          {copied ? "Copied" : "Copy the message"}
        </button>
        <a className="btn-secondary min-h-[60px] text-lg" href={`mailto:?subject=${encodeURIComponent("I thought of you")}&body=${encodeURIComponent(data.message)}`}>
          <Mail aria-hidden="true" className="h-5 w-5" /> Open in my email
        </a>
      </div>
      <div className="mt-8 rounded-3xl bg-brand-100/70 p-6 text-lg">
        <p className="font-semibold text-brand-900">Their choice, always</p>
        <p className="mt-1">You can invite them and sit beside them. Only they can share their experience, or say yes to any work.</p>
      </div>
      <div className="mt-6 space-y-4">
        <BigChoice to="/older/help?step=1" icon={Users} label="Ask a helper to walk them through it" sub="A patient younger helper, at their pace" />
      </div>
      <Feedback flow="family" />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* What does this message mean? (Vibe Check)                           */
/* ------------------------------------------------------------------ */

export function MeaningScreen({ younger = false }: { younger?: boolean }) {
  return (
    <Screen
      title={younger ? "Understand each other" : "What does this message mean?"}
      help={younger ? "Explain an expression an older adult used, or find a clearer way to say something." : "Paste or type a message that confused you. We'll explain it in plain words."}
    >
      <VibeCheck idPrefix={younger ? "yvibe" : "ovibe"} />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Our goals: the pilot's key metrics, and what this device recorded.  */
/* ------------------------------------------------------------------ */

export function Impact() {
  const stats = useStore(getStats, null);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "No answers yet");
  const of = (a: number, b: number, none: string) => (b ? `${a} of ${b}` : none);
  const v = (n: number | undefined) => (stats ? String(n ?? 0) : "…");

  const rows: [string, string, string][] = [
    ["Older adults sharing their experience", "10 to 15", v(stats?.elders)],
    ["Younger helpers offering their skills", "10", v(stats?.helpers)],
    ["Questions, help and session requests", "10 learning sessions", v(stats?.connections)],
    ["Older adults offering a paid session", "5 sharing a skill", v(stats?.listings)],
    ["First visit finished within 5 minutes", "Most people", stats ? of(stats.firstUnder5, stats.firstTimes, "Not measured yet") : "…"],
    ["Feel more comfortable asking for help", "7 out of 10", stats ? of(stats.comfortable, stats.comfortAsked, "No answers yet") : "…"],
    ["Rated their experience 4 or 5 out of 5", "80%", stats ? pct(stats.ratedGood, stats.rated) : "…"],
    ["Pairs who met again for a second session", "5 pairs", v(stats?.returningPairs)],
  ];

  return (
    <Screen title="Our goals" help="The targets for our first local pilot, next to how we're doing so far. Everything here is counted anonymously.">
      <ul className="space-y-4">
        {rows.map(([what, goal, now]) => (
          <li key={what} className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
            <p className="text-xl font-semibold text-brand-900">{what}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-lg">
              <div>
                <dt className="text-base text-muted">Pilot goal</dt>
                <dd className="font-medium">{goal}</dd>
              </div>
              <div>
                <dt className="text-base text-muted">So far</dt>
                <dd className="font-medium">{now}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex items-start gap-2 text-lg text-muted">
        <Heart aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warm-700" />
        The ratings come from the optional "How was this for you?" question at the end of each step. We never link them to your name.
      </p>
      <h2 className="mt-12 font-sans text-2xl font-semibold">Who we hope to work with</h2>
      <p className="mt-3 text-lg leading-relaxed">
        Families are the main way people find us: a son, daughter or grandchild sitting down with someone they love. For a local pilot, we would
        like to approach senior centers, trade associations, community colleges and universities (such as Maricopa Community Colleges and Arizona
        State University), psychology and counseling departments, and groups like AARP and Senior Planet.
      </p>
      <p className="mt-3 text-lg text-muted">These are possible partners we hope to talk to. None of them has agreed to work with us yet.</p>
    </Screen>
  );
}
