import { useState, type FormEvent, type ReactNode } from "react";
import type { BuddyOffer, BuddyPricing, Format, Role, User } from "../lib/types";
import { ChipInput } from "./ui";

export type ProfileFields = Pick<
  User,
  "bio" | "skills" | "yearsExperience" | "industries" | "workPreferences" | "wantToLearn" | "location" | "format" | "roles" | "buddy"
>;

const ROLE_LABELS: Record<Role, string> = {
  mentor: "Mentor / expert",
  learner: "Learner",
  buddy: "Digital buddy",
};

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
