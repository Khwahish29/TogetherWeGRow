import { useMemo, useState, type FormEvent } from "react";
import { CalendarCheck, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { skillsOverlap } from "../lib/matching";
import { addNote, createRequest, getListings, getUsers, quickJoin, saveUser } from "../lib/store";
import type { Format } from "../lib/types";
import { useStore } from "../lib/useStore";
import { Avatar } from "../components/ui";
import { Actions, BigChoice, Screen, SpeakOrType, useRun } from "./parts";
import { useWizard } from "./useWizard";
import { Feedback } from "./Extra";

/* ------------------------------------------------------------------ */
/* Learn from Older Adults                                             */
/* ------------------------------------------------------------------ */

export function YoungerLearn() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const sendRun = useRun();
  const people = useMemo(
    () =>
      users
        .filter((u) => u.roles.includes("mentor") && u.skills.length > 0)
        .filter((u) => u.id !== user?.id && u.profileApproved)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [users, user?.id],
  );
  const listings = useStore(getListings, []);
  const w = useWizard("twg.simple.ylearn", { personId: "", question: "", name: "", listingId: "", when: "" });
  const { step, go, data, set } = w;
  const [query, setQuery] = useState("");
  const person = people.find((p) => p.id === data.personId);

  const q = query.trim().toLowerCase();
  const shown = q
    ? people.filter((p) => [p.name, ...p.skills, ...p.industries, p.bio].some((s) => skillsOverlap(s, q) || s.toLowerCase().includes(q)))
    : people;

  if (step === 0 || !person)
    return (
      <Screen title="What would you like to learn?" help="Type a skill, or browse the people below.">
        <form role="search" onSubmit={(e: FormEvent) => e.preventDefault()} className="relative">
          <label htmlFor="ysearch" className="sr-only">
            What would you like to learn?
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted" />
          <input
            id="ysearch"
            type="search"
            className="input min-h-[64px] rounded-full pl-14 text-xl"
            placeholder="For example: woodworking, cooking, bookkeeping"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Career advice", "Woodworking", "Cooking", "Running a business"].map((e) => (
            <button key={e} type="button" onClick={() => setQuery(e)} className="min-h-[48px] rounded-full border-2 border-warm-200 bg-white px-4 text-lg hover:border-brand-600">
              {e}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-6 text-lg text-muted">
          {shown.length === 0 ? "No one yet for that. Try another word." : `${shown.length} ${shown.length === 1 ? "person" : "people"} you could learn from`}
        </p>
        <ul className="mt-4 space-y-4">
          {shown.slice(0, 12).map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  set("personId", p.id);
                  go(1);
                }}
                className="flex w-full items-center gap-5 rounded-3xl border-2 border-warm-200 bg-white p-5 text-left transition hover:border-brand-600"
              >
                <Avatar name={p.name} />
                <span className="flex-1">
                  <span className="block text-2xl font-semibold text-brand-900">{p.name.split(" ")[0]}</span>
                  <span className="block text-lg text-muted">
                    {p.yearsExperience ? `${p.yearsExperience} years · ` : ""}Can teach {p.skills.slice(0, 3).join(", ").toLowerCase()}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {people.length === 0 && (
          <p className="mt-2 rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
            The first experienced people are joining now. Please check back soon, or invite someone you know whose experience you admire.
          </p>
        )}
      </Screen>
    );

  const first = person.name.split(" ")[0];
  const sessions = listings.filter((l) => l.mentorId === person.id);
  const session = sessions.find((l) => l.id === data.listingId);

  if (step === 1)
    return (
      <Screen title={`${first}${person.yearsExperience ? `, ${person.yearsExperience} years of experience` : ""}`}>
        {person.bio && <p className="font-serif text-2xl leading-snug text-brand-900">“{person.bio}”</p>}
        <h2 className="mt-8 font-sans text-xl font-semibold">{first} could teach you</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {person.skills.map((s) => (
            <li key={s} className="rounded-full bg-brand-100 px-4 py-2 text-lg text-brand-800">
              {s}
            </li>
          ))}
        </ul>
        {sessions.length > 0 && (
          <>
            <h2 className="mt-8 font-sans text-xl font-semibold">Paid sessions with {first}</h2>
            <ul className="mt-3 space-y-3">
              {sessions.map((l) => (
                <li key={l.id}>
                  <BigChoice
                    onClick={() => {
                      set("listingId", l.id);
                      go(4);
                    }}
                    icon={CalendarCheck}
                    tone="warm"
                    label={l.title}
                    sub={`${l.durationMins} minutes · $${l.price} · ${first} keeps 90%`}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
        <Actions primary={`Ask ${first} a free question`} onPrimary={() => go(2)} secondary="Look at someone else" onSecondary={() => go(0)} />
      </Screen>
    );

  if (step === 2)
    return (
      <Screen title={`What would you like to ask ${first}?`} help="Be specific, and say what you've already tried. Experienced people love a good question.">
        <SpeakOrType id="yq" label="Your question" value={data.question} onChange={(v) => set("question", v)} placeholder="For example: How do I stop my saw cuts drifting off the line?" />
        {!user && (
          <>
            <label htmlFor="yname" className="label mt-6 text-xl">
              Your first name
            </label>
            <input id="yname" className="input min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        <Actions
          primary="Send my question"
          disabled={data.question.trim().length < 5 || (!user && !data.name.trim())}
          busy={sendRun.busy}
          error={sendRun.error}
          onPrimary={() =>
            sendRun.run(async () => {
              const me = user ?? (await quickJoin(data.name.trim(), ["learner"]));
              await addNote({ toId: person.id, fromName: me.name.split(" ")[0], kind: "question", text: data.question.trim() });
              go(3);
            })
          }
        />
      </Screen>
    );

  if (step === 4 && session)
    return (
      <Screen title={`Book “${session.title}”`} help={`${session.durationMins} minutes · $${session.price}. ${first} would keep $${(session.price * 0.9).toFixed(2)} (90%).`}>
        <label htmlFor="ywhen" className="label text-xl">
          When would suit you?
        </label>
        <input id="ywhen" type="datetime-local" className="input min-h-[60px] text-xl" value={data.when} onChange={(e) => set("when", e.target.value)} />
        {!user && (
          <>
            <label htmlFor="ybname" className="label mt-6 text-xl">
              Your first name
            </label>
            <input id="ybname" className="input min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        {session.cancellation && <p className="mt-4 text-lg text-muted">{session.cancellation}.</p>}
        <p className="mt-4 rounded-2xl bg-warm-100 p-5 text-lg">
          Nothing is charged through TogetherWeGrow. If {first} accepts, you agree together how to pay. Please never pay before you've met.
        </p>
        <Actions
          primary="Ask to book"
          disabled={!data.when || (!user && !data.name.trim())}
          busy={sendRun.busy}
          error={sendRun.error}
          onPrimary={() =>
            sendRun.run(async () => {
              if (!user) await quickJoin(data.name.trim(), ["learner"]);
              await createRequest({
                kind: "session",
                fromId: "",
                toId: person.id,
                listingId: session.id,
                topic: session.title,
                message: "",
                proposedAt: new Date(data.when).toISOString(),
              });
              go(5);
            })
          }
        />
      </Screen>
    );

  if (step === 5 && session)
    return (
      <Screen title="Your booking request has been sent." help={`${first} can accept, or suggest another time. Nothing is charged until then.`}>
        <p className="rounded-3xl bg-brand-100/70 p-6 text-xl">
          You'll see {first}'s answer in{" "}
          <Link to="/inbox" className="link">
            your messages
          </Link>
          .
        </p>
        <div className="mt-8 space-y-4">
          <BigChoice onClick={() => go(0)} icon={Search} label="Find someone else to learn from" />
          <BigChoice to="/younger" icon={Users} tone="warm" label="Back to my choices" />
        </div>
        <Feedback flow="book" />
      </Screen>
    );

  return (
    <Screen title="Your question has been sent." help={`${first} will see it. Thank you for asking. It means a lot to people to know their experience is wanted.`}>
      <p className="rounded-3xl bg-brand-100/70 p-6 text-xl">
        Their reply will appear in{" "}
        <Link to="/inbox" className="link">
          your messages
        </Link>
        . People answer in their own time, so it may take a few days.
      </p>
      <div className="mt-8 space-y-4">
        <BigChoice
          onClick={() => {
            set("question", "");
            go(0);
          }}
          icon={Search}
          label="Find someone else to learn from"
        />
        <BigChoice to="/younger" icon={Users} tone="warm" label="Back to my choices" />
      </div>
      <Feedback flow="ask" />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Share My Skills                                                     */
/* ------------------------------------------------------------------ */

const SKILLS = ["Video calls", "Smartphones", "Email", "Online forms", "Chat assistants", "Social media", "Online safety"];
const WHEN = ["Weekday evenings", "Weekends", "Most days", "It varies"];
const HOW: { value: Format; label: string }[] = [
  { value: "in-person", label: "In person" },
  { value: "online", label: "Online" },
  { value: "both", label: "Either is fine" },
];

export function YoungerShare() {
  const { user } = useAuth();
  const w = useWizard("twg.simple.yshare", { skills: [] as string[], other: "", when: "", how: "both" as Format, name: user?.name.split(" ")[0] ?? "" });
  const { step, go, data, set } = w;

  const saveRun = useRun();
  function save() {
    return saveRun.run(async () => {
      const topics = [...data.skills, ...(data.other.trim() ? [data.other.trim()] : [])];
      const person = user ?? (await quickJoin(data.name.trim(), ["buddy"]));
      await saveUser({
        ...person,
        roles: person.roles.includes("buddy") ? person.roles : [...person.roles, "buddy"],
        bio: person.bio || `Happy to help with ${topics.join(", ").toLowerCase()}.`,
        format: data.how,
        profileApproved: true,
        buddy: { topics, availability: data.when, mode: data.how, pricing: "volunteer" },
      });
      go(4);
    });
  }

  if (step === 0)
    return (
      <Screen step="1 of 4" title="What could you help with?" help="Choose as many as you like.">
        <div className="space-y-3">
          {SKILLS.map((s) => (
            <BigChoice
              key={s}
              label={s}
              selected={data.skills.includes(s)}
              onClick={() => set("skills", data.skills.includes(s) ? data.skills.filter((x) => x !== s) : [...data.skills, s])}
            />
          ))}
        </div>
        <label htmlFor="other" className="label mt-6 text-xl">
          Something else? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="other" className="input min-h-[60px] text-xl" value={data.other} onChange={(e) => set("other", e.target.value)} placeholder="For example: online banking" />
        <Actions primary="Next" onPrimary={() => go(1)} disabled={data.skills.length === 0 && !data.other.trim()} />
      </Screen>
    );

  if (step === 1)
    return (
      <Screen step="2 of 4" title="When are you usually free?">
        <div className="space-y-3">
          {WHEN.map((t) => (
            <BigChoice
              key={t}
              label={t}
              onClick={() => {
                set("when", t);
                go(2);
              }}
            />
          ))}
        </div>
      </Screen>
    );

  if (step === 2)
    return (
      <Screen step="3 of 4" title="How would you like to help?">
        <div className="space-y-3">
          {HOW.map((h) => (
            <BigChoice
              key={h.value}
              label={h.label}
              onClick={() => {
                set("how", h.value);
                go(3);
              }}
            />
          ))}
        </div>
      </Screen>
    );

  if (step === 3)
    return (
      <Screen step="4 of 4" title="What's your first name?" help="This is what people will see.">
        <label htmlFor="ysname" className="sr-only">
          Your first name
        </label>
        <input id="ysname" className="input min-h-[64px] text-2xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
        <p className="mt-6 rounded-2xl bg-brand-100/70 p-5 text-lg">
          A reminder: patience is the whole gift. Go at their pace, let them do the tapping, and never ask for passwords.
        </p>
        <Actions primary="Offer my help" onPrimary={save} disabled={!data.name.trim()} busy={saveRun.busy} error={saveRun.error} />
      </Screen>
    );

  return (
    <Screen title={`Thank you, ${data.name.trim()}.`} help="Older adults asking for help can now find you. When someone asks, it will be in your messages.">
      <div className="space-y-4">
        <BigChoice to="/younger/learn" icon={Search} label="Find someone to learn from too" />
        <BigChoice to="/younger" icon={Users} tone="warm" label="Back to my choices" />
      </div>
      <Feedback flow="offer" />
    </Screen>
  );
}
