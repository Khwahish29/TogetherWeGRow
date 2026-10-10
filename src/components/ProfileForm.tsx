import { useState, type FormEvent, type ReactNode } from "react";
import { EMPTY_COMFORT } from "../lib/comfort";
import type { BuddyOffer, BuddyPricing, Format, Organization, Role, User, WorkComfort } from "../lib/types";
import { langName } from "../i18n/languages";
import { LanguagePicker } from "./LanguagePicker";
import { ChipInput } from "./ui";

export type ProfileFields = Pick<
  User,
  | "bio"
  | "skills"
  | "yearsExperience"
  | "industries"
  | "workPreferences"
  | "wantToLearn"
  | "languages"
  | "preferredLanguage"
  | "location"
  | "format"
  | "roles"
  | "buddy"
  | "workComfort"
  | "org"
>;

const ROLE_LABELS: Record<Role, string> = {
  mentor: "Mentor / expert",
  learner: "Learner",
  buddy: "Digital buddy",
  employer: "Organization (hiring)",
  family: "Supporting someone I love",
};

function Choice<T extends string | boolean | null>({
  name,
  value,
  current,
  onPick,
  children,
}: {
  name: string;
  value: T;
  current: T;
  onPick: (v: T) => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border-2 px-4 ${
        current === value ? "border-brand-700 bg-brand-50" : "border-brand-100"
      }`}
    >
      <input type="radio" name={name} className="h-5 w-5 accent-brand-700" checked={current === value} onChange={() => onPick(value)} />
      {children}
    </label>
  );
}

const DEFAULT_BUDDY: BuddyOffer = { topics: [], availability: "", mode: "online", pricing: "volunteer" };

export function ProfileForm({
  initial,
  submitLabel,
  requireReview,
  onSubmit,
  intro,
}: {
  initial: ProfileFields;
  submitLabel: string;
  requireReview?: boolean;
  onSubmit: (fields: ProfileFields) => Promise<void>;
  intro?: ReactNode;
}) {
  const [f, setF] = useState<ProfileFields>(initial);
  const [reviewed, setReviewed] = useState(!requireReview);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) => setF((prev) => ({ ...prev, [key]: value }));
  const buddy = f.buddy ?? DEFAULT_BUDDY;
  const setBuddy = (patch: Partial<BuddyOffer>) => set("buddy", { ...buddy, ...patch });
  const wc = f.workComfort ?? EMPTY_COMFORT;
  const setWc = (patch: Partial<WorkComfort>) => set("workComfort", { ...wc, ...patch });
  const org: Organization = f.org ?? { name: "", kind: "workshop", about: "", verified: false };
  const setOrg = (patch: Partial<Organization>) => set("org", { ...org, ...patch });
  const showsComfort = f.roles.some((r) => r === "mentor" || r === "learner");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit({ ...f, buddy: f.roles.includes("buddy") ? buddy : undefined });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {intro}
      <fieldset className="card space-y-5">
        <legend className="sr-only">About you</legend>
        <div>
          <label htmlFor="bio" className="label">
            Short introduction
          </label>
          <textarea id="bio" rows={4} className="input" value={f.bio} onChange={(e) => set("bio", e.target.value)} />
          <p className="hint mt-1">This appears on your public profile. Write it in your own words if you prefer.</p>
        </div>
        <ChipInput id="skills" label="Skills" values={f.skills} onChange={(v) => set("skills", v)} placeholder="e.g. Furniture making" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="years" className="label">
              Years of experience
            </label>
            <input
              id="years"
              type="number"
              min={0}
              max={80}
              className="input"
              value={f.yearsExperience ?? ""}
              onChange={(e) => set("yearsExperience", e.target.value === "" ? null : Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="loc" className="label">
              Town or city
            </label>
            <input id="loc" className="input" value={f.location} onChange={(e) => set("location", e.target.value)} />
          </div>
        </div>
        <ChipInput
          id="prefs"
          label="Work preferences"
          values={f.workPreferences}
          onChange={(v) => set("workPreferences", v)}
          placeholder="e.g. Less physically demanding work"
        />
        <ChipInput
          id="learn"
          label="Things I'd like to learn (optional)"
          values={f.wantToLearn}
          onChange={(v) => set("wantToLearn", v)}
          placeholder="e.g. Video meetings, woodworking"
        />
        <div>
          <label htmlFor="spoken-langs" className="label">
            Languages I speak
          </label>
          <LanguagePicker
            id="spoken-langs"
            values={f.languages?.length ? f.languages : ["en"]}
            onChange={(v) => setF((p) => ({ ...p, languages: v, preferredLanguage: v.includes(p.preferredLanguage ?? "") ? p.preferredLanguage : v[0] }))}
          />
          {(f.languages?.length ?? 0) > 1 && (
            <div className="mt-3">
              <label htmlFor="pref-lang" className="label">
                Which language do you prefer for sessions?
              </label>
              <select id="pref-lang" className="input" value={f.preferredLanguage ?? f.languages![0]} onChange={(e) => set("preferredLanguage", e.target.value)}>
                {f.languages!.map((c) => (
                  <option key={c} value={c}>
                    {langName(c)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className="hint mt-1">We use this to match you with people you can talk to.</p>
        </div>
        <div>
          <label htmlFor="format" className="label">
            How do you prefer to meet?
          </label>
          <select id="format" className="input" value={f.format} onChange={(e) => set("format", e.target.value as Format)}>
            <option value="both">Online or in person</option>
            <option value="online">Online only</option>
            <option value="in-person">In person only</option>
          </select>
        </div>
        <fieldset>
          <legend className="label">I'd like to take part as…</legend>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
              <label key={role} className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border-2 border-brand-100 px-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-brand-700"
                  checked={f.roles.includes(role)}
                  onChange={() =>
                    set("roles", f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role])
                  }
                />
                {ROLE_LABELS[role]}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      {showsComfort && (
        <fieldset id="work-comfort" className="card scroll-mt-28 space-y-5">
          <legend className="px-1 font-serif text-xl font-bold text-brand-900">What kind of work feels right for you?</legend>
          <p className="text-muted">
            Optional. These are <strong>work preferences, not medical questions</strong>. We use them to point out roles
            that seem to fit and to flag duties worth asking about. Answer only what you want to.
          </p>
          <fieldset>
            <legend className="label">Do you prefer sitting, standing, or a mix?</legend>
            <div className="flex flex-wrap gap-2">
              <Choice name="posture" value="sitting" current={wc.posture} onPick={(v) => setWc({ posture: v })}>Mostly sitting</Choice>
              <Choice name="posture" value="standing" current={wc.posture} onPick={(v) => setWc({ posture: v })}>Standing is fine</Choice>
              <Choice name="posture" value="mix" current={wc.posture} onPick={(v) => setWc({ posture: v })}>A mix</Choice>
              <Choice name="posture" value="" current={wc.posture} onPick={(v) => setWc({ posture: v })}>No preference</Choice>
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Would you like to avoid routine heavy lifting?</legend>
            <div className="flex flex-wrap gap-2">
              <Choice name="lifting" value={true} current={wc.avoidHeavyLifting} onPick={(v) => setWc({ avoidHeavyLifting: v })}>Yes, I'd rather avoid it</Choice>
              <Choice name="lifting" value={false} current={wc.avoidHeavyLifting} onPick={(v) => setWc({ avoidHeavyLifting: v })}>It's fine</Choice>
              <Choice name="lifting" value={null} current={wc.avoidHeavyLifting} onPick={(v) => setWc({ avoidHeavyLifting: v })}>Rather not say</Choice>
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="hours" className="label">How many hours would you like to work?</label>
              <select id="hours" className="input" value={wc.hoursPerWeek} onChange={(e) => setWc({ hoursPerWeek: e.target.value as WorkComfort["hoursPerWeek"] })}>
                <option value="">No preference</option>
                <option value="up-to-10">Up to 10 hours a week</option>
                <option value="10-20">10 to 20 hours a week</option>
                <option value="20-30">20 to 30 hours a week</option>
                <option value="full-time">Full time</option>
              </select>
            </div>
            <div>
              <label htmlFor="setting" className="label">Remote, in person, or flexible?</label>
              <select id="setting" className="input" value={wc.setting} onChange={(e) => setWc({ setting: e.target.value as WorkComfort["setting"] })}>
                <option value="">No preference</option>
                <option value="remote">Remote</option>
                <option value="in-person">In person</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
          <ChipInput id="more-of" label="Tasks I'd like to do more of" values={wc.moreOf} onChange={(v) => setWc({ moreOf: v })} placeholder="e.g. Teaching apprentices" />
          <ChipInput id="less-of" label="Tasks I'd like to do less of" values={wc.lessOf} onChange={(v) => setWc({ lessOf: v })} placeholder="e.g. Carrying materials" />
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-brand-50 p-4">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-brand-700" checked={wc.shareWithEmployers} onChange={(e) => setWc({ shareWithEmployers: e.target.checked })} />
            <span>
              <strong>Let organizations see these preferences</strong>
              <span className="block text-sm text-muted">Off by default. When off, only you see them.</span>
            </span>
          </label>
        </fieldset>
      )}

      {f.roles.includes("employer") && (
        <fieldset className="card space-y-4">
          <legend className="px-1 font-serif text-xl font-bold text-brand-900">Your organization</legend>
          <div>
            <label htmlFor="org-name" className="label">Organization name</label>
            <input id="org-name" className="input" value={org.name} onChange={(e) => setOrg({ name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="org-kind" className="label">Type</label>
            <select id="org-kind" className="input" value={org.kind} onChange={(e) => setOrg({ kind: e.target.value as Organization["kind"] })}>
              <option value="workshop">Workshop</option>
              <option value="school">Vocational school or college</option>
              <option value="community">Community organization</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div>
            <label htmlFor="org-about" className="label">About</label>
            <textarea id="org-about" rows={2} className="input" value={org.about} onChange={(e) => setOrg({ about: e.target.value })} />
          </div>
        </fieldset>
      )}

      {f.roles.includes("buddy") && (
        <fieldset className="card space-y-5">
          <legend className="px-1 font-serif text-xl font-bold text-brand-900">Digital buddy details</legend>
          <ChipInput
            id="buddy-topics"
            label="Topics I can help with"
            values={buddy.topics}
            onChange={(v) => setBuddy({ topics: v })}
            placeholder="e.g. Video meetings"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="buddy-avail" className="label">
                When I'm available
              </label>
              <input
                id="buddy-avail"
                className="input"
                placeholder="e.g. Weekday evenings"
                value={buddy.availability}
                onChange={(e) => setBuddy({ availability: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="buddy-mode" className="label">
                Help offered
              </label>
              <select id="buddy-mode" className="input" value={buddy.mode} onChange={(e) => setBuddy({ mode: e.target.value as Format })}>
                <option value="online">Online</option>
                <option value="in-person">In person</option>
                <option value="both">Online or in person</option>
              </select>
            </div>
          </div>
          <fieldset>
            <legend className="label">Is your help free, volunteer, or paid?</legend>
            <p className="hint mb-2">This is shown clearly to everyone, so there are no surprises.</p>
            <div className="flex flex-wrap gap-3">
              {(["free", "volunteer", "paid"] as BuddyPricing[]).map((p) => (
                <label key={p} className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border-2 border-brand-100 px-4 capitalize">
                  <input
                    type="radio"
                    name="pricing"
                    className="h-5 w-5 accent-brand-700"
                    checked={buddy.pricing === p}
                    onChange={() => setBuddy({ pricing: p })}
                  />
                  {p}
                </label>
              ))}
            </div>
            {buddy.pricing === "paid" && (
              <div className="mt-3 max-w-xs">
                <label htmlFor="buddy-rate" className="label">
                  Hourly rate ($)
                </label>
                <input
                  id="buddy-rate"
                  type="number"
                  min={1}
                  className="input"
                  required
                  value={buddy.rate ?? ""}
                  onChange={(e) => setBuddy({ rate: Number(e.target.value) })}
                />
              </div>
            )}
          </fieldset>
        </fieldset>
      )}

      {requireReview && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-warm-400 bg-warm-100 p-4">
          <input
            type="checkbox"
            className="mt-1 h-6 w-6 shrink-0 accent-brand-700"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          <span>
            <strong>I've reviewed this profile and it's accurate.</strong> Nothing is published until you confirm. You can edit
            it any time.
          </span>
        </label>
      )}

      <button type="submit" className="btn-primary w-full text-lg sm:w-auto" disabled={!reviewed || saving}>
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
