import { Link, useParams } from "react-router-dom";
import { ListingCard } from "../components/cards";
import { LanguageBadges } from "../components/LanguageBadges";
import { useBooking } from "../components/useBooking";
import { Avatar, EmptyState, FormatBadge, PricingBadge } from "../components/ui";
import { useAuth } from "../lib/auth";
import { scoreMentor } from "../lib/matching";
import { getListings, getThanks, getUsers } from "../lib/store";
import { useStore } from "../lib/useStore";
import { useAiMatches } from "../lib/useAiMatches";
import { useMemo } from "react";

export default function MentorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const thanks = useStore(getThanks, []);
  const booking = useBooking(users);
  const person = users.find((u) => u.id === id);
  const single = useMemo(() => (person && person.id !== user?.id ? [person] : []), [person, user]);
  const ai = useAiMatches("mentor", user, single, "");

  if (!users.length) return <p className="container-page py-16">Loading…</p>;
  if (!person) {
    return (
      <div className="container-page py-16">
        <EmptyState title="We couldn't find this person">
          <Link to="/mentors" className="btn-primary mt-4">
            Back to mentors
          </Link>
        </EmptyState>
      </div>
    );
  }

  const isSelf = user?.id === person.id;
  const own = listings.filter((l) => l.mentorId === person.id);
  const local = scoreMentor(user, person);
  const aiResult = ai.results?.find((r) => r.id === person.id);
  const match = ai.results ? { ...local, reasons: aiResult?.reasons ?? [] } : ai.loading ? { ...local, reasons: [] } : local;

  return (
    <div className="container-page py-10">
      <Link to="/mentors" className="font-bold text-brand-700 hover:underline">
        ← All mentors
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={person.name} size="lg" />
            <div>
              <h1 className="text-4xl font-bold">{person.name}</h1>
              <p className="mt-1 text-lg text-ink/75">
                {person.industries[0] ?? "Member"}
                {person.yearsExperience ? ` · ${person.yearsExperience} years' experience` : ""}
                {person.location ? ` · ${person.location}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <FormatBadge format={person.format} />
                <LanguageBadges person={person} viewer={user} />
                {person.isDemo && <span className="badge bg-warm-100 text-warm-800">Demo profile</span>}
              </div>
            </div>
          </div>
          {person.bio && <p className="mt-6 max-w-3xl text-xl leading-relaxed">{person.bio}</p>}

          <section className="mt-10" aria-labelledby="sessions">
            <h2 id="sessions" className="text-2xl font-bold">
              Mentoring sessions
            </h2>
            {own.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No sessions listed yet">
                  {isSelf ? (
                    <Link to="/marketplace?create=1" className="btn-primary mt-3">
                      Create your first offer
                    </Link>
                  ) : (
                    "Check back soon."
                  )}
                </EmptyState>
              </div>
            ) : (
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                {own.map((l) => (
                  <ListingCard key={l.id} listing={l} isOwn={isSelf} onRequest={() => booking.open(l)} />
                ))}
              </div>
            )}
          </section>

          {thanks.some((t) => t.toId === person.id) && (
            <section className="mt-10" aria-labelledby="thanks">
              <h2 id="thanks" className="text-2xl font-bold">
                Notes of thanks
              </h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {thanks
                  .filter((t) => t.toId === person.id)
                  .map((t) => (
                    <li key={t.id} className="rounded-3xl bg-warm-100/70 p-5">
                      <p className="font-serif text-lg leading-relaxed text-brand-900">“{t.message}”</p>
                      <p className="mt-2 text-sm text-ink/70">
                        {users.find((u) => u.id === t.fromId)?.name ?? "A member"}
                        {t.isDemo && <span className="badge ml-2 bg-warm-100 text-warm-800">Fictional example</span>}
                      </p>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          {match.reasons.length > 0 && !isSelf && (
            <div className="rounded-2xl bg-brand-700 p-5 text-white">
              <p className="font-bold">Why you might connect</p>
              <ul className="mt-2 space-y-1 text-brand-50">
                {match.reasons.map((r) => (
                  <li key={r}>✓ {r}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="card">
            <h2 className="text-lg font-bold">Skills</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {person.skills.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            {person.wantToLearn.length > 0 && (
              <>
                <h2 className="mt-5 text-lg font-bold">Currently learning</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {person.wantToLearn.map((s) => (
                    <li key={s} className="chip bg-warm-100 text-warm-700">
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="hint mt-2">Swapping knowledge is always optional, never a condition of a paid session.</p>
              </>
            )}
          </div>
          {person.buddy && (
            <div className="card">
              <h2 className="text-lg font-bold">Also a digital buddy</h2>
              <p className="mt-1 text-sm">{person.buddy.topics.join(", ")}</p>
              <div className="mt-2">
                <PricingBadge pricing={person.buddy.pricing} rate={person.buddy.rate} />
              </div>
            </div>
          )}
        </aside>
      </div>
      {booking.dialog}
    </div>
  );
}
