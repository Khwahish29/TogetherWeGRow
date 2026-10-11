import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarCheck, Check, Download, Heart, KeyRound, LogOut, Mail, Send, Trash2, UserRound, X } from "lucide-react";
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
  sendThanks,
  setRequestStatus,
  type SimpleNote,
} from "../lib/store";
import type { ConnectionRequest, User } from "../lib/types";
import { Avatar } from "../components/ui";
import { useStore } from "../lib/useStore";
import { BigChoice, ErrorLine, Screen, SpeakOrType, TreeAndSprout, greeting, useRun } from "./parts";

const KIND: Record<SimpleNote["kind"], string> = {
  question: "asked you a question",
  help: "would like your help",
  session: "asked about a session",
  interest: "is interested",
  reply: "replied",
};

const QUICK = ["Thank you!", "Yes, that works for me.", "Could you explain a little more?", "Can we find another time?"];
const STATUS = { pending: "Waiting for an answer", accepted: "Accepted", declined: "Declined", withdrawn: "Withdrawn" };

const time = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });

/** "Today", "Yesterday", or the date: easier to take in than a timestamp. */
function day(iso: string) {
  const d = new Date(iso);
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

const firstOf = (name?: string) => {
  const f = (name ?? "").trim().split(" ")[0];
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : "Someone";
};

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

type Entry = { at: string; note?: SimpleNote; request?: ConnectionRequest };

/* ------------------------------------------------------------------ */
/* Your messages                                                        */
/* ------------------------------------------------------------------ */

export function Inbox() {
  const { user, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const notes = useStore(getNotes, []);
  const requests = useStore(getRequests, []);
  const applications = useStore(getApplications, []);
  const opportunities = useStore(getOpportunities, []);
  const users = useStore(getUsers, []);
  const answerRun = useRun();

  // One conversation per person: every message and request between you and them, oldest first.
  const threads = useMemo(() => {
    if (!user) return [];
    const map = new Map<string, { id: string; name: string; canReply: boolean; entries: Entry[] }>();
    const thread = (id: string, name: string, canReply: boolean) => {
      let t = map.get(id);
      if (!t) map.set(id, (t = { id, name, canReply, entries: [] }));
      return t;
    };
    const nameOf = (id: string) => firstOf(users.find((u) => u.id === id)?.name);
    for (const n of notes) {
      const incoming = n.toId === user.id;
      const otherId = incoming ? n.fromId : n.toId;
      // Someone who wrote without an account can't be replied to here; each of their notes stands alone.
      const t = otherId ? thread(otherId, incoming ? firstOf(n.fromName) : nameOf(otherId), true) : thread(`guest-${n.id}`, firstOf(n.fromName), false);
      t.entries.push({ at: n.createdAt, note: n });
    }
    for (const r of requests) {
      const otherId = r.fromId === user.id ? r.toId : r.fromId;
      thread(otherId, nameOf(otherId), true).entries.push({ at: r.createdAt, request: r });
    }
    for (const t of map.values()) t.entries.sort((a, b) => a.at.localeCompare(b.at));
    return [...map.values()].sort((a, b) => b.entries[b.entries.length - 1].at.localeCompare(a.entries[a.entries.length - 1].at));
  }, [notes, requests, users, user]);

  const openId = params.get("with");
  const open = threads.find((t) => t.id === openId);

  // Reading a conversation marks its messages as read.
  useEffect(() => {
    if (!user || !open) return;
    for (const e of open.entries) if (e.note && e.note.toId === user.id && !e.note.read) void markNoteRead(e.note.id).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.id, open?.entries.length, user?.id]);

  if (!loading && !user) return <SignInFirst what="Your messages" />;
  if (!user) return <Screen title="Your messages">{null}</Screen>;
  if (open) return <Conversation me={user} thread={open} />;

  const unread = (t: (typeof threads)[number]) => t.entries.filter((e) => e.note && e.note.toId === user.id && !e.note.read).length;
  const waiting = requests.filter((r) => r.toId === user.id && r.status === "pending");
  const fresh = threads.reduce((n, t) => n + unread(t), 0);
  const nameOf = (id: string) => firstOf(users.find((u) => u.id === id)?.name);
  const nothing = threads.length === 0 && applications.length === 0;

  return (
    <Screen
      eyebrow={greeting(user.name)}
      title="Your messages"
      help={
        nothing
          ? undefined
          : fresh + waiting.length > 0
            ? `${fresh + waiting.length === 1 ? "One thing is" : `${fresh + waiting.length} things are`} waiting for you. No rush.`
            : "Nothing new. You're all caught up."
      }
    >
      {nothing && (
        <>
          <TreeAndSprout className="mx-auto h-auto w-full max-w-sm" />
          <div className="mt-4 rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
            <p className="font-serif text-2xl text-brand-900">It's quiet here for now.</p>
            <p className="mt-2 text-muted">When someone writes to you or answers you, it will appear here. Good things take a little time.</p>
          </div>
          <div className="mt-6 space-y-4">
            <BigChoice to="/start" icon={UserRound} label="Back to my choices" />
          </div>
        </>
      )}

      {waiting.length > 0 && (
        <section aria-labelledby="inbox-waiting" className="mb-8">
          <h2 id="inbox-waiting" className="font-sans text-2xl font-semibold">
            Waiting for your answer
          </h2>
          <ul className="mt-4 space-y-4">
            {waiting.map((r) => (
              <li key={r.id} className="rounded-3xl bg-brand-900 p-6 text-brand-100">
                <p className="font-serif text-2xl leading-snug text-white">
                  {nameOf(r.fromId)} would like {r.kind === "buddy" ? "your help" : "to book a session"}
                  {r.topic ? `: “${r.topic}”` : ""}
                </p>
                {r.proposedAt && <p className="mt-2 text-lg">They suggested {when(r.proposedAt)}.</p>}
                {r.message && <p className="mt-2 whitespace-pre-line text-lg">“{r.message}”</p>}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" disabled={answerRun.busy} onClick={() => answerRun.run(() => setRequestStatus(r.id, "accepted"))} className="btn min-h-[56px] bg-warm-400 px-6 text-lg font-semibold text-brand-900 hover:bg-warm-200">
                    <Check aria-hidden="true" className="h-5 w-5" /> Yes, accept
                  </button>
                  <button type="button" disabled={answerRun.busy} onClick={() => answerRun.run(() => setRequestStatus(r.id, "declined"))} className="btn min-h-[56px] border-2 border-brand-100/50 px-6 text-lg text-white hover:bg-white/10">
                    <X aria-hidden="true" className="h-5 w-5" /> Not this time
                  </button>
                </div>
                <p className="mt-3 text-base">Either answer is fine. Saying no is not unkind.</p>
              </li>
            ))}
          </ul>
          <ErrorLine error={answerRun.error} />
        </section>
      )}

      {threads.length > 0 && (
        <section aria-labelledby="inbox-people">
          <h2 id="inbox-people" className="font-sans text-2xl font-semibold">
            Your conversations
          </h2>
          <ul className="mt-4 space-y-3">
            {threads.map((t) => {
              const n = unread(t);
              const newest = t.entries[t.entries.length - 1];
              // If something is unread, preview that rather than whatever happened most recently.
              const last = (n && [...t.entries].reverse().find((e) => e.note && e.note.toId === user.id && !e.note.read)) || newest;
              const mine = last.note ? last.note.toId !== user.id : last.request!.fromId === user.id;
              const preview = last.note
                ? last.note.text
                : `${last.request!.kind === "buddy" ? "Help request" : "Session request"}${last.request!.topic ? `: ${last.request!.topic}` : ""} (${STATUS[last.request!.status].toLowerCase()})`;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setParams({ with: t.id })}
                    className={`lift flex w-full items-center gap-4 rounded-3xl border-2 p-5 text-left hover:border-brand-600 ${n ? "border-warm-400 bg-white" : "border-warm-200 bg-white"}`}
                  >
                    <Avatar name={t.name} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-2xl font-semibold text-brand-900">{t.name}</span>
                        {n > 0 && <span className="rounded-full bg-warm-400 px-2.5 py-0.5 text-base font-semibold text-brand-900">{n} new</span>}
                      </span>
                      <span className="mt-1 line-clamp-2 text-lg text-muted">
                        {mine ? "You: " : ""}
                        {preview}
                      </span>
                      <span className="mt-1 block text-base text-muted">{day(newest.at)}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-600" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {applications.length > 0 && (
        <section aria-labelledby="inbox-roles" className="mt-10">
          <h2 id="inbox-roles" className="font-sans text-2xl font-semibold">
            Paid roles
          </h2>
          <ul className="mt-4 space-y-3">
            {applications.map((a) => {
              const opp = opportunities.find((o) => o.id === a.opportunityId);
              const mine = a.workerId === user.id;
              return (
                <li key={a.id} className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
                  <p className="text-xl font-semibold text-brand-900">
                    {mine ? `You showed interest in “${opp?.title ?? "a role"}”` : `${nameOf(a.workerId)} is interested in “${opp?.title ?? "your role"}”`}
                  </p>
                  {a.reply && <p className="mt-2 rounded-2xl bg-brand-50 p-4 text-lg">Their reply: {a.reply}</p>}
                  <p className="mt-2 text-lg text-muted">
                    {mine ? (
                      { submitted: "Sent. They haven't answered yet.", reviewing: "They're looking at it.", invited: "They'd like to talk with you.", closed: "This one is closed." }[a.status]
                    ) : (
                      <Link to="/employer" className="link">
                        Answer in your organization portal
                      </Link>
                    )}
                  </p>
                  <p className="mt-1 text-base text-muted">{day(a.updatedAt)}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!nothing && (
        <p className="mt-10 text-lg">
          <Link to="/account" className="link">
            Your account
          </Link>
        </p>
      )}
    </Screen>
  );
}

/** Everything between you and one person, as a conversation. */
function Conversation({ me, thread }: { me: User; thread: { id: string; name: string; canReply: boolean; entries: Entry[] } }) {
  const [text, setText] = useState("");
  const [thanking, setThanking] = useState(false);
  const [thanksText, setThanksText] = useState("");
  const [thanked, setThanked] = useState(false);
  const sendRun = useRun();
  const actRun = useRun();
  const thanksRun = useRun();
  const lastIncoming = [...thread.entries].reverse().find((e) => e.note && e.note.toId === me.id)?.note;
  const contact = thread.entries.map((e) => (e.note && e.note.toId === me.id ? e.note.contact : undefined)).filter(Boolean).pop();
  const end = useRef<HTMLDivElement>(null);

  // Start at the newest message, where the reply box is.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [thread.entries.length]);

  let lastDay = "";
  return (
    <Screen title={`You and ${thread.name}`} readAloud={false}>
      <ol className="space-y-3">
        {thread.entries.map((e) => {
          const d = day(e.at);
          const showDay = d !== lastDay;
          lastDay = d;
          const key = e.note?.id ?? e.request!.id;
          return (
            <li key={key}>
              {showDay && <p className="my-4 text-center text-base font-medium text-muted">{d}</p>}
              {e.note ? (
                <Bubble mine={e.note.toId !== me.id} who={e.note.toId !== me.id ? "You" : thread.name} at={e.at} lead={e.note.toId === me.id && e.note.kind !== "reply" ? KIND[e.note.kind] : undefined}>
                  {e.note.text}
                </Bubble>
              ) : (
                <RequestEvent request={e.request!} me={me} otherName={thread.name} run={actRun} />
              )}
            </li>
          );
        })}
      </ol>
      <ErrorLine error={actRun.error} />

      {contact && (
        <p className="mt-5 rounded-2xl bg-white p-5 text-lg ring-1 ring-warm-200">
          {thread.name} said you can also reach them at: <strong>{contact}</strong>
        </p>
      )}

      <div ref={end} />
      {thread.canReply ? (
        <section className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-warm-200 sm:p-6" aria-labelledby="reply-title">
          <h2 id="reply-title" className="font-sans text-xl font-semibold">
            Write back to {thread.name}
          </h2>
          <div className="mt-3">
            <SpeakOrType id="reply" label={`Your message to ${thread.name}`} value={text} onChange={setText} rows={3} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick replies">
            {QUICK.map((qk) => (
              <button key={qk} type="button" onClick={() => setText(qk)} className="min-h-[48px] rounded-full border-2 border-warm-200 bg-warm-50 px-4 text-lg hover:border-brand-600">
                {qk}
              </button>
            ))}
          </div>
          <ErrorLine error={sendRun.error} />
          <button
            type="button"
            className="btn-primary mt-5 min-h-[60px] w-full text-xl"
            disabled={sendRun.busy || text.trim().length < 2}
            onClick={() =>
              sendRun.run(async () => {
                await addNote({ toId: thread.id, fromName: firstOf(me.name), kind: "reply", text: text.trim(), replyTo: lastIncoming?.id });
                setText("");
              })
            }
          >
            <Send aria-hidden="true" className="h-5 w-5" /> {sendRun.busy ? "Sending…" : `Send to ${thread.name}`}
          </button>
        </section>
      ) : (
        <p className="mt-8 rounded-2xl bg-warm-100 p-5 text-lg">{thread.name} wrote without joining, so there's no way to reply here{contact ? ". You can use the contact details above" : ""}.</p>
      )}

      {thread.canReply && (
        <section className="mt-6">
          {thanked ? (
            <p role="status" className="rounded-2xl bg-brand-100 p-5 text-lg font-semibold text-brand-900">
              Your thank-you is on {thread.name}'s profile. That will mean a lot.
            </p>
          ) : thanking ? (
            <div className="rounded-3xl bg-brand-100/70 p-5">
              <label htmlFor="thanks" className="label text-xl">
                A thank-you for {thread.name}
              </label>
              <p className="text-lg text-muted">Anyone visiting their profile can read it, so others know they're worth asking.</p>
              <textarea id="thanks" rows={3} className="input mt-3 text-xl" value={thanksText} onChange={(e) => setThanksText(e.target.value)} placeholder="For example: You explained it so patiently. Thank you." />
              <ErrorLine error={thanksRun.error} />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary min-h-[52px]"
                  disabled={thanksRun.busy || thanksText.trim().length < 3}
                  onClick={() =>
                    thanksRun.run(async () => {
                      await sendThanks({ fromId: me.id, toId: thread.id, message: thanksText.trim() });
                      setThanked(true);
                    })
                  }
                >
                  Post my thank-you
                </button>
                <button type="button" className="btn-ghost min-h-[52px]" onClick={() => setThanking(false)}>
                  Not now
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn-secondary min-h-[56px] w-full text-lg" onClick={() => setThanking(true)}>
              <Heart aria-hidden="true" className="h-5 w-5" /> Leave {thread.name} a public thank-you
            </button>
          )}
        </section>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 text-lg">
        <Link to="/inbox" className="link min-h-[44px]">
          All my messages
        </Link>
        <Link to={thread.canReply ? `/safety?about=${thread.id}` : "/safety"} className="text-base text-muted underline underline-offset-4">
          Something here worries me
        </Link>
      </div>
    </Screen>
  );
}

function Bubble({ mine, who, at, lead, children }: { mine: boolean; who: string; at: string; lead?: string; children: string }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-3xl px-5 py-4 ${mine ? "rounded-br-lg bg-brand-700 text-white" : "rounded-bl-lg bg-white text-ink ring-1 ring-warm-200"}`}>
        <p className={`text-base font-semibold ${mine ? "text-brand-100" : "text-warm-700"}`}>
          {who}
          {lead ? ` ${lead}` : ""} <span className="font-normal">· {time(at)}</span>
        </p>
        <p className="mt-1 whitespace-pre-line text-xl leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function RequestEvent({ request, me, otherName, run }: { request: ConnectionRequest; me: User; otherName: string; run: ReturnType<typeof useRun> }) {
  const incoming = request.toId === me.id;
  const what = request.kind === "buddy" ? "help" : "a session";
  return (
    <div className="rounded-3xl bg-warm-100 p-5 text-center">
      <p className="flex items-center justify-center gap-2 text-xl font-semibold text-brand-900">
        <CalendarCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-warm-700" />
        {incoming ? `${otherName} asked you for ${what}` : `You asked ${otherName} for ${what}`}
      </p>
      {request.topic && <p className="mt-1 text-lg">“{request.topic}”</p>}
      {request.proposedAt && <p className="mt-1 text-lg text-muted">{when(request.proposedAt)}</p>}
      <p className="mt-2 inline-block rounded-full bg-white px-4 py-1 text-lg font-semibold text-brand-900">{STATUS[request.status]}</p>
      {incoming && request.status === "pending" && (
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary min-h-[52px]" disabled={run.busy} onClick={() => run.run(() => setRequestStatus(request.id, "accepted"))}>
            <Check aria-hidden="true" className="h-5 w-5" /> Yes, accept
          </button>
          <button type="button" className="btn-secondary min-h-[52px]" disabled={run.busy} onClick={() => run.run(() => setRequestStatus(request.id, "declined"))}>
            <X aria-hidden="true" className="h-5 w-5" /> Not this time
          </button>
        </div>
      )}
      {!incoming && request.status === "pending" && (
        <button type="button" className="btn-ghost mt-3 min-h-[48px]" disabled={run.busy} onClick={() => run.run(() => setRequestStatus(request.id, "withdrawn"))}>
          Withdraw my request
        </button>
      )}
      {request.status === "accepted" && <p className="mt-3 text-lg">Use the box below to agree where to meet and how to pay.</p>}
    </div>
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
  const [showPw, setShowPw] = useState(false);
  const pwType = showPw ? "text" : "password";
  const showToggle = (
    <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-lg">
      <input type="checkbox" className="h-5 w-5 accent-[#234638]" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
      Show what I type
    </label>
  );
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
    <Screen title={`Hello, ${firstOf(user.name)}`} help="Everything about you here, in one place. You're in charge of all of it.">
      <section className="rounded-[2rem] bg-brand-900 p-6 text-brand-100 sm:p-8" aria-label="What you do here">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="font-serif text-3xl text-white">{user.name}</p>
            <p className="text-lg">With us since {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-lg">
          {user.roles.includes("mentor") && (
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white">You share your experience{user.skills.length ? `: ${user.skills.slice(0, 3).join(", ").toLowerCase()}` : ""}</span>
              <Link to="/older/share" className="font-semibold text-warm-400 underline underline-offset-4">
                Change
              </Link>
            </li>
          )}
          {user.roles.includes("mentor") && (
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white">Paid sessions you offer</span>
              <Link to="/older/earn" className="font-semibold text-warm-400 underline underline-offset-4">
                See or change
              </Link>
            </li>
          )}
          {user.roles.includes("buddy") && (
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white">You're a helper{user.buddy?.topics.length ? `: ${user.buddy.topics.slice(0, 3).join(", ").toLowerCase()}` : ""}</span>
              <Link to="/younger/share" className="font-semibold text-warm-400 underline underline-offset-4">
                Change or pause
              </Link>
            </li>
          )}
          {!user.roles.includes("mentor") && !user.roles.includes("buddy") && <li className="text-white">You haven't shared anything publicly. That's completely fine.</li>}
        </ul>
      </section>

      <div className="mt-6 space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="Your messages" />
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
            nothing is lost if this browser is cleared. It takes a minute, and it's the one thing here worth doing soon.
          </p>
          <label htmlFor="acc-email" className="label mt-4 text-lg">
            Email address
          </label>
          <input id="acc-email" type="email" className="input min-h-[56px] text-xl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="acc-pw" className="label mt-4 text-lg">
            Choose a password <span className="font-normal text-muted">(at least 8 characters)</span>
          </label>
          <input id="acc-pw" type={pwType} className="input min-h-[56px] text-xl" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {showToggle}
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
          <input id="acc-current" type={pwType} className="input min-h-[56px] text-xl" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <label htmlFor="acc-new" className="label mt-4 text-lg">
            New password <span className="font-normal text-muted">(at least 8 characters)</span>
          </label>
          <input id="acc-new" type={pwType} className="input min-h-[56px] text-xl" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {showToggle}
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
