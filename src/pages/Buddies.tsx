import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { RequestDialog } from "../components/RequestDialog";
import { Avatar, EmptyState, FormatBadge, PageHeader, PricingBadge } from "../components/ui";
import { useAuth } from "../lib/auth";
import { LanguageBadges } from "../components/LanguageBadges";
import { scoreBuddy, skillsOverlap } from "../lib/matching";
import { createRequest, getUsers } from "../lib/store";
import type { BuddyPricing, User } from "../lib/types";
import { useStore } from "../lib/useStore";
import { useAiMatches } from "../lib/useAiMatches";

const TOPICS = ["Video meetings", "Email", "Smartphones", "Chat assistants", "Online safety", "Résumés", "Online job applications"];

export default function Buddies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const users = useStore(getUsers, []);
  const [params] = useSearchParams();
  const [topic, setTopic] = useState(params.get("need") ?? "");
  const [pricing, setPricing] = useState<"any" | BuddyPricing>("any");
  const [selected, setSelected] = useState<User | null>(null);

  const all = useMemo(
    () => users.filter((u) => u.buddy && u.roles.includes("buddy") && u.id !== user?.id),
    [users, user],
  );
  // Only the typed need is used here (not the profile), so the AI answers exactly what was asked.
  const ai = useAiMatches("buddy", null, all, topic);
  const byPricing = all.filter((u) => pricing === "any" || u.buddy!.pricing === pricing);
  const q = topic.trim();
  const byLanguage = (list: User[]) =>
    user ? [...list].sort((a, b) => scoreBuddy(user, b).score - scoreBuddy(user, a).score) : list;
  const buddies = !q
    ? byLanguage(byPricing)
    : ai.results
      ? ai.results.flatMap((r) => byPricing.filter((b) => b.id === r.id))
      : byLanguage(byPricing).filter((u) => u.buddy!.topics.some((t) => skillsOverlap(t, q) || t.toLowerCase().includes(q.toLowerCase())));
  const reasonsFor = (id: string) => (q ? (ai.results?.find((r) => r.id === id)?.reasons ?? []) : []);

  function request(buddy: User) {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setSelected(buddy);
  }

  return (
    <>
      <PageHeader eyebrow="Learn with a person" title="Friendly digital buddies">
        Patient helpers who are happy to explain technology at your pace. Every buddy shows clearly whether their help is
        free, volunteer-based, or paid.
      </PageHeader>
      <div className="container-page py-10">
        <div className="card grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="topic" className="label">
              What would you like help with?
            </label>
            <input
              id="topic"
              type="search"
              className="input"
              placeholder="In your own words, e.g. video calling my grandchildren"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button key={t} type="button" className="chip border border-brand-200 bg-white hover:border-brand-600 hover:bg-brand-50" onClick={() => setTopic(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="pricing" className="label">
              Type of help
            </label>
            <select id="pricing" className="input" value={pricing} onChange={(e) => setPricing(e.target.value as "any" | BuddyPricing)}>
              <option value="any">Any</option>
              <option value="free">Free</option>
              <option value="volunteer">Volunteer</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <p aria-live="polite" className="mt-3 flex min-h-[1.75rem] items-center gap-2 text-sm text-muted">
          {q && ai.loading && (
            <>
              <Sparkles aria-hidden="true" className="h-4 w-4 animate-pulse text-brand-600" /> Finding someone who can help…
            </>
          )}
          {q && !ai.loading && ai.results && (
            <>
              <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-600" /> Matched to what you described.
            </>
          )}
        </p>

        <p className="notice mt-3">
          You're never expected to give anything in return. If you'd like to share your own skills with a buddy, that's
          entirely your choice.
        </p>

        {buddies.length === 0 ? (
          <div className="mt-8">
            <EmptyState title={q && ai.loading ? "Looking…" : "No buddies match right now"}>
              {!(q && ai.loading) && "Try describing it differently, or try the step-by-step guide instead."}
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {buddies.map((b) => (
              <li key={b.id} className="card flex flex-col">
                <div className="flex items-center gap-4">
                  <Avatar name={b.name} />
                  <div>
                    <h2 className="text-xl font-bold">{b.name}</h2>
                    <p className="text-sm text-muted">{b.location}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PricingBadge pricing={b.buddy!.pricing} rate={b.buddy!.rate} />
                  <FormatBadge format={b.buddy!.mode} />
                  <LanguageBadges person={b} viewer={user} />
                </div>
                {reasonsFor(b.id).length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                    {reasonsFor(b.id).map((r) => (
                      <li key={r}>✓ {r}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-ink/80">{b.bio}</p>
                <p className="mt-3 text-sm font-bold text-brand-900">Can help with</p>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {b.buddy!.topics.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">
                  <strong>Available:</strong> {b.buddy!.availability || "Ask for times"}
                </p>
                <div className="mt-auto pt-5">
                  <button className="btn-primary w-full" onClick={() => request(b)}>
                    Request help
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-muted">
          Would you rather learn privately first?{" "}
          <Link to="/learn/ai" className="font-bold text-brand-700 underline">
            Try the step-by-step guide
          </Link>
          .
        </p>
      </div>

      <RequestDialog
        open={selected !== null}
        title={`Ask ${selected?.name.split(" ")[0]} for help`}
        submitLabel="Send request"
        messagePlaceholder="e.g. I'd like help joining a video call with my family."
        onClose={() => setSelected(null)}
        bridge={user && selected ? { viewer: user, person: selected } : undefined}
        summary={
          selected?.buddy && (
            <>
              <p className="font-bold text-brand-900">{selected.name}</p>
              <p className="text-sm">{selected.buddy.topics.join(", ")}</p>
              <div className="mt-2">
                <PricingBadge pricing={selected.buddy.pricing} rate={selected.buddy.rate} />
              </div>
              {selected.buddy.pricing === "paid" ? (
                <p className="mt-1 text-sm text-muted">This buddy charges for their time. You'll agree the cost before meeting.</p>
              ) : (
                <p className="mt-1 text-sm text-muted">This help is free of charge.</p>
              )}
            </>
          )
        }
        onSubmit={async ({ message, proposedAt }) => {
          if (!user || !selected) return;
          await createRequest({
            kind: "buddy",
            fromId: user.id,
            toId: selected.id,
            topic: q || selected.buddy?.topics[0],
            message,
            proposedAt,
          });
        }}
      />
    </>
  );
}
