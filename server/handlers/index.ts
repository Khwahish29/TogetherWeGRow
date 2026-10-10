import * as z from "zod/v4";
import type {
  ApiResult,
  CareerProfileInput,
  CareerRec,
  CompanionRequest,
  CompanionResponse,
  MatchRequest,
  MatchResult,
  NextChapterInput,
  NextChapterPlan,
  ProfileDraft,
  ResumeJobResult,
  ResumeSummaryInput,
} from "../../shared/types";
import { askStructured } from "../lib/ai";
import { fallbackCareers, fallbackProfileDraft } from "../fallback/profile";
import { fallbackCompanion, GUIDES } from "../fallback/companion";
import { fallbackResumeJob, fallbackResumeSummary } from "../fallback/resume";
import { fallbackPlan } from "../fallback/plan";

export class BadRequest extends Error {}

const ProfileDraftSchema = z.object({
  skills: z.array(z.string()),
  yearsExperience: z.number().int().nullable(),
  industries: z.array(z.string()),
  workPreferences: z.array(z.string()),
  suggestedRoles: z.array(z.string()),
  summary: z.string(),
});

const CareersSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string(),
      type: z.enum(["paid-mentoring", "advisory", "training", "inspection", "consulting"]),
      why: z.string(),
      transferableSkills: z.array(z.string()),
      qualificationsNeeded: z.string(),
      physicalDemand: z.enum(["low", "medium"]),
      howToFind: z.string(),
    }),
  ),
});

const GuideSchema = z.object({ intro: z.string(), steps: z.array(z.string()) });
const ReplySchema = z.object({ reply: z.string() });

function requireText(value: unknown, field: string, max = 5000): string {
  if (typeof value !== "string" || !value.trim()) throw new BadRequest(`${field} is required`);
  return value.trim().slice(0, max);
}

export async function profileDraft(body: unknown): Promise<ApiResult<ProfileDraft>> {
  const text = requireText((body as { text?: unknown })?.text, "text");
  const ai = await askStructured(
    ProfileDraftSchema,
    `Turn the person's description of their working life into a skills profile draft.
- skills: concrete skills they mentioned or that are directly implied (e.g. "furniture making"). Always include their main trade or profession itself (e.g. "Carpentry", "Nursing"). Title Case, max 10.
- yearsExperience: only if they stated it, else null.
- workPreferences: what they want or need (e.g. "Less physically demanding work"). Only from what they said.
- suggestedRoles: 3-4 roles that use their knowledge with less physical strain (mentor, adviser, trainer, inspector...).
- summary: 2 sentences, first person NOT used, factual, no invented details.`,
    text,
  );
  return ai ? { source: "ai", data: ai } : { source: "fallback", data: fallbackProfileDraft(text) };
}

export async function careers(body: unknown): Promise<ApiResult<CareerRec[]>> {
  const profile = body as CareerProfileInput;
  if (!profile || !Array.isArray(profile.skills) || profile.skills.length === 0) {
    throw new BadRequest("skills are required");
  }
  const input: CareerProfileInput = {
    skills: profile.skills.slice(0, 20).map(String),
    yearsExperience: typeof profile.yearsExperience === "number" ? profile.yearsExperience : null,
    workPreferences: (profile.workPreferences ?? []).slice(0, 10).map(String),
    location: profile.location ? String(profile.location).slice(0, 100) : undefined,
    interests: (profile.interests ?? []).slice(0, 10).map(String),
    comfort: (profile.comfort ?? []).slice(0, 10).map(String),
  };
  const ai = await askStructured(
    CareersSchema,
    `Recommend exactly 4 career transition options that let this person earn from their existing knowledge, favouring paid mentoring, advisory, training, inspection, or consulting work.
For each: explain "why" in 1-2 plain sentences addressed to the person ("You..."), list which of THEIR skills transfer, state honestly whether further qualifications or certification may be needed, rate physicalDemand (low or medium only), and say concretely where to look for openings.
Respect their work preferences and any "comfort" answers (e.g. preferring to sit, avoiding routine heavy lifting, part-time hours, remote work); favour roles that fit them. Do not assume physical limitations they haven't stated.`,
    JSON.stringify(input),
  );
  return ai
    ? { source: "ai", data: ai.recommendations.slice(0, 4) }
    : { source: "fallback", data: fallbackCareers(input) };
}

export async function companion(body: unknown): Promise<ApiResult<CompanionResponse>> {
  const req = body as CompanionRequest;
  if (!req || !["guide", "simpler", "ask"].includes(req.action)) throw new BadRequest("invalid action");
  const topic = requireText(req.topic, "topic", 100);
  const feelings = ["curious", "nervous", "frustrated", "refresher"] as const;
  const feeling = feelings.find((f) => f === req.feeling);
  const clean: CompanionRequest = { action: req.action, topic, feeling };
  const topicIntro = GUIDES[topic]?.intro ?? topic;
  const mood = {
    curious: "They feel curious.",
    nervous: "They feel a bit nervous, so reassure them that nothing can break and they can go back anytime.",
    frustrated: "They feel frustrated from past attempts, so acknowledge that kindly and go extra slowly.",
    refresher: "They only need a quick refresher, so keep it brisk.",
  };
  const style = `You are a patient technology learning companion. The learner may be new to this technology. Be encouraging but never patronising; mistakes are normal. ${feeling ? mood[feeling] : ""}`;

  let ai: CompanionResponse | null = null;
  if (req.action === "guide") {
    ai = await askStructured(
      GuideSchema,
      `${style} Write a step-by-step guide. intro: one reassuring sentence. steps: 5-7 steps, each ONE action in one or two short sentences, naming the exact button words where common.`,
      `Topic: ${topic} (${topicIntro})`,
    );
  } else if (req.action === "simpler") {
    clean.step = requireText(req.step, "step", 600);
    ai = await askStructured(
      ReplySchema,
      `${style} Re-explain this single step more simply, in at most 3 very short sentences. Use an everyday comparison if it helps.`,
      `Topic: ${topic}\nStep: ${clean.step}`,
    );
  } else {
    clean.question = requireText(req.question, "question", 600);
    ai = await askStructured(
      ReplySchema,
      `${style} Answer the learner's question in plain language, in at most 5 short sentences or a short numbered list. If it involves money, passwords, or personal data, include one safety tip.`,
      `Topic we are learning: ${topic}\nQuestion: ${clean.question}`,
    );
  }
  return ai ? { source: "ai", data: ai } : { source: "fallback", data: fallbackCompanion(clean) };
}

const ResumeJobSchema = z.object({
  title: z.string(),
  employer: z.string(),
  location: z.string(),
  start: z.string(),
  end: z.string(),
  bullets: z.array(z.string()),
  followUp: z.string(),
});

export async function resumeJob(body: unknown): Promise<ApiResult<ResumeJobResult>> {
  const text = requireText((body as { text?: unknown })?.text, "text", 3000);
  const ai = await askStructured(
    ResumeJobSchema,
    `The person is describing one job, in their own words, for their résumé. Extract it.
- title: job title in Title Case (e.g. "Mechanic", "Head Chef"). "" if unclear.
- employer, location: only if they named them, else "".
- start, end: years as they said them (e.g. "1995"); end may be "Present". "" if not said. Never guess.
- bullets: EXACTLY 3 résumé bullet points that turn their everyday words into polished, professional résumé language. Each bullet: starts with a strong past-tense action verb (e.g. "Diagnosed", "Trained", "Managed"), 4-16 words, no "I"/"my", no full stop. Short is fine: never pad a bullet to make it longer. Group related things they said so all of it is covered across the 3 bullets. Make the strengths they described shine (e.g. "customers asked for me by name" -> "Built a loyal customer base who requested my work by name"), but use ONLY what they said: never add tools, numbers, certifications, achievements, duties, results, or benefits they did not mention. Do NOT tack on outcome phrases like "ensuring reliable performance" or "improving efficiency" unless they said so. Do NOT add extra activities: if they said "ran the kitchen", write "Ran day-to-day kitchen operations", NOT "supervised staff" or "maintained inventory". Rewording is fine; adding claims is not.
  Example. They said: "I was a cook at Rosa Diner. I ran the kitchen, ordered supplies, and trained new cooks."
  Good: ["Ran day-to-day kitchen operations at Rosa Diner", "Managed ordering of kitchen supplies", "Trained new cooks joining the kitchen team"]
  Bad (invents details): ["Coordinated staff and managed workflow", "Maintained inventory to support service needs", "Trained new cooks on recipes and safety standards"]
  Before answering, check every bullet: each part of it must come from something they actually said. Remove anything that doesn't. If they said very little, cover the role itself in one bullet rather than inventing.
- followUp: one warm, simple question that could draw out something valuable they haven't mentioned yet (years if missing, training others, responsibilities, something they're proud of).`,
    text,
  );
  if (ai) {
    const bullets = ai.bullets.map((b) => b.trim().replace(/\.$/, "")).filter(Boolean).slice(0, 3);
    return { source: "ai", data: { ...ai, bullets } };
  }
  return { source: "fallback", data: fallbackResumeJob(text) };
}

export async function resumeSummary(body: unknown): Promise<ApiResult<{ summary: string }>> {
  const input = body as ResumeSummaryInput;
  if (!input || !Array.isArray(input.jobs)) throw new BadRequest("jobs are required");
  const clean: ResumeSummaryInput = {
    name: String(input.name ?? "").slice(0, 100),
    jobs: input.jobs.slice(0, 10),
    skills: (input.skills ?? []).slice(0, 20).map(String),
    training: (input.training ?? []).slice(0, 10).map(String),
  };
  const ai = await askStructured(
    z.object({ summary: z.string() }),
    `Write a résumé profile summary of 2-3 sentences (max 60 words) for this person, in the third person without using their name or pronouns (e.g. "Experienced mechanic with..."). Base it ONLY on the jobs, skills, and training given. Do not invent achievements or qualifications. Warm, confident, plain English.`,
    JSON.stringify(clean),
  );
  return ai ? { source: "ai", data: ai } : { source: "fallback", data: fallbackResumeSummary(clean) };
}

const MatchSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      matched: z.array(z.string()),
      reasons: z.array(z.string()),
    }),
  ),
});

/** Ranks mentors or buddies for a seeker's need. Returns data: null when AI is unavailable. */
export async function match(body: unknown): Promise<ApiResult<MatchResult[] | null>> {
  const req = body as MatchRequest;
  if (!req || !Array.isArray(req.people)) throw new BadRequest("people are required");
  const people = req.people.slice(0, 40).map((p) => ({
    id: String(p.id),
    name: String(p.name).slice(0, 80),
    offers: (p.offers ?? []).slice(0, 15).map(String),
    about: String(p.about ?? "").slice(0, 300),
    location: String(p.location ?? ""),
    format: String(p.format ?? ""),
    wantsToLearn: (p.wantsToLearn ?? []).slice(0, 10).map(String),
  }));
  const need = String(req.need ?? "").slice(0, 300);
  const hasProfileNeed = req.kind === "opportunity" ? Boolean(req.seeker?.skills?.length) : Boolean(req.seeker?.wantToLearn?.length);
  if (!need.trim() && !hasProfileNeed) return { source: "fallback", data: null };

  const kind = req.kind ?? "mentor";
  const framing = {
    mentor: `You match a person who wants to learn something with experienced mentors who could teach them. Reasons are addressed to the seeker, e.g. "Teaches carpentry, which you want to learn", "Also in Portland". If the seeker has a skill the candidate wants to learn, you may add "You could share X in return, if you'd like".`,
    buddy: `You match a person who wants help with technology with friendly digital buddies. Reasons are addressed to the seeker, e.g. "Helps with video meetings", "Available online".`,
    opportunity: `You match an experienced worker (the seeker) with paid opportunities (the candidates). "offers" lists each opportunity's title, duties and requirements. Judge how well the seeker's skills and stated preferences fit. Reasons are addressed to the worker, e.g. "Uses your 35 years of carpentry", "Remote, as you prefer". Never claim a role is physically suitable; you may say "No heavy lifting listed".`,
    worker: `You help an employer (the seeker's need) find experienced workers (the candidates). Reasons are addressed to the employer and describe the worker factually, e.g. "35 years of carpentry experience", "Has trained apprentices", "Prefers part-time". Never mention age.`,
  }[kind];
  const ai = await askStructured(
    MatchSchema,
    `${framing}
Understand meaning, not just keywords (e.g. "woodworking" fits "Carpentry", "zoom calls" fits "Video meetings", "fix my car" fits "Engine Diagnostics").
For each candidate, judge how well what they offer fits the need (the typed need if given, otherwise the seeker's profile).
Return only candidates who genuinely fit, best first. Being in the same town or offering the same format NEVER makes a match on its own. If none fit, return an empty list.
- score: 0-100 for how well the candidate fits the need. Only once there's a real fit may location and format add a few points.
- matched: the items from that candidate's "offers" that fit, copied exactly.
- reasons: 1-3 very short phrases based only on the data.`,
    JSON.stringify({ need, seeker: req.seeker ?? null, candidates: people }),
  );
  if (!ai) return { source: "fallback", data: null };
  const ids = new Set(people.map((p) => p.id));
  const data = ai.matches
    .filter((m) => ids.has(m.id))
    .map((m) => {
      const offers = people.find((p) => p.id === m.id)!.offers;
      return {
        id: m.id,
        score: Math.max(0, Math.min(100, Math.round(m.score))),
        matched: m.matched.filter((x) => offers.includes(x)),
        reasons: m.reasons.slice(0, 3),
      };
    })
    .filter((m) => m.score >= 25)
    .sort((a, b) => b.score - a.score);
  return { source: "ai", data };
}

const PlanSchema = z.object({
  from: z.string(),
  to: z.string(),
  intro: z.string(),
  steps: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      actions: z.array(
        z.object({
          kind: z.enum(["profile", "resume", "careers", "opportunities", "offer", "buddy", "practise", "mentors"]),
          label: z.string(),
        }),
      ),
    }),
  ),
});

export async function nextChapter(body: unknown): Promise<ApiResult<NextChapterPlan>> {
  const input = body as NextChapterInput;
  if (!input || !Array.isArray(input.skills)) throw new BadRequest("skills are required");
  const clean: NextChapterInput = {
    name: String(input.name ?? "").slice(0, 80),
    skills: input.skills.slice(0, 15).map(String),
    yearsExperience: typeof input.yearsExperience === "number" ? input.yearsExperience : null,
    industries: (input.industries ?? []).slice(0, 5).map(String),
    workPreferences: (input.workPreferences ?? []).slice(0, 8).map(String),
    comfort: input.comfort,
    targetRole: input.targetRole ? String(input.targetRole).slice(0, 100) : undefined,
    opportunities: (input.opportunities ?? []).slice(0, 8),
    hasResume: Boolean(input.hasResume),
    hasOffer: Boolean(input.hasOffer),
  };
  const ai = await askStructured(
    PlanSchema,
    `Create a realistic, encouraging career transition plan ("My Next Chapter") for this experienced worker.
- from: their current kind of work in a few words (e.g. "Construction carpentry"). to: one realistic target role in a few words (use targetRole if given).
- intro: one sentence saying this is a possible pathway based on their experience and preferences, not a promise.
- steps: exactly 5 steps, in this order: 1) recognise their strengths (name their actual skills and years), 2) choose a direction that fits their stated preferences, 3) identify what may be missing (credentials, references, certificates; say "may"), 4) prepare (résumé, a mentoring offer, practising an introduction), 5) take a first step (contact a specific listed opportunity if one fits, or get help applying from a digital buddy).
- Each step: short title, a 1-2 sentence detail written to them ("you"), and 1-2 actions from the allowed kinds with short button labels. Use "resume" only for résumé work, "offer" for creating a paid mentoring offer, "opportunities" for paid openings, "buddy" for asking a person to help, "practise" for practising with the AI companion.
Never promise a job or say a role is physically suitable; tell them to check each listing's actual duties. Use only facts given.`,
    JSON.stringify(clean),
  );
  if (ai) return { source: "ai", data: { ...ai, steps: ai.steps.slice(0, 6) } };
  return { source: "fallback", data: fallbackPlan(clean) };
}
