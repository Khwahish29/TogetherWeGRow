import * as z from "zod/v4";

// Shared rules for every prompt. Keep them short and literal.
export const BASE_RULES = `You are part of TogetherWeGrow, a website that helps experienced (often older) workers turn their knowledge into paid mentoring, teaching, and advisory work, and helps anyone learn technology without embarrassment.
Rules:
- Use plain, warm, respectful language. Short sentences. No jargon.
- Never invent qualifications, certifications, employers, or experience the person did not mention.
- Never guarantee that a role is physically safe, available, or that the person is qualified. Say when certification or credentials may be needed.
- Never be condescending about age or technology skills.`;

interface Provider {
  name: string;
  baseUrl: string;
  apiKey: string;
  model?: string;
  /** Preferred model ids, best first, used when no model is configured. Rate-limited models fall through to the next. */
  prefer: RegExp[];
}

/**
 * Picks the AI provider from environment variables. Both providers speak the
 * OpenAI-compatible chat completions API, so one client serves both.
 *   XAI_API_KEY  -> xAI Grok   (https://api.x.ai)
 *   GROQ_API_KEY -> Groq       (https://api.groq.com, has a free tier)
 * AI_MODEL overrides the model for whichever provider is active.
 */
function getProvider(): Provider | null {
  const model = process.env.AI_MODEL || undefined;
  if (process.env.XAI_API_KEY) {
    return {
      name: "Grok (xAI)",
      baseUrl: "https://api.x.ai/v1",
      apiKey: process.env.XAI_API_KEY,
      model,
      prefer: [/^grok-4.*fast.*non-reasoning/, /^grok-4.*fast/, /^grok-3-mini/],
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      name: "Groq",
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      model,
      // Free-tier limits are per model, so several models give more headroom.
      prefer: [/^llama-3\.3-70b/, /^openai\/gpt-oss-120b$/, /^qwen\/qwen3/, /^openai\/gpt-oss-20b$/],
    };
  }
  if (process.env.AI_BASE_URL && process.env.AI_API_KEY) {
    return { name: "OpenAI-compatible", baseUrl: process.env.AI_BASE_URL, apiKey: process.env.AI_API_KEY, model, prefer: [/.*/] };
  }
  return null;
}

export function aiEnabled(): boolean {
  return getProvider() !== null;
}

export function aiProviderName(): string | null {
  return getProvider()?.name ?? null;
}

let resolvedModels: Promise<string[]> | null = null;

/** AI_MODEL if set; otherwise the provider's available models that match our preferences, best first. */
function resolveModels(p: Provider): Promise<string[]> {
  if (p.model) return Promise.resolve([p.model]);
  resolvedModels ??= (async () => {
    try {
      const res = await fetch(`${p.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${p.apiKey}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const list = (await res.json()) as { data?: { id: string; active?: boolean }[] };
      const ids = (list.data ?? []).filter((m) => m.active !== false).map((m) => m.id);
      const chosen: string[] = [];
      for (const re of p.prefer) {
        const match = ids.filter((id) => re.test(id) && !chosen.includes(id)).sort().reverse()[0];
        if (match) chosen.push(match);
      }
      if (chosen.length) console.log(`[ai] ${p.name}: models ${chosen.join(" → ")} (set AI_MODEL to force one)`);
      else console.warn(`[ai] ${p.name}: no suitable model among ${ids.join(", ")}`);
      return chosen;
    } catch (err) {
      console.warn(`[ai] ${p.name}: couldn't list models`, (err as Error).message);
      resolvedModels = null; // try again next time
      return [];
    }
  })();
  return resolvedModels;
}

/** Keep built-in "thinking" short: it costs tokens (and rate limit) without helping these small tasks. */
function reasoningParams(model: string): Record<string, unknown> {
  if (/gpt-oss/.test(model)) return { reasoning_effort: "low" };
  if (/qwen3/.test(model)) return { reasoning_effort: "none" };
  return {};
}

/** Pulls the first JSON object out of a reply, tolerating ```json fences, <think> blocks, or stray text. */
function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("No JSON object in reply");
  }
}

// Small in-memory cache so identical questions (e.g. the same matching request on reload) don't spend tokens again.
const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();
function cacheGet(key: string) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  cache.delete(key);
  return undefined;
}
function cacheSet(key: string, value: unknown) {
  if (cache.size > 300) cache.delete(cache.keys().next().value!);
  cache.set(key, { at: Date.now(), value });
}

type Attempt = { ok: true; text: string } | { ok: false; rateLimited: boolean; retryAfterMs?: number };

async function callModel(p: Provider, model: string, system: string, user: string): Promise<Attempt> {
  // Try the richest request first, then drop optional parameters if the model rejects them.
  const variants = [
    { response_format: { type: "json_object" }, ...reasoningParams(model) },
    { response_format: { type: "json_object" } },
    {},
  ];
  for (const extra of variants) {
    const res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 3000,
        ...extra,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.ok) {
      const body = (await res.json()) as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
      const text = body.choices?.[0]?.message?.content;
      if (text) return { ok: true, text };
      console.warn(`[ai] ${p.name}/${model}: empty reply (finish_reason: ${body.choices?.[0]?.finish_reason})`);
      return { ok: false, rateLimited: false };
    }
    const detail = (await res.text()).slice(0, 300);
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || Number(detail.match(/try again in ([\d.]+)s/)?.[1]) * 1000;
      console.warn(`[ai] ${p.name}/${model}: rate limited${wait ? `, retry in ${Math.round(wait / 100) / 10}s` : ""}`);
      return { ok: false, rateLimited: true, retryAfterMs: wait || undefined };
    }
    if (res.status === 400 && extra !== variants[variants.length - 1]) continue;
    console.warn(`[ai] ${p.name}/${model} HTTP ${res.status}: ${detail}`);
    if (res.status === 404 && !p.model) resolvedModels = null; // model may have been retired; re-discover
    return { ok: false, rateLimited: false };
  }
  return { ok: false, rateLimited: false };
}

/**
 * Ask the AI for a structured answer matching `schema`. Returns null on any failure
 * (no key, network error, rate limits on every model, invalid JSON) so callers can fall back to built-in rules.
 */
export async function askStructured<S extends z.ZodType>(
  schema: S,
  system: string,
  userContent: string,
): Promise<z.infer<S> | null> {
  const provider = getProvider();
  if (!provider) return null;
  const models = await resolveModels(provider);
  if (models.length === 0) return null;

  const jsonSchema = JSON.stringify(z.toJSONSchema(schema));
  const fullSystem = `${BASE_RULES}\n\n${system}\n\nReply with ONLY a JSON object (no markdown, no commentary) that matches this JSON Schema:\n${jsonSchema}`;
  const cacheKey = `${fullSystem}\u0000${userContent}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached as z.infer<S>;

  const tryParse = (text: string, model: string) => {
    try {
      const parsed = schema.safeParse(extractJson(text));
      if (parsed.success) return parsed.data;
      console.warn(`[ai] ${provider.name}/${model}: reply didn't match schema`, parsed.error.issues.slice(0, 3));
    } catch (err) {
      console.warn(`[ai] ${provider.name}/${model}: ${(err as Error).message}`);
    }
    return null;
  };

  try {
    let shortestWait = Infinity;
    for (const model of models) {
      const attempt = await callModel(provider, model, fullSystem, userContent);
      if (attempt.ok) {
        const data = tryParse(attempt.text, model);
        if (data !== null) {
          cacheSet(cacheKey, data);
          return data;
        }
        continue; // malformed reply: give the next model a go
      }
      if (attempt.rateLimited) shortestWait = Math.min(shortestWait, attempt.retryAfterMs ?? 3000);
    }
    // Every model was busy. If one frees up soon, wait briefly and try once more.
    if (shortestWait <= 5000) {
      await new Promise((r) => setTimeout(r, shortestWait + 250));
      const attempt = await callModel(provider, models[0], fullSystem, userContent);
      if (attempt.ok) {
        const data = tryParse(attempt.text, models[0]);
        if (data !== null) {
          cacheSet(cacheKey, data);
          return data;
        }
      }
    }
    return null;
  } catch (err) {
    console.warn(`[ai] ${provider.name} request failed:`, (err as Error).message);
    return null;
  }
}
