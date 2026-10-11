import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardPaste, Search, ShieldAlert, ShieldCheck, ShieldQuestion, Users } from "lucide-react";
import type { ScamCheckResult, ScamVerdict } from "../../shared/types";
import { api } from "../lib/api";
import { Actions, BigChoice, Screen, useRun } from "./parts";

const EXAMPLE =
  "USPS: Your package is on hold due to an unpaid $1.99 redelivery fee. Pay within 24 hours or it will be returned: http://usps-redeliver.top/pay";

const LOOK: Record<ScamVerdict, { title: string; card: string; icon: typeof ShieldAlert; iconBox: string }> = {
  "likely-scam": { title: "This looks like a scam.", card: "bg-warm-700 text-white", icon: ShieldAlert, iconBox: "bg-white/15 text-white" },
  "be-careful": { title: "Be careful with this one.", card: "bg-warm-100 text-warm-900 ring-2 ring-warm-400", icon: ShieldQuestion, iconBox: "bg-warm-400 text-brand-900" },
  "no-signs": { title: "We didn't spot the usual warning signs.", card: "bg-brand-100 text-brand-900 ring-1 ring-brand-200", icon: ShieldCheck, iconBox: "bg-brand-700 text-white" },
};

/** Paste a worrying message; get a calm, plain answer about whether it looks like fraud. */
export function ScamCheck() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScamCheckResult | null>(null);
  const [pasteHint, setPasteHint] = useState(false);
  const { run, busy, error } = useRun();

  async function paste() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip.trim()) setText(clip.trim().slice(0, 3000));
      else setPasteHint(true);
    } catch {
      // The browser didn't allow it; explain the manual way.
      setPasteHint(true);
    }
  }

  function check() {
    return run(async () => {
      const res = await api.scamCheck(text.trim());
      setResult(res.data);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus());
    });
  }

  if (result) {
    const look = LOOK[result.verdict];
    return (
      <Screen title={look.title} help="You did the right thing by checking first.">
        <section className={`rise rounded-[2rem] p-6 shadow-lg sm:p-8 ${look.card}`} aria-label="Our view">
          <span aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-2xl ${look.iconBox}`}>
            <look.icon className="h-9 w-9" />
          </span>
          <p className="mt-4 font-serif text-2xl leading-snug">{result.summary}</p>
        </section>

        {result.signs.length > 0 && (
          <section className="mt-8" aria-labelledby="scam-signs">
            <h2 id="scam-signs" className="font-sans text-2xl font-semibold">
              What we noticed
            </h2>
            <ul className="mt-4 space-y-3">
              {result.signs.map((s) => (
                <li key={s.sign} className="rounded-2xl bg-white p-5 ring-1 ring-warm-200">
                  <p className="text-xl font-semibold text-brand-900">{s.sign}</p>
                  <p className="mt-1 text-lg text-muted">{s.why}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8" aria-labelledby="scam-do">
          <h2 id="scam-do" className="font-sans text-2xl font-semibold">
            What to do now
          </h2>
          <ol className="mt-4 space-y-3">
            {result.advice.map((a, i) => (
              <li key={a} className="flex gap-4 rounded-2xl bg-white p-5 text-xl ring-1 ring-warm-200">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-lg font-semibold text-white">
                  {i + 1}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </section>

        {result.verdict !== "no-signs" && (
          <details className="mt-6 rounded-2xl bg-warm-100 p-5 text-lg">
            <summary className="cursor-pointer text-xl font-semibold text-brand-900">Already replied, paid, or shared a code?</summary>
            <p className="mt-3">
              It happens to careful people every day, and it is not your fault. Call your bank or card company now, using the number on your card,
              and tell them what happened. Change any password you shared. Then tell someone you trust.
            </p>
          </details>
        )}

        <p className="mt-6 text-lg text-muted">
          This is our best judgment from the words alone. It can be wrong, so when in doubt, check with someone you trust.
        </p>

        <div className="mt-8 space-y-4">
          <BigChoice
            onClick={() => {
              setResult(null);
              setText("");
            }}
            icon={Search}
            label="Check another message"
          />
          <BigChoice to="/roots/help?step=1" icon={Users} tone="warm" label="Ask a person to look at it with me" />
          <BigChoice to="/roots" icon={ShieldCheck} tone="sage" label="Back to my choices" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Is this message a scam?" help="Paste or type the message that worried you. We'll look for the warning signs together.">
      <label htmlFor="scam-text" className="sr-only">
        The message you received
      </label>
      <textarea
        id="scam-text"
        rows={7}
        maxLength={3000}
        className="input min-h-[190px] text-xl leading-relaxed"
        placeholder="Paste the text, email or letter here"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPasteHint(false);
        }}
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={paste} className="btn-secondary min-h-[56px] px-5 text-lg">
          <ClipboardPaste aria-hidden="true" className="h-5 w-5" /> Paste it for me
        </button>
        <button type="button" onClick={() => setText(EXAMPLE)} className="btn-ghost min-h-[56px] px-5 text-lg">
          Show me an example
        </button>
      </div>
      {pasteHint && (
        <p role="status" className="mt-3 rounded-2xl bg-warm-100 p-4 text-lg">
          We couldn't paste it automatically. Press and hold inside the box above, then choose <strong>Paste</strong>.
        </p>
      )}

      <Actions primary="Check this message" onPrimary={check} disabled={text.trim().length < 10} busy={busy} error={error} />

      <p className="mt-6 text-lg text-muted">
        Please leave out card or account numbers. The message is read by our checking service and is not saved.{" "}
        <Link to="/privacy" className="link">
          How we handle privacy
        </Link>
      </p>

      <details className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
        <summary className="cursor-pointer text-xl font-semibold text-brand-900">The five signs to look for yourself</summary>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-lg">
          <li>It rushes you: “act now”, “within 24 hours”.</li>
          <li>It asks for money, gift cards, passwords or a code sent to your phone.</li>
          <li>It wants you to tap a link or call a number you don't know.</li>
          <li>It asks you to keep it secret.</li>
          <li>It's from a “new number” that says it's family.</li>
        </ol>
      </details>
    </Screen>
  );
}
