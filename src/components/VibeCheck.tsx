import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy, MessageCircle, MessagesSquare } from "lucide-react";
import type { VibeCheckRequest, VibeCheckResult } from "../../shared/types";
import { api } from "../lib/api";

const EXAMPLES: Record<VibeCheckRequest["mode"], string[]> = {
  explain: ["That advice was clutch.", "You're a legend!", "No cap, best session ever.", "Measure twice, cut once.", "Hold your horses, son.", "Lowkey nervous for tomorrow ngl."],
  rephrase: ["ngl I'm lowkey lost, can u explain again?", "Don't cut corners on this, it's not rocket science.", "Bet, see you tmrw."],
};

const CERTAINTY: Record<VibeCheckResult["certainty"], { label: string; style: string }> = {
  clear: { label: "Clear meaning", style: "bg-emerald-100 text-emerald-900" },
  likely: { label: "The usual meaning", style: "bg-brand-100 text-brand-800" },
  unsure: { label: "Not certain: worth asking", style: "bg-warm-100 text-warm-900" },
};

/**
 * Vibe Check: helps people from different generations understand each other's words.
 * It explains, it doesn't judge, and it says so when it isn't sure.
 */
export function VibeCheck({
  initialText = "",
  autoRun = false,
  compact = false,
  idPrefix = "vibe",
}: {
  initialText?: string;
  autoRun?: boolean;
  compact?: boolean;
  idPrefix?: string;
}) {
  const [mode, setMode] = useState<VibeCheckRequest["mode"]>("explain");
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<VibeCheckResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run(t = text, m = mode) {
    if (!t.trim()) return;
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      setResult((await api.vibeCheck({ text: t.trim(), mode: m })).data);
    } catch {
      setError("We couldn't check that just now. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (autoRun && initialText) run(initialText, "explain");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    run();
  }

  async function copy(t: string) {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const tabs: { value: VibeCheckRequest["mode"]; label: string; icon: typeof MessageCircle }[] = [
    { value: "explain", label: "What do they mean?", icon: MessageCircle },
    { value: "rephrase", label: "Help me say it", icon: MessagesSquare },
  ];

  return (
    <div className={compact ? "" : "rounded-[1.75rem] bg-white p-6 ring-1 ring-warm-200 sm:p-8"}>
      {!autoRun && (
        <div role="radiogroup" aria-label="What would you like help with?" className="inline-flex flex-wrap gap-1 rounded-full bg-warm-100 p-1">
          {tabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => {
                setMode(value);
                setResult(null);
              }}
              className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 font-medium transition ${
                mode === value ? "bg-white text-brand-900 shadow-sm" : "text-muted hover:text-brand-800"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      )}

      {!autoRun && (
        <form onSubmit={submit} className="mt-5">
          <label htmlFor={`${idPrefix}-text`} className="label">
            {mode === "explain" ? "Paste or type the message you received" : "Type what you'd like to say"}
          </label>
          <textarea
            id={`${idPrefix}-text`}
            rows={3}
            className="input text-lg"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "explain" ? "e.g. That advice was clutch." : "e.g. ngl I'm lowkey lost, can u explain again?"}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Try:</span>
            {EXAMPLES[mode].map((ex) => (
              <button
                key={ex}
                type="button"
                className="chip border border-warm-200 bg-white hover:border-brand-600 hover:bg-brand-50"
                onClick={() => {
                  setText(ex);
                  run(ex, mode);
                }}
              >
                {ex}
              </button>
            ))}
          </div>
          <button type="submit" className="btn-primary mt-5" disabled={busy || !text.trim()}>
            {busy ? "Thinking it through…" : mode === "explain" ? "Explain it" : "Suggest a clearer way"}
          </button>
        </form>
      )}

      <div aria-live="polite">
        {autoRun && busy && <p className="text-muted">Thinking it through…</p>}
        {error && (
          <p role="alert" className="notice mt-4">
            {error}
          </p>
        )}
        {result && !busy && (
          <div className={`${autoRun ? "" : "mt-6"} rounded-2xl bg-brand-50 p-5`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${CERTAINTY[result.certainty].style}`}>{CERTAINTY[result.certainty].label}</span>
              <span className="badge bg-white text-brand-800">Tone: {result.tone}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-muted">{mode === "explain" ? "What it probably means" : "A clearer way to say it"}</p>
            <p className="mt-1 font-serif text-xl leading-relaxed text-brand-900">{result.meaning}</p>
            {mode === "rephrase" && (
              <button type="button" className="btn-ghost mt-2 min-h-[44px] px-3 text-sm" onClick={() => copy(result.meaning)}>
                {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
                {copied ? "Copied" : "Copy this"}
              </button>
            )}
            {result.phrases.length > 0 && (
              <dl className="mt-4 space-y-1.5">
                {result.phrases.map((p) => (
                  <div key={p.phrase} className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold text-brand-900">“{p.phrase}”</dt>
                    <dd className="text-ink">means {p.meaning.replace(/^means\s+/i, "")}</dd>
                  </div>
                ))}
              </dl>
            )}
            {result.reply && mode === "explain" && (
              <div className="mt-4 rounded-xl bg-white p-4">
                <p className="text-sm font-medium text-muted">You could reply</p>
                <p className="mt-1">“{result.reply}”</p>
                <button type="button" className="btn-ghost mt-1 min-h-[40px] px-0 text-sm" onClick={() => copy(result.reply!)}>
                  {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy reply"}
                </button>
              </div>
            )}
            {result.askBack && (
              <p className="mt-4 text-[0.95rem] text-ink">
                <strong>If you're not sure, just ask:</strong> “{result.askBack.replace(/^["“]|["”]$/g, "")}”
              </p>
            )}
            <p className="mt-4 text-xs text-muted">
              An explanation, not a verdict. People use words differently, so when in doubt, asking is always kind.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
