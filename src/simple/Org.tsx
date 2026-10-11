import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Armchair, Building2, Check, ClipboardCheck, Clock, Feather, GraduationCap, Home, MessagesSquare, PencilLine, PlusCircle, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "../lib/auth";
import { getApplications, getOpportunities, getUsers, saveOpportunity, saveUser, signUp, updateApplication } from "../lib/store";
import type { Application, Opportunity, Organization, User } from "../lib/types";
import { useStore } from "../lib/useStore";
import { PasswordField } from "./Account";
import { Actions, BigChoice, ErrorLine, Screen, useRun } from "./parts";
import { useWizard } from "./useWizard";

/* ------------------------------------------------------------------ */
/* For organizations: offer paid work to experienced people            */
/* ------------------------------------------------------------------ */

const KINDS: { value: Organization["kind"]; label: string }[] = [
  { value: "workshop", label: "Workshop or trade" },
  { value: "school", label: "School or college" },
  { value: "community", label: "Community group" },
  { value: "business", label: "Business" },
];

const TYPES: { value: Opportunity["type"]; label: string; icon: LucideIcon }[] = [
  { value: "training", label: "Teaching and training", icon: GraduationCap },
  { value: "mentoring", label: "Mentoring", icon: Users },
  { value: "advisory", label: "Advising", icon: MessagesSquare },
  { value: "consulting", label: "Checking and consulting", icon: ClipboardCheck },
];

const LIFTING: { value: Opportunity["physical"]["heavyLifting"]; label: string }[] = [
  { value: "none", label: "No heavy lifting" },
  { value: "occasional", label: "Some, occasionally" },
  { value: "regular", label: "Regular heavy lifting" },
];
const POSTURE: { value: "sitting" | "mix" | "standing"; label: string }[] = [
  { value: "sitting", label: "Mostly sitting" },
  { value: "mix", label: "Sitting and standing" },
  { value: "standing", label: "Mostly standing" },
];
const SETTING: { value: Opportunity["setting"]; label: string }[] = [
  { value: "on-site", label: "On site" },
  { value: "hybrid", label: "Partly from home" },
  { value: "remote", label: "From home" },
];
const UNITS: { value: Opportunity["pay"]["unit"]; label: string }[] = [
  { value: "hour", label: "an hour" },
  { value: "session", label: "a session" },
  { value: "month", label: "a month" },
];

const chip = (on: boolean) =>
  `min-h-[52px] rounded-full border-2 px-5 text-lg font-medium transition ${on ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"}`;
const firstOf = (name?: string) => (name ?? "").trim().split(" ")[0] || "Someone";
const isOrg = (u: User | null): u is User & { org: Organization } => Boolean(u?.org && u.roles.includes("employer"));

/** Organizations home: join, or see your roles. */
export function Organizations() {
  const { user, loading } = useAuth();
  if (loading) return <Screen title="For organizations">{null}</Screen>;
  return isOrg(user) ? <OrgHome user={user} /> : <OrgJoin user={user} />;
}

function OrgJoin({ user }: { user: User | null }) {
  const [org, setOrg] = useState("");
  const [kind, setKind] = useState<Organization["kind"]>("workshop");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { run, busy, error } = useRun();
  const needsLogin = !user?.hasLogin;

  function submit(e: FormEvent) {
    e.preventDefault();
    return run(async () => {
      const details: Organization = { name: org.trim(), kind, about: "", verified: false };
      if (user && !needsLogin) {
        await saveUser({ ...user, roles: user.roles.includes("employer") ? user.roles : [...user.roles, "employer"], org: details });
      } else {
        // Organizations sign in with an email, so more than one device can manage the roles.
        await signUp({ name: user?.name ?? name.trim(), email: email.trim(), password, roles: [...(user?.roles ?? []), "employer"], location: user?.location ?? "", org: details });
      }
    });
  }

  return (
    <Screen title="Offer paid work to experienced people" help="For workshops, schools, community groups and businesses. Posting a role is free and takes about two minutes.">
      <ul className="grid gap-3 sm:grid-cols-3">
        {[
          [GraduationCap, "Decades of know-how", "Trainers, mentors and advisers who have done the work."],
          [Check, "Honest listings", "You state the pay and the physical side up front."],
          [Users, "They come to you", "Interested people leave a way to reach them."],
        ].map(([Icon, title, body]) => {
          const I = Icon as LucideIcon;
          return (
            <li key={title as string} className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
              <I aria-hidden="true" className="h-7 w-7 text-warm-700" />
              <p className="mt-2 text-lg font-semibold text-brand-900">{title as string}</p>
              <p className="mt-1 text-base text-muted">{body as string}</p>
            </li>
          );
        })}
      </ul>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="org-name" className="label text-xl">
            Your organization's name
          </label>
          <input id="org-name" required className="input min-h-[60px] text-xl" autoComplete="organization" value={org} onChange={(e) => setOrg(e.target.value)} />
        </div>
        <div role="group" aria-labelledby="org-kind">
          <p id="org-kind" className="label text-xl">
            What kind of organization?
          </p>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {KINDS.map((k) => (
              <button key={k.value} type="button" aria-pressed={kind === k.value} onClick={() => setKind(k.value)} className={chip(kind === k.value)}>
                {k.label}
              </button>
            ))}
          </div>
        </div>
        {needsLogin && (
          <>
            {!user && (
              <div>
                <label htmlFor="org-you" className="label text-xl">
                  Your name
                </label>
                <input id="org-you" required className="input min-h-[60px] text-xl" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label htmlFor="org-email" className="label text-xl">
                Email address
              </label>
              <input id="org-email" type="email" required className="input min-h-[60px] text-xl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <PasswordField id="org-password" label="Choose a password" hint="at least 8 characters" value={password} onChange={setPassword} autoComplete="new-password" />
          </>
        )}
        <ErrorLine error={error} />
        <button
          type="submit"
          className="btn-primary min-h-[64px] w-full text-xl"
          disabled={busy || org.trim().length < 2 || (needsLogin && (!email.includes("@") || password.length < 8 || (!user && !name.trim())))}
        >
          {busy ? "One moment…" : "Continue"}
        </button>
      </form>
      <p className="mt-6 text-lg text-muted">
        Organizations are shown as “not verified” for now. Please describe roles truthfully, and never ask anyone to pay to apply.{" "}
        <Link to="/terms" className="link">
          How we look after each other
        </Link>
      </p>
      {!user && (
        <p className="mt-4 text-lg">
          Already posted a role?{" "}
          <Link to="/login" state={{ from: "/organizations" }} className="link">
            Sign in
          </Link>
        </p>
      )}
    </Screen>
  );
}

function OrgHome({ user }: { user: User & { org: Organization } }) {
  const opportunities = useStore(getOpportunities, []);
  const applications = useStore(getApplications, []);
  const mine = opportunities.filter((o) => o.employerId === user.id);
  const waiting = (o: Opportunity) => applications.filter((a) => a.opportunityId === o.id && a.employerId === user.id);

  return (
    <Screen eyebrow={user.org.name} title="Your roles" help={mine.length ? "Tap a role to see who is interested." : "You haven't posted a role yet. It takes about two minutes."}>
      <div className="space-y-4">
        {mine.map((o) => {
          const people = waiting(o);
          const unanswered = people.filter((a) => !a.reply).length;
          return (
            <Link key={o.id} to={`/organizations/role/${o.id}`} className="lift block rounded-3xl border-2 border-warm-200 bg-white p-5 hover:border-brand-600 sm:p-6">
              <span className="flex items-start justify-between gap-4">
                <span className="min-w-0">
                  <span className="block text-2xl font-semibold leading-snug text-brand-900">{o.title}</span>
                  <span className="mt-1 block text-lg text-muted">
                    ${o.pay.amount} per {o.pay.unit} · {o.status === "open" ? "Open" : "Closed"}
                  </span>
                </span>
                {unanswered > 0 && <span className="shrink-0 rounded-full bg-warm-400 px-3 py-1 text-base font-semibold text-brand-900">{unanswered} new</span>}
              </span>
              <span className="mt-3 block text-lg text-brand-900">
                {people.length === 0 ? "Nobody yet. People are finding it." : `${people.length} ${people.length === 1 ? "person is" : "people are"} interested`}
              </span>
            </Link>
          );
        })}
        <BigChoice to="/organizations/post" icon={PlusCircle} tone="warm" label={mine.length ? "Post another role" : "Post a role"} sub="Teaching, mentoring, advising or checking work" />
      </div>
      <p className="mt-8 text-lg">
        <Link to="/account" className="link">
          Your account
        </Link>
      </p>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Post or change a role                                               */
/* ------------------------------------------------------------------ */

const BLANK = {
  title: "",
  type: "training" as Opportunity["type"],
  duties: "",
  amount: 25,
  unit: "hour" as Opportunity["pay"]["unit"],
  hours: "",
  lifting: "" as "" | Opportunity["physical"]["heavyLifting"],
  posture: "" as "" | "sitting" | "mix" | "standing",
  setting: "on-site" as Opportunity["setting"],
  location: "",
  loadedFor: "",
};

export function PostRole() {
  const { user, loading } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const opportunities = useStore(getOpportunities, []);
  const existing = id ? opportunities.find((o) => o.id === id && o.employerId === user?.id) : undefined;
  const w = useWizard(`twg.simple.orgrole.${id ?? "new"}`, BLANK);
  const { step, go, data, set, reset } = w;
  const { run, busy, error } = useRun();

  // Changing a role: start from what's already posted.
  useEffect(() => {
    if (!existing || data.loadedFor === existing.id) return;
    set("title", existing.title);
    set("type", existing.type);
    set("duties", existing.responsibilities.join("\n"));
    set("amount", existing.pay.amount);
    set("unit", existing.pay.unit);
    set("hours", existing.hoursPerWeek);
    set("lifting", existing.physical.heavyLifting === "unspecified" ? "" : existing.physical.heavyLifting);
    set("posture", existing.physical.posture === "sitting" || existing.physical.posture === "mix" || existing.physical.posture === "standing" ? existing.physical.posture : "");
    set("setting", existing.setting);
    set("location", existing.location);
    set("loadedFor", existing.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  if (loading) return <Screen title="Post a role">{null}</Screen>;
  if (!isOrg(user)) return <Organizations />;

  const duties = data.duties.split("\n").map((d) => d.trim()).filter(Boolean).slice(0, 8);
  const steps = "of 4";

  function publish() {
    return run(async () => {
      const saved = await saveOpportunity({
        ...(existing ?? {}),
        id: existing?.id,
        employerId: user!.id,
        orgName: user!.org!.name,
        title: data.title.trim(),
        type: data.type,
        summary: existing?.summary ?? "",
        responsibilities: duties,
        pay: { amount: data.amount, unit: data.unit },
        hoursPerWeek: data.hours.trim(),
        schedule: existing?.schedule ?? "",
        duration: existing?.duration ?? "",
        setting: data.setting,
        location: data.location.trim(),
        physical: { posture: data.posture || "unspecified", heavyLifting: data.lifting || "unspecified", notes: existing?.physical.notes ?? "" },
        qualificationsRequired: existing?.qualificationsRequired ?? "",
        qualificationsMaybe: existing?.qualificationsMaybe ?? "",
        paymentTerms: existing?.paymentTerms ?? "",
        cancellationTerms: existing?.cancellationTerms ?? "",
        status: existing?.status ?? "open",
      });
      reset();
      navigate(`/organizations/role/${saved.id}?posted=1`, { replace: true });
    });
  }

  if (step === 0)
    return (
      <Screen step={`Step 1 ${steps}`} title={existing ? "Change this role" : "What's the role?"} help="A short, plain title. For example: Workshop mentor, two afternoons a week.">
        <label htmlFor="role-title" className="sr-only">
          Role title
        </label>
        <input id="role-title" className="input min-h-[64px] text-xl" value={data.title} onChange={(e) => set("title", e.target.value)} />
        <p className="mt-6 text-xl font-semibold text-brand-900">What kind of work is it?</p>
        <div role="group" aria-label="Kind of work" className="mt-3 grid grid-cols-2 gap-3">
          {TYPES.map((t) => {
            const on = data.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={on}
                onClick={() => set("type", t.value)}
                className={`flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-3xl border-2 p-3 text-center text-lg font-semibold leading-snug transition ${
                  on ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"
                }`}
              >
                <t.icon aria-hidden="true" className="h-8 w-8" />
                {t.label}
              </button>
            );
          })}
        </div>
        <Actions primary="Next" onPrimary={() => go(1)} disabled={data.title.trim().length < 3} />
      </Screen>
    );

  if (step === 1)
    return (
      <Screen step={`Step 2 ${steps}`} title="What would they do?" help="One thing per line. Two or three is plenty.">
        <label htmlFor="role-duties" className="sr-only">
          What they would do
        </label>
        <textarea
          id="role-duties"
          rows={5}
          className="input min-h-[170px] text-xl leading-relaxed"
          placeholder={"Guide apprentices at the bench\nCheck finished work\nAnswer questions from the team"}
          value={data.duties}
          onChange={(e) => set("duties", e.target.value)}
        />
        <Actions primary="Next" onPrimary={() => go(2)} disabled={duties.length === 0} />
      </Screen>
    );

  if (step === 2)
    return (
      <Screen step={`Step 3 ${steps}`} title="What does it pay?" help="Pay is always shown. Experience is expertise, and people decide faster when they can see it.">
        <label htmlFor="role-pay" className="label text-xl">
          Amount ($)
        </label>
        <input
          id="role-pay"
          type="number"
          inputMode="numeric"
          min={1}
          className="input min-h-[64px] text-2xl"
          value={data.amount || ""}
          onChange={(e) => set("amount", Math.min(100000, Math.max(0, Number(e.target.value) || 0)))}
        />
        <div role="group" aria-label="Paid" className="mt-3 flex flex-wrap gap-2.5">
          {UNITS.map((u) => (
            <button key={u.value} type="button" aria-pressed={data.unit === u.value} onClick={() => set("unit", u.value)} className={chip(data.unit === u.value)}>
              {u.label}
            </button>
          ))}
        </div>
        <label htmlFor="role-hours" className="label mt-6 text-xl">
          How much time? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="role-hours" className="input min-h-[60px] text-xl" placeholder="For example: 6 hours a week" value={data.hours} onChange={(e) => set("hours", e.target.value)} />
        <Actions primary="Next" onPrimary={() => go(3)} disabled={data.amount < 1} />
      </Screen>
    );

  if (step === 3)
    return (
      <Screen step={`Step 4 ${steps}`} title="How physical is it?" help="Please be exact. Many people here are looking for work that asks for what they know, not what they can lift.">
        <div role="group" aria-labelledby="role-lift">
          <p id="role-lift" className="text-xl font-semibold text-brand-900">
            Lifting
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {LIFTING.map((l) => (
              <button key={l.value} type="button" aria-pressed={data.lifting === l.value} onClick={() => set("lifting", l.value)} className={chip(data.lifting === l.value)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-labelledby="role-posture" className="mt-7">
          <p id="role-posture" className="text-xl font-semibold text-brand-900">
            Most of the time, they would be
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {POSTURE.map((x) => (
              <button key={x.value} type="button" aria-pressed={data.posture === x.value} onClick={() => set("posture", x.value)} className={chip(data.posture === x.value)}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-labelledby="role-where" className="mt-7">
          <p id="role-where" className="text-xl font-semibold text-brand-900">
            Where
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {SETTING.map((x) => (
              <button key={x.value} type="button" aria-pressed={data.setting === x.value} onClick={() => set("setting", x.value)} className={chip(data.setting === x.value)}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <label htmlFor="role-town" className="label mt-7 text-xl">
          Town or city <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="role-town" className="input min-h-[60px] text-xl" placeholder="For example: Phoenix" value={data.location} onChange={(e) => set("location", e.target.value)} />
        <Actions primary="See how it will look" onPrimary={() => go(4)} disabled={!data.lifting || !data.posture} />
      </Screen>
    );

  return (
    <Screen title="Here's how people will see it" help="Nothing is posted until you say yes.">
      <article className="rounded-[2rem] bg-brand-900 p-6 text-brand-100 shadow-xl sm:p-8" aria-label="Your role">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">{user.org.name}</p>
        <p className="mt-2 font-serif text-3xl leading-tight text-white">{data.title}</p>
        <p className="mt-3 font-serif text-2xl text-warm-400">
          ${data.amount} {UNITS.find((u) => u.value === data.unit)?.label}
        </p>
        <ul className="mt-5 space-y-2 text-lg">
          <li className="flex items-center gap-3">
            <Feather aria-hidden="true" className="h-5 w-5 shrink-0 text-warm-400" /> {LIFTING.find((l) => l.value === data.lifting)?.label}
          </li>
          <li className="flex items-center gap-3">
            <Armchair aria-hidden="true" className="h-5 w-5 shrink-0 text-warm-400" /> {POSTURE.find((x) => x.value === data.posture)?.label}
          </li>
          <li className="flex items-center gap-3">
            {data.setting === "on-site" ? <Building2 aria-hidden="true" className="h-5 w-5 shrink-0 text-warm-400" /> : <Home aria-hidden="true" className="h-5 w-5 shrink-0 text-warm-400" />}
            {SETTING.find((x) => x.value === data.setting)?.label}
            {data.location.trim() ? `, ${data.location.trim()}` : ""}
          </li>
          {data.hours.trim() && (
            <li className="flex items-center gap-3">
              <Clock aria-hidden="true" className="h-5 w-5 shrink-0 text-warm-400" /> {data.hours.trim()}
            </li>
          )}
        </ul>
        <ul className="mt-5 space-y-1 border-t border-white/15 pt-4 text-lg text-white">
          {duties.map((d) => (
            <li key={d} className="flex gap-3">
              <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warm-400" /> {d}
            </li>
          ))}
        </ul>
      </article>
      <Actions primary={existing ? "Save my changes" : "Yes, post it"} onPrimary={publish} busy={busy} error={error} secondary="Change something" onSecondary={() => go(0)} />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* One role: who is interested                                         */
/* ------------------------------------------------------------------ */

export function OrgRole() {
  const { user, loading } = useAuth();
  const { id } = useParams();
  const opportunities = useStore(getOpportunities, []);
  const applications = useStore(getApplications, []);
  const users = useStore(getUsers, []);
  const { run, busy, error } = useRun();
  const justPosted = new URLSearchParams(window.location.search).get("posted") === "1";

  if (loading) return <Screen title="Your role">{null}</Screen>;
  if (!isOrg(user)) return <Organizations />;
  const role = opportunities.find((o) => o.id === id && o.employerId === user.id);
  if (!role)
    return (
      <Screen title="We couldn't find that role." help="It may have been posted from a different account.">
        <BigChoice to="/organizations" icon={Building2} label="Back to your roles" />
      </Screen>
    );
  const people = applications.filter((a) => a.opportunityId === role.id && a.employerId === user.id);

  return (
    <Screen step={user.org.name} title={role.title} help={`$${role.pay.amount} per ${role.pay.unit} · ${role.status === "open" ? "Open: people can find it" : "Closed: hidden from the list"}`}>
      {justPosted && (
        <p role="status" className="mb-6 rounded-3xl bg-brand-100 p-5 text-xl font-semibold text-brand-900">
          Your role is posted. We'll show it to people looking for work that values what they know.
        </p>
      )}

      <h2 className="font-sans text-2xl font-semibold">
        {people.length === 0 ? "Nobody has shown interest yet" : `${people.length} ${people.length === 1 ? "person is" : "people are"} interested`}
      </h2>
      {people.length === 0 && <p className="mt-2 text-lg text-muted">When someone does, they'll appear here with a way to reach them.</p>}
      <ul className="mt-4 space-y-4">
        {people.map((a) => (
          <li key={a.id}>
            <Interested application={a} person={users.find((u) => u.id === a.workerId)} />
          </li>
        ))}
      </ul>

      <div className="mt-10 space-y-3">
        <BigChoice to={`/organizations/post/${role.id}`} icon={PencilLine} label="Change this role" />
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => saveOpportunity({ ...role, status: role.status === "open" ? "closed" : "open" }))}
          className="btn-secondary min-h-[60px] w-full text-lg"
        >
          {role.status === "open" ? "Close this role (hide it from the list)" : "Open this role again"}
        </button>
        <ErrorLine error={error} />
        <BigChoice to="/organizations" icon={Building2} tone="warm" label="Back to your roles" />
      </div>
    </Screen>
  );
}

function Interested({ application, person }: { application: Application; person?: User }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { run, busy, error } = useRun();
  const name = firstOf(person?.name);
  return (
    <article className="rounded-3xl bg-white p-6 ring-1 ring-warm-200">
      <p className="text-2xl font-semibold text-brand-900">{name}</p>
      {person?.skills.length ? <p className="mt-1 text-lg text-muted">Knows: {person.skills.slice(0, 4).join(", ").toLowerCase()}</p> : null}
      <p className="mt-3 whitespace-pre-line text-xl leading-relaxed">{application.message}</p>
      {application.reply ? (
        <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-lg">
          <strong>You replied:</strong> {application.reply}
        </p>
      ) : open ? (
        <div className="mt-4">
          <label htmlFor={`reply-${application.id}`} className="label text-lg">
            Your reply to {name}
          </label>
          <textarea id={`reply-${application.id}`} rows={3} className="input text-xl" value={text} onChange={(e) => setText(e.target.value)} placeholder="For example: Thank you. Could we talk on Thursday afternoon?" />
          <ErrorLine error={error} />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className="btn-primary min-h-[52px]" disabled={busy || text.trim().length < 2} onClick={() => run(() => updateApplication(application.id, { reply: text.trim(), status: "invited" }))}>
              {busy ? "Sending…" : "Send reply"}
            </button>
            <button type="button" className="btn-ghost min-h-[52px]" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn-secondary mt-4 min-h-[52px]" onClick={() => setOpen(true)}>
          Reply to {name}
        </button>
      )}
      <p className="mt-3 text-base text-muted">Your reply appears in {name}'s messages. You can also contact them directly using the details they gave.</p>
    </article>
  );
}
