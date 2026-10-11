import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Calculator,
  CalendarCheck,
  Check,
  ChefHat,
  Compass,
  FileText,
  Hammer,
  HeartHandshake,
  HeartPulse,
  Mail,
  MessageCircleQuestion,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  Sprout,
  Users,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { skillsOverlap } from "../lib/matching";
import { addNote, createRequest, getListings, getThanks, getUsers, quickJoin, saveUser } from "../lib/store";
import type { Format } from "../lib/types";
import { useStore } from "../lib/useStore";
import { Avatar } from "../components/ui";
import { Actions, BigChoice, Screen, SpeakOrType, useRun } from "./parts";
import { useWizard } from "./useWizard";
import { Feedback } from "./Extra";

/* ------------------------------------------------------------------ */
/* Learn from Older Adults                                             */
/* ------------------------------------------------------------------ */

/** Kinds of know-how to browse by. Each matches people whose skills or story mention any of its words. */
const KINDS: { id: string; label: string; icon: LucideIcon; words: string[] }[] = [
  { id: "career", label: "Career advice", icon: Compass, words: [] },
  { id: "build", label: "Building and repairs", icon: Hammer, words: ["carpent", "wood", "build", "repair", "tool", "construct", "plumb", "weld", "electric", "mason"] },
  { id: "cook", label: "Cooking", icon: ChefHat, words: ["cook", "kitchen", "bak", "food", "chef"] },
  { id: "grow", label: "Growing things", icon: Sprout, words: ["garden", "farm", "grow", "soil", "plant"] },
  { id: "fix", label: "Machines and cars", icon: Wrench, words: ["mechanic", "machine", "engine", "car ", "cars", "fixing"] },
  { id: "business", label: "Business and money", icon: Calculator, words: ["business", "bookkeep", "money", "record", "manag", "account", "organiz"] },
  { id: "care", label: "Caring for people", icon: HeartPulse, words: ["caring", "nurs", "patien", "care "] },
  { id: "make", label: "Sewing and making", icon: Scissors, words: ["sew", "tailor", "fabric", "mend", "craft"] },
];

const STARTERS = ["How did you get started in this work?", "What's one mistake beginners often make?", "What do you wish someone had told you at my stage?"];

const firstName = (name: string) => {
  const first = name.trim().split(" ")[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
};
const prettyWhen = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });

function Timeline({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
          <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${i === 0 ? "bg-brand-700 text-white" : "bg-warm-100 text-warm-800"}`}>
            {i === 0 ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
          </span>
          <span>
            <span className="block text-xl font-semibold text-brand-900">{s.title}</span>
            <span className="block text-lg text-muted">{s.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function YoungerLearn() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const thanks = useStore(getThanks, []);
  const sendRun = useRun();
  const people = useMemo(
    () =>
      users
        .filter((u) => u.roles.includes("mentor") && u.skills.length > 0)
        .filter((u) => u.id !== user?.id && u.profileApproved)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [users, user?.id],
  );
  const w = useWizard("twg.simple.ylearn", { personId: "", question: "", name: "", listingId: "", when: "" });
  const { step, go, data, set } = w;
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [showing, setShowing] = useState(5);
  const person = people.find((p) => p.id === data.personId);

  const q = query.trim().toLowerCase();
  const picked = KINDS.find((k) => k.id === kind);
  const about = (p: (typeof people)[number]) => [...p.skills, ...p.industries, p.bio].join(" ").toLowerCase() + " ";
  let shown = people;
  if (q) shown = shown.filter((p) => [p.name, ...p.skills, ...p.industries, p.bio].some((s) => skillsOverlap(s, q) || s.toLowerCase().includes(q)));
  else if (picked?.id === "career") shown = [...shown].sort((a, b) => (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0));
  else if (picked) shown = shown.filter((p) => picked.words.some((word) => about(p).includes(word)));

  if (step === 0 || !person)
    return (
      <Screen title="Who could you learn from?" help="Someone nearby has already solved the thing you're stuck on. All it takes is a good question.">
        <figure className="relative mb-6 overflow-hidden rounded-3xl">
          <img src="/images/welding-mentor.jpg" alt="An experienced welder watches closely as a younger worker welds beside him." className="h-44 w-full object-cover object-[30%_20%] sm:h-56" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/90 to-transparent p-5 pt-12 font-serif text-2xl text-white">
            Ten minutes with someone who's done it ten thousand times.
          </figcaption>
        </figure>

        <form role="search" onSubmit={(e: FormEvent) => e.preventDefault()} className="relative">
          <label htmlFor="ysearch" className="sr-only">
            Search for a skill or a name
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted" />
          <input
            id="ysearch"
            type="search"
            className="input min-h-[64px] rounded-full pl-14 text-xl"
            placeholder="Search a skill"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setKind("");
              setShowing(5);
            }}
          />
        </form>

        <div role="group" aria-label="Or browse by kind of know-how" className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {KINDS.map((k) => {
            const on = kind === k.id && !q;
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setKind(on ? "" : k.id);
                  setQuery("");
                  setShowing(5);
                }}
                className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center text-base font-semibold leading-snug transition ${
                  on ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"
                }`}
              >
                <k.icon aria-hidden="true" className="h-7 w-7" />
                {k.label}
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="mt-6 text-lg text-muted">
          {people.length === 0
            ? ""
            : shown.length === 0
              ? "Nobody yet for that. Try another word, or browse everyone."
              : `${shown.length} ${shown.length === 1 ? "person" : "people"} you could learn from${picked?.id === "career" && !q ? ", most experienced first" : ""}`}
        </p>

        {people.length === 0 && (
          <div className="rounded-3xl bg-brand-900 p-6 text-brand-100">
            <p className="font-serif text-2xl leading-snug text-white">The first experienced people are joining now.</p>
            <p className="mt-2 text-lg">Know someone whose skill you admire? Invite them. Being asked means more than you'd think.</p>
            <Link to="/family" className="btn mt-5 min-h-[52px] bg-warm-400 px-6 font-semibold text-brand-900 hover:bg-warm-200">
              Invite someone <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        )}

        <ul className="mt-4 space-y-4">
          {shown.slice(0, showing).map((p) => {
            const offers = listings.filter((l) => l.mentorId === p.id);
            const from = offers.length ? Math.min(...offers.map((l) => l.price)) : null;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    set("personId", p.id);
                    go(1);
                  }}
                  className="lift w-full rounded-3xl border-2 border-warm-200 bg-white p-5 text-left hover:border-brand-600 sm:p-6"
                >
                  <span className="flex items-center gap-4">
                    <Avatar name={p.name} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-2xl font-semibold text-brand-900">{firstName(p.name)}</span>
                      <span className="block text-lg text-muted">{p.yearsExperience ? `${p.yearsExperience} years of experience` : "A lifetime of know-how"}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-600" />
                  </span>
                  {p.bio && <span className="mt-4 block border-l-2 border-warm-400 pl-4 font-serif text-xl leading-snug text-brand-900">“{p.bio.length > 120 ? `${p.bio.slice(0, 117)}…` : p.bio}”</span>}
                  <span className="mt-4 flex flex-wrap gap-2">
                    {p.skills.slice(0, 3).map((sk) => (
                      <span key={sk} className="rounded-full bg-brand-100 px-3 py-1 text-base font-medium text-brand-800">
                        {sk}
                      </span>
                    ))}
                    {from !== null && <span className="rounded-full bg-warm-100 px-3 py-1 text-base font-medium text-warm-800">Sessions from ${from}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {shown.length > showing && (
          <button type="button" onClick={() => setShowing(showing + 5)} className="btn-secondary mt-4 min-h-[60px] w-full text-lg">
            Show more people ({shown.length - showing} more)
          </button>
        )}
        <p className="mt-8 text-sm text-muted">Photo: Rwebogora, CC BY-SA 4.0. The people pictured are not affiliated with TogetherWeGrow.</p>
      </Screen>
    );

  const first = firstName(person.name);
  const sessions = listings.filter((l) => l.mentorId === person.id);
  const session = sessions.find((l) => l.id === data.listingId);
  const notes = thanks.filter((t) => t.toId === person.id).slice(0, 2);

  if (step === 1)
    return (
      <Screen title={`Meet ${first}`} help={person.yearsExperience ? `${person.yearsExperience} years of experience. That's a lot of problems already solved.` : "A lifetime of knowing how."}>
        <div className="rounded-[2rem] bg-brand-900 p-6 text-brand-100 sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar name={person.name} size="lg" />
            <p className="font-serif text-3xl text-white">{first}</p>
          </div>
          {person.bio && <p className="mt-5 font-serif text-2xl leading-snug text-white">“{person.bio}”</p>}
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">{first} could teach you</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {person.skills.map((sk) => (
              <li key={sk} className="rounded-full bg-white/10 px-4 py-2 text-lg font-medium text-white ring-1 ring-white/25">
                {sk}
              </li>
            ))}
          </ul>
        </div>

        {notes.length > 0 && (
          <section className="mt-6" aria-labelledby="ythanks">
            <h2 id="ythanks" className="font-sans text-xl font-semibold">
              What learners have said
            </h2>
            <ul className="mt-3 space-y-3">
              {notes.map((t) => (
                <li key={t.id} className="rounded-2xl bg-white p-5 text-lg ring-1 ring-warm-200">
                  “{t.message}”
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 space-y-4">
          <BigChoice onClick={() => go(2)} icon={MessageCircleQuestion} label={`Ask ${first} a question`} sub="Free. A good question is a kind of compliment" />
          {sessions.map((l) => (
            <BigChoice
              key={l.id}
              onClick={() => {
                set("listingId", l.id);
                go(4);
              }}
              icon={CalendarCheck}
              tone="warm"
              label={`Book: ${l.title}`}
              sub={`${l.durationMins === 60 ? "One hour" : `${l.durationMins} minutes`} · $${l.price}`}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 text-lg">
          <button type="button" className="link min-h-[44px]" onClick={() => go(0)}>
            Look at someone else
          </button>
          <Link to={`/safety?about=${person.id}`} className="text-base text-muted underline underline-offset-4">
            Report a concern about this profile
          </Link>
        </div>
      </Screen>
    );

  if (step === 2)
    return (
      <Screen title={`What would you like to ask ${first}?`} help="Say what you're trying to do and what you've already tried. People love a question that shows you've had a go.">
        <SpeakOrType id="yq" label="Your question" value={data.question} onChange={(v) => set("question", v)} placeholder="For example: My saw cuts keep drifting off the line. I've tried going slower. What am I missing?" />
        <div className="mt-5">
          <p className="text-lg text-muted">Not sure how to begin? Tap one to start:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STARTERS.map((st) => (
              <button key={st} type="button" onClick={() => set("question", st)} className="min-h-[48px] rounded-full border-2 border-warm-200 bg-white px-4 py-2 text-left text-lg hover:border-brand-600">
                {st}
              </button>
            ))}
          </div>
        </div>
        {!user && (
          <>
            <label htmlFor="yname" className="label mt-6 text-xl">
              Your first name
            </label>
            <input id="yname" className="input min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        <p className="mt-6 rounded-2xl bg-brand-100/70 p-5 text-lg">
          A small thing that matters: write the way you'd speak to someone you respect. If you use an expression they might not know,{" "}
          <Link to="/younger/understand" className="link">
            Vibe Check
          </Link>{" "}
          can suggest plainer words.
        </p>
        <Actions
          primary={`Send to ${first}`}
          disabled={data.question.trim().length < 5 || (!user && !data.name.trim())}
          busy={sendRun.busy}
          error={sendRun.error}
          onPrimary={() =>
            sendRun.run(async () => {
              const me = user ?? (await quickJoin(data.name.trim(), ["learner"]));
              await addNote({ toId: person.id, fromName: firstName(me.name), kind: "question", text: data.question.trim() });
              set("question", "");
              go(3);
            })
          }
        />
      </Screen>
    );

  if (step === 4 && session)
    return (
      <Screen title={`Book a session with ${first}`} help="Suggest a time. Nothing is confirmed until they say yes.">
        <div className="rounded-3xl bg-brand-900 p-6 text-brand-100">
          <p className="font-serif text-2xl leading-snug text-white">{session.title}</p>
          <p className="mt-2 text-lg">
            {session.durationMins === 60 ? "One hour" : `${session.durationMins} minutes`} · ${session.price} ·{" "}
            {session.format === "online" ? "Online" : session.format === "in-person" ? "In person" : "Online or in person"}
          </p>
        </div>
        <label htmlFor="ywhen" className="label mt-6 text-xl">
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
        <p className="mt-6 rounded-2xl bg-warm-100 p-5 text-lg">
          Nothing is charged through TogetherWeGrow. If {first} accepts, you agree together how to pay. All of it goes to {first}. Please never pay before
          you've met.{session.cancellation ? ` ${session.cancellation}.` : ""}
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
      <Screen title={`${first} has your booking request.`} help="Thank you for valuing what they know enough to pay for it.">
        <Timeline
          steps={[
            { title: "You asked to book", body: `${session.title}${data.when ? `, ${prettyWhen(data.when)}` : ""}.` },
            { title: `${first} answers`, body: "They can accept, or suggest another time. It may take a few days." },
            { title: "You agree the details", body: "Where to meet and how to pay. Nothing is charged by us." },
          ]}
        />
        <div className="mt-8 space-y-4">
          <BigChoice to="/inbox" icon={Mail} label="See my messages" />
          <BigChoice onClick={() => go(0)} icon={Search} tone="warm" label="Find someone else to learn from" />
          <BigChoice to="/younger" icon={Users} tone="sage" label="Back to my choices" />
        </div>
        <Feedback flow="book" />
      </Screen>
    );

  return (
    <Screen title={`Your question is on its way to ${first}.`} help="Thank you for asking. It means a great deal to know your experience is wanted.">
      <Timeline
        steps={[
          { title: "You asked", body: "A real question, to a real person." },
          { title: `${first} reads it`, body: "People answer in their own time. It may take a few days." },
          { title: "Their answer arrives", body: "In your messages here. A thank-you afterwards goes a long way." },
        ]}
      />
      <div className="mt-8 space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="See my messages" />
        <BigChoice onClick={() => go(0)} icon={Search} tone="warm" label="Find someone else to learn from" />
        <BigChoice to="/younger" icon={Users} tone="sage" label="Back to my choices" />
      </div>
      <Feedback flow="ask" />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Share My Skills                                                     */
/* ------------------------------------------------------------------ */

/** What a helper can offer. The names line up with what older adults ask for in Get Help. */
const SKILLS: { name: string; icon: LucideIcon }[] = [
  { name: "Video calls", icon: Video },
  { name: "Smartphones", icon: Smartphone },
  { name: "Email", icon: Mail },
  { name: "Online forms", icon: FileText },
  { name: "Online safety", icon: ShieldCheck },
  { name: "Chat assistants", icon: MessageCircleQuestion },
  { name: "Social media", icon: Users },
];
const WHEN = ["Weekday evenings", "Weekends", "Most days", "It varies"];
const HOW: { value: Format; label: string }[] = [
  { value: "both", label: "Online or in person" },
  { value: "online", label: "Online" },
  { value: "in-person", label: "In person" },
];

/** The whole of what we ask from a helper. */
const PROMISE = [
  { title: "I'll go at their pace", body: "Slowly, and as many times as it takes. No sighing." },
  { title: "I'll let them do the tapping", body: "My hands stay off their phone. They learn by doing." },
  { title: "I'll never ask for passwords, codes or money", body: "If they need to type one, I look away." },
];

const chip = (on: boolean) =>
  `min-h-[52px] rounded-full border-2 px-5 text-lg font-medium transition ${on ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"}`;

export function YoungerShare() {
  const { user } = useAuth();
  const helping = Boolean(user?.buddy && user.roles.includes("buddy"));
  const known = SKILLS.map((k) => k.name);
  const w = useWizard("twg.simple.yshare", {
    skills: user?.buddy?.topics.filter((t) => known.includes(t)) ?? ([] as string[]),
    other: user?.buddy?.topics.find((t) => !known.includes(t)) ?? "",
    when: user?.buddy?.availability || "Weekends",
    how: (user?.buddy?.mode ?? "both") as Format,
    name: user?.name.split(" ")[0] ?? "",
    promised: false,
  });
  const { step, go, data, set } = w;
  const topics = [...data.skills, ...(data.other.trim() ? [data.other.trim()] : [])];

  // Account details arrive a moment after the page opens. Fill in a returning helper's choices once they do.
  useEffect(() => {
    const b = user?.buddy;
    if (!b || data.skills.length || data.other) return;
    set("skills", b.topics.filter((t) => known.includes(t)));
    set("other", b.topics.find((t) => !known.includes(t)) ?? "");
    if (b.availability) set("when", b.availability);
    set("how", b.mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const saveRun = useRun();
  function save() {
    return saveRun.run(async () => {
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

  function pause() {
    return saveRun.run(async () => {
      if (!user) return;
      await saveUser({ ...user, roles: user.roles.filter((r) => r !== "buddy") });
      go(5);
    });
  }

  // 1 of 3: what they can help with.
  if (step === 0)
    return (
      <Screen
        step="Step 1 of 3"
        title={helping ? "What you help with" : "What could you help with?"}
        help={helping ? "You're already a helper. Thank you. Change anything you like." : "Things that feel obvious to you can be a locked door to someone else. Tap all that you could explain."}
      >
        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {SKILLS.map((k) => {
            const on = data.skills.includes(k.name);
            return (
              <li key={k.name}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => set("skills", on ? data.skills.filter((x) => x !== k.name) : [...data.skills, k.name])}
                  className={`relative flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 p-4 text-center transition ${
                    on ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white hover:border-brand-600"
                  }`}
                >
                  {on && (
                    <span aria-hidden="true" className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  )}
                  <span aria-hidden="true" className={`flex h-14 w-14 items-center justify-center rounded-2xl ${on ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-800"}`}>
                    <k.icon className="h-8 w-8" />
                  </span>
                  <span className="text-lg font-semibold leading-snug text-brand-900">{k.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <label htmlFor="other" className="label mt-6 text-xl">
          Something else? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="other" className="input min-h-[60px] text-xl" value={data.other} onChange={(e) => set("other", e.target.value)} placeholder="For example: online banking" />
        <Actions primary="Next" onPrimary={() => go(1)} disabled={topics.length === 0} />
        {helping && (
          <p className="mt-6 text-center text-lg">
            <button type="button" className="link min-h-[44px]" onClick={pause} disabled={saveRun.busy}>
              I need a break from helping for now
            </button>
          </p>
        )}
      </Screen>
    );

  // 2 of 3: when and how, on one screen, already filled in.
  if (step === 1)
    return (
      <Screen step="Step 2 of 3" title="When and how?" help="A rough idea is plenty. You and the person you help will agree the details.">
        <div role="group" aria-labelledby="yw-when">
          <p id="yw-when" className="text-xl font-semibold text-brand-900">
            I'm usually free
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {WHEN.map((t) => (
              <button key={t} type="button" aria-pressed={data.when === t} onClick={() => set("when", t)} className={chip(data.when === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-labelledby="yw-how" className="mt-8">
          <p id="yw-how" className="text-xl font-semibold text-brand-900">
            I can help
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {HOW.map((h) => (
              <button key={h.value} type="button" aria-pressed={data.how === h.value} onClick={() => set("how", h.value)} className={chip(data.how === h.value)}>
                {h.label}
              </button>
            ))}
          </div>
        </div>
        <Actions primary="Next" onPrimary={() => go(2)} />
      </Screen>
    );

  // 3 of 3: the promise, a preview, and a name.
  if (step === 2)
    return (
      <Screen step="Step 3 of 3" title="A helper's promise" help="Patience is the whole gift. For many older adults, asking was the hard part. This is how we honor it.">
        <ul className="space-y-3">
          {PROMISE.map((pr) => (
            <li key={pr.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-100 text-warm-700">
                <HeartHandshake className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xl font-semibold text-brand-900">{pr.title}</span>
                <span className="block text-lg text-muted">{pr.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <label className={`mt-5 flex min-h-[64px] cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 text-xl font-semibold text-brand-900 ${data.promised ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white"}`}>
          <input type="checkbox" className="h-6 w-6 accent-[#234638]" checked={data.promised} onChange={(e) => set("promised", e.target.checked)} />
          I promise
        </label>

        {!user && (
          <>
            <label htmlFor="ysname" className="label mt-6 text-xl">
              Your first name
            </label>
            <input id="ysname" className="input min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}

        <p className="mt-8 text-lg text-muted">This is how older adults will see you:</p>
        <div className="mt-2 flex items-start gap-4 rounded-3xl border-2 border-warm-200 bg-white p-5">
          <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-700 font-serif text-3xl text-white">
            {(firstName(user?.name || data.name) || "?")[0]}
          </span>
          <span className="min-w-0">
            <span className="block text-2xl font-semibold text-brand-900">{firstName(user?.name || data.name) || "Your name"}</span>
            <span className="mt-1 block text-lg text-muted">Helps with {topics.slice(0, 3).join(", ").toLowerCase()}</span>
            <span className="mt-1 block text-lg text-muted">
              Free · {data.when} · {HOW.find((h) => h.value === data.how)?.label}
            </span>
          </span>
        </div>

        <Actions
          primary={helping ? "Save my changes" : "Offer my help"}
          onPrimary={save}
          disabled={!data.promised || (!user && !data.name.trim())}
          busy={saveRun.busy}
          error={saveRun.error}
        />
      </Screen>
    );

  if (step === 5)
    return (
      <Screen title="You're taking a break." help="Older adults won't see you in the list for now. Thank you for the help you've given. Come back whenever you're ready.">
        <div className="space-y-4">
          <BigChoice onClick={() => go(0)} icon={HeartHandshake} label="Start helping again" />
          <BigChoice to="/younger" icon={Users} tone="warm" label="Back to my choices" />
        </div>
      </Screen>
    );

  return (
    <Screen title={`Thank you, ${firstName(user?.name || data.name)}.`} help="You've just made it easier for someone to ask. That matters more than it sounds.">
      <Timeline
        steps={[
          { title: "You offered your help", body: `With ${topics.slice(0, 3).join(", ").toLowerCase()}.` },
          { title: "Someone asks", body: "It will be waiting in your messages. There may be a wait while people find us." },
          { title: "You reply and arrange a time", body: "Online or in person, whatever suits you both." },
        ]}
      />
      <div className="mt-8 space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="See my messages" />
        <BigChoice to="/younger/learn" icon={Search} tone="warm" label="Learn from someone too" sub="It goes both ways" />
        <BigChoice to="/younger" icon={Users} tone="sage" label="Back to my choices" />
      </div>
      <Feedback flow="offer" />
    </Screen>
  );
}
