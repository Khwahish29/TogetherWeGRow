import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Check, MessageCircleQuestion, Pencil, Trash2 } from "lucide-react";
import { PageHeader, EmptyState } from "../components/ui";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { useAuth } from "../lib/auth";
import { skillsOverlap } from "../lib/matching";
import { answerQuestion, askQuestion, getQuestions, updateAnswer } from "../lib/store";
import type { PracticalQuestion } from "../lib/types";
import { useStore } from "../lib/useStore";

const TRADES = [
  "Home repair",
  "Carpentry",
  "Plumbing",
  "Electrical",
  "Welding",
  "Mechanics",
  "Cooking",
  "Gardening & farming",
  "Small business",
  "Sewing & tailoring",
  "Painting & decorating",
  "Workplace safety",
  "Working life",
];

function QuestionCard({ q }: { q: PracticalQuestion }) {
  const { user } = useAuth();
  const mine = q.answers.find((a) => user && a.authorId === user.id);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(mine?.text ?? "");
  const others = q.answers.filter((a) => a !== mine).length;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) return;
    if (mine) await updateAnswer(q.id, mine.id, text.trim());
    else await answerQuestion(q.id, user?.id ?? null, text.trim());
    setOpen(false);
    setEditing(false);
  }

  return (
    <li className="card">
      <p className="flex flex-wrap items-center gap-2 text-[0.95rem] text-warm-700">
        <span className="font-medium">{q.askerLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{q.trade}</span>
        {(q.isDemo || q.isStarter) && <span className="badge bg-warm-100 text-warm-800">Common question</span>}
      </p>
      <h3 className="mt-2 font-serif text-2xl font-medium leading-snug">“{q.text}”</h3>
      <p className="mt-2 text-sm text-muted">
        {others === 0 ? "No answers yet." : `${others} ${others === 1 ? "person has" : "people have"} answered.`}
      </p>

      {mine && !editing && (
        <div className="mt-4 rounded-2xl bg-brand-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
            <Check aria-hidden="true" className="h-4 w-4" /> Your answer
          </p>
          <p className="mt-1">{mine.text}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <button type="button" className="btn-ghost min-h-[44px] px-3 text-sm" onClick={() => setEditing(true)}>
              <Pencil aria-hidden="true" className="h-4 w-4" /> Edit
            </button>
            <button type="button" className="btn-ghost min-h-[44px] px-3 text-sm" onClick={() => updateAnswer(q.id, mine.id, null)}>
              <Trash2 aria-hidden="true" className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      )}

      {(open || editing) && (
        <form onSubmit={save} className="mt-4">
          <label htmlFor={`ans-${q.id}`} className="label">
            {editing ? "Edit your answer" : "Your answer"}
          </label>
          <textarea
            id={`ans-${q.id}`}
            rows={4}
            className="input"
            placeholder="Tell them what you'd tell someone standing next to you."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
            <button type="submit" className="btn-primary" disabled={text.trim().length < 10}>
              {editing ? "Save changes" : "Share my answer"}
            </button>
            <VoiceRecorder compact onText={(t) => setText((x) => (x ? `${x} ${t}` : t))} />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setOpen(false);
                setEditing(false);
                setText(mine?.text ?? "");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!mine && !open && (
        <button type="button" className="btn-secondary mt-4" onClick={() => setOpen(true)}>
          I could help with this
        </button>
      )}
    </li>
  );
}

export default function Questions() {
  const { user } = useAuth();
  const questions = useStore(getQuestions, []);
  const [trade, setTrade] = useState("All");
  const [asked, setAsked] = useState(false);
  const [newText, setNewText] = useState("");
  const [newTrade, setNewTrade] = useState(TRADES[0]);

  // Questions closest to the person's own experience come first.
  const sorted = useMemo(() => {
    const skills = [...(user?.skills ?? []), ...(user?.industries ?? [])];
    const score = (q: PracticalQuestion) => (skills.some((s) => skillsOverlap(s, q.trade) || q.text.toLowerCase().includes(s.toLowerCase())) ? 1 : 0);
    return [...questions].sort((a, b) => score(b) - score(a));
  }, [questions, user]);
  const trades = ["All", ...new Set(questions.map((q) => q.trade))];
  const list = sorted.filter((q) => trade === "All" || q.trade === trade);

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (newText.trim().length < 10) return;
    await askQuestion({ text: newText.trim(), trade: newTrade, askerLabel: user ? `${user.name.split(" ")[0]}, learning ${newTrade.toLowerCase()}` : `Someone learning ${newTrade.toLowerCase()}`, askerId: user?.id });
    setNewText("");
    setAsked(true);
  }

  return (
    <>
      <PageHeader eyebrow="Share what you know" title="Questions only experience can answer">
        Real, practical questions from people who are learning. If you know the answer, share it in your own words. There's no
        test, and nothing to prove.
      </PageHeader>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div>
          <div role="group" aria-label="Filter by trade" className="flex flex-wrap gap-2">
            {trades.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={trade === t}
                onClick={() => setTrade(t)}
                className={`min-h-[44px] rounded-full border px-4 font-medium transition ${
                  trade === t ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-ink hover:border-brand-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <h2 className="sr-only">Questions</h2>
          {list.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No questions here yet">Try another trade, or ask one yourself.</EmptyState>
            </div>
          ) : (
                        <ul className="mt-6 space-y-5">
              {list.map((q) => (
                <QuestionCard key={q.id} q={q} />
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={ask} className="rounded-3xl bg-brand-100/70 p-6">
            <h2 className="flex items-center gap-2 font-sans text-xl font-semibold">
              <MessageCircleQuestion aria-hidden="true" className="h-5 w-5 text-brand-700" /> Ask a practical question
            </h2>
            <p className="mt-1 text-muted">Learning something? Ask the people who've done it for years.</p>
            {asked ? (
              <p role="status" className="mt-4 rounded-2xl bg-white p-4">
                Your question has been added to the list. Thank you for asking.{" "}
                <button type="button" className="link" onClick={() => setAsked(false)}>
                  Ask another
                </button>
              </p>
            ) : (
              <>
                <label htmlFor="new-trade" className="label mt-4">
                  It's about
                </label>
                <select id="new-trade" className="input" value={newTrade} onChange={(e) => setNewTrade(e.target.value)}>
                  {TRADES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <label htmlFor="new-q" className="label mt-4">
                  Your question
                </label>
                <textarea id="new-q" rows={3} className="input" value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="e.g. How do I know if a wall is load-bearing?" />
                <button type="submit" className="btn-primary mt-4 w-full" disabled={newText.trim().length < 10}>
                  Ask my question
                </button>
              </>
            )}
          </form>
          <div className="rounded-3xl border border-warm-200 bg-white p-6 text-[0.95rem] text-muted">
            <p className="font-semibold text-brand-900">Good to know</p>
            <p className="mt-2">
              Some questions are common ones people ask when starting out, written by our team. Answers are public, so please
              leave out private details.
            </p>
            {!user && (
              <p className="mt-2">
                You can answer without an account.{" "}
                <Link to="/signup?role=mentor" className="link">
                  Join free
                </Link>{" "}
                to keep your answers.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
