import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RequestDialog } from "../components/RequestDialog";
import { Avatar, EmptyState, FormatBadge, PageHeader, PricingBadge } from "../components/ui";
import { useAuth } from "../lib/auth";
import { skillsOverlap } from "../lib/matching";
import { createRequest, getUsers } from "../lib/store";
import type { BuddyPricing, User } from "../lib/types";
import { useStore } from "../lib/useStore";

const TOPICS = ["Video meetings", "Email", "Smartphones", "AI tools", "Online safety", "Résumés", "Online job applications"];

export default function Buddies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const users = useStore(getUsers, []);
  const [topic, setTopic] = useState("");
  const [pricing, setPricing] = useState<"any" | BuddyPricing>("any");
  const [selected, setSelected] = useState<User | null>(null);

  const buddies = users.filter(
    (u) =>
      u.buddy &&
      u.roles.includes("buddy") &&
      u.id !== user?.id &&
      (!topic || u.buddy.topics.some((t) => skillsOverlap(t, topic))) &&
      (pricing === "any" || u.buddy.pricing === pricing),
  );

  function request(buddy: User) {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setSelected(buddy);
  }

  return (
    <>
      <PageHeader eyebrow="Learn with a human" title="Friendly digital buddies">
        Patient helpers who are happy to explain technology at your pace. Every buddy shows clearly whether their help is
        free, volunteer-based, or paid.
      </PageHeader>
      <div className="container-page py-10">
        <div className="card grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="topic" className="label">
              What would you like help with?
            </label>
            <select id="topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">Anything</option>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
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

        <p className="notice mt-6">
          You're never expected to give anything in return. If you'd like to share your own skills with a buddy, that's
          entirely your choice.
        </p>

        {buddies.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No buddies match right now">Try a different topic, or ask our AI companion instead.</EmptyState>
          </div>
        ) : (
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {buddies.map((b) => (
              <li key={b.id} className="card flex flex-col">
                <div className="flex items-center gap-4">
                  <Avatar name={b.name} />
                  <div>
                    <h2 className="text-xl font-bold">{b.name}</h2>
                    <p className="text-sm text-ink/70">{b.location}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PricingBadge pricing={b.buddy!.pricing} rate={b.buddy!.rate} />
                  <FormatBadge format={b.buddy!.mode} />
                </div>
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

        <p className="mt-10 text-ink/75">
          Would you rather learn privately first?{" "}
          <Link to="/learn/ai" className="font-bold text-brand-700 underline">
            Try the AI companion
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
        summary={
          selected?.buddy && (
            <>
              <p className="font-bold text-brand-900">{selected.name}</p>
              <p className="text-sm">{selected.buddy.topics.join(", ")}</p>
              <div className="mt-2">
                <PricingBadge pricing={selected.buddy.pricing} rate={selected.buddy.rate} />
              </div>
              {selected.buddy.pricing === "paid" ? (
                <p className="mt-1 text-sm text-ink/70">This buddy charges for their time. You'll agree the cost before meeting.</p>
              ) : (
                <p className="mt-1 text-sm text-ink/70">This help is free of charge.</p>
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
            topic: topic || selected.buddy?.topics[0],
            message,
            proposedAt,
          });
        }}
      />
    </>
  );
}
