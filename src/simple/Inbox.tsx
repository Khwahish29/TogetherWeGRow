import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Download, KeyRound, LogOut, Mail, MessageCircle, Trash2, UserRound, X } from "lucide-react";
import { useAuth } from "../lib/auth";
import {
  EXPORT_URL,
  addNote,
  changePassword,
  claimAccount,
  deleteAccount,
  getApplications,
  getNotes,
  getOpportunities,
  getRequests,
  getUsers,
  logOut,
  markNoteRead,
  saveUser,
  setRequestStatus,
  type SimpleNote,
} from "../lib/store";
import type { User } from "../lib/types";
import { useStore } from "../lib/useStore";
import { BigChoice, ErrorLine, Screen, useRun } from "./parts";

const KIND: Record<SimpleNote["kind"], string> = {
  question: "asked you a question",
  help: "would like your help with",
  session: "asked about a session",
  interest: "is interested in",
  reply: "replied",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function SignInFirst({ what }: { what: string }) {
  return (
    <Screen title={what} help="You'll see this once you've joined or signed in.">
      <div className="space-y-4">
        <BigChoice to="/start" icon={UserRound} label="I'm new here" sub="Start with one simple question" />
        <BigChoice to="/login" icon={KeyRound} tone="warm" label="Sign in" sub="With your email and password" />
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Your messages                                                        */
/* ------------------------------------------------------------------ */

export function Inbox() {
  const { user, loading } = useAuth();
  const notes = useStore(getNotes, []);
  const requests = useStore(getRequests, []);
  const applications = useStore(getApplications, []);
  const opportunities = useStore(getOpportunities, []);
  const users = useStore(getUsers, []);
  const nameOf = (id?: string) => users.find((u) => u.id === id)?.name.split(" ")[0] ?? "Someone";

  // Opening the page counts as reading what's here.
  useEffect(() => {
    if (!user) return;
    for (const n of notes) if (n.toId === user.id && !n.read) void markNoteRead(n.id).catch(() => undefined);
  }, [notes, user]);

  const items = useMemo(() => {
    if (!user) return [];
    type Item = { at: string; key: string; node: JSX.Element };
    const out: Item[] = [];
    for (const n of notes) out.push({ at: n.createdAt, key: n.id, node: <NoteCard note={n} me={user} toName={nameOf(n.toId)} /> });
    for (const r of requests)
      out.push({ at: r.createdAt, key: r.id, node: <RequestCard request={r} me={user} otherName={nameOf(r.fromId === user.id ? r.toId : r.fromId)} /> });
    for (const a of applications) {
      const opp = opportunities.find((o) => o.id === a.opportunityId);
      const mine = a.workerId === user.id;
      out.push({
        at: a.updatedAt,
        key: a.id,
        node: (
          <article className="rounded-3xl bg-white p-6 ring-1 ring-warm-200">
            <p className="text-lg text-muted">{when(a.updatedAt)}</p>
            <p className="mt-1 text-xl font-semibold text-brand-900">
              {mine ? `Your interest in “${opp?.title ?? "a role"}”` : `${nameOf(a.workerId)} is interested in “${opp?.title ?? "your role"}”`}
            </p>
            {!mine && <p className="mt-2 whitespace-pre-line text-lg">{a.message}</p>}
            {a.reply && <p className="mt-3 rounded-2xl bg-brand-50 p-4 text-lg">Reply: {a.reply}</p>}
            <p className="mt-3 text-lg text-muted">
              {mine ? `Status: ${a.status === "submitted" ? "sent" : a.status}` : <Link to="/employer" className="link">Answer in your organization portal</Link>}
            </p>
          </article>
        ),
      });
    }
    return out.sort((a, b) => b.at.localeCompare(a.at));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, requests, applications, opportunities, users, user]);

  if (!loading && !user) return <SignInFirst what="Your messages" />;

  return (
    <Screen title="Your messages" help="Questions, requests for help and replies, newest first.">
      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
          <p>Nothing here yet. When someone writes to you, or answers you, it will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.key}>{i.node}</li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-lg">
        <Link to="/account" className="link">
          Your account
        </Link>
      </p>
    </Screen>
  );
}

function NoteCard({ note, me, toName }: { note: SimpleNote; me: User; toName: string }) {
  const incoming = note.toId === me.id;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const { run, busy, error } = useRun();

  return (
    <article className={`rounded-3xl p-6 ring-1 ${incoming ? "bg-white ring-warm-200" : "bg-brand-50/60 ring-brand-100"}`}>
      <p className="text-lg text-muted">
        {when(note.createdAt)}
        {incoming && !note.read && <span className="ml-2 rounded-full bg-warm-400 px-2 py-0.5 text-sm font-semibold text-brand-900">New</span>}
      </p>
      <p className="mt-1 text-xl font-semibold text-brand-900">
        {incoming ? `${note.fromName} ${KIND[note.kind]}` : `You wrote to ${toName}`}
      </p>
      <p className="mt-2 whitespace-pre-line text-xl leading-relaxed">{note.text}</p>
      {incoming && note.contact && (
        <p className="mt-3 text-lg">
          You can reach {note.fromName} at: <strong>{note.contact}</strong>
        </p>
      )}
      {incoming && note.fromId && !sent && (
        <div className="mt-4">
          {!open ? (
            <button type="button" className="btn-secondary min-h-[52px]" onClick={() => setOpen(true)}>
              <MessageCircle aria-hidden="true" className="h-5 w-5" /> Reply
            </button>
          ) : (
            <div>
              <label htmlFor={`reply-${note.id}`} className="label text-lg">
                Your reply to {note.fromName}
              </label>
              <textarea id={`reply-${note.id}`} rows={4} className="input text-xl" value={text} onChange={(e) => setText(e.target.value)} />
              <ErrorLine error={error} />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary min-h-[52px]"
                  disabled={busy || text.trim().length < 2}
                  onClick={() =>
                    run(async () => {
                      await addNote({ toId: note.fromId!, fromName: me.name.split(" ")[0], kind: "reply", text: text.trim(), replyTo: note.id });
                      setSent(true);
                    })
                  }
                >
                  {busy ? "Sending…" : "Send reply"}
                </button>
                <button type="button" className="btn-ghost min-h-[52px]" onClick={() => setOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {sent && (
        <p role="status" className="mt-4 text-lg font-semibold text-brand-800">
          Reply sent.
        </p>
      )}
    </article>
  );
}

function RequestCard({ request, me, otherName }: { request: import("../lib/types").ConnectionRequest; me: User; otherName: string }) {
  const incoming = request.toId === me.id;
  const { run, busy, error } = useRun();
  const status = { pending: "Waiting for an answer", accepted: "Accepted", declined: "Declined", withdrawn: "Withdrawn" }[request.status];
  return (
    <article className="rounded-3xl bg-white p-6 ring-1 ring-warm-200">
      <p className="text-lg text-muted">{when(request.createdAt)}</p>
      <p className="mt-1 text-xl font-semibold text-brand-900">
        {incoming
          ? `${otherName} would like ${request.kind === "buddy" ? "your help" : "a session"}${request.topic ? `: “${request.topic}”` : ""}`
          : `You asked ${otherName} for ${request.kind === "buddy" ? "help" : "a session"}${request.topic ? `: “${request.topic}”` : ""}`}
      </p>
      {request.proposedAt && <p className="mt-2 text-lg">Suggested time: {when(request.proposedAt)}</p>}
      {request.message && <p className="mt-2 whitespace-pre-line text-lg">{request.message}</p>}
      <p className="mt-2 text-lg text-muted">{status}</p>
      <ErrorLine error={error} />
      {incoming && request.status === "pending" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn-primary min-h-[52px]" disabled={busy} onClick={() => run(() => setRequestStatus(request.id, "accepted"))}>
            <Check aria-hidden="true" className="h-5 w-5" /> Accept
          </button>
          <button type="button" className="btn-secondary min-h-[52px]" disabled={busy} onClick={() => run(() => setRequestStatus(request.id, "declined"))}>
            <X aria-hidden="true" className="h-5 w-5" /> Not this time
          </button>
        </div>
      )}
      {!incoming && request.status === "pending" && (
        <button type="button" className="btn-ghost mt-3 min-h-[52px]" disabled={busy} onClick={() => run(() => setRequestStatus(request.id, "withdrawn"))}>
          Withdraw my request
        </button>
      )}
      {request.status === "accepted" && (
        <p className="mt-3 text-lg">
          To agree on the details, use <strong>Reply</strong> on one of {otherName}'s messages, or the{" "}
          <Link to="/requests" className="link">
            full requests page
          </Link>
          .
        </p>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Your account                                                         */
/* ------------------------------------------------------------------ */

export function Account() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [current, setCurrent] = useState("");
  const [confirmLeave, setConfirmLeave] = useState<"" | "signout" | "delete">("");
  const [done, setDone] = useState("");
  const nameRun = useRun();
  const loginRun = useRun();
  const leaveRun = useRun();

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!loading && !user) return <SignInFirst what="Your account" />;
  if (!user) return <Screen title="Your account">{null}</Screen>;

  return (
    <Screen title={`Hello, ${user.name.split(" ")[0]}`} help="Everything about your account, in one place.">
      <div className="space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="Your messages" />
        <BigChoice to="/profile" icon={UserRound} tone="warm" label="Your full profile" sub="Skills, experience and what you'd like to learn" />
      </div>

      <section className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-warm-200" aria-labelledby="acc-name">
        <h2 id="acc-name" className="font-sans text-xl font-semibold">
          The name people see
        </h2>
        <label htmlFor="acc-name-input" className="sr-only">
          Your name
        </label>
        <input id="acc-name-input" className="input mt-3 min-h-[60px] text-xl" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <ErrorLine error={nameRun.error} />
        <button
          type="button"
          className="btn-secondary mt-3 min-h-[52px]"
          disabled={nameRun.busy || !name.trim() || name.trim() === user.name}
          onClick={() =>
            nameRun.run(async () => {
              await saveUser({ ...user, name: name.trim() });
              setDone("Your name is saved.");
            })
          }
        >
          Save my name
        </button>
      </section>

      {!user.hasLogin ? (
        <section className="mt-6 rounded-3xl bg-brand-100/70 p-6" aria-labelledby="acc-keep">
          <h2 id="acc-keep" className="font-sans text-xl font-semibold text-brand-900">
            Keep your account safe
          </h2>
          <p className="mt-2 text-lg">
            Right now your account lives only in this browser. Add an email and password so you can sign in on another phone or computer, and so
            nothing is lost if this browser is cleared.
          </p>
          <label htmlFor="acc-email" className="label mt-4 text-lg">
            Email address
          </label>
          <input id="acc-email" type="email" className="input min-h-[56px] text-xl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="acc-pw" className="label mt-4 text-lg">
            Choose a password <span className="font-normal text-muted">(at least 8 characters)</span>
          </label>
          <input id="acc-pw" type="password" className="input min-h-[56px] text-xl" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <ErrorLine error={loginRun.error} />
          <button
            type="button"
            className="btn-primary mt-4 min-h-[56px]"
            disabled={loginRun.busy || !email.includes("@") || password.length < 8}
            onClick={() =>
              loginRun.run(async () => {
                await claimAccount(email.trim(), password);
                setPassword("");
                setDone("Your email and password are saved. You can now sign in anywhere.");
              })
            }
          >
            Save my email and password
          </button>
        </section>
      ) : (
        <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-warm-200" aria-labelledby="acc-pw-title">
          <h2 id="acc-pw-title" className="font-sans text-xl font-semibold">
            Change your password
          </h2>
          <p className="mt-1 text-lg text-muted">You sign in as {user.email}.</p>
          <label htmlFor="acc-current" className="label mt-4 text-lg">
            Current password
          </label>
          <input id="acc-current" type="password" className="input min-h-[56px] text-xl" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <label htmlFor="acc-new" className="label mt-4 text-lg">
            New password <span className="font-normal text-muted">(at least 8 characters)</span>
          </label>
          <input id="acc-new" type="password" className="input min-h-[56px] text-xl" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <ErrorLine error={loginRun.error} />
          <button
            type="button"
            className="btn-secondary mt-4 min-h-[52px]"
            disabled={loginRun.busy || password.length < 8 || !current}
            onClick={() =>
              loginRun.run(async () => {
                await changePassword(current, password);
                setCurrent("");
                setPassword("");
                setDone("Your new password is saved.");
              })
            }
          >
            Save new password
          </button>
        </section>
      )}

      {done && (
        <p role="status" className="mt-4 rounded-2xl bg-brand-100 p-4 text-lg font-semibold text-brand-900">
          {done}
        </p>
      )}

      <section className="mt-10" aria-labelledby="acc-data">
        <h2 id="acc-data" className="font-sans text-xl font-semibold">
          Your information
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <a href={EXPORT_URL} download className="btn-secondary min-h-[56px] justify-start text-lg">
            <Download aria-hidden="true" className="h-5 w-5" /> Download everything we have about you
          </a>
          <button type="button" className="btn-secondary min-h-[56px] justify-start text-lg" onClick={() => setConfirmLeave("signout")}>
            <LogOut aria-hidden="true" className="h-5 w-5" /> Sign out
          </button>
          <button type="button" className="btn-ghost min-h-[56px] justify-start text-lg text-warm-700" onClick={() => setConfirmLeave("delete")}>
            <Trash2 aria-hidden="true" className="h-5 w-5" /> Delete my account
          </button>
        </div>

        {confirmLeave && (
          <div role="alertdialog" aria-labelledby="leave-title" className="mt-5 rounded-3xl bg-warm-100 p-6">
            <p id="leave-title" className="text-xl font-semibold text-brand-900">
              {confirmLeave === "delete" ? "Delete your account for good?" : "Sign out?"}
            </p>
            <p className="mt-2 text-lg">
              {confirmLeave === "delete"
                ? "Your profile, messages, sessions and everything you've shared will be removed. This can't be undone."
                : user.hasLogin
                  ? "You can sign in again any time with your email and password."
                  : "Without an email and password, you won't be able to get back into this account. You may want to add them above first."}
            </p>
            <ErrorLine error={leaveRun.error} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary min-h-[52px]"
                disabled={leaveRun.busy}
                onClick={() =>
                  leaveRun.run(async () => {
                    if (confirmLeave === "delete") await deleteAccount();
                    else await logOut();
                    navigate("/start");
                  })
                }
              >
                {confirmLeave === "delete" ? "Yes, delete everything" : "Yes, sign out"}
              </button>
              <button type="button" className="btn-ghost min-h-[52px]" onClick={() => setConfirmLeave("")}>
                Keep my account
              </button>
            </div>
          </div>
        )}
      </section>
    </Screen>
  );
}
