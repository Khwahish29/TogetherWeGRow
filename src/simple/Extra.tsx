import { useState } from "react";
import { Heart } from "lucide-react";
import { addFeedback, getStats, markFirstInteraction } from "../lib/store";
import { useStore } from "../lib/useStore";
import { Screen } from "./parts";

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
/* Our goals: the pilot's key metrics, and what this device recorded.  */
/* ------------------------------------------------------------------ */

export function Impact() {
  const stats = useStore(getStats, null);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "No answers yet");
  const of = (a: number, b: number, none: string) => (b ? `${a} of ${b}` : none);
  const v = (n: number | undefined) => (stats ? String(n ?? 0) : "…");

  const rows: [string, string, string][] = [
    ["People sharing their experience", "10 to 15", v(stats?.elders)],
    ["Helpers offering their skills", "10", v(stats?.helpers)],
    ["Questions, help and session requests", "10 learning sessions", v(stats?.connections)],
    ["People offering a paid session", "5 sharing a skill", v(stats?.listings)],
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
