import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Compass, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { PlanActionKind, PlanStep } from "../../shared/types";
import { WorkTabs } from "../components/opportunity";
import { PageHeader, SourceLabel } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { getListings, getOpportunities, getPlan, savePlan, type SavedPlan } from "../lib/store";

const ACTION_ROUTE: Record<PlanActionKind, string> = {
  profile: "/profile",
  resume: "/resume",
  careers: "/careers",
  opportunities: "/opportunities",
  offer: "/marketplace?create=1",
  buddy: "/learn/buddies",
  practise: "/learn/ai",
  mentors: "/mentors",
};

function suggestedRoles(): string[] {
  try {
    const cached = JSON.parse(sessionStorage.getItem("twg.careers") ?? "null");
    return (cached?.result?.data ?? []).map((r: { title: string }) => r.title).slice(0, 4);
  } catch {
    return [];
  }
}

function StepItem({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: PlanStep;
  index: number;
  onChange: (s: PlanStep) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="relative pl-16">
      <button
        type="button"
        onClick={() => onChange({ ...step, done: !step.done })}
        aria-pressed={Boolean(step.done)}
        aria-label={step.done ? `Mark step ${index + 1} as not done` : `Mark step ${index + 1} as done`}
        className={`absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 font-serif text-xl font-bold transition ${
          step.done ? "border-brand-700 bg-brand-700 text-white" : "border-brand-200 bg-white text-brand-800 hover:border-brand-700"
        }`}
      >
        {step.done ? <Check className="h-6 w-6" /> : index + 1}
      </button>
      <div className={`card ${step.done ? "bg-brand-50/60" : ""}`}>
        {editing ? (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-brand-900">
              Step title
              <input className="input mt-1" value={step.title} onChange={(e) => onChange({ ...step, title: e.target.value })} />
            </label>
            <label className="block text-sm font-bold text-brand-900">
              Details
              <textarea rows={3} className="input mt-1" value={step.detail} onChange={(e) => onChange({ ...step, detail: e.target.value })} />
            </label>
            <div className="flex gap-2">
              <button type="button" className="btn-primary" onClick={() => setEditing(false)}>
                Done
              </button>
              <button type="button" className="btn-ghost text-rose-800" onClick={onRemove}>
                <Trash2 aria-hidden="true" className="h-4 w-4" /> Remove step
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h3 className={`text-xl font-bold ${step.done ? "text-brand-700 line-through decoration-2" : ""}`}>{step.title}</h3>
              <button type="button" className="btn-ghost min-h-[40px] shrink-0 px-3 py-1 text-sm" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" className="h-4 w-4" /> Edit
              </button>
            </div>
            <p className="mt-1 text-lg text-ink/80">{step.detail}</p>
            {step.actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {step.actions.map((a) => (
                  <Link key={a.label} to={ACTION_ROUTE[a.kind]} className="btn-secondary min-h-[44px] py-2 text-sm">
                    {a.label.charAt(0).toUpperCase() + a.label.slice(1)} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export default function NextChapter() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [plan, setPlan] = useState<SavedPlan | null | undefined>(undefined);
  const [target, setTarget] = useState(params.get("role") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    if (user) getPlan(user.id).then((p) => setPlan(params.get("role") ? (p && p.to === params.get("role") ? p : null) : p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user || plan === undefined) return <p className="container-page py-16">Loading…</p>;

  async function create() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const [opps, listings] = await Promise.all([getOpportunities(), getListings()]);
      let hasResume = false;
      try {
        hasResume = Boolean(JSON.parse(localStorage.getItem(`twg.resume.${user.id}`) ?? "null")?.data?.jobs?.length);
      } catch {
        // ignore
      }
      const wc = user.workComfort;
      const res = await api.nextChapter({
        name: user.name,
        skills: user.skills,
        yearsExperience: user.yearsExperience,
        industries: user.industries,
        workPreferences: user.workPreferences,
        comfort: wc
          ? { posture: wc.posture, avoidHeavyLifting: wc.avoidHeavyLifting, hoursPerWeek: wc.hoursPerWeek, setting: wc.setting, moreOf: wc.moreOf, lessOf: wc.lessOf }
          : undefined,
        targetRole: target.trim() || undefined,
        opportunities: opps.filter((o) => o.status === "open").map((o) => ({ title: o.title, org: o.orgName, type: o.type })),
        hasResume,
        hasOffer: listings.some((l) => l.mentorId === user.id),
      });
      const saved: SavedPlan = { ...res.data, source: res.source, updatedAt: new Date().toISOString() };
      await savePlan(user.id, saved);
      setPlan(saved);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function update(next: SavedPlan) {
    setPlan(next);
    savePlan(user!.id, next);
  }

  const roles = suggestedRoles();
  const done = plan?.steps.filter((s) => s.done).length ?? 0;

  return (
    <>
      <PageHeader eyebrow="My Next Chapter" title="Your experience can take you somewhere new">
        A step-by-step plan for moving from the work you've done into work that suits you now. You decide every step.
      </PageHeader>
      <WorkTabs />

      <div className="container-page py-10 [&>*]:max-w-4xl">
        {!plan ? (
          <div className="card p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <Compass aria-hidden="true" className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">Where would you like to go next?</h2>
            <p className="mt-1 text-ink/75">
              Pick a direction, or leave it blank and we'll suggest one from your profile
              {user.skills.length === 0 && (
                <>
                  {" "}
                  (it works best once you've{" "}
                  <Link to="/profile/create" className="font-bold text-brand-700 underline">
                    told us about your work
                  </Link>
                  )
                </>
              )}
              .
            </p>
            <label htmlFor="target" className="label mt-5">
              The kind of role I'm aiming for <span className="font-normal text-ink/60">(optional)</span>
            </label>
            <input id="target" className="input text-lg" placeholder="e.g. Paid workshop mentor" value={target} onChange={(e) => setTarget(e.target.value)} />
            {roles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-ink/70">From your career ideas:</span>
                {roles.map((r) => (
                  <button key={r} type="button" className="chip border border-brand-200 bg-white hover:border-brand-600 hover:bg-brand-50" onClick={() => setTarget(r)}>
                    {r}
                  </button>
                ))}
              </div>
            )}
            {error && (
              <p role="alert" className="notice mt-4">
                {error}
              </p>
            )}
            <button className="btn-primary mt-6 text-lg" onClick={create} disabled={busy}>
              {busy ? "Writing your plan…" : "Create my plan"}
            </button>
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-brand-900 p-7 text-white sm:p-9">
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-700" />
              <p className="relative text-sm font-bold uppercase tracking-widest text-warm-400">
                {user.name.split(" ")[0]}'s transition goal
              </p>
              <p className="relative mt-3 font-serif text-2xl leading-snug sm:text-3xl">
                From <span className="text-warm-400">{plan.from}</span> to <span className="text-warm-400">{plan.to}</span>
              </p>
              <p className="relative mt-3 text-brand-100">{plan.intro}</p>
              <div className="relative mt-5">
                <div className="h-2.5 overflow-hidden rounded-full bg-brand-700" aria-hidden="true">
                  <div className="h-full rounded-full bg-warm-400 transition-all" style={{ width: `${(done / Math.max(plan.steps.length, 1)) * 100}%` }} />
                </div>
                <p className="mt-2 text-sm text-brand-100">
                  {done} of {plan.steps.length} steps done. Go at your own pace.
                </p>
              </div>
            </section>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <SourceLabel source={plan.source} />
              <p className="text-sm text-ink/60">Saved automatically. Edit any step to make it yours.</p>
            </div>

            <ol className="mt-6 space-y-5">
              {plan.steps.map((s, i) => (
                <StepItem
                  key={i}
                  step={s}
                  index={i}
                  onChange={(next) => update({ ...plan, steps: plan.steps.map((x, j) => (j === i ? next : x)) })}
                  onRemove={() => update({ ...plan, steps: plan.steps.filter((_, j) => j !== i) })}
                />
              ))}
            </ol>
            <button
              type="button"
              className="btn-ghost ml-16 mt-4"
              onClick={() => update({ ...plan, steps: [...plan.steps, { title: "My own step", detail: "Describe what you'd like to do.", actions: [] }] })}
            >
              <Plus aria-hidden="true" className="h-5 w-5" /> Add my own step
            </button>

            <div role="note" className="notice mt-8">
              <strong>This is a possible pathway, not a promise.</strong> No plan can guarantee a job, and only you can judge
              whether a role suits you physically. Always check each opportunity's actual duties and requirements.
            </div>

            <div className="mt-6">
              {confirmNew ? (
                <div className="rounded-2xl border-2 border-warm-400 p-4">
                  <p className="font-bold">Start a new plan? Your current steps and ticks will be replaced.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        await savePlan(user.id, null);
                        setPlan(null);
                        setConfirmNew(false);
                      }}
                    >
                      Yes, choose a new direction
                    </button>
                    <button className="btn-ghost" onClick={() => setConfirmNew(false)}>
                      Keep this plan
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-ghost px-0 underline" onClick={() => setConfirmNew(true)}>
                  <RotateCcw aria-hidden="true" className="h-4 w-4" /> Make a new plan
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
