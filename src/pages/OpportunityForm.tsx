import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { KnowBeforeYouAccept } from "../components/opportunity";
import { ChipInput, PageHeader } from "../components/ui";
import { useAuth } from "../lib/auth";
import { OPP_TYPE_LABEL, transparency } from "../lib/comfort";
import { getOpportunities, saveOpportunity } from "../lib/store";
import type { Opportunity } from "../lib/types";
import { useStore } from "../lib/useStore";

type Draft = Omit<Opportunity, "id" | "createdAt" | "employerId" | "orgName" | "status">;

const EMPTY: Draft = {
  title: "",
  type: "mentoring",
  summary: "",
  responsibilities: [],
  pay: { amount: 0, unit: "hour" },
  hoursPerWeek: "",
  schedule: "",
  duration: "",
  setting: "on-site",
  location: "",
  physical: { posture: "unspecified", heavyLifting: "unspecified", notes: "" },
  qualificationsRequired: "",
  qualificationsMaybe: "",
  paymentTerms: "",
  cancellationTerms: "",
};

function Form({ initial, existing }: { initial: Draft; existing?: Opportunity }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [d, setD] = useState<Draft>(initial);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const checks = transparency(d);
  const complete = checks.every((c) => c.ok) && d.title.trim() && d.summary.trim() && d.hoursPerWeek.trim();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!complete || !user) return;
    await saveOpportunity({
      ...d,
      id: existing?.id,
      createdAt: existing?.createdAt,
      employerId: user.id,
      orgName: user.org?.name ?? user.name,
      status: existing?.status ?? "open",
    });
    navigate("/employer");
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <fieldset className="card space-y-4">
          <legend className="px-1 font-serif text-xl font-bold text-brand-900">The role</legend>
          <div>
            <label htmlFor="t" className="label">Title</label>
            <input id="t" className="input" required value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Workshop Mentor (Part-Time)" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ty" className="label">Type of work</label>
              <select id="ty" className="input" value={d.type} onChange={(e) => set("type", e.target.value as Draft["type"])}>
                {Object.entries(OPP_TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="se" className="label">Where</label>
              <select id="se" className="input" value={d.setting} onChange={(e) => set("setting", e.target.value as Draft["setting"])}>
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="lo" className="label">Location</label>
            <input id="lo" className="input" value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Portland, or Remote" />
          </div>
          <div>
            <label htmlFor="su" className="label">Short summary</label>
            <textarea id="su" rows={2} className="input" required value={d.summary} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <ChipInput id="resp" label="Responsibilities (add each one)" values={d.responsibilities} onChange={(v) => set("responsibilities", v)} placeholder="e.g. Guide apprentices on their projects" />
        </fieldset>

        <fieldset className="card space-y-4">
          <legend className="px-1 font-serif text-xl font-bold text-brand-900">Pay & time</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pa" className="label">Pay ($)</label>
              <input id="pa" type="number" min={1} className="input" value={d.pay.amount || ""} onChange={(e) => set("pay", { ...d.pay, amount: Number(e.target.value) })} />
            </div>
            <div>
              <label htmlFor="pu" className="label">Per</label>
              <select id="pu" className="input" value={d.pay.unit} onChange={(e) => set("pay", { ...d.pay, unit: e.target.value as Draft["pay"]["unit"] })}>
                <option value="hour">Hour</option>
                <option value="session">Session</option>
                <option value="project">Project</option>
                <option value="month">Month</option>
              </select>
            </div>
            <div>
              <label htmlFor="hw" className="label">Hours</label>
              <input id="hw" className="input" required value={d.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)} placeholder="e.g. 10 hours/week" />
            </div>
            <div>
              <label htmlFor="sc" className="label">Schedule</label>
              <input id="sc" className="input" value={d.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="e.g. Two afternoons a week" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="du" className="label">How long</label>
              <input id="du" className="input" value={d.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. Ongoing, or 6 months" />
            </div>
          </div>
          <div>
            <label htmlFor="pt" className="label">Payment terms</label>
            <input id="pt" className="input" value={d.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} placeholder="e.g. Paid every two weeks by bank transfer" />
          </div>
          <div>
            <label htmlFor="ct" className="label">Cancellation or notice terms</label>
            <input id="ct" className="input" value={d.cancellationTerms} onChange={(e) => set("cancellationTerms", e.target.value)} placeholder="e.g. Two weeks' notice either side" />
          </div>
        </fieldset>

        <fieldset className="card space-y-4">
          <legend className="px-1 font-serif text-xl font-bold text-brand-900">Physical duties</legend>
          <p className="text-sm text-muted">Describe what the job actually involves, so people can decide for themselves.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="po" className="label">Sitting or standing</label>
              <select id="po" className="input" value={d.physical.posture} onChange={(e) => set("physical", { ...d.physical, posture: e.target.value as Draft["physical"]["posture"] })}>
                <option value="unspecified">Choose…</option>
                <option value="sitting">Mostly sitting</option>
                <option value="standing">Mostly standing</option>
                <option value="mix">A mix</option>
              </select>
            </div>
            <div>
              <label htmlFor="hl" className="label">Lifting</label>
              <select id="hl" className="input" value={d.physical.heavyLifting} onChange={(e) => set("physical", { ...d.physical, heavyLifting: e.target.value as Draft["physical"]["heavyLifting"] })}>
                <option value="unspecified">Choose…</option>
                <option value="none">No routine heavy lifting</option>
                <option value="occasional">Occasional lifting</option>
                <option value="regular">Regular heavy lifting</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="pn" className="label">Anything else about the physical side</label>
            <textarea id="pn" rows={2} className="input" value={d.physical.notes} onChange={(e) => set("physical", { ...d.physical, notes: e.target.value })} placeholder="e.g. Seating available; help is available for moving timber." />
          </div>
        </fieldset>

        <fieldset className="card space-y-4">
          <legend className="px-1 font-serif text-xl font-bold text-brand-900">Qualifications</legend>
          <div>
            <label htmlFor="qr" className="label">Required</label>
            <input id="qr" className="input" value={d.qualificationsRequired} onChange={(e) => set("qualificationsRequired", e.target.value)} placeholder="Describe experience, not age. e.g. Substantial carpentry experience" />
          </div>
          <div>
            <label htmlFor="qm" className="label">May also be needed (optional)</label>
            <input id="qm" className="input" value={d.qualificationsMaybe} onChange={(e) => set("qualificationsMaybe", e.target.value)} placeholder="e.g. A teaching credential, which we can help with" />
          </div>
        </fieldset>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <KnowBeforeYouAccept opp={d} />
        {tried && !complete && (
          <p role="alert" className="notice">
            Please complete every item in the checklist, plus a title, summary and hours. Clear pay, duties and terms are
            required before a role can be published.
          </p>
        )}
        <button type="submit" className="btn-primary w-full text-lg">
          {existing ? "Save changes" : "Publish opportunity"}
        </button>
        <p className="text-xs text-muted">
          Roles are shown as "not verified" until we can check organizations.
        </p>
      </aside>
    </form>
  );
}

export default function OpportunityForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const opportunities = useStore(getOpportunities, []);
  const existing = id ? opportunities.find((o) => o.id === id && o.employerId === user?.id) : undefined;

  if (id && !opportunities.length) return <p className="container-page py-16">Loading…</p>;
  if (!user?.roles.includes("employer")) {
    return (
      <div className="container-page py-16">
        <p className="notice">Posting opportunities is for organizations. You can add the organization role when you sign up.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Employer portal" title={existing ? "Edit opportunity" : "Post a paid opportunity"}>
        Describe the skills and experience you need, not the age of the person. Honest details about pay, duties and the
        physical side help the right people say yes.
      </PageHeader>
      <div className="container-page py-8">
        <Link to="/employer" className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to the portal
        </Link>
        <div className="mt-6">
          <Form key={existing?.id ?? "new"} initial={existing ?? EMPTY} existing={existing} />
        </div>
      </div>
    </>
  );
}
