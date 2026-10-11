import type { CareerProfileInput, CareerRec, ProfileDraft } from "../../shared/types.js";
import { GENERIC_ROLES, PREFERENCE_PATTERNS, TRADES } from "../data/roleMap.js";

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function detectTrades(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `;
  return Object.keys(TRADES).filter((key) => TRADES[key].keywords.some((k) => lower.includes(k)));
}

export function fallbackProfileDraft(text: string): ProfileDraft {
  const lower = text.toLowerCase();
  const trades = detectTrades(text);

  const skills = unique(
    trades.flatMap((key) =>
      Object.entries(TRADES[key].skills)
        .filter(([keyword]) => lower.includes(keyword))
        .map(([, label]) => label),
    ),
  );

  const yearsMatch = lower.match(/(\d{1,2})\s*(\+\s*)?(years|yrs)/);
  const yearsExperience = yearsMatch ? Number(yearsMatch[1]) : null;

  const workPreferences = PREFERENCE_PATTERNS.filter(([re]) => re.test(text)).map(([, label]) => label);
  const industries = trades.map((key) => TRADES[key].industry);
  const suggestedRoles = trades.length
    ? unique(trades.flatMap((key) => TRADES[key].roles.map((r) => r.title))).slice(0, 4)
    : GENERIC_ROLES.map((r) => r.title);

  const mainIndustry = industries[0]?.toLowerCase() ?? "your field";
  const summary =
    `Experienced professional in ${mainIndustry}` +
    (yearsExperience ? ` with ${yearsExperience} years of practical experience` : "") +
    (skills.length ? `, skilled in ${skills.slice(0, 3).join(", ").toLowerCase()}` : "") +
    ". Interested in sharing knowledge through mentoring, training, and advisory work.";

  return { skills, yearsExperience, industries, workPreferences, suggestedRoles, summary };
}

export function fallbackCareers(profile: CareerProfileInput): CareerRec[] {
  const text = [...profile.skills, ...(profile.interests ?? [])].join(" ");
  const trades = detectTrades(text);
  const roles = trades.length ? trades.flatMap((key) => TRADES[key].roles) : GENERIC_ROLES;
  const wantsLowStrain = profile.workPreferences.some((p) => /physical|lift|strain/i.test(p));

  const ranked = wantsLowStrain
    ? [...roles].sort((a, b) => (a.physicalDemand === "low" ? 0 : 1) - (b.physicalDemand === "low" ? 0 : 1))
    : roles;

  return ranked.slice(0, 4).map((role) => ({
    ...role,
    transferableSkills: profile.skills.slice(0, 4),
  }));
}
