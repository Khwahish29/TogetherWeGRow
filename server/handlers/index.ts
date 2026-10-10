import * as z from "zod/v4";
import type {
  ApiResult,
  CareerProfileInput,
  CareerRec,
  CompanionRequest,
  CompanionResponse,
  ProfileDraft,
} from "../../shared/types";
import { askStructured } from "../lib/claude";
import { fallbackCareers, fallbackProfileDraft } from "../fallback/profile";
import { fallbackCompanion, GUIDES } from "../fallback/companion";

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
- skills: concrete skills they mentioned or that are directly implied (e.g. "furniture making"). Title Case, max 10.
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
  };
  const ai = await askStructured(
    CareersSchema,
    `Recommend exactly 4 career transition options that let this person earn from their existing knowledge, favouring paid mentoring, advisory, training, inspection, or consulting work.
For each: explain "why" in 1-2 plain sentences addressed to the person ("You..."), list which of THEIR skills transfer, state honestly whether further qualifications or certification may be needed, rate physicalDemand (low or medium only), and say concretely where to look for openings.
Respect their work preferences, especially any physical limitations.`,
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
  const clean: CompanionRequest = { action: req.action, topic };
  const topicIntro = GUIDES[topic]?.intro ?? topic;
  const style = `You are a patient technology learning companion. The learner may be new to this technology. Be encouraging but never patronising; mistakes are normal.`;

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
