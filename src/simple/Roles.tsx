import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Armchair, Briefcase, Building2, Check, ClipboardCheck, Clock, Coins, Feather, GraduationCap, Home, Mail, MessagesSquare, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "../lib/auth";
import { createApplication, getOpportunities, quickJoin } from "../lib/store";
import type { Opportunity } from "../lib/types";
import { useStore } from "../lib/useStore";
import { Feedback } from "./Extra";
import { Actions, BigChoice, Screen, useRun } from "./parts";
import { useWizard } from "./useWizard";

/* ------------------------------------------------------------------ */
/* Paid work that's easier on the body                                 */
/* ------------------------------------------------------------------ */

const EFFORT: Record<Opportunity["physical"]["heavyLifting"], { label: string; dots: number; note: string }> = {
  none: { label: "Light", dots: 1, note: "No heavy lifting." },
  occasional: { label: "Some", dots: 2, note: "Some occasional lifting." },
  regular: { label: "Heavy", dots: 3, note: "Regular heavy lifting." },
  unspecified: { label: "Not stated", dots: 0, note: "They haven't said how physical it is. It's worth asking." },
};
const GENTLE = ["none", "occasional", "unspecified", "regular"];
const POSTURE: Record<string, string> = { sitting: "Mostly sitting", standing: "Mostly standing", mix: "Sitting and standing", unspecified: "", "": "" };
const WHERE = { "on-site": "On site", remote: "From home", hybrid: "Partly from home" };

/** Things someone might wish for. Each is one tap, and none is required. */
const WISHES: { id: string; label: string; icon: LucideIcon; fits: (o: Opportunity) => boolean }[] = [
  { id: "lift", label: "No heavy lifting", icon: Feather, fits: (o) => o.physical.heavyLifting === "none" },
  { id: "sit", label: "Mostly sitting", icon: Armchair, fits: (o) => o.physical.posture === "sitting" || o.physical.posture === "mix" },
  { id: "home", label: "From home", icon: Home, fits: (o) => o.setting === "remote" || o.setting === "hybrid" },
];

/** Kinds of paid work that use experience rather than strength. Ideas, shown when nothing is posted yet. */
const KINDS_OF_WORK: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: GraduationCap, title: "Teaching and training", body: "Showing apprentices or students how it's really done." },
  { icon: MessagesSquare, title: "Advising", body: "Being the person a younger team calls when they're stuck." },
  { icon: ClipboardCheck, title: "Checking and inspecting", body: "A trained eye that knows when work is done properly." },
  { icon: Users, title: "Mentoring", body: "Regular time with one person who's starting out." },
];

function EffortDots({ level }: { level: Opportunity["physical"]["heavyLifting"] }) {
  const e = EFFORT[level];
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="inline-flex gap-1">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-3 w-3 rounded-full ${n <= e.dots ? (e.dots === 3 ? "bg-warm-600" : "bg-brand-600") : "bg-warm-200"}`} />
        ))}
      </span>
      {e.label}
    </span>
  );
}

function Badge({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-base font-medium text-brand-900 ring-1 ring-brand-100">
      <Icon aria-hidden="true" className="h-4 w-4 text-brand-700" /> {children}
    </span>
  );
}

export function OlderRoles() {
  const { user } = useAuth();
  const opportunities = useStore(getOpportunities, []);
  const w = useWizard("twg.simple.roles", { roleId: "", name: user?.name.split(" ")[0] ?? "", contact: "", note: "", wishes: [] as string[] });
  const { step, go, data, set } = w;
  const { run, busy, error } = useRun();
  // A few at a time, so the list never feels endless.
  const [showing, setShowing] = useState(5);

  const open = useMemo(
    () =>
      opportunities
        .filter((o) => o.status === "open" && o.employerId !== user?.id)
        .sort((a, b) => GENTLE.indexOf(a.physical.heavyLifting) - GENTLE.indexOf(b.physical.heavyLifting)),
    [opportunities, user?.id],
  );
  const wishes = WISHES.filter((x) => data.wishes.includes(x.id));
  const matching = open.filter((o) => wishes.every((x) => x.fits(o)));
  // If nothing fits every wish, show everything rather than an empty page.
  const noneFit = wishes.length > 0 && matching.length === 0;
  const roles = noneFit ? open : matching;
  const role = open.find((r) => r.id === data.roleId);

  if (step === 0 || !role)
    return (
      <Screen title="Work that's easier on the body" help="Paid roles that need what you know, not what you can lift. Your experience is the qualification.">
        {open.length === 0 ? (
          <>
            <div className="rounded-3xl bg-brand-900 p-6 text-brand-100 sm:p-8">
              <p className="font-serif text-2xl leading-snug text-white">No roles have been posted yet. We're inviting local workshops, schools and businesses now.</p>
              <p className="mt-3 text-lg">In the meantime, here are the kinds of paid work that use a lifetime of knowing how.</p>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {KINDS_OF_WORK.map((k) => (
                <li key={k.title} className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
                  <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-100 text-warm-700">
                    <k.icon className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-xl font-semibold text-brand-900">{k.title}</p>
                  <p className="mt-1 text-lg text-muted">{k.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4">
              <BigChoice to="/older/earn" icon={Coins} label="Offer a paid session yourself" sub="You set the price and keep 90%" />
              <BigChoice to="/older" icon={Users} tone="warm" label="Back to my choices" />
            </div>
            <p className="mt-8 text-lg text-muted">
              Know an organization that needs experienced people?{" "}
              <Link to="/signup?role=employer" className="link">
                They can post a role here
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <div role="group" aria-label="What would feel right? Tap any that matter to you." className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
              <p className="text-xl font-semibold text-brand-900">
                What would feel right? <span className="font-normal text-muted">(tap any, or none)</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {WISHES.map((x) => {
                  const on = data.wishes.includes(x.id);
                  return (
                    <button
                      key={x.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("wishes", on ? data.wishes.filter((id) => id !== x.id) : [...data.wishes, x.id])}
                      className={`inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 px-4 text-lg font-medium transition ${
                        on ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"
                      }`}
                    >
                      {on ? <Check aria-hidden="true" className="h-5 w-5" /> : <x.icon aria-hidden="true" className="h-5 w-5" />} {x.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p aria-live="polite" className="mt-6 text-lg text-muted">
              {noneFit
                ? "Nothing matches all of those yet, so here is everything, gentlest first."
                : `${roles.length} ${roles.length === 1 ? "role" : "roles"}${wishes.length ? " that fit" : ""}, gentlest first`}
            </p>

            <ul className="mt-3 space-y-4">
              {roles.slice(0, showing).map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      set("roleId", r.id);
                      go(1);
                    }}
                    className="lift w-full rounded-3xl border-2 border-warm-200 bg-white p-5 text-left hover:border-brand-600 sm:p-6"
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="min-w-0">
                        <span className="block text-2xl font-semibold leading-snug text-brand-900">{r.title}</span>
                        <span className="mt-1 block text-lg text-muted">{r.orgName}</span>
                      </span>
                      <span className="shrink-0 rounded-2xl bg-warm-100 px-3 py-2 text-center">
                        <span className="block font-serif text-2xl leading-none text-brand-900">${r.pay.amount}</span>
                        <span className="block text-sm text-muted">per {r.pay.unit}</span>
                      </span>
                    </span>
                    <span className="mt-4 flex flex-wrap gap-2">
                      <Badge icon={Feather}>
                        <span className="sr-only">Physical effort: </span>
                        <EffortDots level={r.physical.heavyLifting} />
                      </Badge>
                      {POSTURE[r.physical.posture] && <Badge icon={Armchair}>{POSTURE[r.physical.posture]}</Badge>}
                      <Badge icon={r.setting === "on-site" ? Building2 : Home}>{WHERE[r.setting]}</Badge>
                      {r.hoursPerWeek && <Badge icon={Clock}>{r.hoursPerWeek}</Badge>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {roles.length > showing && (
              <button type="button" onClick={() => setShowing(showing + 5)} className="btn-secondary mt-4 min-h-[60px] w-full text-lg">
                Show more roles ({roles.length - showing} more)
              </button>
            )}
            <p className="mt-6 text-lg text-muted">Roles are posted by the organizations themselves. We don't check them, so never pay to apply.</p>
          </>
        )}
      </Screen>
    );

  if (step === 1) {
    const duties = role.responsibilities.filter(Boolean);
    const effort = EFFORT[role.physical.heavyLifting];
    return (
      <Screen step={role.orgName} title={role.title} help={role.summary || undefined}>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-brand-900 p-5 text-brand-100">
            <p className="text-base">Pay</p>
            <p className="mt-1 font-serif text-4xl leading-none text-white">${role.pay.amount}</p>
            <p className="mt-1 text-lg text-white">per {role.pay.unit}</p>
            {role.paymentTerms && <p className="mt-1 text-base">{role.paymentTerms}</p>}
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
            <p className="text-base text-muted">Time</p>
            <p className="mt-1 text-2xl font-semibold text-brand-900">{role.hoursPerWeek || "Not stated"}</p>
            {role.schedule && <p className="mt-1 text-base text-muted">{role.schedule}</p>}
          </div>
        </div>

        <section className="mt-4 rounded-3xl bg-white p-6 ring-1 ring-warm-200" aria-labelledby="role-body">
          <h2 id="role-body" className="font-sans text-xl font-semibold">
            How it treats your body
          </h2>
          <p className="mt-3 text-2xl font-semibold text-brand-900">
            <EffortDots level={role.physical.heavyLifting} />
          </p>
          <p className="mt-2 text-lg">
            {effort.note} {POSTURE[role.physical.posture] ? `${POSTURE[role.physical.posture]}.` : ""}
          </p>
          {role.physical.notes && <p className="mt-2 text-lg text-muted">{role.physical.notes}</p>}
          <p className="mt-2 text-lg text-muted">
            {WHERE[role.setting]}
            {role.location ? `, ${role.location}` : ""}.
          </p>
        </section>

        {duties.length > 0 && (
          <section className="mt-4 rounded-3xl bg-white p-6 ring-1 ring-warm-200" aria-labelledby="role-do">
            <h2 id="role-do" className="font-sans text-xl font-semibold">
              What you'd do
            </h2>
            <ul className="mt-3 space-y-2 text-xl">
              {duties.map((d) => (
                <li key={d} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-600" /> {d}
                </li>
              ))}
            </ul>
            {role.qualificationsRequired && <p className="mt-4 text-lg text-muted">They ask for: {role.qualificationsRequired}</p>}
          </section>
        )}

        <details className="mt-4 rounded-3xl bg-warm-100 p-6">
          <summary className="cursor-pointer text-xl font-semibold text-brand-900">Good questions to ask them first</summary>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg">
            <li>What does an ordinary day look like?</li>
            <li>Is there anything I'd need to lift, carry or climb?</li>
            <li>Can I sit when I need to, and take breaks?</li>
            <li>How and when would I be paid?</li>
          </ul>
        </details>

        <p className="mt-6 text-lg text-muted">Only you can judge whether a role suits you. Showing interest commits you to nothing.</p>
        <Actions primary="I'm interested" onPrimary={() => go(2)} secondary="Look at other roles" onSecondary={() => go(0)} />
      </Screen>
    );
  }

  if (step === 2)
    return (
      <Screen title={`Let ${role.orgName} know`} help="Just how to reach you. They already know which role you mean.">
        {!user && (
          <>
            <label htmlFor="rname" className="label text-xl">
              Your first name
            </label>
            <input id="rname" className="input mb-6 min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        <label htmlFor="rcontact" className="label text-xl">
          Your phone number or email
        </label>
        <input id="rcontact" className="input min-h-[60px] text-xl" value={data.contact} onChange={(e) => set("contact", e.target.value)} />
        <p className="mt-2 text-lg text-muted">Only {role.orgName} will see this.</p>
        <details className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
          <summary className="cursor-pointer text-xl font-semibold text-brand-900">Say a little about your experience (only if you'd like)</summary>
          <label htmlFor="rnote" className="sr-only">
            About your experience
          </label>
          <textarea id="rnote" rows={3} className="input mt-4 text-xl" value={data.note} onChange={(e) => set("note", e.target.value)} placeholder="For example: 35 years as a carpenter, and I trained apprentices." />
        </details>
        <Actions
          primary="Send my interest"
          disabled={(!user && !data.name.trim()) || !data.contact.trim()}
          busy={busy}
          error={error}
          onPrimary={() =>
            run(async () => {
              if (!user) await quickJoin(data.name.trim());
              await createApplication({
                opportunityId: role.id,
                workerId: "",
                employerId: role.employerId,
                initiatedBy: "worker",
                message: [data.note.trim(), `You can reach me at: ${data.contact.trim()}`].filter(Boolean).join("\n\n"),
              });
              set("note", "");
              go(3);
            })
          }
        />
      </Screen>
    );

  return (
    <Screen title="They know you're interested." help="That took courage. Whatever happens next, what you know is worth being paid for.">
      <ol className="space-y-3">
        {[
          { done: true, title: "You showed interest", body: `In “${role.title}”.` },
          { done: false, title: `${role.orgName} reads it`, body: "This can take a few days." },
          { done: false, title: "They get in touch", body: "On the phone or email you gave, or in your messages here." },
        ].map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
            <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${s.done ? "bg-brand-700 text-white" : "bg-warm-100 text-warm-800"}`}>
              {s.done ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
            </span>
            <span>
              <span className="block text-xl font-semibold text-brand-900">{s.title}</span>
              <span className="block text-lg text-muted">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-2xl bg-warm-100 p-5 text-lg">
        A reminder: we don't check organizations. Meet somewhere public the first time, and never pay anything to get a job.
      </p>
      <div className="mt-8 space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="See my messages" />
        <BigChoice onClick={() => go(0)} icon={Briefcase} tone="warm" label="Look at other roles" />
        <BigChoice to="/older" icon={Users} tone="sage" label="Back to my choices" />
      </div>
      <Feedback flow="roles" />
    </Screen>
  );
}
