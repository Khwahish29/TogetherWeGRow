import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AiSource, ProfileDraft } from "../../shared/types";
import { ProfileForm, type ProfileFields } from "../components/ProfileForm";
import { PageHeader, SourceLabel } from "../components/ui";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { saveUser } from "../lib/store";

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
        }
      : base;
    return (
      <>
        <PageHeader eyebrow="Step 2 of 2" title="Check your profile">
          {draft ? "Here's what we understood. Change anything that isn't quite right." : "Fill in as much or as little as you like."}
        </PageHeader>
        <div className="container-page max-w-3xl py-10">
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
                  <button type="button" className="btn-ghost self-start" onClick={() => setDraft(null)}>
                    ← Go back and describe again
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
      <PageHeader eyebrow="Step 1 of 2" title={`Tell us about your work, ${user.name.split(" ")[0]}`}>
        No résumé needed. Speak or type the way you'd explain it to a friend: what you did, for how long, what you're good
        at, and what kind of work suits you now.
      </PageHeader>
      <div className="container-page grid max-w-5xl gap-8 py-10 lg:grid-cols-[1fr_280px]">
        <div className="card space-y-4">
          <label htmlFor="story" className="label text-lg">
            Your working life, in your own words
          </label>
          <textarea
            id="story"
            rows={8}
            className="input text-lg"
            placeholder={EXAMPLE}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <VoiceRecorder onText={(t) => setText((prev) => (prev ? `${prev} ${t}` : t))} />
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          <div aria-live="polite" className="flex flex-col gap-3 border-t border-brand-100 pt-4 sm:flex-row">
            <button className="btn-primary text-lg" onClick={generate} disabled={busy || text.trim().length < 15}>
              {busy ? "Organising your experience…" : "Create my skills profile"}
            </button>
            <button className="btn-ghost" onClick={() => setManual(true)}>
              I'd rather fill in a form
            </button>
          </div>
        </div>
        <aside className="space-y-4 text-sm">
          <div className="rounded-2xl bg-brand-50 p-5">
            <p className="font-bold text-brand-900">Not sure what to say?</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>What jobs have you done?</li>
              <li>How many years?</li>
              <li>What are you proud of?</li>
              <li>Have you trained anyone?</li>
              <li>Is there work you'd rather avoid now?</li>
            </ul>
            <button className="btn-ghost mt-2 px-0 underline" onClick={() => setText(EXAMPLE)}>
              Use an example
            </button>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="font-bold text-brand-900">Your privacy</p>
            <p className="mt-1">
              Your browser's speech service turns your voice into text. TogetherWeGrow never receives or saves recordings. Only the text you approve becomes your
              profile.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
