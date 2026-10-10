import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { MatchPerson } from "../../shared/types";
import { OpportunityCard, WorkTabs } from "../components/opportunity";
import { EmptyState, PageHeader } from "../components/ui";
import { useAuth } from "../lib/auth";
import { OPP_TYPE_LABEL, fitCheck } from "../lib/comfort";
import { getApplications, getOpportunities } from "../lib/store";
import type { Opportunity } from "../lib/types";
import { toSeeker, useAiRank } from "../lib/useAiMatches";
import { useStore } from "../lib/useStore";

const STATUS_LABEL = { submitted: "Applied", reviewing: "Being reviewed", invited: "Invited to talk", closed: "Closed" } as const;

export default function Opportunities() {
  const { user } = useAuth();
  const all = useStore(getOpportunities, []);
  const applications = useStore(getApplications, []);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"any" | Opportunity["type"]>("any");
  const [setting, setSetting] = useState<"any" | Opportunity["setting"]>("any");
  // Follows the person's saved preference until they change the checkbox themselves.
  const [gentleChoice, setGentle] = useState<boolean | null>(null);
  const gentle = gentleChoice ?? Boolean(user?.workComfort?.avoidHeavyLifting);

  const open = useMemo(() => all.filter((o) => o.status === "open"), [all]);
  const items: MatchPerson[] = useMemo(
    () =>
      open.map((o) => ({
        id: o.id,
        name: `${o.title} at ${o.orgName}`,
        offers: [o.title, ...o.responsibilities, o.qualificationsRequired].filter(Boolean),
        about: `${o.summary} Physical: ${o.physical.notes || "not stated"}. ${o.hoursPerWeek}.`,
        location: o.location,
        format: o.setting,
        wantsToLearn: [],
      })),
    [open],
  );
  const seeker = useMemo(() => (user?.roles.includes("employer") ? undefined : toSeeker(user)), [user]);
  const ai = useAiRank("opportunity", seeker, items, query);

  const mine = (id: string) => applications.find((a) => a.opportunityId === id && a.workerId === user?.id);
  const q = query.trim().toLowerCase();

  let list = open.filter(
    (o) =>
      (type === "any" || o.type === type) &&
      (setting === "any" || o.setting === setting) &&
      (!gentle || o.physical.heavyLifting === "none" || o.physical.heavyLifting === "unspecified"),
  );
  const aiById = new Map((ai.results ?? []).map((r) => [r.id, r]));
  if (ai.results) {
    list = list
      .filter((o) => !q || aiById.has(o.id))
      .sort((a, b) => (aiById.get(b.id)?.score ?? 0) - (aiById.get(a.id)?.score ?? 0));
  } else if (q) {
    list = list.filter((o) => [o.title, o.summary, o.orgName, ...o.responsibilities].some((t) => t.toLowerCase().includes(q)));
  }

  return (
    <>
      <PageHeader eyebrow="Work" title="Paid opportunities that value experience">
        Mentoring, training, advisory and consulting roles posted by organisations. Every listing shows pay, duties and
        physical requirements up front, or tells you clearly when they're missing.
      </PageHeader>
      <WorkTabs />
      <div className="container-page py-8">
        <div className="notice mb-6">
          <strong>Demo listings:</strong> the organisations and opportunities here are fictional examples for this prototype.
          None are verified or live jobs.
        </div>

        <form role="search" onSubmit={(e) => e.preventDefault()} className="card grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label htmlFor="oq" className="label">
              What kind of work are you looking for?
            </label>
            <input
              id="oq"
              type="search"
              className="input"
              placeholder="In your own words, e.g. teaching young people woodwork, part-time"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="otype" className="label">
              Type
            </label>
            <select id="otype" className="input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="any">Any</option>
              {Object.entries(OPP_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="oset" className="label">
              Where
            </label>
            <select id="oset" className="input" value={setting} onChange={(e) => setSetting(e.target.value as typeof setting)}>
              <option value="any">Anywhere</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
          </div>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 font-bold md:col-span-3">
            <input type="checkbox" className="h-5 w-5 accent-brand-700" checked={gentle} onChange={(e) => setGentle(e.target.checked)} />
            Hide roles that list occasional or regular heavy lifting
          </label>
        </form>

        <p aria-live="polite" className="mt-3 flex min-h-[1.75rem] items-center gap-2 text-sm text-ink/70">
          {ai.active && ai.loading && (
            <>
              <Sparkles aria-hidden="true" className="h-4 w-4 animate-pulse text-violet-600" /> Finding roles that use your experience…
            </>
          )}
          {ai.active && !ai.loading && ai.results && (
            <>
              <Sparkles aria-hidden="true" className="h-4 w-4 text-violet-600" /> Ordered by AI using {q ? "what you typed" : "your skills and preferences"}. Please read each listing yourself.
            </>
          )}
        </p>

        {!user && (
          <p className="mb-4 text-ink/75">
            <Link to="/signup" className="font-bold text-brand-700 underline">
              Join free
            </Link>{" "}
            to apply and to see how each role compares with your preferences.
          </p>
        )}

        {list.length === 0 ? (
          <EmptyState title={ai.loading ? "Looking…" : "No opportunities match that yet"}>
            {!ai.loading && "Try different words or remove a filter."}
          </EmptyState>
        ) : (
          <ul className="mt-2 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((o) => {
              const app = mine(o.id);
              const reasons = aiById.get(o.id)?.reasons ?? [];
              return (
                <li key={o.id} className="flex flex-col gap-2">
                  <OpportunityCard opp={o} comfort={user?.workComfort} applied={app ? STATUS_LABEL[app.status] : undefined} />
                  {reasons.length > 0 && (
                    <p className="px-2 text-sm text-violet-900">
                      <Sparkles aria-hidden="true" className="mr-1 inline h-4 w-4" />
                      {reasons.join(" · ")}
                    </p>
                  )}
                  {fitCheck(user?.workComfort, o).verdict === "unclear" && (
                    <p className="px-2 text-xs text-ink/60">Some physical details aren't stated. Ask before accepting.</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
