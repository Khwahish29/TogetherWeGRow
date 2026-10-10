import { useEffect, useMemo, useState } from "react";
import { Briefcase, Check, Coins, FileText, Heart, HelpCircle, Mail, MessageCircle, MessageSquareText, ShieldAlert, Image as ImageIcon, Sparkles, Type, Video, Volume2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { addNote, answerQuestion, getQuestions, getUsers, quickJoin, saveUser } from "../lib/store";
import { useStore } from "../lib/useStore";
import { setTextSize } from "../components/TextSizeToggle";
import { Actions, BigChoice, Examples, Screen, SpeakOrType, useRun } from "./parts";
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

const SHARE_START = { work: "", good: "", lesson: "", skills: [] as string[], summary: "", name: "", analyzed: false, questionId: "", answer: "" };

export function OlderShare() {
  const { user } = useAuth();
  const w = useWizard("twg.simple.share", { ...SHARE_START, name: user?.name.split(" ")[0] ?? "" });
  const { step, go, data, set } = w;
  const loading = step === 3 && !data.analyzed;

  // Step 3: find what they could teach, using only their own words.
  useEffect(() => {
    if (step !== 3 || data.analyzed) return;
    let active = true;
    const text = [`My work: ${data.work}`, data.good && `What I'm good at: ${data.good}`, data.lesson && `A lesson I've learned: ${data.lesson}`]
      .filter(Boolean)
      .join("\n");
    api
      .profileDraft(text)
      .then((r) => {
        if (!active) return;
        set("skills", r.data.skills.slice(0, 6));
        set("summary", r.data.summary);
      })
      .catch(() => undefined)
      .finally(() => active && set("analyzed", true));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, data.analyzed]);

  const shareRun = useRun();
  function share() {
    return shareRun.run(async () => {
      // A first name is enough to start; they can add an email later to sign in on other devices.
      const person = user ?? (await quickJoin(data.name.trim(), ["mentor"]));
      await saveUser({
        ...person,
        name: user?.name || data.name.trim(),
        roles: person.roles.includes("mentor") ? person.roles : [...person.roles, "mentor"],
        bio: data.summary || data.work,
        skills: [...new Set([...person.skills, ...(data.skills.length ? data.skills : [data.work.slice(0, 40)])])],
        yearsExperience: person.yearsExperience ?? (Number(data.work.match(/(\d{1,2})\s*years/i)?.[1]) || null),
        profileApproved: true,
      });
      go(6);
    });
  }

  if (step === 0)
    return (
      <Screen step="Question 1 of 3" title="What kind of work have you done?" help="Tell us in your own words. A sentence or two is plenty.">
        <SpeakOrType id="work" label="The work you've done" value={data.work} onChange={(v) => set("work", v)} placeholder="For example: I was a carpenter for 35 years." />
        <Examples items={["I was a carpenter for 35 years", "I ran a kitchen", "I worked on farms", "I was a nurse"]} onPick={(v) => set("work", v)} />
        <Actions primary="Next" onPrimary={() => go(1)} disabled={data.work.trim().length < 3} />
        <div className="mt-10 border-t border-warm-200 pt-8">
          <BigChoice onClick={() => go(20)} icon={HelpCircle} tone="warm" label="Or answer a question someone is asking" sub="Younger people's real questions about work and life" />
        </div>
      </Screen>
    );

  if (step === 20 || step === 21 || step === 22) return <AnswerAQuestion step={step} go={go} data={data} set={set} />;

  if (step === 1)
    return (
      <Screen step="Question 2 of 3" title="What are you good at, or love doing?" help="Skills from work, hobbies, or anything people ask you about.">
        <SpeakOrType id="good" label="What you're good at" value={data.good} onChange={(v) => set("good", v)} placeholder="For example: fixing things, gardening, sewing, keeping calm." />
        <Actions primary="Next" onPrimary={() => go(2)} secondary="Skip this question" onSecondary={() => go(2)} />
      </Screen>
    );

  if (step === 2)
    return (
      <Screen step="Question 3 of 3" title="What has life or work taught you?" help="A lesson you wish someone had told you when you were starting out.">
        <SpeakOrType id="lesson" label="A lesson you've learned" value={data.lesson} onChange={(v) => set("lesson", v)} placeholder="For example: measure twice, cut once." />
        <Actions
          primary="See what I could teach"
          onPrimary={() => {
            set("analyzed", false);
            go(3);
          }}
          secondary="Skip this question"
          onSecondary={() => {
            set("analyzed", false);
            go(3);
          }}
        />
      </Screen>
    );

  if (step === 3)
    return (
      <Screen title="Here's what you could teach others" help={loading ? "Reading what you shared…" : "Based only on what you told us. Tap any that don't feel right to remove them."}>
        <div aria-live="polite">
          {!loading && (
            <>
              {data.skills.length > 0 ? (
                <ul className="space-y-3">
                  {data.skills.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => set("skills", data.skills.filter((x) => x !== s))}
                        className="flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl border-2 border-brand-200 bg-white px-5 text-left text-xl font-semibold text-brand-900 hover:border-warm-600"
                        aria-label={`${s}. Tap to remove`}
                      >
                        <span className="flex items-center gap-3">
                          <Check aria-hidden="true" className="h-6 w-6 text-brand-600" /> {s}
                        </span>
                        <span className="text-base font-normal text-muted">Remove</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl bg-white p-5 text-xl">Everything you shared is worth passing on: “{data.work}”</p>
              )}
              {data.lesson && (
                <blockquote className="mt-6 rounded-2xl bg-brand-100/70 p-5 font-serif text-2xl leading-snug text-brand-900">
                  “{data.lesson}”
                  <span className="mt-2 block font-sans text-base text-muted">A lesson worth passing on.</span>
                </blockquote>
              )}
              <p className="mt-6 text-xl text-ink">Someone, somewhere, is trying to learn exactly this.</p>
              <Actions primary="Next" onPrimary={() => go(4)} />
            </>
          )}
        </div>
      </Screen>
    );

  if (step === 4)
    return (
      <Screen title="Would you like to share this with younger people who want to learn?" help="It's completely your choice. You can say no, and you can change your mind later.">
        <div className="space-y-4">
          <BigChoice onClick={() => go(5)} icon={Heart} label="Yes, I'd like to share" sub="Younger adults will see what you could teach" />
          <BigChoice onClick={() => go(7)} icon={Check} tone="warm" label="Not right now" sub="Nothing will be shared" />
        </div>
      </Screen>
    );

  if (step === 5)
    return (
      <Screen title="What name should people see?" help="Your first name is enough.">
        <label htmlFor="name" className="sr-only">
          Your first name
        </label>
        <input id="name" className="input min-h-[64px] text-2xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
        <Actions primary="Share my experience" onPrimary={share} disabled={!data.name.trim()} busy={shareRun.busy} error={shareRun.error} />
      </Screen>
    );

  if (step === 6)
    return (
      <Screen title={`Thank you, ${data.name.trim()}.`} help="Your experience is now shared. Younger adults who want to learn can find you, and send you a question.">
        <p className="rounded-3xl bg-brand-100/70 p-6 text-xl text-brand-900">
          Questions people send you will be waiting in <Link to="/inbox" className="link">your messages</Link>. We never show your phone number or
          email to anyone.
        </p>
        <h2 className="mt-10 font-sans text-2xl font-semibold">Would you like to earn from what you know?</h2>
        <p className="mt-2 text-lg text-muted">Only if you want to. There's no pressure either way.</p>
        <div className="mt-5 space-y-4">
          <BigChoice to="/older/earn" icon={Coins} label="Offer paid help sessions" sub="You set the price and keep 90%" />
          <BigChoice to="/older/roles" icon={Briefcase} tone="warm" label="See roles that are easier on the body" sub="Paid work where what you know matters most" />
          <BigChoice to="/older" icon={Users} tone="sage" label="Back to my choices" />
        </div>
        <Feedback flow="share" askComfort />
      </Screen>
    );

  // step 7: chose not to share
  return (
    <Screen title="That's completely fine." help="Nothing has been shared. What you know is still yours, and you're welcome back anytime.">
      <div className="space-y-4">
        <BigChoice to="/older" icon={Users} label="Back to my choices" />
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Learn Something New                                                 */
/* ------------------------------------------------------------------ */

const TOPICS = [
  { id: "video-meeting", label: "Video call my family", icon: Video },
  { id: "photos", label: "Send a photo from my phone", icon: ImageIcon },
  { id: "email", label: "Send an email", icon: Mail },
  { id: "scams", label: "Spot a scam message", icon: ShieldAlert },
  { id: "ai-tools", label: "Ask a chat assistant a question", icon: MessageCircle },
];

export function OlderLearn() {
  const w = useWizard("twg.simple.learn", { topic: "", steps: [] as string[], intro: "" });
  const { step, go, data, set } = w;
  const [loading, setLoading] = useState(false);
  const [simpler, setSimpler] = useState<string | null>(null);
  const topic = TOPICS.find((t) => t.id === data.topic);

  async function choose(id: string) {
    set("topic", id);
    set("steps", []);
    setLoading(true);
    go(1);
    try {
      const res = await api.companion({ action: "guide", topic: id });
      set("intro", res.data.intro ?? "");
      set("steps", res.data.steps ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => setSimpler(null), [step]);

  if (step === 0 || !topic)
    return (
      <Screen title="What would you like to learn?" help="Pick one. We'll go one small step at a time.">
        <div className="space-y-4">
          {TOPICS.map((t, i) => (
            <BigChoice key={t.id} onClick={() => choose(t.id)} icon={t.icon} tone={i % 2 ? "warm" : "forest"} label={t.label} />
          ))}
        </div>
      </Screen>
    );

  if (loading || data.steps.length === 0)
    return (
      <Screen title={topic.label} help="Getting your steps ready…">
        <span className="sr-only" aria-live="polite">
          Loading
        </span>
      </Screen>
    );

  const index = step - 1;
  const total = data.steps.length;

  if (index >= total)
    return (
      <Screen title="That's every step." help="Come back and go through it again whenever you like. Everyone needs a few tries.">
        <div className="space-y-4">
          <BigChoice onClick={() => go(1)} icon={Sparkles} label="Go through it again" />
          <BigChoice onClick={() => go(0)} icon={FileText} tone="warm" label="Learn something else" />
          <BigChoice to="/older/help" icon={Users} tone="sage" label="I'd like a person to help" />
        </div>
        <Feedback flow="learn" askComfort />
      </Screen>
    );

  const current = data.steps[index];
  return (
    <Screen step={`Step ${index + 1} of ${total}`} title={topic.label}>
      <div className="h-3 overflow-hidden rounded-full bg-brand-100" aria-hidden="true">
        <div className="h-full rounded-full bg-brand-700 transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
      {index === 0 && data.intro && <p className="mt-6 text-xl text-muted">{data.intro}</p>}
      <p aria-live="polite" className="mt-6 rounded-3xl bg-white p-6 font-serif text-[1.75rem] leading-snug text-brand-900 ring-1 ring-warm-200 sm:p-8">
        {current}
      </p>
      {simpler && (
        <p className="mt-4 rounded-2xl bg-warm-100 p-5 text-xl">
          <strong>In other words:</strong> {simpler}
        </p>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn-secondary min-h-[56px] text-lg" onClick={() => speak(simpler ?? current)}>
          <Volume2 aria-hidden="true" className="h-5 w-5" /> Read it to me
        </button>
        <button
          type="button"
          className="btn-secondary min-h-[56px] text-lg"
          onClick={async () => {
            const res = await api.companion({ action: "simpler", topic: topic.id, step: current }).catch(() => null);
            setSimpler(res?.data.reply ?? "Take it slowly, one small part at a time.");
          }}
        >
          Explain it more simply
        </button>
      </div>
      <Actions primary={index + 1 === total ? "I'm done" : "Next step"} onPrimary={() => go(step + 1)} />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Get Help                                                            */
/* ------------------------------------------------------------------ */

const HELP_TOPICS = ["Using my phone", "Video calls", "Email", "Filling in a form online", "Something else"];

export function OlderHelp() {
  const users = useStore(getUsers, []);
  const { user } = useAuth();
  // The most recently joined helpers first.
  const helpers = useMemo(
    () =>
      users
        .filter((u) => u.roles.includes("buddy") && u.buddy && u.id !== user?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 4),
    [users, user?.id],
  );
  const helpRun = useRun();
  const w = useWizard("twg.simple.help", { helperId: "", topic: "", contact: "", name: "" });
  const { step, go, data, set } = w;
  const helper = helpers.find((h) => h.id === data.helperId) ?? users.find((u) => u.id === data.helperId);

  if (step === 0)
    return (
      <Screen title="How can we help?" help="There's no wrong way to ask.">
        <div className="space-y-4">
          <BigChoice onClick={() => go(1)} icon={Users} label="Talk to a friendly person" sub="A patient younger helper" />
          <BigChoice to="/older/learn" icon={FileText} tone="warm" label="Show me step by step" sub="Simple steps you can follow on your own" />
          <BigChoice onClick={() => go(11)} icon={MessageSquareText} tone="sage" label="What does this message mean?" sub="A text, email or letter that confused you" />
          <BigChoice onClick={() => go(10)} icon={Type} label="Make the words bigger" />
        </div>
      </Screen>
    );

  if (step === 11) return <MeaningScreen />;

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

  if (step === 1)
    return (
      <Screen step="1 of 3" title="Who would you like to talk to?" help="These are friendly younger helpers. Each one says if their help is free.">
        <div className="space-y-4">
          {helpers.map((h, i) => (
            <BigChoice
              key={h.id}
              onClick={() => {
                set("helperId", h.id);
                go(2);
              }}
              emoji={h.name[0]}
              tone={i % 2 ? "warm" : "forest"}
              label={h.name.split(" ")[0]}
              sub={`${h.buddy!.pricing === "paid" ? `Paid, $${h.buddy!.rate}/hour` : h.buddy!.pricing === "free" ? "Free" : "Volunteer, free"} · ${h.buddy!.availability || "Times vary"}`}
            />
          ))}
        </div>
        {helpers.length === 0 && (
          <div className="rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
            <p>Our first younger helpers are just joining. In the meantime, the step-by-step guides can help with most things.</p>
            <div className="mt-5">
              <BigChoice to="/older/learn" icon={FileText} tone="warm" label="Show me step by step" />
            </div>
          </div>
        )}
      </Screen>
    );

  if (step === 2)
    return (
      <Screen step="2 of 3" title="What would you like help with?">
        <div className="space-y-3">
          {HELP_TOPICS.map((t) => (
            <BigChoice
              key={t}
              onClick={() => {
                set("topic", t);
                go(3);
              }}
              label={t}
            />
          ))}
        </div>
      </Screen>
    );

  if (step === 3)
    return (
      <Screen step="3 of 3" title={`How can ${helper?.name.split(" ")[0] ?? "they"} reach you?`} help="A phone number or email. Or leave it empty: their reply will be in your messages here.">
        {!user && (
          <>
            <label htmlFor="hname" className="label text-xl">
              Your first name
            </label>
            <input id="hname" className="input mb-6 min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        <label htmlFor="contact" className="label text-xl">
          Phone or email <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="contact" className="input min-h-[60px] text-xl" value={data.contact} onChange={(e) => set("contact", e.target.value)} />
        <Actions
          primary="Ask for help"
          disabled={!user && !data.name.trim()}
          busy={helpRun.busy}
          error={helpRun.error}
          onPrimary={() =>
            helpRun.run(async () => {
              const me = user ?? (await quickJoin(data.name.trim()));
              await addNote({ toId: data.helperId, fromName: me.name.split(" ")[0], kind: "help", text: data.topic, contact: data.contact.trim() || undefined });
              go(4);
            })
          }
        />
      </Screen>
    );

  return (
    <Screen title="Your request has been made." help={`${helper?.name.split(" ")[0] ?? "A helper"} will see that you'd like help with “${data.topic.toLowerCase()}”.`}>
      <p className="rounded-3xl bg-brand-100/70 p-6 text-xl">
        Their reply will appear in{" "}
        <Link to="/inbox" className="link">
          your messages
        </Link>
        {data.contact.trim() ? ", or they may contact you directly" : ""}. Helpers are volunteers, so it can take a day or two.
      </p>
      <div className="mt-8 space-y-4">
        <BigChoice to="/older/learn" icon={FileText} label="Try the step-by-step help meanwhile" />
        <BigChoice to="/older" icon={Users} tone="warm" label="Back to my choices" />
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
