import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, Clock, MapPin, Wallet } from "lucide-react";
import { ApplyDialog, FitPanel, IllustrativeBadge, KnowBeforeYouAccept } from "../components/opportunity";
import { EmptyState } from "../components/ui";
import { useAuth } from "../lib/auth";
import { OPP_TYPE_LABEL, fitCheck, payLabel } from "../lib/comfort";
import { createApplication, getApplications, getOpportunities, getUsers } from "../lib/store";
import { useStore } from "../lib/useStore";

const POSTURE = { sitting: "Mostly sitting", standing: "Mostly standing", mix: "A mix of sitting and standing", unspecified: "Not stated", "": "Not stated" };
const LIFTING = { none: "No routine heavy lifting", occasional: "Occasional lifting", regular: "Regular heavy lifting", unspecified: "Not stated" };
const STATUS_TEXT = {
  submitted: "You've applied. The organisation hasn't replied yet.",
  reviewing: "The organisation is reviewing your application.",
  invited: "You've been invited to talk about this role.",
  closed: "This application is closed.",
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const opportunities = useStore(getOpportunities, []);
  const applications = useStore(getApplications, []);
  const users = useStore(getUsers, []);
  const [applying, setApplying] = useState(false);
  const opp = opportunities.find((o) => o.id === id);

  if (!opportunities.length) return <p className="container-page py-16">Loading…</p>;
  if (!opp) {
    return (
      <div className="container-page py-16">
        <EmptyState title="We couldn't find this opportunity">
          <Link to="/opportunities" className="btn-primary mt-4">
            See all opportunities
          </Link>
        </EmptyState>
      </div>
    );
  }

  const employer = users.find((u) => u.id === opp.employerId);
  const app = applications.find((a) => a.opportunityId === opp.id && a.workerId === user?.id);
  const isEmployer = user?.id === opp.employerId;
  const wc = user?.workComfort;
  const hasPrefs = Boolean(wc && (wc.posture || wc.avoidHeavyLifting !== null || wc.setting || wc.hoursPerWeek));

  function startApply() {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setApplying(true);
  }

  return (
    <div className="container-page py-10">
      <Link to="/opportunities" className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All opportunities
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-warm-100 text-warm-700">{OPP_TYPE_LABEL[opp.type]}</span>
            {opp.isDemo && <IllustrativeBadge />}
            {opp.status === "closed" && <span className="badge bg-gray-200 text-gray-700">Closed</span>}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{opp.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-lg text-ink/80">
            <Building2 aria-hidden="true" className="h-5 w-5" /> {opp.orgName}
            <span className="text-sm text-ink/60">· Not verified</span>
          </p>
          <p className="mt-5 text-xl leading-relaxed">{opp.summary}</p>

          <dl className="mt-6 grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <Wallet aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-600" />
              <div>
                <dt className="text-sm text-ink/60">Pay</dt>
                <dd className="text-2xl font-bold text-brand-900">{payLabel(opp.pay)}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-600" />
              <div>
                <dt className="text-sm text-ink/60">Time</dt>
                <dd className="font-bold">{opp.hoursPerWeek || "Not stated"}</dd>
                {opp.schedule && <dd className="text-sm">{opp.schedule}</dd>}
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-600" />
              <div>
                <dt className="text-sm text-ink/60">Where</dt>
                <dd className="font-bold capitalize">{opp.setting}</dd>
                <dd className="text-sm">{opp.location}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarDays aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-600" />
              <div>
                <dt className="text-sm text-ink/60">How long</dt>
                <dd className="font-bold">{opp.duration || "Not stated"}</dd>
              </div>
            </div>
          </dl>

          <section className="mt-8">
            <h2 className="text-2xl font-bold">What you'd do</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-lg">
              {opp.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold">Physical duties</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-brand-50 p-4">
                <dt className="text-sm text-ink/60">Sitting or standing</dt>
                <dd className="font-bold">{POSTURE[opp.physical.posture]}</dd>
              </div>
              <div className="rounded-2xl bg-brand-50 p-4">
                <dt className="text-sm text-ink/60">Lifting</dt>
                <dd className="font-bold">{LIFTING[opp.physical.heavyLifting]}</dd>
              </div>
            </dl>
            <p className="mt-3">{opp.physical.notes || "The organisation hasn't described the physical side of this role yet."}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold">Qualifications</h2>
            <p className="mt-2">
              <strong>Required:</strong> {opp.qualificationsRequired || "Not stated"}
            </p>
            {opp.qualificationsMaybe && (
              <p className="mt-1">
                <strong>May also be needed:</strong> {opp.qualificationsMaybe}
              </p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold">Payment & notice</h2>
            <p className="mt-2">
              <strong>Payment:</strong> {opp.paymentTerms || "Not stated. Ask before accepting."}
            </p>
            <p className="mt-1">
              <strong>Cancellation / notice:</strong> {opp.cancellationTerms || "Not stated. Ask before accepting."}
            </p>
          </section>

          {employer?.org && (
            <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-5">
              <h2 className="text-lg font-bold">About {employer.org.name}</h2>
              <p className="mt-1 text-ink/80">{employer.org.about}</p>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card">
            {isEmployer ? (
              <>
                <p className="font-bold">This is your listing.</p>
                <Link to="/employer" className="btn-primary mt-3 w-full">
                  Manage in employer portal
                </Link>
              </>
            ) : app ? (
              <>
                <p className="font-bold text-brand-900">{STATUS_TEXT[app.status]}</p>
                <Link to="/requests?tab=work" className="btn-secondary mt-3 w-full">
                  See my applications
                </Link>
              </>
            ) : opp.status === "closed" ? (
              <p className="font-bold">This opportunity is closed.</p>
            ) : (
              <>
                <p className="text-ink/80">Interested? Send a short note. Applying doesn't commit you to anything.</p>
                <button className="btn-primary mt-3 w-full text-lg" onClick={startApply}>
                  Apply or ask a question
                </button>
                <Link to="/learn/buddies" className="btn-ghost mt-2 w-full">
                  I'd like someone to help me apply
                </Link>
              </>
            )}
          </div>
          {user && !isEmployer && <FitPanel fit={fitCheck(wc, opp)} hasPrefs={hasPrefs} />}
          <KnowBeforeYouAccept opp={opp} />
        </aside>
      </div>

      {user && (
        <ApplyDialog
          open={applying}
          title={`Apply: ${opp.title}`}
          intro={`${opp.orgName} will see this message along with your public profile.`}
          submitLabel="Send application"
          onClose={() => setApplying(false)}
          onSubmit={async (message, helperRequested) => {
            await createApplication({
              opportunityId: opp.id,
              workerId: user.id,
              employerId: opp.employerId,
              initiatedBy: "worker",
              message,
              helperRequested,
            });
          }}
        />
      )}
    </div>
  );
}
