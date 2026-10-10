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
  MessageCircle,
  MessageCircleQuestion,
  PenLine,
  PlusCircle,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { MentorCard } from "../components/cards";
import { Avatar, formatPrice } from "../components/ui";
import { useAuth } from "../lib/auth";
import { scoreMentor } from "../lib/matching";
import {
  deleteListing,
  getApplications,
  getListings,
  getOpportunities,
  getPlan,
  getQuestions,
  getReflections,
  getRequests,
  getThanks,
  getUsers,
} from "../lib/store";
import type { User } from "../lib/types";
import { useAiMatches } from "../lib/useAiMatches";
import { useStore } from "../lib/useStore";
import { formatWhen, isPast } from "./Requests";

interface MainAction {
  to: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

function completion(user: User) {
  const teaches = user.roles.some((r) => r === "mentor" || r === "buddy");
  const checks = [
    { done: user.bio.length > 20, label: "Write a short introduction" },
    { done: user.skills.length >= 3 || !teaches, label: "Add at least 3 skills" },
    { done: Boolean(user.location), label: "Add your town or city" },
    { done: user.wantToLearn.length > 0 || !user.roles.includes("learner"), label: "Add something you'd like to learn" },
    { done: user.profileApproved, label: "Review and approve your profile" },
  ];
  return { percent: Math.round((checks.filter((c) => c.done).length / checks.length) * 100), todo: checks.filter((c) => !c.done) };
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
  const questions = useStore(getQuestions, []);
  const reflections = useStore(() => (user ? getReflections(user.id) : Promise.resolve([])), []);
  const plan = useStore(() => (user ? getPlan(user.id) : Promise.resolve(null)), null);
  const mentors = useMemo(() => users.filter((u) => u.roles.includes("mentor") && u.id !== user?.id && u.skills.length > 0), [users, user]);
  const ai = useAiMatches("mentor", user, user?.roles.includes("learner") ? mentors : [], "");
  const applications = useStore(getApplications, []);
  if (!user) return null;
  if (user.roles.length === 1 && user.roles[0] === "employer") return <Navigate to="/employer" replace />;

  const first = user.name.split(" ")[0];
  const isMentor = user.roles.includes("mentor");
  const isLearner = user.roles.includes("learner");
  const isFamily = user.roles.includes("family");
  const isBuddy = user.roles.includes("buddy");
  const primaryRole = isMentor ? "mentor" : isLearner ? "learner" : isFamily ? "family" : "buddy";
  const { percent, todo } = completion(user);
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "A member";

  const invitations = applications.filter((a) => a.workerId === user.id && a.initiatedBy === "employer" && a.status === "invited" && !a.reply);
  const incoming = requests.filter((r) => r.toId === user.id && r.status === "pending");
  const mine = requests.filter((r) => r.toId === user.id || r.fromId === user.id);
  const upcoming = mine.filter((r) => r.status === "accepted" && !isPast(r.proposedAt)).sort((a, b) => a.proposedAt.localeCompare(b.proposedAt));
  const toReflect = mine.filter((r) => r.status === "accepted" && isPast(r.proposedAt) && !reflections.some((rf) => rf.requestId === r.id));
  const myListings = listings.filter((l) => l.mentorId === user.id);
  const myThanks = thanks.filter((t) => t.toId === user.id);
  const myAnswers = questions.filter((q) => q.answers.some((a) => a.authorId === user.id)).length;
  const openQuestions = questions.filter((q) => !q.answers.some((a) => a.authorId === user.id)).length;
  const planDone = plan ? plan.steps.filter((s) => s.done).length : 0;

  const intro = {
    mentor: { title: `Welcome back, ${first}. Your experience matters here.`, sub: "Here are a few good places to start. Take your time." },
    learner: { title: "What would you love to learn from someone who's done it?", sub: `Welcome back, ${first}. People with decades of practical experience are here to help.` },
    family: { title: `Thank you for being there for someone, ${first}.`, sub: "Here's how you can help someone you love take a first step, while every choice stays theirs." },
    buddy: { title: `Welcome back, ${first}. Thank you for your patience.`, sub: "Your help makes technology feel a little less daunting for someone." },
  }[primaryRole];

  const actions: MainAction[] = {
    mentor: [
      { to: "/questions", icon: MessageCircleQuestion, title: "See questions I could answer", body: `${openQuestions} practical questions from people who are learning` },
      { to: "/opportunities", icon: Briefcase, title: "Explore ways to share my experience", body: "Paid advice, mentoring and roles that are easier on the body" },
      { to: "/learn", icon: Lightbulb, title: "Get help with something", body: "Step by step on your own, or with a patient person" },
    ],
    learner: [
      { to: "/questions", icon: MessageCircleQuestion, title: "Ask a practical question", body: "People who've done it for years can answer" },
      { to: "/mentors", icon: Search, title: "Find an experienced guide", body: "One-to-one sessions with clear prices" },
      { to: isBuddy ? "/requests" : "/profile", icon: HeartHandshake, title: "Offer patient digital help", body: isBuddy ? "See who has asked for your help" : "Add the digital buddy role to your profile" },
    ],
    family: [
      { to: "/introduce", icon: PenLine, title: "Write an invitation", body: "A warm message that celebrates their experience" },
      { to: "/learn/buddies?need=Getting%20started%20on%20TogetherWeGrow", icon: HeartHandshake, title: "Request a walkthrough", body: "A patient buddy can guide them, while they stay in control" },
      { to: "/vibe-check", icon: MessageCircle, title: "Understand each other's words", body: "Vibe Check explains unfamiliar expressions, both ways" },
    ],
    buddy: [
      { to: "/requests", icon: Inbox, title: "See who has asked for help", body: incoming.length ? `${incoming.length} waiting for your reply` : "Requests will appear here" },
      { to: "/vibe-check", icon: MessageCircle, title: "Understand each other's words", body: "Vibe Check explains unfamiliar expressions, both ways" },
      { to: "/questions", icon: MessageCircleQuestion, title: "Ask a practical question", body: "Learn from people with decades of experience" },
    ],
  }[primaryRole];

  const attention = [
    ...invitations.map((a) => ({
      key: a.id,
      icon: Building2,
      title: "An organization would like to talk with you",
      body: opportunities.find((o) => o.id === a.opportunityId)?.title ?? "About a paid role",
      to: "/requests?tab=work",
      cta: "See invitation",
      tone: "brand" as const,
    })),
    ...incoming.map((r) => ({
      key: r.id,
      icon: Inbox,
      title: `${nameOf(r.fromId)} would like ${r.kind === "session" ? "a session" : "a hand with technology"}`,
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

  const more: MainAction[] = [
    ...(isMentor
      ? [
          { to: "/next-chapter", icon: Compass, title: "Explore your next chapter", body: plan ? `${planDone} of ${plan.steps.length} steps done` : "A step-by-step plan, built from your experience" },
          { to: "/marketplace?create=1", icon: PlusCircle, title: "Offer a paid session", body: "Set your own fair price" },
          { to: "/resume", icon: FileText, title: "Build my résumé", body: "Answer questions, watch it build" },
        ]
      : []),
    { to: "/vibe-check", icon: MessageCircle, title: "Vibe Check", body: "Understand an unfamiliar expression" },
    { to: "/introduce", icon: PenLine, title: "Invite someone you love", body: "Write a respectful introduction" },
    { to: "/mentors", icon: Search, title: "Find a mentor", body: "Learn from decades of experience" },
    { to: "/learn/buddies", icon: HeartHandshake, title: "Ask a friendly person", body: "A patient digital buddy" },
  ];

  return (
    <>
      <header className="border-b border-warm-200/70 bg-gradient-to-b from-warm-100/70 to-warm-50">
        <div className="container-page pb-12 pt-10 sm:pt-14">
          <div className="max-w-3xl animate-fade-up">
            <p className="eyebrow">My Home</p>
            <h1 className="mt-3 text-[2.2rem] leading-tight sm:text-5xl">{intro.title}</h1>
            <p className="mt-3 text-lg text-muted">{intro.sub}</p>
          </div>
          {isMentor && user.skills.length === 0 && (
            <p className="notice mt-6 max-w-3xl">
              When you're ready,{" "}
              <Link to="/profile/create" className="link">
                tell us a little about your working life
              </Link>
              . It takes about five minutes, and you approve everything.
            </p>
          )}
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {actions.map(({ to, icon: Icon, title, body }, i) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`group flex h-full flex-col rounded-3xl p-6 transition ${
                    i === 0 ? "bg-brand-800 text-white hover:bg-brand-900" : "card card-hover"
                  }`}
                >
                  <Icon aria-hidden="true" className={`h-7 w-7 ${i === 0 ? "text-warm-400" : "text-brand-600"}`} />
                  <span className={`mt-4 text-xl font-semibold ${i === 0 ? "text-white" : "text-brand-900"}`}>{title}</span>
                  <span className={`mt-1 flex-1 ${i === 0 ? "text-brand-100" : "text-muted"}`}>{body}</span>
                  <ArrowRight aria-hidden="true" className={`mt-4 h-5 w-5 transition group-hover:translate-x-1 ${i === 0 ? "text-warm-400" : "text-brand-600"}`} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="container-page space-y-12 py-12">
        {attention.length > 0 && (
          <Section id="attention" title="Waiting for you">
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
            <p className="text-muted">Nothing booked yet. When a session is confirmed, it will appear here.</p>
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

        {isLearner && (
          <Section
            id="people"
            title="People you might learn from"
            action={
              <Link to="/mentors" className="link">
                See everyone
              </Link>
            }
          >
            {ai.loading && recommended.length === 0 ? (
              <p className="flex items-center gap-2 text-muted">
                <Sparkles aria-hidden="true" className="h-4 w-4 animate-pulse text-brand-600" /> Finding people for you…
              </p>
            ) : recommended.length === 0 ? (
              <p className="text-muted">
                {user.wantToLearn.length ? `No close matches for ${user.wantToLearn.join(", ")} yet.` : "Tell us what you'd like to learn, and we'll suggest people."}{" "}
                <Link to={user.wantToLearn.length ? "/mentors" : "/profile"} className="link">
                  {user.wantToLearn.length ? "See everyone" : "Update my profile"}
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

        {myThanks.length > 0 && (
          <section aria-labelledby="thanks" className="rounded-3xl bg-warm-100/70 p-7">
            <h2 id="thanks" className="flex items-center gap-2 font-sans text-lg font-semibold">
              <Heart aria-hidden="true" className="h-5 w-5 text-warm-700" /> Notes of thanks for you
            </h2>
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
          </section>
        )}

        <details className="group rounded-3xl border border-warm-200 bg-white">
          <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-3 px-6 font-semibold text-brand-900 [&::-webkit-details-marker]:hidden">
            More for you
            <ChevronDown aria-hidden="true" className="h-5 w-5 transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-warm-200 p-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <p className="font-semibold text-brand-900">Your profile is {percent}% complete</p>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
                  <div className="h-full rounded-full bg-brand-700" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-muted">{todo[0] ? `Next: ${todo[0].label}` : "Your profile is ready for others to see."}</p>
                <Link to="/profile" className="link mt-2 inline-block">
                  Edit my profile
                </Link>
                {myAnswers > 0 && <p className="mt-4 text-muted">You've answered {myAnswers} {myAnswers === 1 ? "question" : "questions"}.</p>}
              </div>
              {isMentor && (
                <div>
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
                          <button className="btn-ghost min-h-[44px] px-3 py-1 text-sm" onClick={() => deleteListing(l.id)}>
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <ul className="space-y-1 lg:col-span-1">
                {more.map(({ to, icon: Icon, title, body }) => (
                  <li key={to}>
                    <Link to={to} className="flex min-h-[56px] items-start gap-3 rounded-xl p-2 hover:bg-brand-50">
                      <Icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-600" />
                      <span>
                        <span className="block font-semibold text-brand-900">{title}</span>
                        <span className="text-sm text-muted">{body}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>

        <p className="text-center text-muted">
          <Link to="/account" className="link">
            Your account and privacy
          </Link>
        </p>
      </div>
    </>
  );
}
