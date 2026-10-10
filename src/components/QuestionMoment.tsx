import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, MessageCircleQuestion, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { answerQuestion, getQuestions, saveFirstAnswer } from "../lib/store";
import { useStore } from "../lib/useStore";
import { VoiceRecorder } from "./VoiceRecorder";

type Stage = "ask" | "answering" | "answered" | "looking";

/**
 * The question-first way in: a real question someone is asking, and a gentle invitation to answer it.
 * It's a conversation, not a test. Nothing is required, and "just looking" is a perfectly good answer.
 */
export function QuestionMoment({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { user } = useAuth();
  const questions = useStore(getQuestions, []);
  const open = useMemo(() => questions.filter((q) => !user || !q.answers.some((a) => a.authorId === user.id)), [questions, user]);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("ask");
  const [answer, setAnswer] = useState("");
  const [shows, setShows] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const q = open[index % Math.max(open.length, 1)];
  const dark = variant === "dark";

  useEffect(() => {
    if (stage !== "ask") headingRef.current?.focus();
  }, [stage]);

  if (!q) return null;

  async function share() {
    if (!q || answer.trim().length < 10) return;
    setSaving(true);
    await answerQuestion(q.id, user?.id ?? null, answer.trim());
    if (!user) saveFirstAnswer(q.text, answer.trim());
    setStage("answered");
    setSaving(false);
    // Gently name the skills the answer shows, using only what they wrote.
    try {
      const res = await api.answerSkills(q.text, answer.trim());
      setShows(res.data.skills.slice(0, 4));
    } catch {
      setShows([]);
    }
  }

  function another() {
    setIndex((i) => i + 1);
    setAnswer("");
    setShows([]);
    setStage("ask");
  }

  const muted = dark ? "text-brand-100" : "text-muted";
  const panel = dark ? "bg-white/[0.06] ring-1 ring-white/15" : "bg-white ring-1 ring-warm-200";

  return (
    <div className={`rounded-[1.75rem] p-6 sm:p-10 ${panel}`} aria-live="polite">
      <p className={`flex items-center gap-2 text-[0.95rem] font-medium ${dark ? "text-warm-400" : "text-warm-700"}`}>
        <MessageCircleQuestion aria-hidden="true" className="h-5 w-5" />
        {q.askerLabel} wants to know:
        {(q.isDemo || q.isStarter) && <span className={`ml-1 rounded-full px-2 py-0.5 text-sm ${dark ? "bg-white/10 text-brand-100" : "bg-warm-100 text-warm-800"}`}>Common question</span>}
      </p>
      <p className={`mt-4 font-serif text-[1.85rem] leading-snug sm:text-[2.3rem] ${dark ? "text-white" : "text-brand-900"}`}>“{q.text}”</p>

      {stage === "ask" && (
        <>
          <p className={`mt-6 text-lg ${dark ? "text-white" : "text-ink"}`}>Would you know how to answer this?</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" className={dark ? "btn bg-warm-400 px-7 text-brand-900 hover:bg-warm-200" : "btn-primary px-7"} onClick={() => setStage("answering")}>
              <Check aria-hidden="true" className="h-5 w-5" /> Yes, I could help
            </button>
            <button type="button" className={dark ? "btn border-2 border-white/40 text-white hover:border-white" : "btn-secondary"} onClick={another}>
              <RefreshCw aria-hidden="true" className="h-5 w-5" /> Show me another question
            </button>
            <button type="button" className={dark ? "btn text-brand-100 hover:bg-white/10" : "btn-ghost"} onClick={() => setStage("looking")}>
              I'm just looking
            </button>
          </div>
        </>
      )}

      {stage === "answering" && (
        <div className="mt-6">
          <p ref={headingRef} tabIndex={-1} className={`text-lg outline-none ${dark ? "text-white" : "text-ink"}`}>
            Tell them what you'd tell someone standing next to you. A few sentences is plenty, and there's no wrong answer.
          </p>
          <label htmlFor="qm-answer" className="sr-only">
            Your answer
          </label>
          <textarea
            id="qm-answer"
            rows={4}
            className="input mt-4 text-lg leading-relaxed"
            placeholder="Type your answer, or use the microphone…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <button type="button" className={dark ? "btn bg-warm-400 px-7 text-brand-900 hover:bg-warm-200" : "btn-primary px-7"} onClick={share} disabled={saving || answer.trim().length < 10}>
              {saving ? "Saving…" : "Share my answer"}
            </button>
            <VoiceRecorder compact onText={(t) => setAnswer((a) => (a ? `${a} ${t}` : t))} />
            <button type="button" className={dark ? "btn text-brand-100 hover:bg-white/10" : "btn-ghost"} onClick={() => setStage("ask")}>
              <ArrowLeft aria-hidden="true" className="h-5 w-5" /> Back
            </button>
          </div>
          <p className={`mt-3 text-sm ${muted}`}>
            {user ? "Your answer is saved with this question. You can edit or remove it later." : "Your answer is shared with the person who asked. Join to get a reply and keep track of your answers."}
          </p>
        </div>
      )}

      {stage === "answered" && (
        <div className="mt-6">
          <p ref={headingRef} tabIndex={-1} className={`font-serif text-2xl outline-none ${dark ? "text-warm-400" : "text-brand-800"}`}>
            That's the kind of experience someone else could learn from.
          </p>
          {shows.length > 0 && (
            <div className="mt-4">
              <p className={`text-sm font-medium ${muted}`}>What your answer shows:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {shows.map((s) => (
                  <li key={s} className={`rounded-full px-3 py-1 text-[0.95rem] ${dark ? "bg-white/10 text-white" : "bg-brand-100 text-brand-800"}`}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className={`mt-5 text-lg ${dark ? "text-white" : "text-ink"}`}>Would you like to continue?</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {user ? (
              <Link to="/questions" className={dark ? "btn bg-warm-400 px-7 text-brand-900 hover:bg-warm-200" : "btn-primary px-7"}>
                See more questions I could answer <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/signup?role=mentor" className={dark ? "btn bg-warm-400 px-7 text-brand-900 hover:bg-warm-200" : "btn-primary px-7"}>
                Keep my answer and join free <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            )}
            <button type="button" className={dark ? "btn border-2 border-white/40 text-white hover:border-white" : "btn-secondary"} onClick={another}>
              Answer another question
            </button>
          </div>
          {!user && <p className={`mt-3 text-sm ${muted}`}>Joining is optional. Your answer would start your profile, and you approve everything before it's shared.</p>}
        </div>
      )}

      {stage === "looking" && (
        <div className="mt-6">
          <p ref={headingRef} tabIndex={-1} className={`font-serif text-2xl outline-none ${dark ? "text-white" : "text-brand-900"}`}>
            That's completely fine. Take your time.
          </p>
          <p className={`mt-2 text-lg ${muted}`}>You can explore without signing up, and come back to a question whenever you like.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/opportunities" className={dark ? "btn border-2 border-white/40 text-white hover:border-white" : "btn-secondary"}>
              Explore ways to share experience
            </Link>
            <button type="button" className={dark ? "btn text-brand-100 hover:bg-white/10" : "btn-ghost"} onClick={another}>
              Show me a question after all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
