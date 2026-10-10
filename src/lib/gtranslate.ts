import { apiCode } from "../i18n/languages";

/**
 * Translates a short text with Google's free translate endpoint (no API key).
 * Returns null on any failure so callers can fall back to the original text.
 */
export async function translateText(text: string, to: string, from = "en"): Promise<string | null> {
  if (to === from) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${apiCode(from)}&tl=${apiCode(to)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as [[string, string][]];
    const out = data[0].map((part) => part[0]).join("");
    return out || null;
  } catch {
    return null;
  }
}
