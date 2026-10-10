import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AiSource, ProfileDraft } from "../../shared/types";
import { ProfileForm, type ProfileFields } from "../components/ProfileForm";
import { PageHeader, SourceLabel } from "../components/ui";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { saveUser } from "../lib/store";
import { EMPTY_COMFORT } from "../lib/comfort";

const EXAMPLE =
  "I've worked in carpentry for 35 years. I know furniture making, repairs, and construction, and I've trained apprentices, but I can't do heavy lifting anymore.";

export default function CreateProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ source: AiSource; data: ProfileDraft } | null>(null);
  const [manual, setManual] = useState(false);

  if (!user) return null;

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      setDraft(await api.profileDraft(text));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save(fields: ProfileFields) {
    await saveUser({ ...user!, ...fields, profileApproved: true });
    navigate(fields.roles.includes("mentor") ? "/careers" : "/dashboard");
  }

  const base: ProfileFields = {
    bio: user.bio,
    skills: user.skills,
    yearsExperience: user.yearsExperience,
    industries: user.industries,
    workPreferences: user.workPreferences,
    wantToLearn: user.wantToLearn,
    location: user.location,
    format: user.format,
    roles: user.roles,
    buddy: user.buddy,
    workComfort: user.workComfort,
    org: user.org,
  };

  if (draft || manual) {
    const d = draft?.data;
    const initial: ProfileFields = d
      ? {
          ...base,
          bio: d.summary,
          skills: d.skills,
          yearsExperience: d.yearsExperience,
          industries: d.industries,
          workPreferences: d.workPreferences,
          // If they mentioned physical limits, pre-tick the matching comfort answer (they can change it).
          workComfort:
            !base.workComfort && d.workPreferences.some((p) => /lift|physical|strain|heavy/i.test(p))
              ? { ...EMPTY_COMFORT, avoidHeavyLifting: true }
              : base.workComfort,
        }
      : base;
    return (
      <>
        <PageHeader eyebrow="Step 2 of 2 · Review" title={draft ? "Here's what we heard." : "Fill in your profile"}>
          {draft ? "Change anything that isn't quite right. Nothing is published until you say so." : "Fill in as much or as little as you like."}
        </PageHeader>
        <div className="container-page py-10 [&>*]:max-w-3xl">
          {d && (
            <section aria-label="Profile preview" className="mb-8 overflow-hidden rounded-3xl bg-brand-800 p-7 text-white sm:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">Your profile, as others would see it</p>
              <p className="mt-3 font-serif text-2xl leading-snug sm:text-[1.7rem]">{d.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {d.skills.map((s) => (
                  <li key={s} className="rounded-full bg-white/10 px-3 py-1 text-[0.95rem] text-white">
                    {s}
                  </li>
                ))}
              </ul>
              {d.yearsExperience && <p className="mt-4 text-brand-100">{d.yearsExperience} years of experience</p>}
            </section>
          )}
          <ProfileForm
            initial={initial}
            requireReview
            submitLabel="Save and publish my profile"
            onSubmit={save}
            intro={
              draft && (
                <div className="flex flex-col gap-3">
                  <div>
                    <SourceLabel source={draft.source} />
                  </div>
                  {d && d.suggestedRoles.length > 0 && (
                    <div className="notice">
                      <strong>Roles that might suit you:</strong> {d.suggestedRoles.join(", ")}. You'll see details on the next page.
                    </div>
                  )}
                  <button type="button" className="btn-ghost self-start px-0" onClick={() => setDraft(null)}>
                    ← Go back and describe it again
                  </button>
                </div>
              )
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Step 1 of 2 · Your story" title={`Tell us about your work, ${user.name.split(" ")[0]}.`}>
        No résumé needed. Talk the way you'd explain it to a friend: what you did, for how long, what you're good at, and
        what kind of work suits you now.
      </PageHeader>
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_300px] lg:gap-12">
        <div className="space-y-6">
          {user.comfort?.includes("A person to help me get set up") && (
            <p className="notice">
              You mentioned you'd like someone to help.{" "}
              <Link to="/learn/buddies" className="link">
                A digital buddy can sit with you
              </Link>{" "}
              while you do this, or you can carry on here at your own pace.
            </p>
          )}
          <div className="card p-6 sm:p-10">
            <VoiceRecorder large onText={(t) => setText((prev) => (prev ? `${prev} ${t}` : t))} />
            <div className="my-8 flex items-center gap-4 text-sm font-medium uppercase tracking-[0.14em] text-muted" aria-hidden="true">
              <span className="h-px flex-1 bg-warm-200" /> or type it <span className="h-px flex-1 bg-warm-200" />
            </div>
            <label htmlFor="story" className="label text-lg">
              Your working life, in your own words
            </label>
            <textarea
              id="story"
              rows={7}
              className="input text-lg leading-relaxed"
              placeholder={EXAMPLE}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="hint mt-2">You can edit anything that was heard wrongly.</p>
            {error && (
              <p role="alert" className="notice mt-4">
                {error}
              </p>
            )}
            <div aria-live="polite" className="mt-8 flex flex-col gap-3 border-t border-warm-200 pt-6 sm:flex-row sm:items-center">
              <button className="btn-primary px-8 text-lg" onClick={generate} disabled={busy || text.trim().length < 15}>
                {busy ? "Organising your experience…" : "Create my skills profile"}
              </button>
              <button className="btn-ghost" onClick={() => setManual(true)}>
                I'd rather fill in a form
              </button>
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl bg-brand-100/70 p-6">
            <p className="font-semibold text-brand-900">Not sure what to say?</p>
            <ul className="mt-3 space-y-2 text-muted">
              {["What jobs have you done?", "How many years?", "What are you proud of?", "Have you trained anyone?", "Is there work you'd rather avoid now?"].map((q) => (
                <li key={q} className="flex gap-2">
                  <span aria-hidden="true" className="text-warm-700">·</span> {q}
                </li>
              ))}
            </ul>
            <button className="link mt-4" onClick={() => setText(EXAMPLE)}>
              Use an example
            </button>
          </div>
          <div className="rounded-3xl border border-warm-200 bg-white p-6 text-[0.95rem]">
            <p className="font-semibold text-brand-900">Your privacy</p>
            <p className="mt-2 text-muted">
              Your browser's speech service turns your voice into text. TogetherWeGrow never receives or saves recordings.
            </p>
            <p className="mt-2 text-muted">
              The text is sent to our AI service provider to draft your profile. Only what you approve is saved. Leave out
              private details like bank or health information.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
