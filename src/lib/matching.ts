import type { Format, User } from "./types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, "").trim();

// Skills that learners describe in different words but mean the same field.
const RELATED: string[][] = [
  ["carpentry", "woodworking", "woodwork", "furniture", "joinery", "cabinet"],
  ["accounting", "bookkeeping", "finance", "payroll", "small business"],
  ["cooking", "chef", "kitchen", "baking", "culinary", "menu"],
  ["mechanic", "mechanical", "engine", "automotive", "car repair"],
  ["plumbing", "pipe", "heating"],
  ["video meetings", "video calls", "zoom", "online meetings"],
];

function relatedGroup(s: string) {
  return RELATED.findIndex((group) => group.some((term) => s.includes(term)));
}

/** True when two skill names refer to the same thing ("Woodworking" ~ "Carpentry"). */
export function skillsOverlap(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y || x.includes(y) || y.includes(x)) return true;
  const gx = relatedGroup(x);
  if (gx >= 0 && gx === relatedGroup(y)) return true;
  const stem = (w: string) => w.slice(0, Math.max(5, Math.ceil(w.length * 0.7)));
  return x.split(" ").some((wx) => y.split(" ").some((wy) => wx.length > 3 && wy.length > 3 && stem(wx) === stem(wy)));
}

function formatsCompatible(a: Format, b: Format) {
  return a === "both" || b === "both" || a === b;
}

export interface MentorMatch {
  mentor: User;
  score: number;
  matchedSkills: string[];
  reasons: string[];
}

/** Scores how well a mentor fits a learner (0–100). Pure function; no I/O. */
export function scoreMentor(learner: User | null, mentor: User): MentorMatch {
  if (!learner) return { mentor, score: 0, matchedSkills: [], reasons: [] };
  const matchedSkills = mentor.skills.filter((skill) => learner.wantToLearn.some((want) => skillsOverlap(skill, want)));
  const reasons: string[] = [];
  let score = 0;

  if (matchedSkills.length) {
    score += Math.min(60, 30 + matchedSkills.length * 15);
    reasons.push(`Teaches ${matchedSkills.slice(0, 2).join(" and ")}, which you want to learn`);
  }
  if (formatsCompatible(learner.format, mentor.format)) {
    score += 15;
  }
  if (learner.location && mentor.location && norm(learner.location) === norm(mentor.location)) {
    score += 15;
    reasons.push(`Also in ${mentor.location}`);
  }
  // Two-way exchange bonus: the learner can teach something the mentor wants to learn.
  const giveBack = learner.skills.filter((s) => mentor.wantToLearn.some((w) => skillsOverlap(s, w)));
  if (giveBack.length) {
    score += 10;
    reasons.push(`You could share ${giveBack[0]} in return, if you'd like`);
  }
  return { mentor, score: Math.min(100, score), matchedSkills, reasons };
}
