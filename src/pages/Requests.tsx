import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Building2, CalendarClock, Check, Heart, HeartHandshake, NotebookPen, RotateCcw, Undo2, X } from "lucide-react";
import { ReflectionDialog } from "../components/ReflectionDialog";
import { VibeCheck } from "../components/VibeCheck";
import { Avatar, EmptyState, PageHeader, formatPrice } from "../components/ui";
import { useAuth } from "../lib/auth";
import {
  getApplications,
  getOpportunities,
  updateApplication,
  getListings,
  getReflections,
  getRequests,
  getUsers,
  rescheduleRequest,
  setRequestStatus,
} from "../lib/store";
import type { Application, ConnectionRequest, Listing, Opportunity, Reflection, RequestStatus, User } from "../lib/types";
import { payLabel } from "../lib/comfort";
import { useStore } from "../lib/useStore";

const STATUS_STYLE: Record<RequestStatus, string> = {
  pending: "bg-warm-100 text-warm-800",
  accepted: "bg-emerald-100 text-emerald-800",
  declined: "bg-warm-100 text-warm-800",
  withdrawn: "bg-warm-100 text-warm-800",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Waiting for a reply",
  accepted: "Confirmed",
  declined: "Not this time",
  withdrawn: "Withdrawn",
};

/** "What do they mean?" for a received message. Only asks the helper when opened. */
function MessageVibe({ text, id }: { text: string; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="mt-2" onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="cursor-pointer text-sm font-semibold text-brand-700 underline underline-offset-4">Not sure what they mean? Vibe Check it</summary>
      {open && (
        <div className="mt-3">
          <VibeCheck initialText={text} autoRun compact idPrefix={`vc-${id}`} />
        </div>
      )}
    </details>
  );
}

export function formatWhen(iso: string) {
  if (!iso) return "Time to be agreed";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
}

export function isPast(iso: string) {
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

function Reschedule({ req, onDone }: { req: ConnectionRequest; onDone: () => void }) {
  const [when, setWhen] = useState("");
  const min = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
  return (
    <form
      className="mt-4 flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 sm:flex-row sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        await rescheduleRequest(req.id, when);
        onDone();
      }}
    >
      <div className="flex-1">
        <label htmlFor={`re-${req.id}`} className="label">
          Suggest a new time
        </label>
        <input id={`re-${req.id}`} type="datetime-local" className="input" required min={min} value={when} onChange={(e) => setWhen(e.target.value)} />
        <p className="hint mt-1">Plans change. The other person will be asked to confirm the new time.</p>
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-ghost" onClick={onDone}>
          Cancel
        </button>
        <button className="btn-primary">Send</button>
      </div>
    </form>
  );
}

export function RequestItem({
  req,
  incoming,
  users,
  listings,
  me,
  reflection,
}: {
  req: ConnectionRequest;
  incoming: boolean;
  users: User[];
  listings: Listing[];
  me: User;
  reflection?: Reflection;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const other = users.find((u) => u.id === (incoming ? req.fromId : req.toId));
  const listing = req.listingId ? listings.find((l) => l.id === req.listingId) : undefined;
  const title = req.kind === "session" ? (listing?.title ?? "Mentoring session") : `Help with ${req.topic ?? "technology"}`;
  const past = req.status === "accepted" && isPast(req.proposedAt);

  return (
    <li className="card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {other && <Avatar name={other.name} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${past ? "bg-brand-100 text-brand-800" : STATUS_STYLE[req.status]}`}>
              {past ? "Completed" : STATUS_LABEL[req.status]}
            </span>
            <span className="badge bg-warm-100 text-warm-700">{req.kind === "session" ? "Paid mentoring" : "Buddy help"}</span>
          </div>
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
          <p className="text-ink/80">
            {incoming ? "From" : "With"}{" "}
            {other ? (
              <Link to={`/mentors/${other.id}`} className="font-bold underline">
                {other.name}
              </Link>
            ) : (
              "a member"
            )}
          </p>
          <p className="mt-1 flex items-center gap-2 text-ink/80">
            <CalendarClock aria-hidden="true" className="h-5 w-5 text-brand-600" /> {formatWhen(req.proposedAt)}
          </p>
          {listing && (
            <p className="mt-1 text-sm text-muted">
              {formatPrice(listing.price)} for {listing.durationMins} minutes. Payment is arranged between you once
              confirmed.
            </p>
          )}
          {req.message && (
            <div className="mt-3 rounded-xl bg-brand-50 p-3">
              <p className="italic">“{req.message}”</p>
              {incoming && <MessageVibe text={req.message} id={req.id} />}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {incoming && req.status === "pending" && (
              <>
                <button className="btn-primary" onClick={() => setRequestStatus(req.id, "accepted")}>
                  <Check aria-hidden="true" className="h-5 w-5" /> Accept
                </button>
                <button className="btn-secondary" onClick={() => setRequestStatus(req.id, "declined")}>
                  <X aria-hidden="true" className="h-5 w-5" /> Not this time
                </button>
              </>
            )}
            {incoming && req.status === "declined" && (
              <button className="btn-secondary" onClick={() => setRequestStatus(req.id, "pending")}>
                <RotateCcw aria-hidden="true" className="h-5 w-5" /> I've changed my mind
              </button>
            )}
            {!incoming && req.status === "pending" && (
              <button className="btn-ghost" onClick={() => setRequestStatus(req.id, "withdrawn")}>
                <Undo2 aria-hidden="true" className="h-5 w-5" /> Withdraw request
              </button>
            )}
            {!incoming && req.status === "withdrawn" && (
              <button className="btn-ghost" onClick={() => setRequestStatus(req.id, "pending")}>
                <RotateCcw aria-hidden="true" className="h-5 w-5" /> Send it again
              </button>
            )}
            {(req.status === "accepted" || req.status === "pending") && !rescheduling && (
              <button className="btn-ghost" onClick={() => setRescheduling(true)}>
                <CalendarClock aria-hidden="true" className="h-5 w-5" /> {past ? "Book another time" : "Suggest a new time"}
              </button>
            )}
            {past && (
              <button className={reflection ? "btn-secondary" : "btn-warm"} onClick={() => setReflecting(true)}>
                {reflection ? (
                  <>
                    <NotebookPen aria-hidden="true" className="h-5 w-5" /> My notes
                  </>
                ) : (
                  <>
                    <Heart aria-hidden="true" className="h-5 w-5" /> How did it go?
                  </>
                )}
              </button>
            )}
          </div>
          {req.status === "declined" && !incoming && (
            <p className="mt-3 text-sm text-muted">
              Not every time works out, and that's okay. There are{" "}
              <Link to="/mentors" className="font-bold underline">
                other mentors
              </Link>{" "}
              who'd be glad to hear from you.
            </p>
          )}
          {rescheduling && <Reschedule req={req} onDone={() => setRescheduling(false)} />}
          {reflection && (reflection.learned || reflection.next) && (
            <p className="mt-3 rounded-xl border border-dashed border-brand-200 p-3 text-sm text-muted">
              <strong>Your note:</strong> {reflection.learned || reflection.next}
            </p>
          )}
        </div>
      </div>
      <ReflectionDialog
        open={reflecting}
        onClose={() => setReflecting(false)}
        me={me}
        other={other}
        requestId={req.id}
        sessionTitle={title}
        existing={reflection}
      />
    </li>
  );
}

const APP_STATUS: Record<Application["status"], { label: string; style: string; text: string }> = {
  submitted: { label: "Sent", style: "bg-warm-100 text-warm-800", text: "Waiting for the organization to look at it." },
  reviewing: { label: "Being reviewed", style: "bg-brand-100 text-brand-800", text: "The organization is reviewing your application." },
  invited: { label: "Invited to talk", style: "bg-emerald-100 text-emerald-800", text: "They'd like to talk with you about this role." },
  closed: { label: "Closed", style: "bg-warm-100 text-warm-800", text: "This application is closed." },
};

function WorkItem({ app, opp, org }: { app: Application; opp?: Opportunity; org?: User }) {
  const [reply, setReply] = useState("");
  const [answering, setAnswering] = useState<"yes" | "no" | null>(null);
  const invite = app.initiatedBy === "employer";
  const st = APP_STATUS[app.status];

  return (
    <li className="card">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${st.style}`}>{st.label}</span>
        <span className="badge bg-warm-100 text-warm-700">{invite ? "Invitation" : "Your application"}</span>
        {opp?.isDemo && <span className="badge bg-warm-100 text-warm-800">Illustrative listing</span>}
      </div>
      <h3 className="mt-2 text-xl font-bold">
        {opp ? (
          <Link to={`/opportunities/${opp.id}`} className="hover:underline">
            {opp.title}
          </Link>
        ) : (
          "Opportunity"
        )}
      </h3>
      <p className="flex items-center gap-1.5 text-ink/80">
        <Building2 aria-hidden="true" className="h-4 w-4" /> {opp?.orgName ?? org?.org?.name}
        {opp && <span className="text-muted"> · {payLabel(opp.pay)} · {opp.hoursPerWeek}</span>}
      </p>
      <p className="mt-2 text-ink/80">{st.text}</p>
      {app.message && (
        <p className="mt-3 rounded-xl bg-brand-50 p-3 italic">
          {invite ? <strong className="not-italic">{org?.name ?? "They"} wrote: </strong> : <strong className="not-italic">You wrote: </strong>}“{app.message}”
        </p>
      )}
      {app.reply && (
        <p className="mt-2 rounded-xl bg-warm-50 p-3">
          <strong>Your reply:</strong> {app.reply}
        </p>
      )}
      {app.helperRequested && (
        <p className="mt-2 flex items-center gap-1 text-sm text-muted">
          <HeartHandshake aria-hidden="true" className="h-4 w-4" /> You asked for help.{" "}
          <Link to="/learn/buddies" className="font-bold underline">Find a buddy</Link>
        </p>
      )}

      {invite && app.status === "invited" && !app.reply && !answering && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => setAnswering("yes")}>
            <Check aria-hidden="true" className="h-5 w-5" /> I'd like to talk
          </button>
          <button className="btn-secondary" onClick={() => setAnswering("no")}>
            Not for me, thanks
          </button>
          {opp && (
            <Link to={`/opportunities/${opp.id}`} className="btn-ghost">
              Read the details first
            </Link>
          )}
        </div>
      )}
      {answering && (
        <form
          className="mt-4 space-y-2 rounded-2xl bg-brand-50 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fallback = answering === "yes" ? "Yes, I'd like to talk about this." : "Thank you, but this isn't for me right now.";
            await updateApplication(app.id, { reply: reply.trim() || fallback, status: answering === "yes" ? "invited" : "closed" });
            setAnswering(null);
          }}
        >
          <label htmlFor={`reply-${app.id}`} className="label">
            {answering === "yes" ? "Add a note (optional), e.g. times that suit you" : "Add a note (optional)"}
          </label>
          <textarea id={`reply-${app.id}`} rows={2} className="input" value={reply} onChange={(e) => setReply(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn-primary">Send reply</button>
            <button type="button" className="btn-ghost" onClick={() => setAnswering(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {!invite && (app.status === "submitted" || app.status === "reviewing") && (
        <button className="btn-ghost mt-3" onClick={() => updateApplication(app.id, { status: "closed", reply: "Withdrawn by applicant." })}>
          <Undo2 aria-hidden="true" className="h-5 w-5" /> Withdraw application
        </button>
      )}
    </li>
  );
}

export default function Requests() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const requests = useStore(getRequests, []);
  const reflections = useStore(() => (user ? getReflections(user.id) : Promise.resolve([])), []);
  const applications = useStore(getApplications, []);
  const opportunities = useStore(getOpportunities, []);
  const [params] = useSearchParams();
  const [tab, setTab] = useState<"incoming" | "outgoing" | "work">(params.get("tab") === "work" ? "work" : "incoming");
  if (!user) return null;
  const work = applications.filter((a) => a.workerId === user.id);

  const incoming = requests.filter((r) => r.toId === user.id);
  const outgoing = requests.filter((r) => r.fromId === user.id);
  const list = tab === "incoming" ? incoming : tab === "outgoing" ? outgoing : [];

  return (
    <>
      <PageHeader eyebrow="Connections" title="Requests & sessions">
        Reply to requests and follow the ones you've sent. Saying no is always fine, and so is changing your mind.
      </PageHeader>
      <div className="container-page py-10 [&>*]:max-w-4xl">
        <div role="tablist" aria-label="Request direction" className="mb-6 inline-flex max-w-full flex-wrap rounded-3xl bg-brand-100 p-1">
          {(["incoming", "outgoing", "work"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-[44px] rounded-full px-4 font-semibold sm:px-5 ${tab === t ? "bg-white text-brand-900 shadow" : "text-brand-800"}`}
            >
              {t === "incoming" ? `Received (${incoming.length})` : t === "outgoing" ? `Sent (${outgoing.length})` : `Work (${work.length})`}
            </button>
          ))}
        </div>
        <h2 className="sr-only">{tab === "incoming" ? "Requests you received" : tab === "outgoing" ? "Requests you sent" : "Work applications and invitations"}</h2>
        {tab === "work" ? (
          work.length === 0 ? (
            <EmptyState title="No job applications or invitations yet">
              <Link to="/opportunities" className="btn-primary mt-3">
                Browse paid opportunities
              </Link>
            </EmptyState>
          ) : (
            <ul className="space-y-4">
              {work.map((a) => (
                <WorkItem
                  key={a.id}
                  app={a}
                  opp={opportunities.find((o) => o.id === a.opportunityId)}
                  org={users.find((u) => u.id === a.employerId)}
                />
              ))}
            </ul>
          )
        ) : list.length === 0 ? (
          <EmptyState title={tab === "incoming" ? "No requests received yet" : "You haven't sent any requests yet"}>
            {tab === "incoming" ? (
              <Link to="/marketplace?create=1" className="btn-primary mt-3">
                Create a mentoring offer
              </Link>
            ) : (
              <Link to="/mentors" className="btn-primary mt-3">
                Find a mentor
              </Link>
            )}
          </EmptyState>
        ) : (
          <ul className="space-y-4">
            {list.map((r) => (
              <RequestItem
                key={r.id}
                req={r}
                incoming={tab === "incoming"}
                users={users}
                listings={listings}
                me={user}
                reflection={reflections.find((rf) => rf.requestId === r.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
