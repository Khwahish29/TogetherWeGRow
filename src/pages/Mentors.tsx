import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MentorCard } from "../components/cards";
import { EmptyState, PageHeader } from "../components/ui";
import { useAuth } from "../lib/auth";
import { scoreMentor, skillsOverlap } from "../lib/matching";
import { getListings, getThanks, getUsers } from "../lib/store";
import type { Format } from "../lib/types";
import { useStore } from "../lib/useStore";

export default function Mentors() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const thanks = useStore(getThanks, []);
  const thanksFor = (id: string) => thanks.filter((t) => t.toId === id).length;
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<"any" | Format>("any");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const mentors = useMemo(() => users.filter((u) => u.roles.includes("mentor") && u.id !== user?.id && u.skills.length > 0), [users, user]);

  const lowestPrice = (mentorId: string) => {
    const prices = listings.filter((l) => l.mentorId === mentorId).map((l) => l.price);
    return prices.length ? Math.min(...prices) : null;
  };

  const filtered = mentors
    .filter((m) => {
      const q = query.trim();
      if (q && ![...m.skills, ...m.industries, m.name, m.bio].some((s) => skillsOverlap(s, q) || s.toLowerCase().includes(q.toLowerCase())))
        return false;
      if (format !== "any" && m.format !== "both" && m.format !== format) return false;
      if (maxPrice !== "") {
        const p = lowestPrice(m.id);
        if (p === null || p > maxPrice) return false;
      }
      return true;
    })
    .map((m) => scoreMentor(user, m))
    .sort((a, b) => b.score - a.score);

  const canMatch = Boolean(user && user.wantToLearn.length > 0);
  const bestMatches = canMatch ? filtered.filter((m) => m.matchedSkills.length > 0).slice(0, 3) : [];
  const rest = filtered.filter((m) => !bestMatches.includes(m));

  return (
    <>
      <PageHeader eyebrow="Find mentors" title="Learn from people who've done it for decades">
        Practical knowledge you can't get from a textbook: craft, trade, business, and life on the job.
      </PageHeader>
      <div className="container-page py-10">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="card grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label htmlFor="q" className="label">
              What do you want to learn?
            </label>
            <input
              id="q"
              type="search"
              className="input"
              placeholder="e.g. woodworking, bookkeeping, cooking"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="fmt" className="label">
              Format
            </label>
            <select id="fmt" className="input" value={format} onChange={(e) => setFormat(e.target.value as "any" | Format)}>
              <option value="any">Any</option>
              <option value="online">Online</option>
              <option value="in-person">In person</option>
            </select>
          </div>
          <div>
            <label htmlFor="price" className="label">
              Max price per session
            </label>
            <select
              id="price"
              className="input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Any</option>
              <option value="25">Up to $25</option>
              <option value="30">Up to $30</option>
              <option value="40">Up to $40</option>
            </select>
          </div>
        </form>

        {!canMatch && (
          <p className="notice mt-6">
            {user ? (
              <>
                Add things you'd like to learn to <Link to="/profile" className="font-bold underline">your profile</Link> and
                we'll show your best matches first.
              </>
            ) : (
              <>
                <Link to="/signup?role=learner" className="font-bold underline">Join free</Link> and tell us what you'd like
                to learn to see your best matches.
              </>
            )}
          </p>
        )}

        {bestMatches.length > 0 && (
          <section aria-labelledby="best" className="mt-10">
            <h2 id="best" className="text-2xl font-bold">
              Best matches for you
            </h2>
            <p className="text-ink/70">Based on what you want to learn: {user!.wantToLearn.join(", ")}</p>
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bestMatches.map((m) => (
                <MentorCard key={m.mentor.id} match={m} showScore thanksCount={thanksFor(m.mentor.id)} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="all" className="mt-10">
          <h2 id="all" className="text-2xl font-bold">
            {bestMatches.length ? "More mentors" : "All mentors"}{" "}
            <span className="text-base font-normal text-ink/60">({rest.length})</span>
          </h2>
          {rest.length === 0 && bestMatches.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No mentors match those filters yet">Try a broader search or remove a filter.</EmptyState>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((m) => (
                <MentorCard key={m.mentor.id} match={m} showScore={canMatch} thanksCount={thanksFor(m.mentor.id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
