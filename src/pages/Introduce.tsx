import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, HeartHandshake, Mail, ShieldCheck, X } from "lucide-react";
import { PageHeader } from "../components/ui";

const RELATIONSHIPS = ["my parent", "my grandparent", "my aunt or uncle", "a friend", "a neighbor", "someone I help in my community", "someone else"];

/** Builds a warm, respectful invitation. Written by us, not generated, so it's always predictable. */
function buildMessage(f: { name: string; rel: string; work: string; years: string; gift: string; brief: boolean }) {
  const name = f.name.trim() || "[their name]";
  const work = f.work.trim();
  const years = f.years.trim();
  const experience = work ? (years ? `your ${years} years in ${work}` : `all your years in ${work}`) : "everything you've done over the years";
  const gift = f.gift.trim();
  const link = typeof window !== "undefined" ? window.location.origin : "";
  if (f.brief) {
    return `Hi ${name}, I came across TogetherWeGrow, a place where people with real experience answer questions from people who are learning, and some offer paid advice. I thought of you and ${experience}. No pressure at all, entirely up to you, but I'd be glad to look at it together if you're curious: ${link}`;
  }
  return `Hi ${name},

I've been thinking about ${experience}${gift ? `, and how good you are at ${gift}` : ""}. You know things that people only learn by doing.

I found a website called TogetherWeGrow. People who are learning a trade or a skill ask practical questions there, and people with experience like yours answer them. Some also offer paid advice or mentoring, and there are roles that are easier on the body than the work you've done.

There's no pressure, and it's completely your choice. You can just look around without signing up. If you'd like, we could look at it together sometime.

${link}`;
}

export default function Introduce() {
  const [f, setF] = useState({ name: "", rel: RELATIONSHIPS[0], work: "", years: "", gift: "", brief: false });
  const [copied, setCopied] = useState(false);
  // The person can edit the wording; changing the details above writes a fresh version.
  const [edited, setEdited] = useState<string | null>(null);
  const generated = useMemo(() => buildMessage(f), [f]);
  const message = edited ?? generated;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCopied(false);
    setEdited(null);
    setF((x) => ({ ...x, [k]: e.target.value }));
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="For family and friends" title="Help someone you love feel valued.">
        Sometimes the first step is easier when it begins with someone who already knows how much they have to offer. Write a
        short invitation that celebrates their experience, and leave the choice with them.
      </PageHeader>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <form className="card space-y-5 p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-3xl">About them</h2>
          <p className="text-muted">Only what you type here goes into the message. Nothing is saved or sent.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="in-name" className="label">
                Their first name (or what you call them)
              </label>
              <input id="in-name" className="input" value={f.name} onChange={set("name")} placeholder="e.g. Dad, Grandma Rose" />
            </div>
            <div>
              <label htmlFor="in-rel" className="label">
                They are
              </label>
              <select id="in-rel" className="input" value={f.rel} onChange={set("rel")}>
                {RELATIONSHIPS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="in-work" className="label">
                The work they've done
              </label>
              <input id="in-work" className="input" value={f.work} onChange={set("work")} placeholder="e.g. carpentry, nursing, farming" />
            </div>
            <div>
              <label htmlFor="in-years" className="label">
                For about how many years? <span className="font-normal text-muted">(optional)</span>
              </label>
              <input id="in-years" className="input" inputMode="numeric" value={f.years} onChange={set("years")} placeholder="e.g. 35" />
            </div>
          </div>
          <div>
            <label htmlFor="in-gift" className="label">
              Something they're especially good at <span className="font-normal text-muted">(optional)</span>
            </label>
            <input id="in-gift" className="input" value={f.gift} onChange={set("gift")} placeholder="e.g. fixing what everyone else gives up on" />
          </div>
          <fieldset>
            <legend className="label">Message length</legend>
            <div className="flex flex-wrap gap-2">
              {[
                [false, "A warm letter"],
                [true, "A short text"],
              ].map(([val, label]) => (
                <label key={String(val)} className={`flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-medium ${f.brief === val ? "border-brand-700 bg-brand-50" : "border-warm-200"}`}>
                  <input type="radio" name="length" className="h-4 w-4 accent-brand-700" checked={f.brief === val} onChange={() => { setEdited(null); setF((x) => ({ ...x, brief: val as boolean })); }} />
                  {label as string}
                </label>
              ))}
            </div>
          </fieldset>
        </form>

        <div className="space-y-6">
          <section aria-labelledby="preview" className="rounded-3xl bg-brand-800 p-6 text-white sm:p-8">
            <h2 id="preview" className="text-2xl text-white">
              Your invitation
            </h2>
            <p className="mt-1 text-brand-100">Change any words you like before you send it. It's yours to send, or not.</p>
            <label htmlFor="in-message" className="sr-only">
              Invitation message
            </label>
            <textarea id="in-message" rows={f.brief ? 6 : 13} value={message} onChange={(e) => { setEdited(e.target.value); setCopied(false); }} className="mt-4 w-full rounded-2xl border-0 bg-white/[0.07] p-4 font-serif text-lg leading-relaxed text-white ring-1 ring-white/15 focus:ring-2 focus:ring-warm-400" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn bg-warm-400 text-brand-900 hover:bg-warm-200" onClick={copy}>
                {copied ? <Check aria-hidden="true" className="h-5 w-5" /> : <Copy aria-hidden="true" className="h-5 w-5" />}
                {copied ? "Copied" : "Copy the message"}
              </button>
              <a
                className="btn border-2 border-white/40 text-white hover:border-white"
                href={`mailto:?subject=${encodeURIComponent("Something I thought of when I thought of you")}&body=${encodeURIComponent(message)}`}
              >
                <Mail aria-hidden="true" className="h-5 w-5" /> Open in my email
              </a>
            </div>
          </section>

          <section aria-labelledby="consent" className="rounded-3xl border border-warm-200 bg-white p-6 sm:p-8">
            <h2 id="consent" className="flex items-center gap-2 font-sans text-xl font-semibold">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-700" /> Their choice, always
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-brand-900">You can</p>
                <ul className="mt-2 space-y-2 text-muted">
                  {["Send them an invitation", "Look at the website together", "Sit beside them while they set things up"].map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-600" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-brand-900">Only they can</p>
                <ul className="mt-2 space-y-2 text-muted">
                  {["Create their profile", "Decide what's published", "Accept requests or paid work"].map((t) => (
                    <li key={t} className="flex gap-2">
                      <X aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-warm-700" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="walk" className="rounded-3xl bg-warm-100/70 p-6 sm:p-8">
            <h2 id="walk" className="flex items-center gap-2 font-sans text-xl font-semibold">
              <HeartHandshake aria-hidden="true" className="h-5 w-5 text-warm-700" /> Would they like someone to walk them through it?
            </h2>
            <p className="mt-2 text-muted">
              A digital buddy can sit with them (online or in person) and explain each step, while they stay in control. Buddies
              are volunteers, so a reply can take a day or two.
            </p>
            <Link to="/learn/buddies?need=Getting%20started%20on%20TogetherWeGrow" className="btn-secondary mt-4">
              Request a walkthrough
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
