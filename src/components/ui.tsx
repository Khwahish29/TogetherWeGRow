import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, Sparkles, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Navigate, useLocation } from "react-router-dom";
import type { AiSource } from "../../shared/types";
import { useAuth } from "../lib/auth";
import { currentUserId } from "../lib/store";
import type { BuddyPricing, Format } from "../lib/types";

// Muted, palette-friendly tones (all pass AA with white initials).
const AVATAR_COLORS = ["bg-brand-700", "bg-warm-700", "bg-brand-500", "bg-[#5B5470]", "bg-[#7A5C2E]", "bg-[#3E5A6B]"];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  const dims = { sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-lg", lg: "h-20 w-20 text-2xl" }[size];
  return (
    <span aria-hidden="true" className={`${color} ${dims} inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white`}>
      {initials}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children, aside }: { eyebrow?: string; title: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="border-b border-warm-200/70 bg-gradient-to-b from-warm-100/70 to-warm-50">
      <div className="container-page flex flex-col gap-6 pb-10 pt-10 sm:pb-12 sm:pt-14 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-[2.1rem] leading-[1.12] sm:text-5xl">{title}</h1>
          {children && <div className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{children}</div>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </header>
  );
}

/** Underlined section tabs that sit directly under a page header and link related pages. */
export function SectionTabs({ label, tabs }: { label: string; tabs: { to: string; label: string }[] }) {
  return (
    <nav aria-label={label} className="border-b border-warm-200 bg-warm-50">
      <div className="container-page flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `relative flex min-h-[56px] items-center whitespace-nowrap px-4 font-medium transition-colors ${
                isActive ? "text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-brand-700" : "text-muted hover:text-brand-800"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function PeopleTabs() {
  return (
    <SectionTabs
      label="People"
      tabs={[
        { to: "/mentors", label: "Mentors" },
        { to: "/marketplace", label: "Paid sessions" },
        { to: "/learn/buddies", label: "Digital buddies" },
      ]}
    />
  );
}

/**
 * Fades content up as it scrolls into view. Fail-safe: anything already on screen, scrolled past,
 * or reached by a jump link is shown immediately; reduced-motion users get static content.
 */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const inOrAbove = () => el.getBoundingClientRect().top < window.innerHeight * 1.05;
    if (reduce || typeof IntersectionObserver === "undefined" || inOrAbove()) {
      setShown(true);
      return;
    }
    const show = () => {
      setShown(true);
      cleanup();
    };
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && show(), {
      rootMargin: "0px 0px 10% 0px",
    });
    const onScroll = () => inOrAbove() && show();
    const cleanup = () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, []);
  return (
    <div
      ref={ref}
      className={`${className} transition duration-700 ease-out motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      style={shown ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/** A clearly labelled space for a real photo. We never fake photography. */
export function PhotoSlot({ caption, className = "" }: { caption: string; className?: string }) {
  return (
    <figure
      className={`relative flex flex-col justify-end overflow-hidden rounded-[1.75rem] bg-brand-100 p-6 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 15%, rgba(216,171,103,0.25), transparent 45%), radial-gradient(circle at 85% 80%, rgba(35,70,56,0.18), transparent 50%), repeating-linear-gradient(135deg, rgba(35,70,56,0.05) 0 2px, transparent 2px 14px)",
      }}
    >
      <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-sm font-medium text-brand-800">
        <Camera aria-hidden="true" className="h-4 w-4" /> Photo to come
      </span>
      <figcaption className="max-w-xs text-[0.95rem] leading-snug text-brand-900">{caption}</figcaption>
    </figure>
  );
}

export function SourceLabel({ source }: { source: AiSource }) {
  return source === "ai" ? (
    <span className="badge bg-brand-100 text-brand-800">
      <Sparkles aria-hidden="true" className="h-4 w-4" /> AI-generated draft · please review
    </span>
  ) : (
    <span className="badge bg-warm-100 text-warm-800">
      <Wrench aria-hidden="true" className="h-4 w-4" /> Suggested by built-in rules · please review
    </span>
  );
}

export function FormatBadge({ format }: { format: Format }) {
  const label = { online: "Online", "in-person": "In person", both: "Online & in person" }[format];
  return <span className="badge whitespace-nowrap bg-brand-100 text-brand-800">{label}</span>;
}

export function PricingBadge({ pricing, rate }: { pricing: BuddyPricing; rate?: number }) {
  if (pricing === "free") return <span className="badge bg-emerald-100 text-emerald-800">Free</span>;
  if (pricing === "volunteer") return <span className="badge bg-brand-100 text-brand-800">Volunteer</span>;
  return <span className="badge bg-warm-100 text-warm-700">Paid · ${rate}/hour</span>;
}

export function DemoBadge() {
  return <span className="badge bg-warm-100 text-warm-800">Demo listing</span>;
}

/** Editable list of short text items (skills, preferences...). */
export function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  id: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <ul className="mb-2 flex flex-wrap gap-2" aria-label={`${label} list`}>
        {values.length === 0 && <li className="hint">None yet.</li>}
        {values.map((v) => (
          <li key={v} className="chip">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              className="ml-1 rounded-full px-1.5 text-brand-700 hover:bg-brand-200"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          id={id}
          className="input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-secondary shrink-0" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, loadedFor } = useAuth();
  const location = useLocation();
  // The session can change (sign up / log in) a moment before the auth context reloads.
  const sessionId = currentUserId();
  if (loading || (sessionId && sessionId !== loadedFor)) return <p className="container-page py-16">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-warm-200 bg-white/60 px-6 py-12 text-center">
      <p className="font-serif text-2xl text-brand-900">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
    </div>
  );
}

export function formatPrice(price: number) {
  return `$${price}`;
}
