import { useState } from "react";
import { Check, Copy, Heart, Mail, Share2, Users } from "lucide-react";
import { markFirstInteraction } from "../lib/store";
import { Feedback } from "./Extra";
import { Actions, BigChoice, Screen } from "./parts";
import { useWizard } from "./useWizard";

/* ------------------------------------------------------------------ */
/* Family: help someone you love take a first step                     */
/* ------------------------------------------------------------------ */

const WHO = ["Dad", "Mom", "Grandpa", "Grandma", "Uncle", "Aunt"];
const WORK = ["carpentry", "nursing", "cooking", "farming", "teaching", "fixing cars", "sewing", "driving"];

const START = { name: "", work: "", years: "", gift: "", message: "", short: false };

/** The invitation is written from what they told us. Nothing is added that they didn't say. */
function write(d: typeof START, short: boolean) {
  const who = d.name.trim() || "there";
  const work = d.work.trim();
  const years = d.years.trim();
  const experience = work ? (years ? `your ${years} years of ${work}` : `all your years of ${work}`) : "everything you've done over the years";
  const gift = d.gift.trim() ? `, and how good you are at ${d.gift.trim()}` : "";
  const link = window.location.origin;
  if (short)
    return `Hi ${who}, I've been thinking about ${experience}${gift}. There's a simple website called TogetherWeGrow where younger people ask people like you for advice. No pressure at all. Shall we look at it together sometime?\n\n${link}`;
  return `Hi ${who},

I've been thinking about ${experience}${gift}. You know things people only learn by doing, and I don't think you realize how much that's worth.

I found a simple website called TogetherWeGrow. Younger people ask practical questions there, and people with experience like yours answer them. Some offer paid advice too, and there's work that's easier on the body.

There's no pressure, and it's completely your choice. If you'd like, we could look at it together.

${link}`;
}

export function FamilyFlow() {
  const w = useWizard("twg.simple.family", START);
  const { step, go, data, set } = w;
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const who = data.name.trim();

  const compose = (short = data.short) => {
    set("short", short);
    set("message", write(data, short));
    setCopied(false);
  };

  // 1 of 2: who.
  if (step === 0)
    return (
      <Screen step="Step 1 of 2" title="Who are you thinking of?" help="The best invitations come from someone they love. That's you.">
        <p className="text-lg text-muted">Tap one, or type what you call them:</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {WHO.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={who === n}
              onClick={() => set("name", n)}
              className={`min-h-[56px] rounded-full border-2 px-5 text-xl font-medium transition ${who === n ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"}`}
            >
              {n}
            </button>
          ))}
        </div>
        <label htmlFor="fname" className="label mt-6 text-xl">
          What you call them
        </label>
        <input id="fname" className="input min-h-[64px] text-2xl" placeholder="For example: Grandma Rose" value={data.name} onChange={(e) => set("name", e.target.value)} />
        <Actions primary="Next" onPrimary={() => go(1)} disabled={!who} />
      </Screen>
    );

  // 2 of 2: what they know. Only the first box is needed.
  if (step === 1)
    return (
      <Screen step="Step 2 of 2" title={`What does ${who} know how to do?`} help="The work they did, or the thing everyone asks them about.">
        <label htmlFor="fwork" className="sr-only">
          Their work or skill
        </label>
        <input id="fwork" className="input min-h-[64px] text-xl" placeholder="For example: carpentry" value={data.work} onChange={(e) => set("work", e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          {WORK.map((x) => (
            <button key={x} type="button" onClick={() => set("work", x)} className="min-h-[48px] rounded-full border-2 border-warm-200 bg-white px-4 text-lg hover:border-brand-600">
              {x}
            </button>
          ))}
        </div>

        <details className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
          <summary className="cursor-pointer text-xl font-semibold text-brand-900">Make it more personal (only if you'd like)</summary>
          <label htmlFor="fyears" className="label mt-4 text-lg">
            About how many years did they do it?
          </label>
          <input id="fyears" className="input min-h-[56px] text-xl" inputMode="numeric" value={data.years} onChange={(e) => set("years", e.target.value.replace(/[^\d]/g, "").slice(0, 2))} />
          <label htmlFor="fgift" className="label mt-4 text-lg">
            Something you admire about how they do it
          </label>
          <input id="fgift" className="input min-h-[56px] text-xl" placeholder="For example: fixing what others give up on" value={data.gift} onChange={(e) => set("gift", e.target.value)} />
        </details>

        <Actions
          primary="Write my invitation"
          disabled={!data.work.trim()}
          onPrimary={() => {
            compose(false);
            go(2);
          }}
        />
      </Screen>
    );

  return (
    <Screen title={`Your invitation to ${who || "them"}`} help="In your voice. Change any words you like, then send it the way you usually talk to each other.">
      <div className="rounded-[1.75rem] bg-white p-2 shadow-lg ring-1 ring-warm-200">
        <div className="rounded-[1.4rem] border border-dashed border-warm-200 bg-warm-50 p-1">
          <label htmlFor="fmsg" className="sr-only">
            Your invitation
          </label>
          <textarea
            id="fmsg"
            rows={data.short ? 7 : 13}
            className="w-full resize-y rounded-[1.2rem] border-0 bg-transparent p-5 font-serif text-xl leading-relaxed text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            value={data.message}
            onChange={(e) => {
              set("message", e.target.value);
              setCopied(false);
            }}
          />
        </div>
      </div>
      <button type="button" className="link mt-3 min-h-[44px] text-lg" onClick={() => compose(!data.short)}>
        {data.short ? "Start again with a longer one" : "Start again with a shorter one"}
      </button>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {canShare && (
          <button
            type="button"
            className="btn-primary min-h-[60px] text-lg sm:col-span-2"
            onClick={async () => {
              try {
                await navigator.share({ text: data.message });
                markFirstInteraction("family");
              } catch {
                // They closed the share sheet; nothing to do.
              }
            }}
          >
            <Share2 aria-hidden="true" className="h-5 w-5" /> Send it (text, WhatsApp, and more)
          </button>
        )}
        <button
          type="button"
          className={`${canShare ? "btn-secondary" : "btn-primary"} min-h-[60px] text-lg`}
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

      <section className="mt-10 rounded-[2rem] bg-brand-900 p-6 text-brand-100 sm:p-8" aria-labelledby="fam-how">
        <h2 id="fam-how" className="flex items-center gap-3 font-serif text-2xl text-white">
          <Heart aria-hidden="true" className="h-6 w-6 text-warm-400" /> Or say it in person
        </h2>
        <ul className="mt-4 space-y-3 text-lg">
          <li>
            <strong className="text-white">Begin with what you admire.</strong> “You're the only person I know who can…”
          </li>
          <li>
            <strong className="text-white">Ask, don't tell.</strong> “Would you want to see something?” lands better than “You should try this.”
          </li>
          <li>
            <strong className="text-white">Sit beside them, and let them hold the phone.</strong> It's theirs to explore.
          </li>
          <li>
            <strong className="text-white">A no is fine.</strong> Only they can decide to share what they know, or say yes to any work.
          </li>
        </ul>
      </section>

      <div className="mt-6 space-y-4">
        <BigChoice to="/start" icon={Users} label="Look at the first screen together" sub="It asks one simple question" />
        <BigChoice to="/older/help?step=1" icon={Heart} tone="warm" label="Ask a helper to walk them through it" sub="A patient younger helper, at their pace" />
      </div>
      <Feedback flow="family" />
    </Screen>
  );
}
