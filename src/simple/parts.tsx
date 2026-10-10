import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { VoiceRecorder } from "../components/VoiceRecorder";

/** One screen, one question. */
export function Screen({ step, title, help, children }: { step?: string; title: string; help?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-5 pb-16 pt-10 sm:px-6 sm:pt-14">
      {step && <p className="text-lg font-medium text-warm-700">{step}</p>}
      <h1 tabIndex={-1} className="mt-2 text-[2.1rem] leading-tight outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-[2.6rem]">
        {title}
      </h1>
      {help && <p className="mt-4 text-xl leading-relaxed text-muted">{help}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

const TONES = {
  forest: "bg-brand-100 text-brand-800",
  warm: "bg-warm-100 text-warm-800",
  sage: "bg-brand-50 text-brand-700",
};

/** A very large, clearly labelled choice. Works as a link or a button. */
export function BigChoice({
  to,
  onClick,
  icon: Icon,
  emoji,
  label,
  sub,
  tone = "forest",
  selected,
}: {
  to?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  sub?: string;
  tone?: keyof typeof TONES;
  /** For toggle-style choices (pick several). */
  selected?: boolean;
}) {
  const cls = `group flex min-h-[88px] w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition sm:min-h-[96px] sm:gap-5 sm:p-6 ${
    selected ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white hover:border-brand-600 hover:bg-brand-50/60"
  }`;
  const inner = (
    <>
      {(emoji || Icon) && (
        <span aria-hidden="true" className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl sm:h-16 sm:w-16 ${TONES[tone]}`}>
          {emoji ?? (Icon && <Icon className="h-8 w-8" />)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-semibold leading-snug text-brand-900">{label}</span>
        {sub && <span className="mt-1 block text-lg text-muted">{sub}</span>}
      </span>
      {selected === undefined ? (
        <ArrowRight aria-hidden="true" className="h-7 w-7 shrink-0 text-brand-600 transition group-hover:translate-x-1" />
      ) : (
        <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-lg font-bold ${selected ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200"}`}>
          {selected ? "✓" : ""}
        </span>
      )}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-pressed={selected}>
      {inner}
    </button>
  );
}

/** The single main action on a screen, plus an optional quieter one. */
export function Actions({
  primary,
  onPrimary,
  disabled,
  busy,
  error,
  secondary,
  onSecondary,
}: {
  primary: string;
  onPrimary: () => void;
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
  secondary?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="mt-10 flex flex-col gap-3">
      {error && (
        <p role="alert" className="rounded-2xl bg-warm-100 p-4 text-lg text-warm-800">
          {error}
        </p>
      )}
      <button type="button" onClick={onPrimary} disabled={disabled || busy} aria-busy={busy || undefined} className="btn-primary min-h-[64px] w-full text-xl">
        {busy ? "One moment…" : primary} {!busy && <ArrowRight aria-hidden="true" className="h-6 w-6" />}
      </button>
      {secondary && onSecondary && (
        <button type="button" onClick={onSecondary} className="btn-ghost min-h-[56px] w-full text-lg">
          {secondary}
        </button>
      )}
    </div>
  );
}

/** A big text box with an optional "Speak instead" button. Typing always works. */
export function SpeakOrType({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input min-h-[140px] text-xl leading-relaxed"
      />
      <div className="mt-3">
        <VoiceRecorder compact onText={(t) => onChange(value ? `${value} ${t}` : t)} />
      </div>
    </div>
  );
}

/** Gentle example answers people can tap to fill the box. */
export function Examples({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  return (
    <div className="mt-5">
      <p className="text-lg text-muted">Or tap an example to start:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((e) => (
          <button key={e} type="button" onClick={() => onPick(e)} className="min-h-[48px] rounded-full border-2 border-warm-200 bg-white px-4 text-lg hover:border-brand-600">
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Runs a save/send action, tracking "busy" and showing a kind message if it fails. */
export function useRun() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return { run, busy, error };
}

/** A friendly error line for screens that don't use <Actions>. */
export function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 rounded-2xl bg-warm-100 p-4 text-lg text-warm-800">
      {error}
    </p>
  );
}
