import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { AiSource } from "../../shared/types";
import { SourceLabel } from "../components/ui";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { api } from "../lib/api";

const TOPICS = [
  { id: "video-meeting", label: "Join a video meeting", icon: "🎥" },
  { id: "email", label: "Send an email", icon: "✉️" },
  { id: "resume", label: "Create a résumé", icon: "📄" },
  { id: "job-application", label: "Apply for a job online", icon: "🧾" },
  { id: "scams", label: "Spot suspicious messages", icon: "🛡️" },
  { id: "ai-tools", label: "Use basic AI tools", icon: "✨" },
];

interface ChatItem {
  who: "you" | "guide";
  text: string;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export default function LearnAI() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number] | null>(null);
  const [intro, setIntro] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [simpler, setSimpler] = useState<string | null>(null);
  const [source, setSource] = useState<AiSource>("fallback");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readAloud, setReadAloud] = useState(false);
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const [pulse, setPulse] = useState(0);

  const done = steps.length > 0 && index >= steps.length;
  const current = steps[index];

  useEffect(() => {
    if (readAloud && current) speak(current);
  }, [current, readAloud, pulse]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  async function choose(t: (typeof TOPICS)[number]) {
    setTopic(t);
    setLoading(true);
    setError(null);
    setSteps([]);
    setChat([]);
    setIndex(0);
    setSimpler(null);
    try {
      const res = await api.companion({ action: "guide", topic: t.id });
      setSource(res.source);
      setIntro(res.data.intro ?? "");
      setSteps(res.data.steps ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function go(next: number) {
    setIndex(next);
    setSimpler(null);
    stepRef.current?.focus();
  }

  async function explainSimpler() {
    if (!topic || !current) return;
    setLoading(true);
    try {
      const res = await api.companion({ action: "simpler", topic: topic.id, step: current });
      setSimpler(res.data.reply ?? null);
      if (readAloud && res.data.reply) speak(res.data.reply);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function ask(e?: FormEvent) {
    e?.preventDefault();
    const q = question.trim();
    if (!q || !topic) return;
    setChat((c) => [...c, { who: "you", text: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await api.companion({ action: "ask", topic: topic.id, question: q });
      const reply = res.data.reply ?? "Sorry, I didn't catch that. Could you ask again?";
      setChat((c) => [...c, { who: "guide", text: reply }]);
      if (readAloud) speak(reply);
    } catch (err) {
      setChat((c) => [...c, { who: "guide", text: (err as Error).message }]);
    } finally {
      setAsking(false);
    }
  }

  if (!topic) {
    return (
      <div className="container-page py-12">
        <Link to="/learn" className="font-bold text-brand-700 hover:underline">
          ← Learn your way
        </Link>
        <h1 className="mt-4 text-4xl font-bold">What would you like to learn?</h1>
        <p className="mt-2 text-lg text-ink/80">Pick a topic. We'll go one step at a time, and you can repeat anything.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => choose(t)}
                className="card flex w-full items-center gap-4 text-left text-xl font-bold text-brand-900 transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md"
              >
                <span aria-hidden="true" className="text-3xl">
                  {t.icon}
                </span>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-ink/75">
          Prefer a person?{" "}
          <Link to="/learn/buddies" className="font-bold text-brand-700 underline">
            Find a digital buddy
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setTopic(null)} className="font-bold text-brand-700 hover:underline">
          ← Choose another topic
        </button>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 font-bold">
          <input type="checkbox" className="h-5 w-5 accent-brand-700" checked={readAloud} onChange={(e) => setReadAloud(e.target.checked)} />
          Read steps aloud
        </label>
      </div>
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
        <span aria-hidden="true">{topic.icon}</span> {topic.label}
      </h1>
      {intro && <p className="mt-2 text-lg text-ink/80">{intro}</p>}
      {steps.length > 0 && (
        <div className="mt-2">
          <SourceLabel source={source} />
        </div>
      )}

      {error && (
        <p role="alert" className="notice mt-6">
          {error}
        </p>
      )}

      {loading && steps.length === 0 && <p className="mt-8 text-lg" aria-live="polite">Getting your guide ready…</p>}

      {steps.length > 0 && (
        <section aria-label="Step by step" className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-brand-100" aria-hidden="true">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(Math.min(index + 1, steps.length) / steps.length) * 100}%` }} />
            </div>
            <span className="font-bold text-brand-800">
              {done ? "All steps done" : `Step ${index + 1} of ${steps.length}`}
            </span>
          </div>

          <div ref={stepRef} tabIndex={-1} aria-live="polite" className="card border-2 border-brand-200 p-8">
            {done ? (
              <>
                <p className="font-serif text-2xl text-brand-900">That's every step.</p>
                <p className="mt-2 text-lg">Practise whenever you like. It gets easier each time, and mistakes are part of learning.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="btn-secondary" onClick={() => go(0)}>
                    Go through it again
                  </button>
                  <button className="btn-primary" onClick={() => setTopic(null)}>
                    Try another topic
                  </button>
                </div>
              </>
            ) : (
              <>
                <p key={pulse} className="text-2xl leading-relaxed text-ink">
                  {current}
                </p>
                {simpler && (
                  <p className="mt-5 rounded-xl bg-warm-100 p-4 text-lg">
                    <strong>In other words:</strong> {simpler}
                  </p>
                )}
              </>
            )}
          </div>

          {!done && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button className="btn-secondary" onClick={() => go(index - 1)} disabled={index === 0}>
                ← Back
              </button>
              <button className="btn-secondary" onClick={() => setPulse((p) => p + 1)}>
                ↻ Repeat that
              </button>
              <button className="btn-secondary" onClick={explainSimpler} disabled={loading}>
                {loading ? "…" : "Explain simpler"}
              </button>
              <button className="btn-primary" onClick={() => go(index + 1)}>
                Next step →
              </button>
            </div>
          )}

          <section aria-labelledby="ask" className="mt-10">
            <h2 id="ask" className="text-2xl font-bold">
              Ask anything
            </h2>
            <p className="text-ink/75">There are no silly questions. Ask the same thing as many times as you like.</p>
            {chat.length > 0 && (
              <ol aria-live="polite" className="mt-4 space-y-3">
                {chat.map((m, i) => (
                  <li
                    key={i}
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl p-4 text-lg ${
                      m.who === "you" ? "ml-auto bg-brand-700 text-white" : "bg-white border border-brand-100"
                    }`}
                  >
                    <span className="sr-only">{m.who === "you" ? "You asked:" : "Guide:"}</span>
                    {m.text}
                  </li>
                ))}
                {asking && <li className="rounded-2xl bg-white p-4 text-ink/60">Thinking…</li>}
              </ol>
            )}
            <form onSubmit={ask} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              <label htmlFor="question" className="sr-only">
                Your question
              </label>
              <input
                id="question"
                className="input flex-1"
                placeholder="e.g. What if I can't find the Join button?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <VoiceRecorder compact onText={(t) => setQuestion((q) => (q ? `${q} ${t}` : t))} />
              <button type="submit" className="btn-primary" disabled={asking || !question.trim()}>
                Ask
              </button>
            </form>
          </section>
        </section>
      )}
    </div>
  );
}
