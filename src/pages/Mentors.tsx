import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { MentorCard } from "../components/cards";
import { EmptyState, PageHeader, PeopleTabs } from "../components/ui";
import { useAuth } from "../lib/auth";
import { languageFit, scoreMentor, skillsOverlap, type MentorMatch } from "../lib/matching";
import { getListings, getThanks, getUsers } from "../lib/store";
import type { Format } from "../lib/types";
import { useAiMatches } from "../lib/useAiMatches";
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
  const ai = useAiMatches("mentor", user, mentors, query);

  const lowestPrice = (mentorId: string) => {
    const prices = listings.filter((l) => l.mentorId === mentorId).map((l) => l.price);
    return prices.length ? Math.min(...prices) : null;
  };

  // Plain filters the person chose (format, price) stay as simple filters.
  const eligible = mentors.filter((m) => {
    if (format !== "any" && m.format !== "both" && m.format !== format) return false;
    if (maxPrice !== "") {
      const p = lowestPrice(m.id);
      if (p === null || p > maxPrice) return false;
    }
    return true;
  });

  const q = query.trim();
  let matches: MentorMatch[];
  if (ai.results) {
    // AI decides who fits the search / what the person wants to learn.
    const byId = new Map(ai.results.map((r) => [r.id, r]));
    matches = eligible
      .map((m) => {
        const r = byId.get(m.id);
        const base = r?.score ?? 0;
        // A shared language nudges people up the list; no shared language nudges them down.
        const fit = languageFit(user, m);
        const score = base > 0 && user ? Math.max(0, Math.min(100, base + (fit.shared.length ? 8 : -8))) : base;
        const reasons = r?.reasons ?? [];
        return { mentor: m, score, matchedSkills: r?.matched ?? [], reasons, language: fit };
      })
      .filter((m) => !q || m.score > 0)
      .sort((a, b) => b.score - a.score);
  } else {
    // AI unavailable or still thinking: simple keyword matching so the page is never empty.
    matches = eligible
      .filter((m) => !q || [...m.skills, ...m.industries, m.name, m.bio].some((s) => skillsOverlap(s, q) || s.toLowerCase().includes(q.toLowerCase())))
      .map((m) => scoreMentor(user, m))
      .sort((a, b) => b.score - a.score);
  }

  const hasNeed = Boolean(q || user?.wantToLearn.length);
  const best = hasNeed ? matches.filter((m) => m.matchedSkills.length > 0 || (ai.results && m.score >= 50)).slice(0, q ? 6 : 3) : [];
  const rest = matches.filter((m) => !best.includes(m));
  const bestTitle = q ? `Best matches for “${q}”` : "Best matches for you";

  return (
    <>
      <PageHeader eyebrow="Find mentors" title="Learn from people who've done it for decades">
        Practical knowledge you can't get from a textbook: craft, trade, business, and life on the job.
      </PageHeader>
      <PeopleTabs />
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
              placeholder="Describe it in your own words, e.g. fix my old car, start a small bakery"
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

        <p aria-live="polite" className="mt-3 flex min-h-[1.75rem] items-center gap-2 text-sm text-ink/70">
          {ai.active && ai.loading && (
            <>
              <Sparkles aria-hidden="true" className="h-4 w-4 animate-pulse text-brand-600" /> Finding the best people for you…
            </>
          )}
          {ai.active && !ai.loading && ai.results && (
            <>
              <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-600" /> How matching works: AI compares what you want to learn
              with what each mentor teaches. "Strong match" is a suggestion, not a score. Please read profiles yourself.
            </>
          )}
        </p>

        {!user?.wantToLearn.length && !q && (
          <p className="notice mt-3">
            {user ? (
              <>
                Type what you'd like to learn above, or add it to <Link to="/profile" className="font-bold underline">your profile</Link>{" "}
                and we'll show your best matches first.
              </>
            ) : (
              <>
                Type what you'd like to learn above, or <Link to="/signup?role=learner" className="font-bold underline">join free</Link>{" "}
                to save it.
              </>
            )}
          </p>
        )}

        {best.length > 0 && (
          <section aria-labelledby="best" className="mt-8">
            <h2 id="best" className="text-2xl font-bold">
              {bestTitle}
            </h2>
            {!q && <p className="text-ink/70">Based on what you want to learn: {user!.wantToLearn.join(", ")}</p>}
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {best.map((m) => (
                <MentorCard key={m.mentor.id} match={m} showScore thanksCount={thanksFor(m.mentor.id)} fromPrice={lowestPrice(m.mentor.id)} />
              ))}
            </div>
          </section>
        )}

        {!(q && best.length > 0 && rest.length === 0) && (
          <section aria-labelledby="all" className="mt-10">
            <h2 id="all" className="text-2xl font-bold">
              {best.length ? (q ? "Other possible matches" : "More mentors") : "All mentors"}{" "}
              <span className="text-base font-normal text-ink/60">({rest.length})</span>
            </h2>
            {rest.length === 0 && best.length === 0 ? (
              <div className="mt-4">
                <EmptyState title={ai.loading ? "Looking…" : "No mentors match that yet"}>
                  {!ai.loading && "Try describing it differently, or remove a filter."}
                </EmptyState>
              </div>
            ) : (
              <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((m) => (
                  <MentorCard key={m.mentor.id} match={m} showScore={hasNeed} thanksCount={thanksFor(m.mentor.id)} fromPrice={lowestPrice(m.mentor.id)} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
