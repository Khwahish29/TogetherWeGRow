import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calculator,
  Check,
  ChefHat,
  Coins,
  Factory,
  FileText,
  GraduationCap,
  Hammer,
  Heart,
  HeartPulse,
  HelpCircle,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  MessageSquareText,
  Mic,
  Scissors,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  Truck,
  Type,
  Users,
  Video,
  Volume2,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { addNote, answerQuestion, getQuestions, getUsers, quickJoin, saveUser } from "../lib/store";
import { useStore } from "../lib/useStore";
import { TextSizeToggle, setTextSize } from "../components/TextSizeToggle";
import { Actions, BigChoice, Examples, Screen, SpeakOrType, TreeAndSprout, useRun } from "./parts";
import { useWizard } from "./useWizard";
import { Feedback, MeaningScreen } from "./Extra";

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

/* ------------------------------------------------------------------ */
/* Share My Experience                                                 */
/* ------------------------------------------------------------------ */

const SHARE_START = { kind: "", work: "", more: "", skills: [] as string[], summary: "", name: "", analyzed: false, questionId: "", answer: "" };

/** Kinds of work, each with a kind word and a few things people often want to learn from someone who did it. */
const KINDS: { id: string; label: string; icon: LucideIcon; praise: string; skills: string[] }[] = [
  { id: "build", label: "Building and carpentry", icon: Hammer, praise: "Things you built are still standing.", skills: ["Carpentry", "Home repairs", "Using hand tools"] },
  { id: "cook", label: "Cooking and kitchens", icon: ChefHat, praise: "You've fed more people than you could ever count.", skills: ["Cooking", "Running a kitchen", "Feeding a crowd"] },
  { id: "care", label: "Caring and nursing", icon: HeartPulse, praise: "People were safer because you were there.", skills: ["Caring for others", "Patience with people", "Staying calm under pressure"] },
  { id: "grow", label: "Farming and gardening", icon: Sprout, praise: "You know things about soil and seasons that no screen can tell.", skills: ["Growing food", "Gardening", "Reading the seasons"] },
  { id: "fix", label: "Fixing and mechanics", icon: Wrench, praise: "You kept things running when others gave up on them.", skills: ["Repairs", "Finding what's wrong", "Looking after machines"] },
  { id: "sew", label: "Sewing and tailoring", icon: Scissors, praise: "Your work was worn close to people's lives.", skills: ["Sewing", "Mending clothes", "Working with fabric"] },
  { id: "teach", label: "Teaching and guiding", icon: GraduationCap, praise: "Somewhere, people still use what you taught them.", skills: ["Explaining things clearly", "Guiding beginners", "Patience"] },
  { id: "office", label: "Office and bookkeeping", icon: Calculator, praise: "You kept everything in order so others could do their work.", skills: ["Keeping records", "Managing money", "Staying organized"] },
  { id: "drive", label: "Driving and delivery", icon: Truck, praise: "People counted on you to arrive, and you did.", skills: ["Safe driving", "Planning routes", "Being reliable"] },
  { id: "factory", label: "Factory and machine work", icon: Factory, praise: "You made things people use every day.", skills: ["Working with machines", "Workplace safety", "Checking quality"] },
];

export function OlderShare() {
  const { user } = useAuth();
  const w = useWizard("twg.simple.share", { ...SHARE_START, name: user?.name.split(" ")[0] ?? "" });
  const { step, go, data, set } = w;
  const kind = KINDS.find((k) => k.id === data.kind);
  const said = [data.work, data.more].map((t) => t.trim()).filter(Boolean).join(" ");
  const loading = step === 2 && !data.analyzed;

  // Step 2: work out what they could pass on. If they used their own words, read those; otherwise start from the kind of work they tapped.
  useEffect(() => {
    if (step !== 2 || data.analyzed) return;
    let active = true;
    const fallback = kind?.skills ?? [];
    if (!said) {
      set("skills", fallback);
      set("summary", "");
      set("analyzed", true);
      return;
    }
    api
      .profileDraft([kind && `My work: ${kind.label}`, said].filter(Boolean).join("\n"))
      .then((r) => {
        if (!active) return;
        set("skills", r.data.skills.length ? r.data.skills.slice(0, 5) : fallback);
        set("summary", r.data.summary);
      })
      .catch(() => active && set("skills", fallback))
      .finally(() => active && set("analyzed", true));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, data.analyzed]);

  const shareRun = useRun();
  function share(name: string) {
    return shareRun.run(async () => {
      // A first name is enough to start; they can add an email later to sign in on other devices.
      const person = user ?? (await quickJoin(name.trim(), ["mentor"]));
      const workLine = kind ? `Worked in ${kind.label.toLowerCase()}.` : "";
      await saveUser({
        ...person,
        roles: person.roles.includes("mentor") ? person.roles : [...person.roles, "mentor"],
        bio: data.summary || [workLine, said].filter(Boolean).join(" ") || person.bio,
        skills: [...new Set([...person.skills, ...(data.skills.length ? data.skills : (kind?.skills ?? [said.slice(0, 40)]))])],
        yearsExperience: person.yearsExperience ?? (Number(said.match(/(\d{1,2})\s*years/i)?.[1]) || null),
        profileApproved: true,
      });
      // Start fresh next time, so old answers don't reappear.
      for (const k of ["kind", "work", "more", "summary"] as const) set(k, "");
      set("skills", []);
      set("analyzed", false);
      go(6);
    });
  }

  // 1 of 3: one tap is enough.
  if (step === 0)
    return (
      <Screen step="Step 1 of 3" title="What kind of work have you done?" help="Tap the one that fits best. Close enough is fine.">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {KINDS.map((k) => (
            <li key={k.id}>
              <button
                type="button"
                onClick={() => {
                  set("kind", k.id);
                  set("work", "");
                  if (k.id !== data.kind) set("more", "");
                  set("analyzed", false);
                  go(1);
                }}
                aria-pressed={data.kind === k.id}
                className={`flex h-full min-h-[132px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 p-4 text-center transition hover:border-brand-600 hover:bg-brand-50/60 ${
                  data.kind === k.id ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white"
                }`}
              >
                <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
                  <k.icon className="h-8 w-8" />
                </span>
                <span className="text-lg font-semibold leading-snug text-brand-900 sm:text-xl">{k.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <BigChoice onClick={() => go(10)} icon={Mic} tone="warm" label="Something else" sub="Tell us in your own words" />
        </div>
        <p className="mt-10 border-t border-warm-200 pt-6 text-lg">
          <button type="button" onClick={() => go(20)} className="link inline-flex items-center gap-2 text-left">
            <HelpCircle aria-hidden="true" className="h-5 w-5 shrink-0" /> Or simply answer a question a younger person is asking
          </button>
        </p>
      </Screen>
    );

  // The "in my own words" way in. It replaces the tiles, and skips the optional step.
  if (step === 10)
    return (
      <Screen step="Step 1 of 3" title="Tell us about your work" help="In your own words. A sentence is plenty, and there's no wrong answer.">
        <SpeakOrType id="work" label="The work you've done" value={data.work} onChange={(v) => set("work", v)} placeholder="For example: I was a carpenter for 35 years." />
        <Examples items={["I was a carpenter for 35 years", "I ran a kitchen", "I drove a bus for 20 years", "I was a nurse"]} onPick={(v) => set("work", v)} />
        <Actions
          primary="Next"
          disabled={data.work.trim().length < 3}
          onPrimary={() => {
            set("kind", "");
            set("more", "");
            set("analyzed", false);
            go(2);
          }}
        />
      </Screen>
    );

  // 2 of 3: entirely optional.
  if (step === 1)
    return (
      <Screen
        step="Step 2 of 3"
        eyebrow={kind?.praise}
        title="Would you like to add anything?"
        help="How long you did it, or something you're proud of. Only if you'd like to. You've already told us enough."
      >
        <SpeakOrType id="more" label="Anything you'd like to add" value={data.more} onChange={(v) => set("more", v)} placeholder="For example: 35 years, mostly furniture. I trained a lot of apprentices." />
        <Actions
          primary={data.more.trim() ? "Next" : "Skip this"}
          onPrimary={() => {
            set("analyzed", false);
            go(2);
          }}
        />
      </Screen>
    );

  // 3 of 3: what they could pass on, and one decision.
  if (step === 2)
    return (
      <Screen step="Step 3 of 3" title={loading ? "One moment…" : "Look what you could pass on"} help={loading ? "Reading what you shared." : undefined}>
        <div aria-live="polite">
          {!loading && (
            <>
              <section className="relative overflow-hidden rounded-[2rem] bg-brand-900 p-6 text-brand-100 shadow-xl sm:p-8" aria-label="What you could pass on">
                <span aria-hidden="true" className="absolute -right-3 -top-3 text-[7rem] leading-none opacity-20">
                  🌳
                </span>
                <p className="font-serif text-2xl leading-snug text-white">{kind?.praise ?? "A lifetime of work is a lifetime of knowing how."}</p>
                {said && <p className="mt-3 border-l-2 border-warm-400 pl-4 text-lg italic">“{said}”</p>}
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">People could learn from you</p>
                {data.skills.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {data.skills.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => set("skills", data.skills.filter((x) => x !== s))}
                          aria-label={`${s}. Tap to remove if it doesn't fit`}
                          className="flex min-h-[48px] items-center gap-2 rounded-full bg-white/10 px-4 text-lg font-medium text-white ring-1 ring-white/25 hover:bg-white/20"
                        >
                          {s} <X aria-hidden="true" className="h-4 w-4 opacity-70" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-lg text-white">Everything you've told us.</p>
                )}
                {data.skills.length > 0 && <p className="mt-3 text-base">These are suggestions. Tap any that don't fit to remove them.</p>}
              </section>

              <p className="mt-6 text-xl">Someone, somewhere, is trying to learn exactly this.</p>
              <h2 className="mt-8 font-sans text-2xl font-semibold">Shall we let younger people know they can ask you?</h2>
              <p className="mt-2 text-lg text-muted">It's your choice, and you can change your mind any time.</p>
              <div className="mt-5 space-y-4">
                <BigChoice onClick={() => (user ? share(user.name) : go(3))} icon={Heart} label={shareRun.busy ? "One moment…" : "Yes, I'd like to share"} sub="Your phone and email stay private" />
                <BigChoice onClick={() => go(7)} icon={Check} tone="warm" label="Not right now" sub="Nothing will be shared" />
              </div>
              {shareRun.error && (
                <p role="alert" className="mt-4 rounded-2xl bg-warm-100 p-4 text-lg text-warm-800">
                  {shareRun.error}
                </p>
              )}
            </>
          )}
        </div>
      </Screen>
    );

  if (step === 3)
    return (
      <Screen title="Last thing: what should people call you?" help="Your first name is enough.">
        <label htmlFor="name" className="sr-only">
          Your first name
        </label>
        <input id="name" className="input min-h-[64px] text-2xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
        <Actions primary="Share my experience" onPrimary={() => share(data.name)} disabled={!data.name.trim()} busy={shareRun.busy} error={shareRun.error} />
      </Screen>
    );

  if (step === 6)
    return (
      <Screen title={`Thank you, ${(user?.name ?? data.name).trim().split(" ")[0]}.`} help="That's it. You're done. Someone will be glad you did this.">
        <TreeAndSprout className="mx-auto h-auto w-full max-w-sm" />
        <p className="mt-4 rounded-3xl bg-brand-100/70 p-6 text-xl text-brand-900">
          When a younger person asks you something, it will be waiting in{" "}
          <Link to="/inbox" className="link">
            your messages
          </Link>
          . There's nothing more you need to do.
        </p>
        <div className="mt-6">
          <BigChoice to="/older" icon={Users} label="Back to my choices" />
        </div>

        <div className="mt-10 border-t border-warm-200 pt-6">
          <p className="text-lg text-muted">Another day, only if you'd like:</p>
          <ul className="mt-3 space-y-3 text-lg">
            <li>
              <Link to="/older/earn" className="link inline-flex items-center gap-2">
                <Coins aria-hidden="true" className="h-5 w-5 shrink-0" /> Earn from what you know (you keep 90%)
              </Link>
            </li>
            <li>
              <Link to="/older/roles" className="link inline-flex items-center gap-2">
                <Briefcase aria-hidden="true" className="h-5 w-5 shrink-0" /> See work that's easier on the body
              </Link>
            </li>
          </ul>
        </div>
        <Feedback flow="share" />
      </Screen>
    );

  if (step === 20 || step === 21 || step === 22) return <AnswerAQuestion step={step} go={go} data={data} set={set} />;

  // step 7: chose not to share
  return (
    <Screen title="That's completely fine." help="Nothing has been shared. What you know is still yours, and you're welcome back whenever you like.">
      <div className="space-y-4">
        <BigChoice to="/older" icon={Users} label="Back to my choices" />
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Learn Something New                                                 */
/* ------------------------------------------------------------------ */

const TOPICS: { id: string; label: string; why: string; icon: LucideIcon; to?: string }[] = [
  { id: "video-meeting", label: "Video call my family", why: "See their faces, wherever they are", icon: Video },
  { id: "photos", label: "Send a photo from my phone", why: "Share a moment with someone you love", icon: ImageIcon },
  { id: "email", label: "Send an email", why: "Write to anyone, at any time", icon: Mail },
  { id: "scams", label: "Check a suspicious message", why: "Paste it in and we'll look for warning signs", icon: ShieldAlert, to: "/older/scam" },
  { id: "ai-tools", label: "Ask a chat assistant a question", why: "Get a quick answer in plain words", icon: MessageCircle },
];

/** A kind word that changes as they move through the steps. */
function encouragement(index: number, total: number) {
  const left = total - index - 1;
  if (index === 0) return "A good place to start. Take all the time you need.";
  if (left === 0) return "This is the last one. You've nearly done it.";
  if (left === 1) return "Just one more after this.";
  if (index + 1 === Math.ceil(total / 2)) return "You're halfway there, and doing well.";
  return `You're doing well. ${left} more small steps to go.`;
}

export function OlderLearn() {
  const w = useWizard("twg.simple.learn", { topic: "", steps: [] as string[], intro: "", at: 0 });
  const { step, go, data, set } = w;
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [simpler, setSimpler] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const topic = TOPICS.find((t) => t.id === data.topic);

  async function choose(id: string) {
    set("topic", id);
    set("steps", []);
    set("at", 0);
    setFailed(false);
    setLoading(true);
    go(1);
    try {
      const res = await api.companion({ action: "guide", topic: id });
      set("intro", res.data.intro ?? "");
      set("steps", res.data.steps ?? []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSimpler(null);
    window.speechSynthesis?.cancel();
    // Remember where they are, so they can carry on another time.
    if (step >= 1 && step <= data.steps.length) set("at", step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (step === 0 || !topic) {
    const resume = topic && data.steps.length > 0 && data.at >= 1 && data.at <= data.steps.length ? topic : null;
    return (
      <Screen title="What would you like to learn?" help="Pick one. We'll go one small step at a time, and you can't break anything.">
        <figure className="relative mb-6 overflow-hidden rounded-3xl">
          <img src="/images/learning-together.jpg" alt="An older woman types at a computer while a helper stands beside her." className="h-44 w-full object-cover object-[60%_35%] sm:h-56" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/90 to-transparent p-5 pt-12 font-serif text-2xl text-white">
            Everyone starts somewhere. Today is a fine day for it.
          </figcaption>
        </figure>
        <div className="space-y-4">
          {resume && (
            <BigChoice
              onClick={() => go(data.at)}
              icon={Sparkles}
              tone="warm"
              label="Carry on where you stopped"
              sub={`${resume.label}: step ${data.at} of ${data.steps.length}`}
            />
          )}
          {TOPICS.map((t, i) => (
            <BigChoice key={t.id} to={t.to} onClick={t.to ? undefined : () => choose(t.id)} icon={t.icon} tone={i % 2 ? "warm" : "forest"} label={t.label} sub={t.why} />
          ))}
        </div>
        <p className="mt-8 text-lg">
          <Link to="/older/help?step=1" className="link inline-flex items-center gap-2">
            <Users aria-hidden="true" className="h-5 w-5 shrink-0" /> I'd rather learn with a person beside me
          </Link>
        </p>
        <p className="mt-8 text-sm text-muted">Photo: Ivana Guslarevic, CC BY-SA 4.0. The people pictured are not affiliated with TogetherWeGrow.</p>
      </Screen>
    );
  }

  if (failed)
    return (
      <Screen title="We couldn't get the steps just now." help="That's our fault, not yours. Please try again in a moment." readAloud={false}>
        <div className="space-y-4">
          <BigChoice onClick={() => choose(topic.id)} icon={Sparkles} label="Try again" />
          <BigChoice to="/older/help?step=1" icon={Users} tone="warm" label="Ask a person instead" />
        </div>
      </Screen>
    );

  if (loading || data.steps.length === 0)
    return (
      <Screen title={topic.label} help="Getting your steps ready. This takes a few seconds." readAloud={false}>
        <div role="status" aria-label="Loading" className="flex items-center gap-3 rounded-3xl bg-white p-8 ring-1 ring-warm-200">
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden="true" className="ember h-4 w-4 rounded-full bg-brand-600" style={{ animationDelay: `${i * 0.3}s`, animationDuration: "1.2s" }} />
          ))}
          <span className="ml-2 text-xl text-muted">Writing them out in plain words…</span>
        </div>
      </Screen>
    );

  const index = step - 1;
  const total = data.steps.length;

  if (index >= total)
    return (
      <Screen title="You did it." help={`Every step of “${topic.label.toLowerCase()}”. That took patience, and you had it.`}>
        <div className="flex flex-col items-center rounded-[2rem] bg-brand-900 p-8 text-center text-brand-100">
          <span aria-hidden="true" className="rise flex h-20 w-20 items-center justify-center rounded-full bg-warm-400 text-brand-900">
            <Check className="h-11 w-11" strokeWidth={3} />
          </span>
          <p className="mt-5 font-serif text-2xl leading-snug text-white">Nobody gets it all the first time. Come back as often as you like. The steps will be here.</p>
        </div>
        <div className="mt-6 space-y-4">
          <BigChoice onClick={() => go(1)} icon={Sparkles} label="Go through it again" sub="It gets easier each time" />
          <BigChoice onClick={() => go(0)} icon={FileText} tone="warm" label="Learn something else" />
          <BigChoice to="/older/help?step=1" icon={Users} tone="sage" label="I'd like a person to help" />
        </div>
        <Feedback flow="learn" askComfort />
      </Screen>
    );

  const current = data.steps[index];
  return (
    <Screen step={topic.label} title={`Step ${index + 1} of ${total}`} readAloud={false}>
      {/* The trail: where you've been, where you are, what's left. */}
      <ol aria-hidden="true" className="flex flex-wrap items-center gap-2">
        {data.steps.map((_, i) => (
          <li
            key={i}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold ${
              i < index ? "bg-brand-700 text-white" : i === index ? "bg-warm-400 text-brand-900 ring-4 ring-warm-200" : "bg-white text-muted ring-1 ring-warm-200"
            }`}
          >
            {i < index ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
          </li>
        ))}
      </ol>

      {index === 0 && data.intro && <p className="mt-6 text-xl text-muted">{data.intro}</p>}

      <div className="mt-6 flex gap-4 rounded-3xl bg-white p-6 ring-1 ring-warm-200 sm:gap-6 sm:p-8">
        <span aria-hidden="true" className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-800 sm:flex">
          <topic.icon className="h-9 w-9" />
        </span>
        <p aria-live="polite" className="font-serif text-[1.75rem] leading-snug text-brand-900">
          {current}
        </p>
      </div>

      {simpler && (
        <p className="pop-in mt-4 rounded-2xl bg-warm-100 p-5 text-xl">
          <strong>In other words:</strong> {simpler}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn-secondary min-h-[56px] text-lg" onClick={() => speak(simpler ?? current)}>
          <Volume2 aria-hidden="true" className="h-5 w-5" /> Read this step to me
        </button>
        <button
          type="button"
          className="btn-secondary min-h-[56px] text-lg"
          disabled={explaining}
          onClick={async () => {
            setExplaining(true);
            const res = await api.companion({ action: "simpler", topic: topic.id, step: current }).catch(() => null);
            setSimpler(res?.data.reply ?? "Take it slowly, one small part at a time. There's no rush.");
            setExplaining(false);
          }}
        >
          {explaining ? "One moment…" : "Explain it more simply"}
        </button>
      </div>

      <p className="mt-8 text-center font-serif text-xl text-warm-700">{encouragement(index, total)}</p>

      <Actions
        primary={index + 1 === total ? "I've done it" : "Done. Next step"}
        onPrimary={() => go(step + 1)}
        secondary={index > 0 ? "Go back a step" : undefined}
        onSecondary={index > 0 ? () => go(step - 1) : undefined}
      />
      <p className="mt-6 text-center text-lg">
        <Link to="/older/help?step=1" className="link inline-flex items-center gap-2">
          <Users aria-hidden="true" className="h-5 w-5 shrink-0" /> Stuck? Ask a person to help
        </Link>
      </p>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Get Help                                                            */
/* ------------------------------------------------------------------ */

/** What people ask for help with. `match` is the helper skill it lines up with; `guide` is a step-by-step guide on the same thing. */
const HELP_TOPICS: { id: string; label: string; icon: LucideIcon; match?: string; guide?: string }[] = [
  { id: "phone", label: "Using my phone", icon: Smartphone, match: "Smartphones" },
  { id: "video", label: "Video calls", icon: Video, match: "Video calls", guide: "video-meeting" },
  { id: "email", label: "Email", icon: Mail, match: "Email", guide: "email" },
  { id: "forms", label: "Filling in a form online", icon: FileText, match: "Online forms" },
  { id: "safety", label: "Staying safe online", icon: ShieldCheck, match: "Online safety" },
  { id: "other", label: "Something else", icon: HelpCircle },
];

const AVATAR = ["bg-brand-700 text-white", "bg-warm-600 text-white", "bg-brand-500 text-white", "bg-warm-400 text-brand-900"];

export function OlderHelp() {
  const users = useStore(getUsers, []);
  const { user } = useAuth();
  const helpRun = useRun();
  const w = useWizard("twg.simple.help", { helperId: "", topicId: "", contact: "", name: "", note: "" });
  const { step, go, data, set } = w;
  const topic = HELP_TOPICS.find((t) => t.id === data.topicId);
  const helps = (u: (typeof users)[number]) => Boolean(topic?.match && u.buddy?.topics.some((t) => t.toLowerCase() === topic.match!.toLowerCase()));
  // People who enjoy helping with this come first, then whoever joined most recently.
  const helpers = useMemo(
    () =>
      users
        .filter((u) => u.roles.includes("buddy") && u.buddy && u.id !== user?.id)
        .sort((a, b) => Number(helps(b)) - Number(helps(a)) || b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, user?.id, data.topicId],
  );
  const helper = helpers.find((h) => h.id === data.helperId) ?? users.find((u) => u.id === data.helperId);
  const first = helper?.name.split(" ")[0] ?? "a helper";

  if (step === 0)
    return (
      <Screen title="How can we help?" help="Asking is how everyone learns anything. You're in good company.">
        <div className="space-y-4">
          <BigChoice onClick={() => go(1)} image="/images/learning-together.jpg" imageFocus="70% 35%" label="Ask a friendly person" sub="A patient younger helper, at your pace" />
          <BigChoice onClick={() => go(12)} icon={MessageSquareText} tone="warm" label="Help with a message I received" sub="Is it a scam? What does it mean?" />
          <BigChoice to="/older/learn" icon={FileText} tone="sage" label="Show me step by step" sub="Simple steps you can follow on your own" />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 ring-1 ring-warm-200">
          <p className="flex items-center gap-3 text-xl font-semibold text-brand-900">
            <Type aria-hidden="true" className="h-6 w-6 text-warm-700" /> Are the words too small?
          </p>
          <TextSizeToggle />
        </div>
        <p className="mt-8 text-sm text-muted">Photo: Ivana Guslarevic, CC BY-SA 4.0. The people pictured are not affiliated with TogetherWeGrow.</p>
      </Screen>
    );

  if (step === 11) return <MeaningScreen />;

  if (step === 12)
    return (
      <Screen title="What would you like to know about it?" help="Have the message ready. You can paste it or type it in.">
        <div className="space-y-4">
          <BigChoice to="/older/scam" icon={ShieldAlert} label="Is it a scam?" sub="We'll look for the warning signs with you" />
          <BigChoice onClick={() => go(11)} icon={MessageSquareText} tone="warm" label="What does it mean?" sub="Plain words for a confusing message" />
        </div>
      </Screen>
    );

  if (step === 10)
    return (
      <Screen title="How big would you like the words?" help="Tap one. You'll see the change straight away.">
        <div className="space-y-4">
          <BigChoice onClick={() => setTextSize("standard")} emoji="A" label="Normal size" />
          <BigChoice onClick={() => setTextSize("large")} emoji="A+" tone="warm" label="Bigger" />
          <BigChoice onClick={() => setTextSize("xlarge")} emoji="A++" tone="sage" label="Biggest" />
        </div>
        <Actions primary="That's better, thank you" onPrimary={() => go(0)} />
      </Screen>
    );

  // 1 of 3: what they need. One tap.
  if (step === 1)
    return (
      <Screen step="Step 1 of 3" title="What would you like help with?" help="Tap the closest one. You can explain more later if you want to.">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {HELP_TOPICS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  set("topicId", t.id);
                  go(2);
                }}
                aria-pressed={data.topicId === t.id}
                className={`flex h-full min-h-[132px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 p-4 text-center transition hover:border-brand-600 hover:bg-brand-50/60 ${
                  data.topicId === t.id ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white"
                }`}
              >
                <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
                  <t.icon className="h-8 w-8" />
                </span>
                <span className="text-lg font-semibold leading-snug text-brand-900 sm:text-xl">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Screen>
    );

  // 2 of 3: who to ask. Meeting people, not picking from a list.
  if (step === 2 || !topic)
    return (
      <Screen
        step="Step 2 of 3"
        title="Who would you like to ask?"
        help={helpers.length ? "These younger helpers signed up because they enjoy explaining things. None of them will rush you." : undefined}
      >
        {helpers.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
            <p>Our first younger helpers are just joining, so nobody is here to ask yet. That will change soon.</p>
            <div className="mt-5 space-y-3">
              <BigChoice to="/older/learn" icon={FileText} tone="warm" label="Show me step by step instead" sub="Simple steps you can follow today" />
              <BigChoice to="/older" icon={Users} tone="sage" label="Back to my choices" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <BigChoice
              onClick={() => {
                set("helperId", helpers[0].id);
                go(3);
              }}
              icon={Sparkles}
              tone="warm"
              label="Anyone kind is fine"
              sub="We'll ask the best match for you"
            />
            {helpers.map((h, i) => (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  set("helperId", h.id);
                  go(3);
                }}
                className="flex w-full items-start gap-4 rounded-3xl border-2 border-warm-200 bg-white p-5 text-left transition hover:border-brand-600 hover:bg-brand-50/60 sm:gap-5 sm:p-6"
              >
                <span aria-hidden="true" className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-serif text-3xl ${AVATAR[i % AVATAR.length]}`}>
                  {h.name.trim()[0]?.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-2xl font-semibold text-brand-900">{h.name.split(" ")[0]}</span>
                  {helps(h) && topic && (
                    <span className="mt-1 inline-block rounded-full bg-brand-100 px-3 py-1 text-base font-semibold text-brand-800">Enjoys helping with {topic.label.toLowerCase()}</span>
                  )}
                  {(() => {
                    const others = h.buddy!.topics.filter((t) => !(helps(h) && t.toLowerCase() === topic?.match?.toLowerCase())).slice(0, 3);
                    return others.length ? (
                      <span className="mt-2 block text-lg text-muted">
                        {helps(h) ? "Also helps with" : "Helps with"} {others.join(", ").toLowerCase()}
                      </span>
                    ) : null;
                  })()}
                  <span className="mt-1 block text-lg text-muted">
                    {h.buddy!.pricing === "paid" ? `Paid, $${h.buddy!.rate}/hour` : "Free"} · {h.buddy!.availability || "Times vary"} ·{" "}
                    {h.buddy!.mode === "online" ? "Online" : h.buddy!.mode === "in-person" ? "In person" : "Online or in person"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Screen>
    );

  // 3 of 3: one confirmation. Everything extra is optional and tucked away.
  if (step === 3)
    return (
      <Screen step="Step 3 of 3" title={`Shall we ask ${first}?`} help="That's all it takes. You can say as little or as much as you like.">
        <div className="flex items-center gap-4 rounded-3xl bg-brand-900 p-6 text-brand-100">
          <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-warm-400 font-serif text-3xl text-brand-900">
            {first[0]?.toUpperCase()}
          </span>
          <p className="font-serif text-2xl leading-snug text-white">
            “Hello {first}, I'd like some help with {topic.id === "other" ? "something" : topic.label.toLowerCase()}.”
          </p>
        </div>
        {!user && (
          <>
            <label htmlFor="hname" className="label mt-6 text-xl">
              Your first name
            </label>
            <input id="hname" className="input min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        <details className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
          <summary className="cursor-pointer text-xl font-semibold text-brand-900">Add a little more (only if you'd like)</summary>
          <label htmlFor="hnote" className="label mt-4 text-lg">
            Anything you'd like {first} to know
          </label>
          <textarea id="hnote" rows={3} className="input text-xl" value={data.note} onChange={(e) => set("note", e.target.value)} placeholder="For example: I'd like to call my daughter on Sunday." />
          <label htmlFor="contact" className="label mt-4 text-lg">
            A phone number or email, if you'd like them to contact you directly
          </label>
          <input id="contact" className="input min-h-[60px] text-xl" value={data.contact} onChange={(e) => set("contact", e.target.value)} />
        </details>
        <Actions
          primary={`Yes, ask ${first}`}
          disabled={!user && !data.name.trim()}
          busy={helpRun.busy}
          error={helpRun.error}
          onPrimary={() =>
            helpRun.run(async () => {
              const me = user ?? (await quickJoin(data.name.trim()));
              const text = [topic.label, data.note.trim()].filter(Boolean).join(": ");
              await addNote({ toId: data.helperId, fromName: me.name.split(" ")[0], kind: "help", text, contact: data.contact.trim() || undefined });
              set("note", "");
              go(4);
            })
          }
          secondary="Choose someone else"
          onSecondary={() => go(2)}
        />
      </Screen>
    );

  return (
    <Screen title={`${first} has your request.`} help="Well done for asking. That's the hardest part, and it's behind you.">
      <ol className="space-y-3">
        {[
          { done: true, title: "You asked", body: `For help with ${topic.id === "other" ? "something" : topic.label.toLowerCase()}.` },
          { done: false, title: `${first} reads it`, body: "Helpers are volunteers, so this can take a day or two." },
          {
            done: false,
            title: "Their reply arrives",
            body: data.contact.trim() ? "In your messages here, or they may contact you directly." : "In your messages here. We'll show you when you next visit.",
          },
        ].map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-warm-200">
            <span
              aria-hidden="true"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${s.done ? "bg-brand-700 text-white" : "bg-warm-100 text-warm-800"}`}
            >
              {s.done ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
            </span>
            <span>
              <span className="block text-xl font-semibold text-brand-900">{s.title}</span>
              <span className="block text-lg text-muted">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-8 space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="See my messages" />
        {topic.guide ? (
          <BigChoice to="/older/learn" icon={FileText} tone="warm" label="Try a guide while I wait" />
        ) : (
          <BigChoice to="/older" icon={Users} tone="warm" label="Back to my choices" />
        )}
      </div>
      <Feedback flow="help" askComfort />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Answer a question a younger person is asking                        */
/* ------------------------------------------------------------------ */

type ShareData = typeof SHARE_START;

function AnswerAQuestion({
  step,
  go,
  data,
  set,
}: {
  step: number;
  go: (n: number) => void;
  data: ShareData;
  set: <K extends keyof ShareData>(k: K, v: ShareData[K]) => void;
}) {
  const questions = useStore(getQuestions, []);
  const open = useMemo(() => [...questions].sort((a, b) => a.answers.length - b.answers.length).slice(0, 6), [questions]);
  const question = questions.find((q) => q.id === data.questionId);
  const answerRun = useRun();

  if (step === 20 || !question)
    return (
      <Screen title="Which question could you help with?" help="Pick one you know something about. Your answer can be short.">
        <div className="space-y-4">
          {open.map((q) => (
            <BigChoice
              key={q.id}
              onClick={() => {
                set("questionId", q.id);
                go(21);
              }}
              label={`“${q.text}”`}
              sub={q.askerLabel}
            />
          ))}
        </div>
      </Screen>
    );

  if (step === 21)
    return (
      <Screen title={`“${question.text}”`} help={`${question.askerLabel}. Say it the way you'd explain it to them in person.`}>
        <SpeakOrType id="qanswer" label="Your answer" value={data.answer} onChange={(v) => set("answer", v)} rows={6} />
        <Actions
          primary="Share my answer"
          disabled={data.answer.trim().length < 5}
          busy={answerRun.busy}
          error={answerRun.error}
          onPrimary={() =>
            answerRun.run(async () => {
              await answerQuestion(question.id, null, data.answer.trim());
              set("answer", "");
              go(22);
            })
          }
          secondary="Pick a different question"
          onSecondary={() => go(20)}
        />
      </Screen>
    );

  return (
    <Screen title="Thank you. Your answer is shared." help="Someone starting out will read what took you years to learn.">
      <div className="space-y-4">
        <BigChoice onClick={() => go(20)} icon={HelpCircle} label="Answer another question" />
        <BigChoice onClick={() => go(0)} icon={Heart} tone="warm" label="Share more about my work" sub="So people can ask you directly" />
        <BigChoice to="/older" icon={Users} tone="sage" label="Back to my choices" />
      </div>
      <Feedback flow="answer" askComfort />
    </Screen>
  );
}
