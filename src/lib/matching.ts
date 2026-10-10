import { langName } from "../i18n/languages";
import type { Format, User } from "./types";

/** Lower-case, accent-stripped, letters only ("Carpintería" -> "carpinteria"). */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim();

// Skills that people describe in different words (English or Spanish) but mean the same field.
const RELATED: string[][] = [
  ["carpentry", "woodworking", "woodwork", "furniture", "joinery", "cabinet", "carpinteria", "madera", "ebanisteria", "muebles"],
  ["accounting", "bookkeeping", "finance", "payroll", "small business", "contabilidad", "contador", "finanzas", "nomina", "pequeno negocio", "pequenos negocios"],
  ["cooking", "chef", "kitchen", "baking", "culinary", "menu", "cocina", "cocinar", "panaderia", "reposteria", "culinari"],
  ["mechanic", "mechanical", "engine", "automotive", "car repair", "mecanica", "motor", "automotriz", "reparacion de autos", "reparacion automotriz"],
  ["plumbing", "pipe", "heating", "plomeria", "fontaneria", "tuberia", "calefaccion"],
  ["video meetings", "video calls", "zoom", "online meetings", "videollamada", "videollamadas", "reuniones virtuales", "reuniones por video", "videoconferencia"],
  ["email", "e mail", "correo", "correo electronico"],
  ["sewing", "tailoring", "costura", "sastreria"],
  ["smartphone", "smartphones", "phone", "telefono", "celular", "movil"],
  ["ai tools", "artificial intelligence", "inteligencia artificial", "herramientas de ia", "herramientas ia"],
  ["online safety", "scams", "seguridad en linea", "seguridad en internet", "estafas"],
  ["resume", "resumes", "curriculum", "curriculo", "cv"],
];

function relatedGroup(s: string) {
  return RELATED.findIndex((group) => group.some((term) => s.includes(term)));
}

/** True when two skill names refer to the same thing ("Woodworking" ~ "Carpintería"). */
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

// ---- Language matching ----

export const speaks = (u: User): string[] => (u.languages?.length ? u.languages : ["en"]);

/** Languages both people can talk in. */
export function sharedLanguages(a: User, b: User): string[] {
  const other = speaks(b);
  return speaks(a).filter((l) => other.includes(l));
}

export interface LanguageFit {
  shared: string[];
  /** True when both people would most like sessions in the same language. */
  samePreferred: boolean;
  /** True when there is no language both can speak, so a translation helper is needed. */
  needsBridge: boolean;
}

export function languageFit(a: User | null, b: User): LanguageFit {
  if (!a) return { shared: [], samePreferred: false, needsBridge: false };
  const shared = sharedLanguages(a, b);
  return {
    shared,
    samePreferred: (a.preferredLanguage ?? speaks(a)[0]) === (b.preferredLanguage ?? speaks(b)[0]),
    needsBridge: shared.length === 0,
  };
}

// ---- Mentor scoring ----

export interface MentorMatch {
  mentor: User;
  score: number;
  matchedSkills: string[];
  reasons: string[];
  language?: LanguageFit;
}

const NO_FIT: LanguageFit = { shared: [], samePreferred: false, needsBridge: false };

/** Scores how well a mentor fits a learner (0–100). Pure function; no I/O. */
export function scoreMentor(learner: User | null, mentor: User): MentorMatch {
  if (!learner) return { mentor, score: 0, matchedSkills: [], reasons: [], language: NO_FIT };
  const matchedSkills = mentor.skills.filter((skill) => learner.wantToLearn.some((want) => skillsOverlap(skill, want)));
  const reasons: string[] = [];
  const language = languageFit(learner, mentor);
  let score = 0;

  if (matchedSkills.length) {
    score += Math.min(60, 30 + matchedSkills.length * 15);
    reasons.push(`Teaches ${matchedSkills.slice(0, 2).join(" and ")}`);
  }
  // A shared language matters most for older members who may not speak the other language at all.
  if (language.shared.length) {
    score += 20 + (language.samePreferred ? 5 : 0);
    const names = language.shared.map(langName).join(" + ");
    reasons.unshift(language.samePreferred ? `Speaks ${names}, the language you prefer` : `You both speak ${names}`);
  } else {
    score -= 20;
  }
  if (formatsCompatible(learner.format, mentor.format)) score += 10;
  if (learner.location && mentor.location && norm(learner.location) === norm(mentor.location)) {
    score += 10;
    reasons.push(`Also in ${mentor.location}`);
  }
  // Two-way exchange bonus: the learner can teach something the mentor wants to learn.
  const giveBack = learner.skills.filter((s) => mentor.wantToLearn.some((w) => skillsOverlap(s, w)));
  if (giveBack.length) {
    score += 5;
    reasons.push(`You could teach them ${giveBack[0]} in return`);
  }
  return { mentor, score: Math.max(0, Math.min(100, score)), matchedSkills, reasons, language };
}

/**
 * Digital-buddy fit for a learner: language first, then topic overlap with what they want to learn.
 * Used to put the buddies a person can actually talk to at the top.
 */
export function scoreBuddy(learner: User | null, buddy: User): { score: number; language: LanguageFit; topics: string[] } {
  const language = languageFit(learner, buddy);
  const topics = (buddy.buddy?.topics ?? []).filter((t) => learner?.wantToLearn.some((w) => skillsOverlap(t, w)));
  const score = (language.shared.length ? 50 : 0) + (language.samePreferred ? 10 : 0) + Math.min(40, topics.length * 20);
  return { score, language, topics };
}
