import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Square, Volume2, type LucideIcon } from "lucide-react";
import { VoiceRecorder } from "../components/VoiceRecorder";

/** One screen, one question. */
export function Screen({
  step,
  eyebrow,
  title,
  help,
  readAloud = true,
  children,
}: {
  step?: string;
  /** Set to false on screens that offer their own, more specific "read to me" button. */
  readAloud?: boolean;
  /** A warm line above the question, such as a greeting. */
  eyebrow?: ReactNode;
  title: string;
  help?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-5 pb-16 pt-10 sm:px-6 sm:pt-14">
      {step && <p className="text-lg font-medium text-warm-700">{step}</p>}
      {eyebrow && <p className="font-serif text-2xl text-warm-700">{eyebrow}</p>}
      <h1 tabIndex={-1} className="mt-2 text-[2.1rem] leading-tight outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-[2.6rem]">
        {title}
      </h1>
      {help && <p className="mt-4 text-xl leading-relaxed text-muted">{help}</p>}
      {readAloud && <ReadAloud className="mt-4" />}
      <div className="mt-6">{children}</div>
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
  image,
  imageFocus,
  label,
  sub,
  tone = "forest",
  selected,
}: {
  to?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  emoji?: string;
  /** A photo shown instead of an icon. Decorative: the label says what the choice is. */
  image?: string;
  /** Which part of the photo to keep in view, as a CSS object-position (for example "70% 30%"). */
  imageFocus?: string;
  label: string;
  sub?: string;
  tone?: keyof typeof TONES;
  /** For toggle-style choices (pick several). */
  selected?: boolean;
}) {
  const cls = `group flex min-h-[88px] w-full gap-4 rounded-3xl border-2 p-4 text-left transition sm:min-h-[96px] sm:items-center sm:gap-5 sm:p-6 ${
    image ? "flex-col sm:flex-row" : "items-center"
  } ${
    selected ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white hover:border-brand-600 hover:bg-brand-50/60"
  }`;
  const inner = (
    <>
      {image && <img src={image} alt="" loading="lazy" style={{ objectPosition: imageFocus }} className="h-40 w-full shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" />}
      {!image && (emoji || Icon) && (
        <span aria-hidden="true" className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl sm:h-16 sm:w-16 ${TONES[tone]}`}>
          {emoji ?? (Icon && <Icon className="h-8 w-8" />)}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-center gap-4">
        <span className="min-w-0 flex-1">
          <span className="block text-2xl font-semibold leading-snug text-brand-900">{label}</span>
          {sub && <span className="mt-1 block break-words text-lg text-muted">{sub}</span>}
        </span>
        {selected === undefined ? (
          <ArrowRight aria-hidden="true" className="h-7 w-7 shrink-0 text-brand-600 transition group-hover:translate-x-1" />
        ) : (
          <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-lg font-bold ${selected ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200"}`}>
            {selected ? "✓" : ""}
          </span>
        )}
      </span>
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

/* ------------------------------------------------------------------ */
/* Warmth: greetings, read-aloud, and a thought for the day            */
/* ------------------------------------------------------------------ */

export function greeting(name?: string) {
  const h = new Date().getHours();
  const hello = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return name ? `${hello}, ${name.split(" ")[0]}.` : `${hello}.`;
}

/** Reads the current screen aloud, slowly. Hidden where the browser can't speak. */
export function ReadAloud({ className = "" }: { className?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  if (!supported) return null;

  function toggle() {
    window.speechSynthesis.cancel();
    if (speaking) return setSpeaking(false);
    const main = document.querySelector("main");
    // Read what's on the screen, minus this button and anything marked as not for reading.
    const copy = main?.cloneNode(true) as HTMLElement | undefined;
    copy?.querySelectorAll("[data-no-read], [aria-hidden='true'], textarea, input").forEach((el) => el.remove());
    // Line breaks only exist for rendered text, so measure the copy off-screen, then turn each line into a sentence.
    let text = "";
    if (copy) {
      copy.style.cssText = "position:absolute;left:-9999px;top:0;width:600px";
      document.body.appendChild(copy);
      text = copy.innerText;
      copy.remove();
    }
    text = text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => (/[.!?:,]$/.test(line) ? line : `${line}.`))
      .join(" ")
      .slice(0, 1500);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    u.lang = document.documentElement.lang || "en";
    u.onend = u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  return (
    <div data-no-read className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={speaking}
        className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-warm-200 bg-white px-4 text-lg font-medium text-brand-800 hover:border-brand-600"
      >
        {speaking ? <Square aria-hidden="true" className="h-5 w-5" /> : <Volume2 aria-hidden="true" className="h-5 w-5" />}
        {speaking ? "Stop reading" : "Read this to me"}
      </button>
    </div>
  );
}

type Thought = { text: string; from?: string };

/** Gentle encouragement. Sayings are credited only as far as we can honestly vouch for them. */
const THOUGHTS: Record<"older" | "younger", Thought[]> = {
  older: [
    { text: "What you know took a lifetime to learn. It still matters." },
    { text: "Your hands remember things no book has ever written down." },
    { text: "While we teach, we learn.", from: "Seneca" },
    { text: "You don't have to know everything about computers. You already know things no computer does." },
    { text: "Measure twice, cut once.", from: "A carpenter's saying, and good advice for almost everything" },
    { text: "Asking for help isn't falling behind. It's how everyone has ever learned anything." },
    { text: "There is no hurry here. Go at the pace that feels right." },
  ],
  younger: [
    { text: "Somewhere nearby is a person who has already solved the problem you're stuck on." },
    { text: "To know the road ahead, ask those coming back.", from: "A Chinese proverb" },
    { text: "Patience is the kindest thing you can bring. It costs nothing and it's remembered for years." },
    { text: "While we teach, we learn.", from: "Seneca" },
    { text: "A good question is a gift. It tells someone their experience is wanted." },
    { text: "Listening is a skill too. Today is good practice." },
    { text: "Every expert you admire was once shown how by someone patient." },
  ],
};

/** One thought a day, the same all day so it feels like a note left for you. */
export function Affirmation({ who }: { who: "older" | "younger" }) {
  const list = THOUGHTS[who];
  const day = Math.floor(Date.now() / 86_400_000);
  const t = list[day % list.length];
  return (
    <figure className="relative overflow-hidden rounded-3xl bg-brand-900 p-6 text-brand-100 sm:p-7">
      <span aria-hidden="true" className="absolute -right-2 -top-6 font-serif text-[9rem] leading-none text-white/10">
        ”
      </span>
      <figcaption className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">A thought for today</figcaption>
      <blockquote className="mt-2 font-serif text-2xl leading-snug text-white">{t.text}</blockquote>
      {t.from && <p className="mt-2 text-base">{t.from}</p>}
    </figure>
  );
}

/** A small scene for the first screen: an old tree and a new sprout, sharing the same sun. */
export function TreeAndSprout({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 200" role="img" aria-label="A tall tree and a young sprout growing side by side under the sun." className={className}>
      <circle className="ember" cx="318" cy="52" r="26" fill="#D8AB67" />
      <path d="M0 176 C 90 150, 190 158, 420 170 L420 200 L0 200 Z" fill="#E8D9BF" />
      <path d="M0 186 C 120 168, 260 176, 420 182 L420 200 L0 200 Z" fill="#CADBCF" />
      <g className="sway" style={{ transformOrigin: "150px 172px" }}>
        <path d="M146 172 C 148 140, 144 118, 150 92 C 156 118, 152 140, 156 172 Z" fill="#8A4630" />
        <path d="M150 128 C 138 120, 128 116, 118 104" stroke="#8A4630" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M151 118 C 164 110, 172 104, 182 92" stroke="#8A4630" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="150" cy="62" r="46" fill="#234638" />
        <circle cx="108" cy="88" r="32" fill="#2F5A47" />
        <circle cx="194" cy="84" r="34" fill="#2F5A47" />
        <circle cx="132" cy="50" r="24" fill="#4C7461" />
        <circle cx="176" cy="56" r="20" fill="#4C7461" />
      </g>
      <g className="sway-fast" style={{ transformOrigin: "262px 178px" }}>
        <path d="M262 178 C 262 164, 261 154, 262 142" stroke="#4C7461" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M262 150 C 262 136, 274 128, 286 130 C 286 144, 274 152, 262 150 Z" fill="#6E9A7F" />
        <path d="M262 156 C 262 144, 252 138, 242 140 C 242 152, 252 158, 262 156 Z" fill="#8FB59C" />
      </g>
    </svg>
  );
}
