import { Link } from "react-router-dom";
import { MentorCard } from "../components/cards";
import { Avatar, formatPrice } from "../components/ui";
import { useAuth } from "../lib/auth";
import { scoreMentor } from "../lib/matching";
import { deleteListing, getListings, getRequests, getUsers, resetDemo } from "../lib/store";
import type { User } from "../lib/types";
import { useStore } from "../lib/useStore";
import { RequestItem, formatWhen } from "./Requests";

function completion(user: User) {
  const checks = [
    { done: user.bio.length > 20, label: "Write a short introduction" },
    { done: user.skills.length >= 3 || user.roles.every((r) => r === "learner"), label: "Add at least 3 skills" },
    { done: Boolean(user.location), label: "Add your town or city" },
    { done: user.workPreferences.length > 0 || !user.roles.includes("mentor"), label: "Add a work preference" },
    { done: user.wantToLearn.length > 0 || !user.roles.includes("learner"), label: "Add something you'd like to learn" },
    { done: user.profileApproved, label: "Review and approve your profile" },
  ];
  return { percent: Math.round((checks.filter((c) => c.done).length / checks.length) * 100), todo: checks.filter((c) => !c.done) };
}

export default function Dashboard() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const requests = useStore(getRequests, []);
  if (!user) return null;

  const { percent, todo } = completion(user);
  const myListings = listings.filter((l) => l.mentorId === user.id);
  const incoming = requests.filter((r) => r.toId === user.id && r.status === "pending");
  const upcoming = requests
    .filter((r) => (r.toId === user.id || r.fromId === user.id) && r.status === "accepted")
    .sort((a, b) => a.proposedAt.localeCompare(b.proposedAt));
  const isMentor = user.roles.includes("mentor");
  const isLearner = user.roles.includes("learner");
  const recommended = users
    .filter((u) => u.roles.includes("mentor") && u.id !== user.id)
    .map((m) => scoreMentor(user, m))
    .filter((m) => m.matchedSkills.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={user.name} size="lg" />
        <div>
          <p className="font-bold uppercase tracking-widest text-warm-700 text-sm">Your home base</p>
          <h1 className="text-4xl font-bold">Hello, {user.name.split(" ")[0]}</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-1" aria-labelledby="completion">
          <h2 id="completion" className="text-xl font-bold">
            Profile {percent}% complete
          </h2>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-100" aria-hidden="true">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
          </div>
          {todo.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {todo.slice(0, 3).map((t) => (
                <li key={t.label}>○ {t.label}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4">Your profile is ready for others to see.</p>
          )}
          <Link to={user.skills.length ? "/profile" : "/profile/create"} className="btn-secondary mt-4 w-full">
            {user.skills.length ? "Edit profile" : "Create my skills profile"}
          </Link>
        </section>

        <section className="card lg:col-span-2" aria-labelledby="todo">
          <div className="flex items-center justify-between">
            <h2 id="todo" className="text-xl font-bold">
              Requests waiting for you
            </h2>
            <Link to="/requests" className="font-bold text-brand-700 underline">
              All requests
            </Link>
          </div>
          {incoming.length === 0 ? (
            <p className="mt-3 text-ink/70">Nothing waiting right now.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {incoming.slice(0, 2).map((r) => (
                <RequestItem key={r.id} req={r} incoming users={users} listings={listings} />
              ))}
            </ul>
          )}
          <h3 className="mt-6 text-lg font-bold">Upcoming sessions</h3>
          {upcoming.length === 0 ? (
            <p className="text-ink/70">No sessions booked yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-brand-100">
              {upcoming.slice(0, 4).map((r) => {
                const other = users.find((u) => u.id === (r.toId === user.id ? r.fromId : r.toId));
                const l = listings.find((x) => x.id === r.listingId);
                return (
                  <li key={r.id} className="py-2">
                    <strong>{formatWhen(r.proposedAt)}</strong> · {l?.title ?? `Buddy help: ${r.topic}`} with {other?.name}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {isMentor && (
          <section className="card" aria-labelledby="earn">
            <h2 id="earn" className="text-xl font-bold">
              Earn from your experience
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link to="/careers" className="rounded-xl bg-brand-50 p-4 hover:bg-brand-100">
                <span className="block font-bold text-brand-900">SkillBridge careers →</span>
                <span className="text-sm">Roles that value what you know</span>
              </Link>
              <Link to="/marketplace?create=1" className="rounded-xl bg-warm-100 p-4 hover:bg-warm-50">
                <span className="block font-bold text-brand-900">Create a paid offer →</span>
                <span className="text-sm">Set your own fair price</span>
              </Link>
            </div>
            <h3 className="mt-5 font-bold">Your offers</h3>
            {myListings.length === 0 ? (
              <p className="text-ink/70">You haven't published any offers yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-brand-100">
                {myListings.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-2">
                    <span>
                      <strong>{l.title}</strong> · {formatPrice(l.price)} / {l.durationMins} min
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
            <h2 id="mentors-for-you" className="text-xl font-bold">
              Recommended mentors
            </h2>
            {recommended.length === 0 && user.wantToLearn.length > 0 ? (
              <p className="mt-2 text-ink/70">
                No close matches for {user.wantToLearn.join(", ")} yet.{" "}
                <Link to="/mentors" className="font-bold underline">Browse all mentors</Link>
              </p>
            ) : recommended.length === 0 ? (
              <p className="mt-2 text-ink/70">
                Add things you'd like to learn on <Link to="/profile" className="font-bold underline">your profile</Link> to see
                matches.
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

        <section className="card" aria-labelledby="learn-support">
          <h2 id="learn-support" className="text-xl font-bold">
            Learning support, your way
          </h2>
          <p className="mt-1 text-ink/75">Use either, both, or neither. It's your choice.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link to="/learn/ai" className="rounded-xl bg-violet-50 p-4 hover:bg-violet-100">
              <span className="block font-bold text-brand-900">💬 Learn with AI →</span>
              <span className="text-sm">Step by step, at your pace</span>
            </Link>
            <Link to="/learn/buddies" className="rounded-xl bg-warm-100 p-4 hover:bg-warm-50">
              <span className="block font-bold text-brand-900">🤝 Learn with a human →</span>
              <span className="text-sm">A patient digital buddy</span>
            </Link>
          </div>
        </section>
      </div>

      <p className="mt-10 text-center text-sm text-ink/60">
        Demo tools:{" "}
        <button className="underline" onClick={() => resetDemo()}>
          reset all demo data
        </button>
      </p>
    </div>
  );
}
