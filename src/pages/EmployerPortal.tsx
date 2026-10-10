import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CircleUser, HeartHandshake, Pencil, PlusCircle, Search, Sparkles } from "lucide-react";
import { ApplyDialog } from "../components/opportunity";
import { Avatar, EmptyState, PageHeader } from "../components/ui";
import { useAuth } from "../lib/auth";
import { comfortSummary, payLabel } from "../lib/comfort";
import { createApplication, getApplications, getOpportunities, getUsers, saveOpportunity, updateApplication } from "../lib/store";
import type { Application, ApplicationStatus, User } from "../lib/types";
import { matchStrength, useAiMatches } from "../lib/useAiMatches";
import { useStore } from "../lib/useStore";

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  submitted: "bg-warm-100 text-warm-800",
  reviewing: "bg-brand-100 text-brand-800",
  invited: "bg-emerald-100 text-emerald-800",
  closed: "bg-warm-100 text-warm-800",
};
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "New",
  reviewing: "Reviewing",
  invited: "Invited to talk",
  closed: "Closed",
};

function ApplicationRow({ app, worker }: { app: Application; worker?: User }) {
  const set = (status: ApplicationStatus) => updateApplication(app.id, { status });
  return (
    <li className="rounded-2xl border border-brand-100 p-4">
      <div className="flex flex-wrap items-start gap-3">
        {worker && <Avatar name={worker.name} size="sm" />}
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {worker ? (
              <Link to={`/mentors/${worker.id}`} className="underline">
                {worker.name}
              </Link>
            ) : (
              "A member"
            )}{" "}
            <span className={`badge ml-1 ${STATUS_STYLE[app.status]}`}>{STATUS_LABEL[app.status]}</span>
            {app.initiatedBy === "employer" && <span className="badge ml-1 bg-brand-100 text-brand-800">You invited</span>}
          </p>
          {worker && (
            <p className="text-sm text-muted">
              {worker.yearsExperience ? `${worker.yearsExperience} years · ` : ""}
              {worker.skills.slice(0, 3).join(", ")}
            </p>
          )}
          {app.message && <p className="mt-2 rounded-xl bg-brand-50 p-3 text-sm italic">“{app.message}”</p>}
          {app.reply && (
            <p className="mt-2 rounded-xl bg-warm-50 p-3 text-sm">
              <strong>Reply:</strong> {app.reply}
            </p>
          )}
          {app.helperRequested && (
            <p className="mt-2 flex items-center gap-1 text-sm text-muted">
              <HeartHandshake aria-hidden="true" className="h-4 w-4" /> Getting help from a digital buddy. Please be patient with replies.
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {app.status === "submitted" && (
          <button className="btn-secondary min-h-[40px] py-1.5 text-sm" onClick={() => set("reviewing")}>
            Start reviewing
          </button>
        )}
        {(app.status === "submitted" || app.status === "reviewing") && (
          <button className="btn-primary min-h-[40px] py-1.5 text-sm" onClick={() => set("invited")}>
            Invite to talk
          </button>
        )}
        {app.status !== "closed" ? (
          <button className="btn-ghost min-h-[40px] py-1.5 text-sm" onClick={() => set("closed")}>
            Close
          </button>
        ) : (
          <button className="btn-ghost min-h-[40px] py-1.5 text-sm" onClick={() => set("reviewing")}>
            Reopen
          </button>
        )}
      </div>
    </li>
  );
}

export default function EmployerPortal() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const opportunities = useStore(getOpportunities, []);
  const applications = useStore(getApplications, []);
  const [query, setQuery] = useState("");
  const [inviting, setInviting] = useState<User | null>(null);
  const [inviteFor, setInviteFor] = useState("");

  const workers = useMemo(() => users.filter((u) => !u.roles.includes("employer") && u.skills.length > 0 && u.roles.includes("mentor")), [users]);
  const ai = useAiMatches("worker", null, workers, query);

  if (!user) return null;
  if (!user.roles.includes("employer")) {
    return (
      <div className="container-page py-16">
        <h1 className="text-4xl">Employer portal</h1>
        <p className="notice mt-4">
          The employer portal is for organizations that want to offer paid work. You can add the organization role when you sign up.
        </p>
      </div>
    );
  }

  const mine = opportunities.filter((o) => o.employerId === user.id);
  const openMine = mine.filter((o) => o.status === "open");
  const results = ai.results
    ? ai.results.flatMap((r) => {
        const w = workers.find((x) => x.id === r.id);
        return w ? [{ worker: w, ...r }] : [];
      })
    : [];

  return (
    <>
      <PageHeader eyebrow="Employer portal" title={user.org?.name ?? "Your organization"}>
        Post paid mentoring, training and advisory work, and find people with decades of experience.
        <span className="mt-2 block text-base">
          <span className="badge bg-warm-100 text-warm-800">Not verified</span>{" "}
          {user.isDemo && <span className="badge bg-warm-100 text-warm-800">Fictional demo organization</span>}
        </span>
      </PageHeader>

      <div className="container-page space-y-10 py-10">
        <section aria-labelledby="mine">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="mine" className="text-2xl font-bold">
              Your opportunities
            </h2>
            <Link to="/employer/new" className="btn-primary">
              <PlusCircle aria-hidden="true" className="h-5 w-5" /> Post an opportunity
            </Link>
          </div>
          {mine.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="You haven't posted anything yet">Post a role and it will appear here with its applications.</EmptyState>
            </div>
          ) : (
            <ul className="mt-4 space-y-6">
              {mine.map((o) => {
                const apps = applications.filter((a) => a.opportunityId === o.id);
                return (
                  <li key={o.id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">
                          <Link to={`/opportunities/${o.id}`} className="hover:underline">
                            {o.title}
                          </Link>
                        </h3>
                        <p className="text-muted">
                          {payLabel(o.pay)} · {o.hoursPerWeek} · <span className="capitalize">{o.setting}</span>
                          {o.status === "closed" && <span className="badge ml-2 bg-warm-100 text-warm-800">Closed</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/employer/edit/${o.id}`} className="btn-ghost min-h-[40px] px-3 py-1.5 text-sm">
                          <Pencil aria-hidden="true" className="h-4 w-4" /> Edit
                        </Link>
                        <button
                          className="btn-ghost min-h-[40px] px-3 py-1.5 text-sm"
                          onClick={() => saveOpportunity({ ...o, status: o.status === "open" ? "closed" : "open" })}
                        >
                          {o.status === "open" ? "Close listing" : "Reopen listing"}
                        </button>
                      </div>
                    </div>
                    <h4 className="mt-4 font-bold">
                      Applications <span className="font-normal text-muted">({apps.length})</span>
                    </h4>
                    {apps.length === 0 ? (
                      <p className="text-sm text-muted">None yet. You can also invite people below.</p>
                    ) : (
                      <ul className="mt-2 space-y-3">
                        {apps.map((a) => (
                          <ApplicationRow key={a.id} app={a} worker={users.find((u) => u.id === a.workerId)} />
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="find" className="rounded-3xl bg-brand-50 p-6 sm:p-8">
          <h2 id="find" className="flex items-center gap-2 text-2xl font-bold">
            <Search aria-hidden="true" className="h-6 w-6 text-brand-700" /> Find experienced people
          </h2>
          <p className="mt-1 text-muted">Describe the experience you need. We never show or use anyone's age.</p>
          <label htmlFor="wq" className="sr-only">
            Experience you need
          </label>
          <input
            id="wq"
            type="search"
            className="input mt-4"
            placeholder="e.g. someone who has trained carpentry apprentices"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p aria-live="polite" className="mt-2 flex min-h-[1.5rem] items-center gap-2 text-sm text-muted">
            {ai.active && ai.loading && (
              <>
                <Sparkles aria-hidden="true" className="h-4 w-4 animate-pulse text-brand-600" /> Searching…
              </>
            )}
            {ai.active && !ai.loading && ai.results && (
              <>
                <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-600" /> Suggestions based on what people chose to share.
              </>
            )}
          </p>
          {ai.active && !ai.loading && results.length === 0 && (
            <p className="mt-2 text-muted">{ai.results ? "No one matches that yet. Try describing it differently." : "Search is unavailable right now."}</p>
          )}
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {results.map((r) => {
              const shared = r.worker.workComfort?.shareWithEmployers ? comfortSummary(r.worker.workComfort) : [];
              return (
                <li key={r.id} className="card">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.worker.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold">{r.worker.name}</p>
                      <p className="text-sm text-muted">
                        {r.worker.industries[0] ?? "Experienced professional"}
                        {r.worker.yearsExperience ? ` · ${r.worker.yearsExperience} years` : ""} · {r.worker.location}
                      </p>
                    </div>
                    <span className="badge bg-brand-700 text-white">{matchStrength(r.score)}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-brand-800">
                    {r.reasons.map((x) => (
                      <li key={x}>✓ {x}</li>
                    ))}
                  </ul>
                  {shared.length > 0 && (
                    <p className="mt-2 text-sm text-muted">
                      <strong>Shared work preferences:</strong> {shared.join(" · ")}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/mentors/${r.worker.id}`} className="btn-ghost min-h-[40px] px-3 py-1.5 text-sm">
                      <CircleUser aria-hidden="true" className="h-4 w-4" /> Profile
                    </Link>
                    <button
                      className="btn-primary min-h-[40px] py-1.5 text-sm"
                      disabled={openMine.length === 0}
                      onClick={() => {
                        setInviteFor(openMine[0]?.id ?? "");
                        setInviting(r.worker);
                      }}
                    >
                      Invite to discuss a role
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {openMine.length === 0 && results.length > 0 && <p className="mt-3 text-sm">Post an open opportunity first to invite people.</p>}
        </section>

        <p className="flex items-center gap-2 text-sm text-muted">
          <Building2 aria-hidden="true" className="h-4 w-4" /> In a real launch, organizations would be verified before posting.
        </p>
      </div>

      {inviting && (
        <ApplyDialogWrapper
          worker={inviting}
          opportunities={openMine}
          value={inviteFor}
          onPick={setInviteFor}
          onClose={() => setInviting(null)}
          onSend={async (message) => {
            const o = openMine.find((x) => x.id === inviteFor);
            if (!o) return;
            await createApplication({
              opportunityId: o.id,
              workerId: inviting.id,
              employerId: user.id,
              initiatedBy: "employer",
              message,
              status: "invited",
            });
          }}
        />
      )}
    </>
  );
}

function ApplyDialogWrapper({
  worker,
  opportunities,
  value,
  onPick,
  onClose,
  onSend,
}: {
  worker: User;
  opportunities: { id: string; title: string }[];
  value: string;
  onPick: (id: string) => void;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
}) {
  return (
    <>
      <div className="sr-only" aria-live="polite">
        Inviting {worker.name}
      </div>
      <ApplyDialog
        open
        title={`Invite ${worker.name.split(" ")[0]} to talk`}
        intro={`Choose a role and write a friendly note. ${worker.name.split(" ")[0]} can say yes or no, with no pressure.`}
        submitLabel="Send invitation"
        onClose={onClose}
        onSubmit={async (message) => onSend(message)}
        picker={
          <div>
            <label htmlFor="inv-role" className="label">
              Which role?
            </label>
            <select id="inv-role" className="input" value={value} onChange={(e) => onPick(e.target.value)}>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>
        }
        hideHelper
        sentText={`Invitation sent. You'll see ${worker.name.split(" ")[0]}'s reply under this role's applications.`}
      />
    </>
  );
}
