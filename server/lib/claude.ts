import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type * as z from "zod/v4";

const MODEL = "claude-opus-5-5";

// Shared rules for every prompt. Keep them short and literal.
export const BASE_RULES = `You are part of TogetherWeGrow, a website that helps experienced (often older) workers turn their knowledge into paid mentoring, teaching, and advisory work, and helps anyone learn technology without embarrassment.
Rules:
- Use plain, warm, respectful language. Short sentences. No jargon.
- Never invent qualifications, certifications, employers, or experience the person did not mention.
- Never guarantee that a role is physically safe, available, or that the person is qualified. Say when certification or credentials may be needed.
- Never be condescending about age or technology skills.`;

let client: Anthropic | null = null;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

/**
 * Ask Claude for a structured answer. Returns null on any failure
 * (missing key, network error, refusal, unparseable output) so callers
 * can fall back to built-in rules.
 */
export async function askStructured<S extends z.ZodType>(
  schema: S,
  system: string,
  userContent: string,
): Promise<z.infer<S> | null> {
  if (!aiEnabled()) return null;
  try {
    const response = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: `${BASE_RULES}\n\n${system}`,
      messages: [{ role: "user", content: userContent }],
      output_config: { effort: "low", format: betaZodOutputFormat(schema) },
    });
    if (response.stop_reason === "refusal") {
      console.warn("[claude] refusal", response.stop_details);
      return null;
    }
    return response.parsed_output ?? null;
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.warn(`[claude] API error ${err.status}: ${err.message}`);
    } else {
      console.warn("[claude] request failed", err);
    }
    return null;
  }
}
