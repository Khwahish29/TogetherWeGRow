import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, FileText, Pencil, Plus, Printer, RotateCcw, Sparkles, Trash2, UserRound } from "lucide-react";
import type { AiSource, ResumeJob } from "../../shared/types";
import { ResumePreview, type ResumeData, type ResumeSection } from "../components/ResumePreview";
import { ChipInput, SourceLabel } from "../components/ui";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { saveUser } from "../lib/store";

type StepId = "name" | "phone" | "email" | "location" | "jobs" | "skills" | "training" | "summary" | "done";

const STEPS: { id: StepId; question: string; hint?: string; optional?: boolean }[] = [
  { id: "name", question: "Let's start with your name. How would you like it to appear at the top?" },
  {
    id: "phone",
    question: "What's the best phone number for employers to reach you on?",
    hint: "You can skip this if you'd rather not share it.",
    optional: true,
  },
  { id: "email", question: "And your email address?", hint: "Employers often reply by email. Skip it if you don't have one yet.", optional: true },
  { id: "location", question: "Which town or city are you based in?", hint: "Just the town is enough. No need for your full address.", optional: true },
  {
    id: "jobs",
    question: "Now the important part. Tell me about a job you've had.",
    hint: "What was the job, where was it, roughly when, and what did you do day to day? Talk as you would to a friend. I'll turn it into three polished résumé points.",
  },
  { id: "skills", question: "What are you good at?", hint: "Practical skills count just as much as anything else. I've added some from your profile." },
  {
    id: "training",
    question: "Any training, licences, or certificates?",
    hint: "Courses, apprenticeships, a driving licence, first aid... It's completely fine if there's nothing here.",
    optional: true,
  },
  { id: "summary", question: "Last step: a short introduction for the top of your résumé.", hint: "I'll write one from everything you've told me. Change any words you like." },
  { id: "done", question: "Your résumé is ready." },
];

const EMPTY: ResumeData = { name: "", phone: "", email: "", location: "", summary: "", jobs: [], skills: [], training: [] };

interface Saved {
  data: ResumeData;
  step: number;
  sources: string[];
}

function storageKey(userId?: string) {
  return `twg.resume.${userId ?? "guest"}`;
}

function loadSaved(userId?: string): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? "null");
  } catch {
    return null;
  }
}

function JobEditor({ job, onChange, onRemove }: { job: ResumeJob; onChange: (job: ResumeJob) => void; onRemove: () => void }) {
  const set = <K extends keyof ResumeJob>(k: K, v: ResumeJob[K]) => onChange({ ...job, [k]: v });
  const small = "input min-h-[44px] py-2 text-base";
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-bold text-brand-900">
          Job title
          <input className={small} value={job.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="text-sm font-bold text-brand-900">
          Where
          <input className={small} value={job.employer} placeholder="Employer (optional)" onChange={(e) => set("employer", e.target.value)} />
        </label>
        <label className="text-sm font-bold text-brand-900">
          From (year)
          <input className={small} value={job.start} inputMode="numeric" onChange={(e) => set("start", e.target.value)} />
        </label>
        <label className="text-sm font-bold text-brand-900">
          To (year or "Present")
          <input className={small} value={job.end} onChange={(e) => set("end", e.target.value)} />
        </label>
      </div>
      <fieldset>
        <legend className="text-sm font-bold text-brand-900">What you did</legend>
        <ul className="mt-1 space-y-2">
          {job.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <input
                className={small}
                value={b}
                aria-label={`Point ${i + 1}`}
                onChange={(e) => set("bullets", job.bullets.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button
                type="button"
                className="btn-ghost min-h-[44px] px-3"
                aria-label={`Remove point ${i + 1}`}
                onClick={() => set("bullets", job.bullets.filter((_, j) => j !== i))}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="btn-ghost min-h-[44px] px-3 text-sm" onClick={() => set("bullets", [...job.bullets, ""])}>
            <Plus aria-hidden="true" className="h-4 w-4" /> Add a point
          </button>
          <button type="button" className="btn-ghost min-h-[44px] px-3 text-sm text-rose-800" onClick={onRemove}>
            <Trash2 aria-hidden="true" className="h-4 w-4" /> Remove this job
          </button>
        </div>
      </fieldset>
    </div>
  );
}

export default function ResumeBuilder() {
  const { user } = useAuth();
  const saved = useRef(loadSaved(user?.id)).current;
  const [data, setData] = useState<ResumeData>(
    () =>
      saved?.data ?? {
        ...EMPTY,
        name: user?.name ?? "",
        email: user?.email.endsWith("@demo.twg") ? "" : (user?.email ?? ""),
        location: user?.location ?? "",
        skills: user?.skills.slice(0, 8) ?? [],
      },
  );
  const [stepIndex, setStepIndex] = useState(saved?.step ?? 0);
  const [sources, setSources] = useState<string[]>(saved?.sources ?? []);
  const [jobText, setJobText] = useState("");
  const [detail, setDetail] = useState("");
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [aiSource, setAiSource] = useState<AiSource | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const step = STEPS[stepIndex];
  const set = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) => setData((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(user?.id), JSON.stringify({ data, step: stepIndex, sources }));
    } catch {
      // Not saved on this device; the builder still works.
    }
  }, [data, stepIndex, sources, user?.id]);

  useEffect(() => {
    setError(null);
    headingRef.current?.focus();
    inputRef.current?.focus();
  }, [stepIndex]);

  const go = (i: number) => setStepIndex(Math.max(0, Math.min(STEPS.length - 1, i)));
  const next = () => go(stepIndex + 1);

  async function describeJob(text: string, replaceIndex: number | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await api.resumeJob(text);
      const { followUp: question, ...job } = res.data;
      setAiSource(res.source);
      setFollowUp(question || null);
      setData((d) => {
        const jobs = [...d.jobs];
        if (replaceIndex === null) jobs.push(job);
        else jobs[replaceIndex] = job;
        return { ...d, jobs };
      });
      setSources((s) => {
        const copy = [...s];
        copy[replaceIndex ?? data.jobs.length] = text;
        return copy;
      });
      setEditing(replaceIndex ?? data.jobs.length);
      setJobText("");
      setDetail("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function writeSummary() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.resumeSummary({ name: data.name, jobs: data.jobs, skills: data.skills, training: data.training });
      setAiSource(res.source);
      set("summary", res.data.summary);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (step.id === "summary" && !data.summary && (data.jobs.length || data.skills.length)) writeSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  function submitField(e: FormEvent) {
    e.preventDefault();
    if (step.id === "name" && !data.name.trim()) {
      setError("Please add your name. It's the one thing every résumé needs.");
      return;
    }
    if (step.id === "email" && data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      setError("That doesn't look quite like an email address. Could you check it? (It usually looks like name@example.com)");
      return;
    }
    next();
  }

  function startOver() {
    setData({ ...EMPTY, name: user?.name ?? "", location: user?.location ?? "", skills: user?.skills.slice(0, 8) ?? [] });
    setSources([]);
    setEditing(null);
    setFollowUp(null);
    setConfirmReset(false);
    go(0);
  }

  async function saveToProfile() {
    if (!user) return;
    const skills = [...new Set([...user.skills, ...data.skills])];
    await saveUser({ ...user, bio: data.summary || user.bio, skills });
    setProfileSaved(true);
  }

  const active: ResumeSection = step.id === "done" ? null : step.id;
  const textField = (["name", "phone", "email", "location"] as const).find((f) => f === step.id);

  return (
    <div className="bg-gradient-to-b from-brand-50/60 to-warm-50 print:bg-none">
      <div className="container-page py-8 sm:py-10 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to="/learn" className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Learn your way
          </Link>
          <p className="text-sm text-ink/70">
            Your draft saves on this device. What you describe is sent to our AI provider to write résumé points.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 print:hidden">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-100 text-warm-700">
            <FileText aria-hidden="true" className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold sm:text-4xl">Let's build your résumé together</h1>
        </div>

        {/* Progress */}
        <ol className="mt-6 flex flex-wrap gap-2 print:hidden" aria-label="Steps">
          {STEPS.slice(0, -1).map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === stepIndex ? "step" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-bold capitalize transition ${
                  i === stepIndex
                    ? "bg-brand-700 text-white"
                    : i < stepIndex
                      ? "bg-brand-100 text-brand-800 hover:bg-brand-200"
                      : "bg-white text-ink/60 hover:bg-brand-50"
                }`}
              >
                {i < stepIndex && <Check aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" />}
                {s.id === "jobs" ? "Experience" : s.id}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] print:mt-0 print:block">
          {/* Guide */}
          <section aria-labelledby="question" className="card self-start p-6 sm:p-8 print:hidden">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 id="question" ref={headingRef} tabIndex={-1} className="scroll-mt-32 font-sans text-xl font-bold text-brand-900 outline-none sm:text-2xl">
                  {step.question}
                </h2>
                {step.hint && <p className="mt-1 text-ink/75">{step.hint}</p>}
              </div>
            </div>

            <div className="mt-6" aria-live="polite">
              {textField && (
                <form onSubmit={submitField} noValidate className="space-y-4">
                  <label htmlFor="field" className="sr-only">
                    {step.question}
                  </label>
                  <input
                    id="field"
                    ref={inputRef}
                    className="input text-lg"
                    type={textField === "email" ? "email" : textField === "phone" ? "tel" : "text"}
                    autoComplete={{ name: "name", phone: "tel", email: "email", location: "address-level2" }[textField]}
                    placeholder={{ name: "e.g. Tomás Rivera", phone: "e.g. 555 123 4567", email: "e.g. name@example.com", location: "e.g. Portland" }[textField]}
                    value={data[textField]}
                    onChange={(e) => set(textField, e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {stepIndex > 0 && (
                      <button type="button" className="btn-ghost" onClick={() => go(stepIndex - 1)}>
                        <ArrowLeft aria-hidden="true" className="h-5 w-5" /> Back
                      </button>
                    )}
                    {step.optional && !data[textField] ? (
                      <button type="submit" className="btn-secondary">
                        Skip this one
                      </button>
                    ) : (
                      <button type="submit" className="btn-primary">
                        Next <ArrowRight aria-hidden="true" className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </form>
              )}

              {step.id === "jobs" && (
                <div className="space-y-5">
                  {data.jobs.length > 0 && (
                    <ul className="space-y-3">
                      {data.jobs.map((job, i) => (
                        <li key={i} className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
                          {editing === i ? (
                            <>
                              <p className="mb-3 flex items-center gap-2 font-bold text-brand-800">
                                <Check aria-hidden="true" className="h-5 w-5" /> Here are your three résumé points. Check they read right.
                              </p>
                              {aiSource && (
                                <div className="mb-3">
                                  <SourceLabel source={aiSource} />
                                </div>
                              )}
                              <JobEditor
                                job={job}
                                onChange={(j) => set("jobs", data.jobs.map((x, k) => (k === i ? j : x)))}
                                onRemove={() => {
                                  set("jobs", data.jobs.filter((_, k) => k !== i));
                                  setSources((s) => s.filter((_, k) => k !== i));
                                  setEditing(null);
                                  setFollowUp(null);
                                }}
                              />
                              {followUp && (
                                <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                                  <p className="flex items-start gap-2 font-bold text-brand-900">
                                    <Sparkles aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-600" /> {followUp}
                                  </p>
                                  <label htmlFor="detail" className="sr-only">
                                    Your answer
                                  </label>
                                  <textarea
                                    id="detail"
                                    rows={2}
                                    className="input mt-2"
                                    placeholder="Optional. Add anything that comes to mind."
                                    value={detail}
                                    onChange={(e) => setDetail(e.target.value)}
                                  />
                                  <div className="mt-2 flex flex-wrap items-start gap-2">
                                    <VoiceRecorder compact onText={(t) => setDetail((d) => (d ? `${d} ${t}` : t))} />
                                    <button
                                      type="button"
                                      className="btn-primary"
                                      disabled={busy || !detail.trim()}
                                      onClick={() => describeJob(`${sources[i] ?? ""}\n${detail}`, i)}
                                    >
                                      {busy ? "Updating…" : "Add this detail"}
                                    </button>
                                  </div>
                                </div>
                              )}
                              <button type="button" className="btn-ghost mt-3 px-3" onClick={() => setEditing(null)}>
                                Done with this job
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-between gap-3">
                              <p>
                                <strong>{job.title || "Job"}</strong>
                                {job.employer && ` · ${job.employer}`}
                                <span className="block text-sm text-ink/70">{job.bullets.length} points</span>
                              </p>
                              <button
                                type="button"
                                className="btn-ghost px-3"
                                onClick={() => {
                                  setEditing(i);
                                  setFollowUp(null);
                                }}
                              >
                                <Pencil aria-hidden="true" className="h-4 w-4" /> Edit
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {editing === null && (
                    <div className="space-y-3">
                      {data.jobs.length > 0 && <p className="font-bold text-brand-900">Tell me about another job, if you'd like.</p>}
                      <label htmlFor="job-text" className="sr-only">
                        Describe a job
                      </label>
                      <textarea
                        id="job-text"
                        rows={5}
                        className="input text-lg"
                        placeholder="e.g. I worked as a mechanic at Joe's Garage in Portland from 1995 to 2020. I fixed engines and brakes and trained the apprentices."
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                      />
                      <div className="flex flex-wrap items-start gap-2">
                        <VoiceRecorder compact onText={(t) => setJobText((d) => (d ? `${d} ${t}` : t))} />
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={busy || jobText.trim().length < 10}
                          onClick={() => describeJob(jobText, null)}
                        >
                          {busy ? "Writing your three résumé points…" : "Add to my résumé"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-brand-100 pt-4">
                    <button type="button" className="btn-ghost" onClick={() => go(stepIndex - 1)}>
                      <ArrowLeft aria-hidden="true" className="h-5 w-5" /> Back
                    </button>
                    <button
                      type="button"
                      className={data.jobs.length ? "btn-primary" : "btn-secondary"}
                      onClick={() => {
                        setEditing(null);
                        next();
                      }}
                    >
                      {data.jobs.length ? (
                        <>
                          That's all my jobs <ArrowRight aria-hidden="true" className="h-5 w-5" />
                        </>
                      ) : (
                        "Skip for now"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {(step.id === "skills" || step.id === "training") && (
                <div className="space-y-4">
                  <ChipInput
                    id={step.id}
                    label={step.id === "skills" ? "Your skills" : "Training & certificates"}
                    values={data[step.id]}
                    onChange={(v) => set(step.id as "skills" | "training", v)}
                    placeholder={step.id === "skills" ? "e.g. Engine diagnostics" : "e.g. Level 3 Motor Vehicle Apprenticeship"}
                  />
                  {step.id === "skills" && user && user.skills.some((s) => !data.skills.includes(s)) && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-ink/70">From your profile:</span>
                      {user.skills
                        .filter((s) => !data.skills.includes(s))
                        .map((s) => (
                          <button key={s} type="button" className="chip border border-brand-200 bg-white hover:border-brand-600 hover:bg-brand-50" onClick={() => set("skills", [...data.skills, s])}>
                            + {s}
                          </button>
                        ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 border-t border-brand-100 pt-4">
                    <button type="button" className="btn-ghost" onClick={() => go(stepIndex - 1)}>
                      <ArrowLeft aria-hidden="true" className="h-5 w-5" /> Back
                    </button>
                    <button type="button" className={data[step.id].length ? "btn-primary" : "btn-secondary"} onClick={next}>
                      {data[step.id].length ? (
                        <>
                          Next <ArrowRight aria-hidden="true" className="h-5 w-5" />
                        </>
                      ) : (
                        "Skip this one"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {step.id === "summary" && (
                <div className="space-y-4">
                  {busy && !data.summary ? (
                    <p className="rounded-2xl bg-brand-50 p-4">Writing an introduction from what you've told me…</p>
                  ) : (
                    <>
                      {aiSource && data.summary && <SourceLabel source={aiSource} />}
                      <label htmlFor="summary" className="sr-only">
                        Introduction
                      </label>
                      <textarea
                        id="summary"
                        rows={5}
                        className="input text-lg"
                        placeholder="e.g. Experienced mechanic with 25 years of hands-on work…"
                        value={data.summary}
                        onChange={(e) => set("summary", e.target.value)}
                      />
                    </>
                  )}
                  <div className="flex flex-wrap gap-2 border-t border-brand-100 pt-4">
                    <button type="button" className="btn-ghost" onClick={() => go(stepIndex - 1)}>
                      <ArrowLeft aria-hidden="true" className="h-5 w-5" /> Back
                    </button>
                    <button type="button" className="btn-secondary" onClick={writeSummary} disabled={busy}>
                      <RotateCcw aria-hidden="true" className="h-5 w-5" /> Write it differently
                    </button>
                    <button type="button" className="btn-primary" onClick={next}>
                      Finish <ArrowRight aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {step.id === "done" && (
                <div className="space-y-4">
                  <p className="text-lg text-ink/80">
                    Have a look on the right. Everything is still editable. Tap any step above to change it.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-primary" onClick={() => window.print()}>
                      <Printer aria-hidden="true" className="h-5 w-5" /> Print or save as PDF
                    </button>
                    {user && (
                      <button type="button" className="btn-secondary" onClick={saveToProfile} disabled={profileSaved}>
                        <UserRound aria-hidden="true" className="h-5 w-5" /> {profileSaved ? "Added to your profile" : "Use on my profile too"}
                      </button>
                    )}
                  </div>
                  <p className="hint">
                    To save as a PDF, choose “Save as PDF” as the printer in the window that opens.
                    {user && " “Use on my profile” copies your introduction and skills to your TogetherWeGrow profile."}
                  </p>
                  <div className="rounded-2xl bg-brand-50 p-4">
                    <p className="font-bold text-brand-900">What next?</p>
                    <ul className="mt-2 space-y-1">
                      <li>
                        <Link to="/careers" className="font-bold text-brand-700 underline">
                          See roles that suit your experience
                        </Link>
                      </li>
                      <li>
                        <Link to="/learn/ai" className="font-bold text-brand-700 underline">
                          Learn how to apply for a job online
                        </Link>
                      </li>
                      <li>
                        <Link to="/learn/buddies" className="font-bold text-brand-700 underline">
                          Ask a buddy to look over it with you
                        </Link>
                      </li>
                    </ul>
                  </div>
                  {confirmReset ? (
                    <div className="rounded-2xl border-2 border-warm-400 p-4">
                      <p className="font-bold">Start a brand new résumé? This clears what's here.</p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" className="btn-secondary" onClick={startOver}>
                          Yes, start over
                        </button>
                        <button type="button" className="btn-ghost" onClick={() => setConfirmReset(false)}>
                          Keep this one
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="btn-ghost px-0 text-sm underline" onClick={() => setConfirmReset(true)}>
                      Start a new résumé
                    </button>
                  )}
                </div>
              )}

              {error && (
                <p role="alert" className="notice mt-4">
                  {error}
                </p>
              )}
            </div>
            <a href="#resume-paper" className="link mt-6 inline-block lg:hidden">
              See your résumé so far ↓
            </a>
          </section>

          {/* Live preview */}
          <section aria-label="Your résumé, live" className="lg:sticky lg:top-24 lg:self-start print:static">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-warm-700 print:hidden">
              <span className="h-2 w-2 animate-pulse rounded-full bg-warm-500" aria-hidden="true" /> Your résumé, building as we go
            </p>
            <ResumePreview data={data} active={active} />
          </section>
        </div>
      </div>
    </div>
  );
}
