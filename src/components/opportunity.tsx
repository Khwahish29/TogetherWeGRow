import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { AlertCircle, Building2, CheckCircle2, CircleHelp, Clock, HeartHandshake, MapPin, ShieldAlert } from "lucide-react";
import { OPP_TYPE_LABEL, fitCheck, payLabel, transparency, type FitCheck } from "../lib/comfort";
import type { Opportunity, WorkComfort } from "../lib/types";

/** Tabs linking the three "work" pages so they feel like one place. */
export function WorkTabs() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-full px-4 py-2 font-bold ${isActive ? "bg-brand-700 text-white" : "bg-white text-brand-800 hover:bg-brand-100"}`;
  return (
    <nav aria-label="Work" className="container-page mt-5 flex gap-2 overflow-x-auto pb-1">
      <NavLink to="/opportunities" className={tab}>
        Paid opportunities
      </NavLink>
      <NavLink to="/careers" className={tab}>
        Career ideas
      </NavLink>
      <NavLink to="/next-chapter" className={tab}>
        My Next Chapter
      </NavLink>
    </nav>
  );
}

export function IllustrativeBadge() {
  return (
    <span className="badge bg-gray-200 text-gray-700" title="Fictional organisation and listing for this prototype">
      Illustrative listing · not verified
    </span>
  );
}

export function FitBadge({ fit }: { fit: FitCheck }) {
  if (fit.verdict === "none") return null;
  const style = {
    fits: "bg-emerald-100 text-emerald-800",
    check: "bg-amber-100 text-amber-800",
    unclear: "bg-sky-100 text-sky-800",
  }[fit.verdict];
  const label = { fits: "Fits your preferences", check: "Worth checking", unclear: "Some duties not stated" }[fit.verdict];
  return <span className={`badge ${style}`}>{label}</span>;
}

export function FitPanel({ fit, hasPrefs }: { fit: FitCheck; hasPrefs: boolean }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <h3 className="text-lg font-bold">How this compares with your preferences</h3>
      {!hasPrefs && (
        <p className="mt-1 text-sm text-ink/70">
          Tell us <Link to="/profile#work-comfort" className="font-bold text-brand-700 underline">what kind of work feels right for you</Link>{" "}
          and we'll compare each opportunity with it.
        </p>
      )}
      <ul className="mt-3 space-y-2">
        {fit.fits.map((t) => (
          <li key={t} className="flex gap-2 text-emerald-900">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /> {t}
          </li>
        ))}
        {fit.check.map((t) => (
          <li key={t} className="flex gap-2 text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /> {t}
          </li>
        ))}
        {fit.unclear.map((t) => (
          <li key={t} className="flex gap-2 text-sky-900">
            <CircleHelp aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /> {t}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink/60">
        This only compares what the listing says with what you told us. It can't tell whether a role is physically right for
        you. Ask about the actual day-to-day duties.
      </p>
    </div>
  );
}

export function KnowBeforeYouAccept({ opp, compact = false }: { opp: Parameters<typeof transparency>[0]; compact?: boolean }) {
  const items = transparency(opp);
  const stated = items.filter((i) => i.ok).length;
  if (compact) {
    return (
      <p className={`text-sm font-bold ${stated === items.length ? "text-emerald-800" : "text-amber-800"}`}>
        {stated === items.length ? <CheckCircle2 aria-hidden="true" className="mr-1 inline h-4 w-4" /> : <AlertCircle aria-hidden="true" className="mr-1 inline h-4 w-4" />}
        {stated} of {items.length} key details stated
      </p>
    );
  }
  return (
    <section aria-labelledby="kbya" className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-5">
      <h3 id="kbya" className="flex items-center gap-2 text-lg font-bold">
        <ShieldAlert aria-hidden="true" className="h-5 w-5 text-brand-700" /> Know before you accept
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.label} className={`flex gap-2 ${i.ok ? "text-ink" : "text-amber-900"}`}>
            {i.ok ? (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            ) : (
              <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            )}
            <span>
              {i.label}
              {!i.ok && <span className="block text-sm">Not stated. Ask the organisation before you agree to anything.</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink/60">
        This checklist only reflects what the listing says. In this prototype TogetherWeGrow doesn't verify organisations or
        handle payments.
      </p>
    </section>
  );
}

export function OpportunityCard({ opp, comfort, applied }: { opp: Opportunity; comfort?: WorkComfort; applied?: string }) {
  const fit = fitCheck(comfort, opp);
  return (
    <article className="card flex h-full flex-col">
      <div className="flex flex-wrap gap-2">
        <span className="badge bg-warm-100 text-warm-700">{OPP_TYPE_LABEL[opp.type]}</span>
        <FitBadge fit={fit} />
        {opp.isDemo && <IllustrativeBadge />}
      </div>
      <h3 className="mt-3 text-xl font-bold">
        <Link to={`/opportunities/${opp.id}`} className="hover:underline">
          {opp.title}
        </Link>
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-ink/75">
        <Building2 aria-hidden="true" className="h-4 w-4" /> {opp.orgName}
      </p>
      <p className="mt-3 flex-1 text-ink/80">{opp.summary}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-brand-50 p-3 text-sm">
        <div>
          <dt className="text-ink/60">Pay</dt>
          <dd className="text-lg font-bold text-brand-900">{payLabel(opp.pay)}</dd>
        </div>
        <div>
          <dt className="text-ink/60">Time</dt>
          <dd className="flex items-center gap-1 font-bold">
            <Clock aria-hidden="true" className="h-4 w-4" /> {opp.hoursPerWeek || "Not stated"}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="sr-only">Where</dt>
          <dd className="flex items-center gap-1 capitalize">
            <MapPin aria-hidden="true" className="h-4 w-4" /> {opp.setting} · {opp.location}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between gap-3">
        <KnowBeforeYouAccept opp={opp} compact />
        {applied ? (
          <span className="badge bg-brand-100 text-brand-800">{applied}</span>
        ) : (
          <Link to={`/opportunities/${opp.id}`} className="btn-secondary shrink-0 px-5">
            View details
          </Link>
        )}
      </div>
    </article>
  );
}

/** Apply (or answer an invitation). Optional request for a buddy's help, without sharing account access. */
export function ApplyDialog({
  open,
  title,
  intro,
  submitLabel,
  onClose,
  onSubmit,
  picker,
  hideHelper = false,
  sentText,
}: {
  open: boolean;
  title: string;
  intro: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (message: string, wantsHelper: boolean) => Promise<void>;
  /** Optional extra field shown above the message (e.g. choosing a role). */
  picker?: ReactNode;
  hideHelper?: boolean;
  sentText?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [helper, setHelper] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setMessage("");
      setHelper(false);
      setSent(false);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(message.trim(), helper);
    setSent(true);
  }

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="apply-title" className="w-[calc(100%-2rem)] max-w-lg rounded-3xl p-0 backdrop:bg-brand-900/50">
      <div className="p-6 sm:p-8">
        <h2 id="apply-title" className="text-2xl font-bold">
          {sent ? "Sent" : title}
        </h2>
        {sent ? (
          <>
            <p className="mt-3">
              {sentText ?? (
                <>
                  The organisation will see your message and profile. You can follow progress under <strong>Requests → Work</strong>.
                  {helper && " A digital buddy can help you with the next steps."}
                </>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {helper && (
                <Link to="/learn/buddies" className="btn-secondary">
                  <HeartHandshake aria-hidden="true" className="h-5 w-5" /> Find a buddy
                </Link>
              )}
              <button className="btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-4">
            <p className="text-ink/80">{intro}</p>
            {picker}
            <div>
              <label htmlFor="apply-msg" className="label">
                A short message <span className="font-normal text-ink/60">(optional)</span>
              </label>
              <textarea
                id="apply-msg"
                rows={4}
                className="input"
                placeholder="e.g. I've been a carpenter for 35 years and I've trained apprentices. I'd love to talk about this role."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {!hideHelper && <label className="flex cursor-pointer gap-3 rounded-2xl bg-warm-50 p-4">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-brand-700" checked={helper} onChange={(e) => setHelper(e.target.checked)} />
              <span>
                <strong>I'd like a person to help me with this</strong>
                <span className="block text-sm text-ink/70">
                  A digital buddy can sit with you and explain each step. You stay in control: never share your password.
                </span>
              </span>
            </label>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
