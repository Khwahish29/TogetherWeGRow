import { useMemo, type ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  Compass,
  FileText,
  Heart,
  HeartHandshake,
  Inbox,
  Lightbulb,
  PlusCircle,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { MentorCard } from "../components/cards";
import { FitBadge } from "../components/opportunity";
import { Avatar, formatPrice } from "../components/ui";
import { useAuth } from "../lib/auth";
import { fitCheck, payLabel } from "../lib/comfort";
import { scoreMentor } from "../lib/matching";
import {
  deleteListing,
  getApplications,
  getListings,
  getOpportunities,
  getPlan,
  getReflections,
  getRequests,
  getThanks,
  getUsers,
  resetDemo,
} from "../lib/store";
import type { User } from "../lib/types";
import { useAiMatches } from "../lib/useAiMatches";
import { useStore } from "../lib/useStore";
import { formatWhen, isPast } from "./Requests";

function completion(user: User) {
  const teaches = user.roles.some((r) => r !== "learner");
  const checks = [
    { done: user.bio.length > 20, label: "Write a short introduction" },
    { done: user.skills.length >= 3 || !teaches, label: "Add at least 3 skills" },
    { done: Boolean(user.location), label: "Add your town or city" },
    { done: user.workPreferences.length > 0 || !user.roles.includes("mentor"), label: "Add a work preference" },
    { done: user.wantToLearn.length > 0 || !user.roles.includes("learner"), label: "Add something you'd like to learn" },
    { done: user.profileApproved, label: "Review and approve your profile" },
  ];
  return { percent: Math.round((checks.filter((c) => c.done).length / checks.length) * 100), todo: checks.filter((c) => !c.done) };
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Section({ id, title, action, children }: { id: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-warm-200 pt-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={id} className="text-[1.75rem]">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AttentionRow({ icon: Icon, title, body, to, cta, tone = "brand" }: { icon: LucideIcon; title: string; body: string; to: string; cta: string; tone?: "brand" | "warm" }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-warm-200 bg-white p-5 sm:flex-row sm:items-center">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone === "warm" ? "bg-warm-100 text-warm-700" : "bg-brand-100 text-brand-700"}`}>
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-semibold text-brand-900">{title}</p>
        <p className="text-muted">{body}</p>
      </div>
      <Link to={to} className="btn-secondary shrink-0 whitespace-nowrap">
        {cta}
      </Link>
    </li>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const requests = useStore(getRequests, []);
  const thanks = useStore(getThanks, []);
  const opportunities = useStore(getOpportunities, []);
  const reflections = useStore(() => (user ? getReflections(user.id) : Promise.resolve([])), []);
  const plan = useStore(() => (user ? getPlan(user.id) : Promise.resolve(null)), null);
  const mentors = useMemo(() => users.filter((u) => u.roles.includes("mentor") && u.id !== user?.id && u.skills.length > 0), [users, user]);
  const ai = useAiMatches("mentor", user, mentors, "");
  const applications = useStore(getApplications, []);
  if (!user) return null;
  if (user.roles.length === 1 && user.roles[0] === "employer") return <Navigate to="/employer" replace />;

  const first = user.name.split(" ")[0];
  const isMentor = user.roles.includes("mentor");
  const isLearner = user.roles.includes("learner");
  const { percent, todo } = completion(user);
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "A member";

  const invitations = applications.filter((a) => a.workerId === user.id && a.initiatedBy === "employer" && a.status === "invited" && !a.reply);
  const incoming = requests.filter((r) => r.toId === user.id && r.status === "pending");
  const mine = requests.filter((r) => r.toId === user.id || r.fromId === user.id);
  const upcoming = mine.filter((r) => r.status === "accepted" && !isPast(r.proposedAt)).sort((a, b) => a.proposedAt.localeCompare(b.proposedAt));
  const toReflect = mine.filter((r) => r.status === "accepted" && isPast(r.proposedAt) && !reflections.some((rf) => rf.requestId === r.id));
  const myListings = listings.filter((l) => l.mentorId === user.id);
  const myThanks = thanks.filter((t) => t.toId === user.id);
  const nextStep = plan?.steps.find((s) => !s.done);
  const planDone = plan ? plan.steps.filter((s) => s.done).length : 0;

  const forMe = opportunities
    .filter((o) => o.status === "open" && !applications.some((a) => a.opportunityId === o.id && a.workerId === user.id))
    .map((o) => ({ o, fit: fitCheck(user.workComfort, o) }))
    .sort((a, b) => ["fits", "none", "unclear", "check"].indexOf(a.fit.verdict) - ["fits", "none", "unclear", "check"].indexOf(b.fit.verdict))
    .slice(0, 2);

  const recommended = (
    ai.results
      ? ai.results.flatMap((r) => {
          const mentor = mentors.find((m) => m.id === r.id);
          return mentor ? [{ mentor, score: r.score, matchedSkills: r.matched, reasons: r.reasons }] : [];
        })
      : ai.loading
        ? []
        : mentors.map((m) => scoreMentor(user, m)).filter((m) => m.matchedSkills.length > 0).sort((a, b) => b.score - a.score)
  ).slice(0, 2);

  // One clear next action, chosen by what matters most right now.
  const primary =
    user.skills.length === 0 && !isLearner
      ? { label: "Start here", title: "Tell us about your working life", body: "Speak or type. It takes about five minutes, and you approve everything.", to: "/profile/create", cta: "Create my profile" }
      : invitations.length
        ? { label: "Needs a reply", title: `${invitations.length === 1 ? "An organisation" : `${invitations.length} organisations`} would like to talk with you`, body: "No pressure. Read the details and reply yes or no when you're ready.", to: "/requests?tab=work", cta: "See invitation" }
        : incoming.length
          ? { label: "Needs a reply", title: `${nameOf(incoming[0].fromId)} asked for a session`, body: "Accept, suggest another time, or say not this time.", to: "/requests", cta: "Reply" }
          : nextStep && isMentor
            ? { label: "Your next chapter", title: nextStep.title, body: nextStep.detail, to: "/next-chapter", cta: "Continue my plan" }
            : isMentor && !plan
              ? { label: "Your next chapter", title: "Plan your move into work that suits you now", body: "A step-by-step pathway built from your experience and preferences.", to: "/next-chapter", cta: "Create my plan" }
              : { label: "Something to try", title: isLearner ? "Find someone to learn from" : "Explore paid opportunities", body: isLearner ? "People with decades of practical experience." : "Roles that value experience, with pay and duties up front.", to: isLearner ? "/mentors" : "/opportunities", cta: isLearner ? "Find a mentor" : "See opportunities" };

  const attention = [
    ...invitations.map((a) => ({
      key: a.id,
      icon: Building2,
      title: "An organisation would like to talk",
      body: opportunities.find((o) => o.id === a.opportunityId)?.title ?? "About a paid role",
      to: "/requests?tab=work",
      cta: "See invitation",
      tone: "brand" as const,
    })),
    ...incoming.map((r) => ({
      key: r.id,
      icon: Inbox,
      title: `${nameOf(r.fromId)} would like a ${r.kind === "session" ? "session" : "hand with technology"}`,
      body: formatWhen(r.proposedAt),
      to: "/requests",
      cta: "Reply",
      tone: "brand" as const,
    })),
    ...toReflect.map((r) => ({
      key: r.id,
      icon: Heart,
      title: "How did your session go?",
      body: `With ${nameOf(r.toId === user.id ? r.fromId : r.toId)}. A quiet moment, just for you.`,
      to: "/requests",
      cta: "Take a moment",
      tone: "warm" as const,
    })),
  ];

  const more: { to: string; icon: LucideIcon; title: string; body: string }[] = [
    ...(isMentor
      ? [
          { to: "/next-chapter", icon: Compass, title: "My Next Chapter", body: "Your step-by-step plan" },
          { to: "/opportunities", icon: Briefcase, title: "Paid opportunities", body: "Roles that value experience" },
          { to: "/marketplace?create=1", icon: PlusCircle, title: "Offer a paid session", body: "Set your own fair price" },
        ]
      : []),
    { to: "/mentors", icon: Search, title: "Find a mentor", body: "Learn from decades of experience" },
    { to: "/resume", icon: FileText, title: "Build my résumé", body: "Answer questions, watch it build" },
    { to: "/learn/ai", icon: Lightbulb, title: "Learn some technology", body: "Step by step, at your pace" },
    { to: "/learn/buddies", icon: HeartHandshake, title: "Ask a friendly person", body: "A patient digital buddy" },
  ];

  return (
    <>
      <header className="border-b border-warm-200/70 bg-gradient-to-b from-warm-100/70 to-warm-50">
        <div className="container-page grid gap-10 pb-12 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div className="animate-fade-up">
            <p className="eyebrow">My Space</p>
            <h1 className="mt-3 text-[2.4rem] leading-tight sm:text-5xl">
              {greeting()}, {first}.
            </h1>
            <p className="mt-3 text-lg text-muted">
              {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}. Here's what's worth your
              attention.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-brand-800 p-7 text-white shadow-[0_24px_60px_-30px_rgba(20,43,33,0.6)] sm:p-8">
            <div aria-hidden="true" className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-700" />
            <p className="relative text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">{primary.label}</p>
            <p className="relative mt-2 font-serif text-2xl leading-snug sm:text-[1.7rem]">{primary.title}</p>
            <p className="relative mt-2 text-brand-100">{primary.body}</p>
            <Link to={primary.to} className="btn relative mt-6 bg-white text-brand-900 hover:bg-warm-100">
              {primary.cta} <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container-page space-y-12 py-12">
        {attention.length > 0 && (
          <Section id="attention" title="Needs your attention">
            <ul className="space-y-3">
              {attention.map(({ key, ...row }) => (
                <AttentionRow key={key} {...row} />
              ))}
            </ul>
          </Section>
        )}

        <Section
          id="upcoming"
          title="Coming up"
          action={
            <Link to="/requests" className="link">
              All requests & sessions
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <p className="text-muted">Nothing booked yet. When a session is confirmed it will appear here.</p>
          ) : (
            <ul className="divide-y divide-warm-200 rounded-2xl border border-warm-200 bg-white">
              {upcoming.slice(0, 4).map((r) => {
                const other = users.find((u) => u.id === (r.toId === user.id ? r.fromId : r.toId));
                const l = listings.find((x) => x.id === r.listingId);
                return (
                  <li key={r.id} className="flex items-center gap-4 p-5">
                    <CalendarClock aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-600" />
                    <div>
                      <p className="font-semibold text-brand-900">{formatWhen(r.proposedAt)}</p>
                      <p className="text-muted">
                        {l?.title ?? `Help with ${r.topic}`} · with {other?.name}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {isMentor && (
          <Section
            id="for-me"
            title="Opportunities for you"
            action={
              <Link to="/opportunities" className="link">
                See all opportunities
              </Link>
            }
          >
            {forMe.length === 0 ? (
              <p className="text-muted">You've looked at everything open right now. New roles will appear here.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {forMe.map(({ o, fit }) => (
                  <li key={o.id}>
                    <Link to={`/opportunities/${o.id}`} className="card card-hover block h-full">
                      <div className="flex flex-wrap gap-2">
                        <FitBadge fit={fit} />
                        {o.isDemo && <span className="badge bg-warm-100 text-warm-800">Illustrative listing</span>}
                      </div>
                      <h3 className="mt-3 text-xl">{o.title}</h3>
                      <p className="text-muted">{o.orgName}</p>
                      <p className="mt-3 font-semibold text-brand-900">
                        {payLabel(o.pay)} · <span className="font-normal text-muted">{o.hoursPerWeek}</span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {isLearner && (
          <Section
            id="people"
            title="People you might learn from"
            action={
              <Link to="/mentors" className="link">
                Browse all mentors
              </Link>
            }
          >
            {ai.loading && recommended.length === 0 ? (
              <p className="flex items-center gap-2 text-muted">
                <Sparkles aria-hidden="true" className="h-4 w-4 animate-pulse text-brand-600" /> Finding people for you…
              </p>
            ) : recommended.length === 0 ? (
              <p className="text-muted">
                {user.wantToLearn.length ? `No close matches for ${user.wantToLearn.join(", ")} yet.` : "Tell us what you'd like to learn on your profile and we'll suggest people."}{" "}
                <Link to={user.wantToLearn.length ? "/mentors" : "/profile"} className="link">
                  {user.wantToLearn.length ? "Browse everyone" : "Update my profile"}
                </Link>
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommended.map((m) => (
                  <MentorCard key={m.mentor.id} match={m} showScore />
                ))}
              </div>
            )}
          </Section>
        )}

        <Section id="progress" title="Your profile and progress">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="sm" />
                <p className="font-semibold text-brand-900">Profile {percent}% complete</p>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-muted">{todo[0] ? `Next: ${todo[0].label}` : "Your profile is ready for others to see."}</p>
              <Link to={user.skills.length ? "/profile" : "/profile/create"} className="link mt-3 inline-block">
                {user.skills.length ? "Edit profile" : "Create my profile"}
              </Link>
            </div>

            {isMentor && (
              <div className="card">
                <p className="font-semibold text-brand-900">My Next Chapter</p>
                {plan ? (
                  <>
                    <p className="mt-1 text-muted">Towards {plan.to}</p>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={planDone} aria-valuemin={0} aria-valuemax={plan.steps.length} aria-label="Plan progress">
                      <div className="h-full rounded-full bg-warm-400" style={{ width: `${(planDone / Math.max(plan.steps.length, 1)) * 100}%` }} />
                    </div>
                    <p className="mt-3 text-muted">
                      {planDone} of {plan.steps.length} steps done
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-muted">No plan yet. A step-by-step pathway, built from your experience.</p>
                )}
                <Link to="/next-chapter" className="link mt-3 inline-block">
                  {plan ? "Open my plan" : "Create my plan"}
                </Link>
              </div>
            )}

            {isMentor && (
              <div className="card">
                <p className="font-semibold text-brand-900">My mentoring offers</p>
                {myListings.length === 0 ? (
                  <p className="mt-1 text-muted">None yet.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-warm-200">
                    {myListings.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                        <span>
                          <span className="block font-medium">{l.title}</span>
                          <span className="text-sm text-muted">
                            {formatPrice(l.price)} · {l.durationMins} min
                          </span>
                        </span>
                        <button className="btn-ghost min-h-[40px] px-3 py-1 text-sm" onClick={() => deleteListing(l.id)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/marketplace?create=1" className="link mt-3 inline-block">
                  Create an offer
                </Link>
              </div>
            )}
          </div>

          {myThanks.length > 0 && (
            <div className="mt-6 rounded-3xl bg-warm-100/70 p-7">
              <p className="flex items-center gap-2 font-semibold text-brand-900">
                <Heart aria-hidden="true" className="h-5 w-5 text-warm-700" /> Notes of thanks for you
              </p>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {myThanks.slice(0, 2).map((t) => (
                  <li key={t.id}>
                    <blockquote className="font-serif text-xl leading-relaxed text-brand-900">“{t.message}”</blockquote>
                    <p className="mt-2 text-sm text-muted">
                      {nameOf(t.fromId)}
                      {t.isDemo && <span className="badge ml-2 bg-white text-warm-800">Fictional example</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        <details className="group rounded-3xl border border-warm-200 bg-white">
          <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-3 px-6 font-semibold text-brand-900 [&::-webkit-details-marker]:hidden">
            More things you can do
            <ChevronDown aria-hidden="true" className="h-5 w-5 transition group-open:rotate-180" />
          </summary>
          <ul className="grid gap-px overflow-hidden rounded-b-3xl border-t border-warm-200 bg-warm-200 sm:grid-cols-2 lg:grid-cols-3">
            {more.map(({ to, icon: Icon, title, body }) => (
              <li key={to}>
                <Link to={to} className="flex h-full items-start gap-4 bg-white p-5 hover:bg-brand-50">
                  <Icon aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
                  <span>
                    <span className="block font-semibold text-brand-900">{title}</span>
                    <span className="text-muted">{body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>

        <p className="text-center text-sm text-muted">
          Demo tools:{" "}
          <button className="underline" onClick={() => resetDemo()}>
            reset all demo data
          </button>
        </p>
      </div>
    </>
  );
}
