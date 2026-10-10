import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AiSource, CareerRec, CareerType } from "../../shared/types";
import { EmptyState, PageHeader, SourceLabel } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const TYPE_LABEL: Record<CareerType, string> = {
  "paid-mentoring": "Paid mentoring",
  advisory: "Advisory work",
  training: "Training & teaching",
  inspection: "Inspection",
  consulting: "Consulting",
};

const CACHE_KEY = "twg.careers";
// Shares one in-flight request between duplicate effect runs (React StrictMode) and quick revisits.
const inFlight = new Map<string, ReturnType<typeof api.careers>>();

export default function Careers() {
  const { user } = useAuth();
  const [result, setResult] = useState<{ source: AiSource; data: CareerRec[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gentleOnly, setGentleOnly] = useState(
    () => Boolean(user?.workPreferences.some((p) => /physical|lift|strain/i.test(p))),
  );
  const cacheId = user ? `${user.id}:${user.skills.join("|")}:${user.workPreferences.join("|")}` : "";

  async function load(force = false) {
    if (!user || user.skills.length === 0) return;
    if (!force) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null");
        if (cached?.id === cacheId) {
          setResult(cached.result);
          return;
        }
      } catch {
        // ignore cache errors
      }
    }
    setLoading(true);
    setError(null);
    try {
      const key = `${cacheId}:${force ? Date.now() : ""}`;
      if (!inFlight.has(key)) {
        inFlight.set(
          key,
          api
            .careers({
              skills: user.skills,
              yearsExperience: user.yearsExperience,
              workPreferences: user.workPreferences,
              location: user.location,
              interests: user.industries,
            })
            .finally(() => inFlight.delete(key)),
        );
      }
      const res = await inFlight.get(key)!;
      setResult(res);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ id: cacheId, result: res }));
      } catch {
        // ignore
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheId]);

  if (!user) return null;

  return (
    <>
      <PageHeader eyebrow="SkillBridge careers" title="Your experience opens new doors">
        Roles where what you know is the main thing you bring, often with less physical strain. Each one explains why it may
        suit you and what it may take.
      </PageHeader>
      <div className="container-page py-10">
        {user.skills.length === 0 ? (
          <EmptyState title="Add your skills first">
            <p>SkillBridge needs to know what you're good at.</p>
            <Link to="/profile/create" className="btn-primary mt-4">
              Create my skills profile
            </Link>
          </EmptyState>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">Based on:</span>
                {user.skills.slice(0, 6).map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-full border-2 border-brand-200 bg-white px-4 font-bold">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-brand-700"
                  checked={gentleOnly}
                  onChange={(e) => setGentleOnly(e.target.checked)}
                />
                Only show roles that are easy on the body
              </label>
              <button className="btn-ghost" onClick={() => load(true)} disabled={loading}>
                ↻ Suggest again
              </button>
              </div>
            </div>

            <div role="note" className="notice mb-8">
              <strong>Please note:</strong> these are suggestions, not job offers. We can't guarantee a role is physically
              right for you or that you're eligible. Always check the actual requirements and your own circumstances.
            </div>

            <div aria-live="polite" aria-busy={loading}>
              {loading && (
                <div className="grid gap-6 md:grid-cols-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="card h-64 animate-pulse bg-brand-50" />
                  ))}
                  <span className="sr-only">Finding roles that match your experience…</span>
                </div>
              )}
              {error && (
                <p role="alert" className="notice">
                  {error}
                </p>
              )}
              {!loading && result && (
                <>
                  <div className="mb-4">
                    <SourceLabel source={result.source} />
                  </div>
                  {result.data.every((r) => gentleOnly && r.physicalDemand !== "low") && (
                    <p className="notice mb-4">
                      None of these suggestions are low in physical demand. Try "Suggest again", or turn off the filter to
                      see them.
                    </p>
                  )}
                  <ol className="grid gap-6 md:grid-cols-2">
                    {result.data.filter((r) => !gentleOnly || r.physicalDemand === "low").map((rec) => (
                      <li key={rec.title} className="card flex flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge bg-warm-100 text-warm-700">{TYPE_LABEL[rec.type] ?? rec.type}</span>
                          <span
                            className={`badge ${rec.physicalDemand === "low" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                          >
                            {rec.physicalDemand === "low" ? "Usually low physical demand" : "Some physical demand"}
                          </span>
                        </div>
                        <h2 className="mt-3 text-2xl font-bold">{rec.title}</h2>
                        <p className="mt-2 text-lg">{rec.why}</p>
                        <dl className="mt-4 space-y-3 text-[0.95rem]">
                          <div>
                            <dt className="font-bold text-brand-900">Skills that carry over</dt>
                            <dd className="mt-1 flex flex-wrap gap-2">
                              {rec.transferableSkills.map((s) => (
                                <span key={s} className="chip">
                                  {s}
                                </span>
                              ))}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-bold text-brand-900">Qualifications</dt>
                            <dd>{rec.qualificationsNeeded}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-brand-900">Where to look</dt>
                            <dd>{rec.howToFind}</dd>
                          </div>
                        </dl>
                        {rec.type === "paid-mentoring" && (
                          <div className="mt-auto pt-5">
                            <Link to="/marketplace?create=1" className="btn-primary">
                              Create a mentoring offer
                            </Link>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
