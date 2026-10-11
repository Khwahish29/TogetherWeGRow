import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock, Coins, Mail, MapPin, PencilLine, Trash2, Users } from "lucide-react";
import { useAuth } from "../lib/auth";
import { createListing, deleteListing, getListings, quickJoin, saveUser } from "../lib/store";
import type { Format } from "../lib/types";
import { useStore } from "../lib/useStore";
import { Feedback } from "./Extra";
import { Actions, BigChoice, ErrorLine, Screen, useRun } from "./parts";
import { useWizard } from "./useWizard";

/* ------------------------------------------------------------------ */
/* Earn from what you know: offer a paid session                        */
/* ------------------------------------------------------------------ */

const PRICES = [15, 25, 40];
const WHERE: Record<Format, string> = { both: "Online or in person", online: "Online", "in-person": "In person" };
const IDEAS = ["Woodworking for beginners", "Cooking for a crowd", "Fixing things at home", "Starting a small business"];
const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

/** How a session's price would be shared once payments run through the site. Today, nothing is taken. */
function Share({ price }: { price: number }) {
  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
      <div aria-hidden="true" className="flex h-12 overflow-hidden rounded-full text-base font-semibold">
        <span className="flex flex-[9] items-center bg-brand-700 px-4 text-white">You: {money(price * 0.9)}</span>
        <span className="flex min-w-[3.25rem] flex-[1] items-center justify-center bg-warm-400 text-sm text-brand-900">10%</span>
      </div>
      <p className="mt-3 text-lg">
        Our plan is that you keep <strong>90%</strong> ({money(price * 0.9)} of {money(price)}), and 10% keeps the service running.
      </p>
      <p className="mt-1 text-lg text-muted">For now, nothing is taken at all. You and the learner arrange payment yourselves, and you keep all of it.</p>
    </div>
  );
}

export function OlderEarn() {
  const { user } = useAuth();
  const listings = useStore(getListings, []);
  const mine = listings.filter((l) => user && l.mentorId === user.id);
  const w = useWizard("twg.simple.earn", { topic: "", minutes: 60, price: 25, format: "both" as Format, name: user?.name.split(" ")[0] ?? "" });
  const { step, go, data, set } = w;
  const { run, busy, error } = useRun();
  const removeRun = useRun();
  const [removing, setRemoving] = useState("");
  const [custom, setCustom] = useState(false);
  const suggestions = user?.skills.length ? user.skills.slice(0, 5) : IDEAS;
  const topic = data.topic.trim();

  function publish() {
    return run(async () => {
      // Use the person signed in on this device, or create a first-name account for them.
      const person = user ?? (await quickJoin(data.name.trim(), ["mentor"]));
      await saveUser({
        ...person,
        roles: person.roles.includes("mentor") ? person.roles : [...person.roles, "mentor"],
        skills: person.skills.length ? person.skills : [topic],
        bio: person.bio || `Offers sessions on ${topic.toLowerCase()}.`,
        profileApproved: true,
      });
      await createListing({
        mentorId: person.id,
        title: topic,
        category: "Other",
        description: `A one-to-one session on ${topic.toLowerCase()}.`,
        format: data.format,
        durationMins: data.minutes,
        price: data.price,
        cancellation: "Free to cancel up to 24 hours before",
      });
      set("topic", "");
      go(3);
    });
  }

  // 1 of 3: what to teach. One tap if they've already shared their experience.
  if (step === 0)
    return (
      <Screen step="Step 1 of 3" title="What would you teach?" help="One thing people would come to you for. Being paid for what you know isn't asking a favor. It's what expertise is worth.">
        {mine.length > 0 && (
          <section className="mb-8 rounded-3xl bg-brand-100/70 p-5" aria-labelledby="earn-mine">
            <h2 id="earn-mine" className="font-sans text-xl font-semibold text-brand-900">
              What you offer now
            </h2>
            <ul className="mt-3 space-y-3">
              {mine.map((l) => (
                <li key={l.id} className="rounded-2xl bg-white p-4 ring-1 ring-warm-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xl font-semibold text-brand-900">
                      {l.title} <span className="font-normal text-muted">· {money(l.price)}</span>
                    </p>
                    {removing !== l.id && (
                      <button type="button" className="btn-ghost min-h-[48px] px-3 text-lg text-warm-700" onClick={() => setRemoving(l.id)}>
                        <Trash2 aria-hidden="true" className="h-5 w-5" /> Remove
                      </button>
                    )}
                  </div>
                  {removing === l.id && (
                    <div role="alertdialog" aria-label={`Remove ${l.title}?`} className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-lg">Stop offering this?</span>
                      <button
                        type="button"
                        className="btn-primary min-h-[48px] px-4"
                        disabled={removeRun.busy}
                        onClick={() =>
                          removeRun.run(async () => {
                            await deleteListing(l.id);
                            setRemoving("");
                          })
                        }
                      >
                        Yes, remove it
                      </button>
                      <button type="button" className="btn-ghost min-h-[48px] px-4" onClick={() => setRemoving("")}>
                        Keep it
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <ErrorLine error={removeRun.error} />
            <p className="mt-4 text-lg font-semibold text-brand-900">Add another:</p>
          </section>
        )}

        <p className="text-lg text-muted">{user?.skills.length ? "From what you've shared. Tap one:" : "Tap an idea, or type your own:"}</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={topic === s}
              onClick={() => set("topic", s)}
              className={`min-h-[56px] rounded-full border-2 px-5 text-xl font-medium transition ${
                topic === s ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <label htmlFor="etopic" className="label mt-6 text-xl">
          Or in your own words
        </label>
        <input id="etopic" className="input min-h-[64px] text-xl" placeholder="For example: Woodworking for beginners" value={data.topic} onChange={(e) => set("topic", e.target.value)} />
        <Actions primary="Next" onPrimary={() => go(1)} disabled={topic.length < 3} />
      </Screen>
    );

  // 2 of 3: the price. Three cards, each showing what they'd keep.
  if (step === 1)
    return (
      <Screen step="Step 2 of 3" title="What feels like a fair price?" help={`For a one-hour session on “${topic}”. You decide, and you can change it whenever you like.`}>
        <div role="group" aria-label="Choose a price" className="grid grid-cols-3 gap-3">
          {PRICES.map((p) => {
            const on = data.price === p && !custom;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  set("price", p);
                  setCustom(false);
                }}
                className={`flex min-h-[112px] flex-col items-center justify-center rounded-3xl border-2 p-3 transition ${
                  on ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"
                }`}
              >
                <span className="font-serif text-4xl leading-none">${p}</span>
                <span className={`mt-2 text-base ${on ? "text-brand-100" : "text-muted"}`}>a session</span>
              </button>
            );
          })}
        </div>
        {custom ? (
          <div className="mt-4">
            <label htmlFor="eprice" className="label text-xl">
              Your price for a session ($)
            </label>
            <input
              id="eprice"
              type="number"
              inputMode="numeric"
              min={1}
              max={1000}
              className="input min-h-[60px] text-xl"
              value={data.price || ""}
              onChange={(e) => set("price", Math.min(1000, Math.max(0, Number(e.target.value) || 0)))}
            />
          </div>
        ) : (
          <button type="button" className="link mt-4 inline-flex min-h-[48px] items-center gap-2 text-lg" onClick={() => setCustom(true)}>
            <PencilLine aria-hidden="true" className="h-5 w-5" /> A different amount
          </button>
        )}
        <div className="mt-6">
          <Share price={data.price} />
        </div>
        <Actions primary="Next" onPrimary={() => go(2)} disabled={data.price < 1} />
      </Screen>
    );

  // 3 of 3: see it as a learner will, then say yes.
  if (step === 2)
    return (
      <Screen step="Step 3 of 3" title="Here's how people will see it" help="Have a look. Nothing is offered until you say yes.">
        <article className="rounded-[2rem] bg-brand-900 p-6 text-brand-100 shadow-xl sm:p-8" aria-label="Your session">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">A session with {(user?.name || data.name || "you").split(" ")[0]}</p>
          <p className="mt-2 font-serif text-3xl leading-tight text-white">{topic}</p>
          <ul className="mt-5 space-y-2 text-lg">
            <li className="flex items-center gap-3">
              <Clock aria-hidden="true" className="h-5 w-5 text-warm-400" /> {data.minutes === 60 ? "One hour" : `${data.minutes} minutes`}
            </li>
            <li className="flex items-center gap-3">
              <MapPin aria-hidden="true" className="h-5 w-5 text-warm-400" /> {WHERE[data.format]}
            </li>
            <li className="flex items-center gap-3">
              <Coins aria-hidden="true" className="h-5 w-5 text-warm-400" /> {money(data.price)}
            </li>
          </ul>
        </article>

        <details className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
          <summary className="cursor-pointer text-xl font-semibold text-brand-900">Change the length or the place</summary>
          <p className="mt-4 text-lg font-semibold text-brand-900">Length</p>
          <div role="group" aria-label="Length" className="mt-2 flex flex-wrap gap-2.5">
            {[30, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={data.minutes === m}
                onClick={() => set("minutes", m)}
                className={`min-h-[52px] rounded-full border-2 px-5 text-lg font-medium ${data.minutes === m ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900"}`}
              >
                {m === 60 ? "One hour" : `${m} minutes`}
              </button>
            ))}
          </div>
          <p className="mt-4 text-lg font-semibold text-brand-900">Place</p>
          <div role="group" aria-label="Place" className="mt-2 flex flex-wrap gap-2.5">
            {(Object.keys(WHERE) as Format[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={data.format === f}
                onClick={() => set("format", f)}
                className={`min-h-[52px] rounded-full border-2 px-5 text-lg font-medium ${data.format === f ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900"}`}
              >
                {WHERE[f]}
              </button>
            ))}
          </div>
        </details>

        {!user && (
          <>
            <label htmlFor="ename" className="label mt-6 text-xl">
              Your first name
            </label>
            <input id="ename" className="input min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}

        <Actions
          primary="Yes, offer it"
          onPrimary={publish}
          disabled={!user && !data.name.trim()}
          busy={busy}
          error={error}
          secondary="Change the topic or price"
          onSecondary={() => go(0)}
        />
      </Screen>
    );

  return (
    <Screen title="Your session is on offer." help="Younger people looking to learn can find it now. That's a real thing you've just done.">
      <ol className="space-y-3">
        {[
          { done: true, title: "You offered a session", body: "You can remove it or add another whenever you like." },
          { done: false, title: "Someone asks to book", body: "It will be waiting in your messages. You can accept, or say not this time." },
          { done: false, title: "You agree the details together", body: "When, where, and how they'll pay you. Nothing is taken by us." },
        ].map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
            <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${s.done ? "bg-brand-700 text-white" : "bg-warm-100 text-warm-800"}`}>
              {s.done ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
            </span>
            <span>
              <span className="block text-xl font-semibold text-brand-900">{s.title}</span>
              <span className="block text-lg text-muted">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-2xl bg-warm-100 p-5 text-lg">
        A reminder: meet somewhere public or online the first time, and never share bank passwords or codes.{" "}
        <Link to="/safety" className="link">
          More on staying safe
        </Link>
      </p>
      <div className="mt-8 space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="See my messages" />
        <BigChoice to="/older" icon={Users} tone="warm" label="Back to my choices" />
      </div>
      <Feedback flow="earn" />
    </Screen>
  );
}
