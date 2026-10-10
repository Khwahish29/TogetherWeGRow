import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  GraduationCap,
  Heart,
  HeartHandshake,
  Inbox,
  Lightbulb,
  PlusCircle,
  Search,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { MentorCard } from "../components/cards";
import { Avatar, formatPrice } from "../components/ui";
import { useAuth } from "../lib/auth";
import { scoreMentor } from "../lib/matching";
import { deleteListing, getListings, getReflections, getRequests, getThanks, getUsers, resetDemo } from "../lib/store";
import type { User } from "../lib/types";
import { useStore } from "../lib/useStore";
import { RequestItem, formatWhen, isPast } from "./Requests";

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

function ActionTile({ to, icon: Icon, title, body, tone }: { to: string; icon: LucideIcon; title: string; body: string; tone: string }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-3xl border border-brand-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-1 text-lg font-bold text-brand-900">
          {title}
          <ArrowRight aria-hidden="true" className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
        </span>
        <span className="block text-ink/70">{body}</span>
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const requests = useStore(getRequests, []);
  const thanks = useStore(getThanks, []);
  const reflections = useStore(() => (user ? getReflections(user.id) : Promise.resolve([])), []);
  if (!user) return null;

  const { percent, todo } = completion(user);
  const isMentor = user.roles.includes("mentor");
  const isLearner = user.roles.includes("learner");
  const mine = requests.filter((r) => r.toId === user.id || r.fromId === user.id);
  const myListings = listings.filter((l) => l.mentorId === user.id);
  const incoming = requests.filter((r) => r.toId === user.id && r.status === "pending");
  const upcoming = mine.filter((r) => r.status === "accepted" && !isPast(r.proposedAt)).sort((a, b) => a.proposedAt.localeCompare(b.proposedAt));
  const toReflect = mine.filter((r) => r.status === "accepted" && isPast(r.proposedAt) && !reflections.some((rf) => rf.requestId === r.id));
  const myThanks = thanks.filter((t) => t.toId === user.id);
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "A member";
  const recommended = users
    .filter((u) => u.roles.includes("mentor") && u.id !== user.id)
    .map((m) => scoreMentor(user, m))
    .filter((m) => m.matchedSkills.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const actions = [
    ...(isMentor
      ? [
          { to: "/careers", icon: Briefcase, title: "Explore new roles", body: "Work that values what you know", tone: "bg-brand-100 text-brand-700" },
          { to: "/marketplace?create=1", icon: PlusCircle, title: "Offer a paid session", body: "Set your own fair price", tone: "bg-warm-100 text-warm-700" },
        ]
      : []),
    ...(isLearner || !isMentor
      ? [{ to: "/mentors", icon: Search, title: "Find a mentor", body: "Learn from decades of experience", tone: "bg-brand-100 text-brand-700" }]
      : []),
    { to: "/learn/ai", icon: Lightbulb, title: "Learn some technology", body: "Step by step, at your pace", tone: "bg-violet-100 text-violet-700" },
    { to: "/learn/buddies", icon: HeartHandshake, title: "Ask a friendly person", body: "A patient digital buddy", tone: "bg-sky-100 text-sky-700" },
    { to: "/requests", icon: Inbox, title: "My requests", body: incoming.length ? `${incoming.length} waiting for you` : "Sessions and replies", tone: "bg-amber-100 text-amber-700" },
  ];

  return (
    <>
      <section className="border-b border-brand-100 bg-gradient-to-br from-brand-50 via-warm-50 to-warm-100">
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {greeting()}, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-lg text-ink/75">What would you like to do today?</p>
          </div>
          {percent < 100 && (
            <Link to={user.skills.length ? "/profile" : "/profile/create"} className="rounded-3xl bg-white p-4 shadow-sm sm:w-72">
              <span className="flex items-center justify-between font-bold">
                <span>Profile {percent}% ready</span>
                <UserRound aria-hidden="true" className="h-5 w-5 text-brand-600" />
              </span>
              <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-brand-100" aria-hidden="true">
                <span className="block h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
              </span>
              <span className="mt-2 block text-sm text-ink/70">Next: {todo[0]?.label}</span>
            </Link>
          )}
        </div>
      </section>

      <div className="container-page space-y-10 py-10">
        <section aria-label="Things to do">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((a) => (
              <li key={a.to}>
                <ActionTile {...a} />
              </li>
            ))}
          </ul>
        </section>

        {toReflect.length > 0 && (
          <section aria-labelledby="reflect" className="rounded-3xl border-2 border-warm-400 bg-warm-50 p-6">
            <div className="flex items-start gap-4">
              <Heart aria-hidden="true" className="mt-1 h-7 w-7 shrink-0 text-warm-700" />
              <div className="flex-1">
                <h2 id="reflect" className="text-xl font-bold">
                  Take a moment after your session
                </h2>
                <p className="text-ink/80">
                  {toReflect.length === 1 ? "You had a session" : `You had ${toReflect.length} sessions`} recently. A few quiet
                  notes, just for you, and a thank-you if you'd like.
                </p>
              </div>
              <Link to="/requests" className="btn-warm shrink-0">
                How did it go?
              </Link>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="card" aria-labelledby="waiting">
            <div className="flex items-center justify-between gap-3">
              <h2 id="waiting" className="flex items-center gap-2 text-xl font-bold">
                <Inbox aria-hidden="true" className="h-6 w-6 text-brand-600" /> Waiting for your reply
              </h2>
              <Link to="/requests" className="font-bold text-brand-700 underline">
                See all
              </Link>
            </div>
            {incoming.length === 0 ? (
              <p className="mt-3 text-ink/70">You're all caught up.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {incoming.slice(0, 2).map((r) => (
                  <RequestItem key={r.id} req={r} incoming users={users} listings={listings} me={user} />
                ))}
              </ul>
            )}
          </section>

          <section className="card" aria-labelledby="upcoming">
            <h2 id="upcoming" className="flex items-center gap-2 text-xl font-bold">
              <CalendarClock aria-hidden="true" className="h-6 w-6 text-brand-600" /> Coming up
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-ink/70">No sessions booked yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {upcoming.slice(0, 4).map((r) => {
                  const other = users.find((u) => u.id === (r.toId === user.id ? r.fromId : r.toId));
                  const l = listings.find((x) => x.id === r.listingId);
                  return (
                    <li key={r.id} className="rounded-2xl bg-brand-50 p-3">
                      <p className="font-bold text-brand-900">{formatWhen(r.proposedAt)}</p>
                      <p className="text-sm">
                        {l?.title ?? `Help with ${r.topic}`} · with {other?.name}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {isMentor && (
            <section className="card" aria-labelledby="offers">
              <h2 id="offers" className="flex items-center gap-2 text-xl font-bold">
                <GraduationCap aria-hidden="true" className="h-6 w-6 text-brand-600" /> Your offers
              </h2>
              {myListings.length === 0 ? (
                <p className="mt-3 text-ink/70">
                  You haven't published an offer yet.{" "}
                  <Link to="/marketplace?create=1" className="font-bold text-brand-700 underline">
                    Create one
                  </Link>
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-brand-100">
                  {myListings.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                      <span>
                        <strong>{l.title}</strong>
                        <span className="block text-sm text-ink/70">
                          {formatPrice(l.price)} · {l.durationMins} minutes
                        </span>
                      </span>
                      <button className="btn-ghost min-h-[40px] px-3 py-1 text-sm" onClick={() => deleteListing(l.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {isLearner && (
            <section className="card" aria-labelledby="mentors-for-you">
              <h2 id="mentors-for-you" className="flex items-center gap-2 text-xl font-bold">
                <Sparkles aria-hidden="true" className="h-6 w-6 text-brand-600" /> Mentors for you
              </h2>
              {recommended.length === 0 ? (
                <p className="mt-3 text-ink/70">
                  {user.wantToLearn.length ? (
                    <>
                      No close matches for {user.wantToLearn.join(", ")} yet.{" "}
                      <Link to="/mentors" className="font-bold underline">
                        Browse all mentors
                      </Link>
                    </>
                  ) : (
                    <>
                      Add things you'd like to learn on{" "}
                      <Link to="/profile" className="font-bold underline">
                        your profile
                      </Link>{" "}
                      to see matches.
                    </>
                  )}
                </p>
              ) : (
                <div className="mt-4 grid gap-4">
                  {recommended.map((m) => (
                    <MentorCard key={m.mentor.id} match={m} showScore />
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="card bg-warm-50" aria-labelledby="kind-words">
            <h2 id="kind-words" className="flex items-center gap-2 text-xl font-bold">
              <Heart aria-hidden="true" className="h-6 w-6 text-warm-700" /> Notes of thanks for you
            </h2>
            {myThanks.length === 0 ? (
              <p className="mt-3 text-ink/70">When someone thanks you after a session, their note will appear here.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {myThanks.slice(0, 3).map((t) => (
                  <li key={t.id} className="rounded-2xl bg-white p-4">
                    <p className="font-serif text-lg text-brand-900">“{t.message}”</p>
                    <p className="mt-1 text-sm text-ink/70">{nameOf(t.fromId)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <p className="text-center text-sm text-ink/60">
          Demo tools:{" "}
          <button className="underline" onClick={() => resetDemo()}>
            reset all demo data
          </button>
        </p>
      </div>
    </>
  );
}
