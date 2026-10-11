import type { VibeCheckRequest, VibeCheckResult } from "../../shared/types.js";

interface Entry {
  re: RegExp;
  phrase: string;
  meaning: string;
  plain: string;
  tone?: string;
}

// A small two-way phrase guide: newer slang and long-standing workplace sayings.
const PHRASES: Entry[] = [
  { re: /\bclutch\b/i, phrase: "clutch", meaning: "especially helpful at an important moment", plain: "really helpful just when it mattered", tone: "appreciative" },
  { re: /\b(you'?re|ur) (a |an absolute )?legend\b/i, phrase: "you're a legend", meaning: "strong, friendly appreciation", plain: "thank you so much, you're brilliant", tone: "appreciative" },
  { re: /\bno cap\b/i, phrase: "no cap", meaning: "honestly; I'm not exaggerating", plain: "honestly", tone: "sincere" },
  { re: /\blow ?key\b/i, phrase: "lowkey", meaning: "a little, or quietly (\"lowkey nervous\" means a bit nervous)", plain: "a little" },
  { re: /\bhigh ?key\b/i, phrase: "highkey", meaning: "very much, openly", plain: "really" },
  { re: /\bslay(ed|s)?\b/i, phrase: "slay", meaning: "did something impressively well", plain: "did brilliantly", tone: "admiring" },
  { re: /\bbet\b/i, phrase: "bet", meaning: "okay, agreed, sounds good", plain: "sounds good", tone: "agreeable" },
  { re: /\bit'?s giving\b/i, phrase: "it's giving", meaning: "it has the feel of (\"it's giving professional\" means it looks professional)", plain: "it feels like" },
  { re: /\bmid\b/i, phrase: "mid", meaning: "average or unimpressive", plain: "just okay", tone: "mildly critical" },
  { re: /\brizz\b/i, phrase: "rizz", meaning: "charm, especially when talking to people", plain: "charm" },
  { re: /\bsay less\b/i, phrase: "say less", meaning: "I understand, no need to explain more; I'm in", plain: "understood, I'm in", tone: "agreeable" },
  { re: /\biykyk\b/i, phrase: "IYKYK", meaning: "\"if you know, you know\": an in-joke or shared experience", plain: "those who've been there will understand" },
  { re: /\bbussin\b/i, phrase: "bussin", meaning: "really good (often about food)", plain: "really good", tone: "enthusiastic" },
  { re: /\bgoat(ed)?\b/i, phrase: "GOAT", meaning: "\"greatest of all time\": the very best", plain: "the very best", tone: "admiring" },
  { re: /\bfr\b|\bfor real\b/i, phrase: "fr / for real", meaning: "seriously, truly", plain: "truly" },
  { re: /\bngl\b/i, phrase: "ngl", meaning: "\"not gonna lie\": honestly", plain: "honestly" },
  { re: /\bvibe(s)?\b/i, phrase: "vibe", meaning: "the feeling or atmosphere of something", plain: "feeling" },
  { re: /\bate\b|\bate that\b/i, phrase: "ate (that)", meaning: "did it extremely well", plain: "did it extremely well", tone: "admiring" },
  { re: /\bsus\b/i, phrase: "sus", meaning: "suspicious or a bit dodgy", plain: "a bit suspicious" },
  { re: /\btbh\b/i, phrase: "tbh", meaning: "\"to be honest\"", plain: "to be honest" },
  { re: /\bidk\b/i, phrase: "idk", meaning: "\"I don't know\"", plain: "I don't know" },
  { re: /\bimo\b/i, phrase: "imo", meaning: "\"in my opinion\"", plain: "in my opinion" },
  { re: /measure twice,? cut once/i, phrase: "measure twice, cut once", meaning: "check carefully before you act, because mistakes are hard to undo", plain: "double-check before you commit" },
  { re: /elbow grease/i, phrase: "elbow grease", meaning: "hard physical effort", plain: "hard work" },
  { re: /rule of thumb/i, phrase: "rule of thumb", meaning: "a practical guideline from experience, not an exact rule", plain: "a good general guide" },
  { re: /not rocket science/i, phrase: "it's not rocket science", meaning: "it's simpler than it looks", plain: "it's simpler than it looks" },
  { re: /cut(ting)? corners/i, phrase: "cutting corners", meaning: "doing a job quickly or cheaply in a way that lowers its quality", plain: "skipping important steps" },
  { re: /ballpark( figure)?/i, phrase: "ballpark figure", meaning: "a rough estimate", plain: "a rough estimate" },
  { re: /by the book/i, phrase: "by the book", meaning: "exactly following the official rules", plain: "following the rules exactly" },
  { re: /the whole nine yards/i, phrase: "the whole nine yards", meaning: "everything; the full amount", plain: "everything" },
  { re: /hold your horses/i, phrase: "hold your horses", meaning: "slow down, wait a moment (usually friendly)", plain: "wait a moment" },
  { re: /back in (my|the) day/i, phrase: "back in my day", meaning: "in the past, when the speaker was younger", plain: "years ago" },
  { re: /learn(ed|t)? the ropes/i, phrase: "learn the ropes", meaning: "learn how a job or place works", plain: "learn how things work" },
  { re: /on the level/i, phrase: "on the level", meaning: "honest, genuine", plain: "honest" },
  { re: /put your back into it/i, phrase: "put your back into it", meaning: "use more effort", plain: "try a bit harder" },
];

export function fallbackVibeCheck(req: VibeCheckRequest): VibeCheckResult {
  const text = req.text.trim();
  const found = PHRASES.filter((p) => p.re.test(text));
  const tones = [...new Set(found.map((f) => f.tone).filter(Boolean))] as string[];

  if (req.mode === "rephrase") {
    let out = text;
    for (const p of found) out = out.replace(p.re, p.plain);
    out = out.charAt(0).toUpperCase() + out.slice(1);
    return {
      meaning: out,
      tone: found.length ? "Clearer, with expressions replaced by everyday words" : "Already clear",
      certainty: found.length ? "likely" : "clear",
      phrases: found.map((f) => ({ phrase: f.phrase, meaning: f.meaning })),
      askBack: undefined,
    };
  }

  if (found.length === 0) {
    return {
      meaning: "We don't have this expression in our phrase guide yet, so we can't explain it reliably.",
      tone: "Not sure",
      certainty: "unsure",
      phrases: [],
      askBack: "I'd like to make sure I understand. Could you tell me what you meant by that?",
    };
  }
  const friendly = tones.some((t) => /apprec|admir|enthus|agree|sincere/.test(t));
  return {
    meaning: found.map((f) => `"${f.phrase}" usually means ${f.meaning}.`).join(" "),
    tone: tones.length ? tones.map((t) => t[0].toUpperCase() + t.slice(1)).join(", ") : "Neutral",
    certainty: found.length && text.split(/\s+/).length <= 12 ? "likely" : "unsure",
    phrases: found.map((f) => ({ phrase: f.phrase, meaning: f.meaning })),
    reply: friendly ? "Thank you, that's kind of you. Let me know if you have another question." : undefined,
    askBack: "If you're not sure, it's always fine to ask: \"Just to check, what did you mean by that?\"",
  };
}
