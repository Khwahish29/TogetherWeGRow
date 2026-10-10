import { useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { AiSource } from "../../shared/types";
import { useAuth } from "../lib/auth";
import { currentUserId } from "../lib/store";
import type { BuddyPricing, Format } from "../lib/types";

const AVATAR_COLORS = ["bg-brand-600", "bg-warm-500", "bg-sky-700", "bg-rose-700", "bg-violet-700", "bg-teal-700"];

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

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-brand-100 bg-gradient-to-br from-brand-50 via-warm-50 to-warm-100">
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-2xl" />
      <div aria-hidden="true" className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-warm-400/20 blur-2xl" />
      <div className="container-page relative py-10 sm:py-14">
        {eyebrow && <p className="font-bold uppercase tracking-widest text-warm-700 text-sm">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">{title}</h1>
        {children && <div className="mt-3 max-w-3xl text-lg text-ink/80">{children}</div>}
      </div>
    </div>
  );
}

export function SourceLabel({ source }: { source: AiSource }) {
  return source === "ai" ? (
    <span className="badge bg-violet-100 text-violet-800">AI-generated draft · please review</span>
  ) : (
    <span className="badge bg-sky-100 text-sky-800">Suggested by built-in rules · please review</span>
  );
}

export function FormatBadge({ format }: { format: Format }) {
  const label = { online: "Online", "in-person": "In person", both: "Online & in person" }[format];
  return <span className="badge whitespace-nowrap bg-brand-100 text-brand-800">{label}</span>;
}

export function PricingBadge({ pricing, rate }: { pricing: BuddyPricing; rate?: number }) {
  if (pricing === "free") return <span className="badge bg-emerald-100 text-emerald-800">Free</span>;
  if (pricing === "volunteer") return <span className="badge bg-sky-100 text-sky-800">Volunteer</span>;
  return <span className="badge bg-warm-100 text-warm-700">Paid · ${rate}/hour</span>;
}

export function DemoBadge() {
  return <span className="badge bg-gray-200 text-gray-700">Demo</span>;
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
  const { user, loading } = useAuth();
  const location = useLocation();
  // The session can change (sign up / log in) a moment before the auth context reloads.
  const sessionId = currentUserId();
  if (loading || (sessionId && user?.id !== sessionId)) return <p className="container-page py-16">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-white/60 p-8 text-center">
      <p className="font-bold text-brand-900">{title}</p>
      {children && <div className="mt-2 text-ink/70">{children}</div>}
    </div>
  );
}

export function formatPrice(price: number) {
  return `$${price}`;
}
