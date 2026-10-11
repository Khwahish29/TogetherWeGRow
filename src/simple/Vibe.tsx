import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ClipboardPaste, Copy, MessageCircle, MessagesSquare, Search, ShieldAlert, Users } from "lucide-react";
import type { VibeCheckRequest, VibeCheckResult } from "../../shared/types";
import { api } from "../lib/api";
import { Actions, BigChoice, Screen, useRun } from "./parts";

/* ------------------------------------------------------------------ */
/* Vibe Check: understanding each other's words                         */
/* ------------------------------------------------------------------ */

type Mode = VibeCheckRequest["mode"];

const EXAMPLES: Record<Mode, string[]> = {
  explain: ["That advice was clutch.", "No cap, best session ever.", "Hold your horses.", "Lowkey nervous for tomorrow ngl."],
  rephrase: ["ngl I'm lowkey lost, can u explain again?", "Bet, see you tmrw.", "Don't cut corners on this."],
};

const SURE: Record<VibeCheckResult["certainty"], string> = {
  clear: "We're confident about this one.",
  likely: "This is the usual meaning.",
  unsure: "This could mean a few things. It's perfectly fine to ask them.",
};

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary mt-3 min-h-[52px] px-5 text-lg"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check aria-hidden="true" className="h-5 w-5" /> : <Copy aria-hidden="true" className="h-5 w-5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/** The Deep roots path arrives wanting a message explained; the New growth path gets both directions offered equally. */
export function MeaningScreen({ younger = false }: { younger?: boolean }) {
  const [mode, setMode] = useState<Mode>("explain");
  const [text, setText] = useState("");
  const [result, setResult] = useState<VibeCheckResult | null>(null);
  const [pasteHint, setPasteHint] = useState(false);
  const { run, busy, error } = useRun();

  function check(t = text) {
    return run(async () => {
      const res = await api.vibeCheck({ text: t.trim(), mode });
      setResult(res.data);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus());
    });
  }

  async function paste() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip.trim()) setText(clip.trim().slice(0, 600));
      else setPasteHint(true);
    } catch {
      setPasteHint(true);
    }
  }

  if (result) {
    const explaining = mode === "explain";
    return (
      <Screen step="Vibe Check" title={explaining ? "Here's what it means" : "Here's a clearer way to say it"} help={explaining ? "Every generation has its own words. Not knowing one isn't falling behind." : "Same meaning, plainer words."}>
        <p className="border-l-2 border-warm-400 pl-4 text-lg italic text-muted">“{text.trim()}”</p>

        <section className="rise mt-5 rounded-[2rem] bg-brand-900 p-6 text-brand-100 shadow-lg sm:p-8" aria-label={explaining ? "The meaning" : "The clearer version"}>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">{explaining ? "What they probably mean" : "You could say"}</p>
          <p className="mt-2 font-serif text-2xl leading-snug text-white sm:text-3xl">{result.meaning}</p>
          <p className="mt-4 text-lg">
            {explaining ? `It sounds ${result.tone.toLowerCase()}. ${SURE[result.certainty]}` : `It will come across as ${result.tone.toLowerCase()}.`}
          </p>
        </section>
        {!explaining && <CopyButton text={result.meaning} label="Copy this" />}

        {result.phrases.length > 0 && (
          <section className="mt-8" aria-labelledby="vibe-words">
            <h2 id="vibe-words" className="font-sans text-2xl font-semibold">
              {explaining ? "The words, one by one" : "What we changed"}
            </h2>
            <dl className="mt-4 space-y-3">
              {result.phrases.map((p) => (
                <div key={p.phrase} className="rounded-2xl bg-white p-5 ring-1 ring-warm-200">
                  <dt className="font-serif text-2xl text-brand-900">“{p.phrase}”</dt>
                  <dd className="mt-1 text-xl text-muted">means {p.meaning.replace(/^means\s+/i, "")}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {explaining && result.reply && (
          <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-warm-200" aria-labelledby="vibe-reply">
            <h2 id="vibe-reply" className="font-sans text-xl font-semibold">
              If you'd like to reply
            </h2>
            <p className="mt-2 text-xl">“{result.reply}”</p>
            <CopyButton text={result.reply} label="Copy this reply" />
          </section>
        )}

        {result.askBack && (
          <p className="mt-6 rounded-2xl bg-warm-100 p-5 text-lg">
            <strong>Not sure? You can simply ask:</strong> “{result.askBack.replace(/^["“]|["”]$/g, "")}”
          </p>
        )}

        <p className="mt-6 text-lg text-muted">This is an explanation, not a verdict. People use words in their own ways, and asking is always kind.</p>

        <div className="mt-8 space-y-4">
          <BigChoice
            onClick={() => {
              setResult(null);
              setText("");
            }}
            icon={Search}
            label="Try another"
          />
          {!younger && <BigChoice to="/roots/scam" icon={ShieldAlert} tone="warm" label="Is it a scam?" sub="If the message worries you, check it here" />}
          <BigChoice to={younger ? "/growth" : "/roots"} icon={Users} tone="sage" label="Back to my choices" />
        </div>
      </Screen>
    );
  }

  const modes: { value: Mode; label: string; sub: string; icon: typeof MessageCircle }[] = [
    { value: "explain", label: "Explain a message", sub: "Someone said something I don't follow", icon: MessageCircle },
    { value: "rephrase", label: "Help me say it clearly", sub: "So the other person understands me", icon: MessagesSquare },
  ];

  return (
    <Screen
      step="Vibe Check"
      title={younger ? "Understand each other" : "What does this message mean?"}
      help={
        younger
          ? "“Clutch” and “measure twice, cut once” both mean something. This helps each of you hear the other."
          : "Paste or type the message that puzzled you. We'll put it in plain words."
      }
    >
      <div role="radiogroup" aria-label="What would you like?" className="grid gap-3 sm:grid-cols-2">
        {modes.map((m) => {
          const on = mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setMode(m.value)}
              className={`flex min-h-[88px] items-center gap-4 rounded-3xl border-2 p-4 text-left transition ${on ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white hover:border-brand-600"}`}
            >
              <span aria-hidden="true" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${on ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-800"}`}>
                <m.icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-xl font-semibold text-brand-900">{m.label}</span>
                <span className="block text-base text-muted">{m.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      <label htmlFor="vibe-text" className="label mt-6 text-xl">
        {mode === "explain" ? "The message you received" : "What you'd like to say"}
      </label>
      <textarea
        id="vibe-text"
        rows={4}
        maxLength={600}
        className="input min-h-[140px] text-xl leading-relaxed"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPasteHint(false);
        }}
      />
      {mode === "explain" && (
        <button type="button" onClick={paste} className="btn-secondary mt-3 min-h-[56px] px-5 text-lg">
          <ClipboardPaste aria-hidden="true" className="h-5 w-5" /> Paste it for me
        </button>
      )}
      {pasteHint && (
        <p role="status" className="mt-3 rounded-2xl bg-warm-100 p-4 text-lg">
          We couldn't paste it automatically. Press and hold inside the box above, then choose <strong>Paste</strong>.
        </p>
      )}

      <div className="mt-5">
        <p className="text-lg text-muted">Or tap one to see how it works:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES[mode].map((ex) => (
            <button key={ex} type="button" onClick={() => setText(ex)} className="min-h-[48px] rounded-full border-2 border-warm-200 bg-white px-4 py-2 text-left text-lg hover:border-brand-600">
              {ex}
            </button>
          ))}
        </div>
      </div>

      <Actions primary={mode === "explain" ? "Explain it to me" : "Suggest a clearer way"} onPrimary={() => check()} disabled={text.trim().length < 2} busy={busy} error={error} />

      {!younger && (
        <p className="mt-6 text-lg">
          <Link to="/roots/scam" className="link inline-flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0" /> Worried it might be a scam? Check that instead
          </Link>
        </p>
      )}
    </Screen>
  );
}
