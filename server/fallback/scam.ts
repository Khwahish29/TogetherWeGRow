import type { ScamCheckResult, ScamVerdict } from "../../shared/types.js";

interface Pattern {
  re: RegExp;
  sign: string;
  why: string;
  /** 2 = something genuine senders almost never do; 1 = worth noticing. */
  weight: 1 | 2;
}

// Well-known warning signs. Kept deliberately cautious: it's better to say "be careful" too often than too rarely.
const PATTERNS: Pattern[] = [
  { re: /\b(gift ?cards?|itunes cards?|google play cards?|steam cards?)\b/i, sign: "It asks for gift cards", why: "No real company, bank or government office takes payment in gift cards.", weight: 2 },
  { re: /\b(wire (transfer|the money)|western union|moneygram|bitcoin|crypto(currency)?|zelle|cash ?app|venmo)\b/i, sign: "It asks for money in a way that's hard to get back", why: "Wire transfers, payment apps and cryptocurrency are favorites of scammers because the money can't be recovered.", weight: 2 },
  { re: /\b(password|passcode|\bpin\b|social security( number)?|\bssn\b|card number|cvv|security code|verification code|one[- ]time (code|password)|\botp\b|bank (account|details)|routing number|medicare number)\b/i, sign: "It asks for private details or a code", why: "Genuine organizations don't ask for passwords, PINs or the codes sent to your phone.", weight: 2 },
  { re: /\b(don'?t|do not) tell\b|\bkeep (this|it) (a )?(secret|confidential|between us|quiet)\b|\btell no ?one\b/i, sign: "It asks you to keep it secret", why: "Asking you not to tell anyone is a way to stop someone you trust from warning you.", weight: 2 },
  { re: /\b(anydesk|teamviewer|remote (access|desktop|control)|let (me|us) (connect|access) (to )?your (computer|phone|device))\b/i, sign: "It wants access to your phone or computer", why: "Letting a stranger control your device gives them your banking and passwords.", weight: 2 },
  { re: /\b(arrest(ed)?|warrant|legal action|lawsuit|sued|police|deport(ed|ation)?|jail|court)\b/i, sign: "It threatens you", why: "Threats of arrest or court are used to frighten people into paying quickly. Real authorities don't work by text or email.", weight: 2 },
  { re: /\b(new (phone )?number|lost my phone|broke my phone|phone (is )?broken)\b|\b(grandma|grandpa|granny|mom|mum|dad|nana)\b.{0,80}\b(help|trouble|accident|hospital|money|urgent)\b/i, sign: "It may be pretending to be family in trouble", why: "“This is my new number” followed by a request for money is a very common trick. Call the person on the number you already have.", weight: 2 },
  { re: /\b(urgent(ly)?|immediately|right away|act now|asap|within \d+ ?(hours?|hrs?|minutes?|mins?|days?)|final (notice|warning)|last chance|expires? (today|soon|in)|before it'?s too late)\b/i, sign: "It rushes you", why: "Pressure to act quickly is meant to stop you from thinking it over or asking someone.", weight: 1 },
  { re: /\b(suspended|locked|deactivated|disabled|restricted|unusual (activity|sign[- ]?in)|verify your (account|identity|details)|confirm your (account|identity|details)|update your (payment|billing|account))\b/i, sign: "It says there's a problem with your account", why: "Fake account warnings are designed to make you click a link and type in your details.", weight: 1 },
  { re: /\b(you('ve| have)? won|winner|lottery|sweepstakes|prize|inheritance|claim your|free gift|congratulations)\b/i, sign: "It promises a prize or money", why: "You can't win a prize you didn't enter for, and real prizes never need a fee first.", weight: 1 },
  { re: /https?:\/\/\S+|\bwww\.\S+|\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|rb\.gy|is\.gd|cutt\.ly)\/\S*|\b(click|tap) (here|the link|below|this link)\b/i, sign: "It wants you to tap a link", why: "Links in unexpected messages can lead to fake websites that look real.", weight: 1 },
  { re: /\b(processing|delivery|customs|release|handling|clearance|redelivery) fee\b|\bpay (a |the )?(small )?fee\b|\bunpaid (toll|fee|fine|invoice)\b/i, sign: "It asks you to pay a fee", why: "Small “fees” for a parcel, toll or prize are a common way to get your card details.", weight: 1 },
  { re: /\b(earn|make) \$?\d[\d,]* ?(a|per|every) ?(day|week|hour)\b|\bguaranteed (returns?|income|profit)\b|\b(investment|business) opportunity\b|\bdouble your (money|investment)\b|\bwork from home\b.{0,40}\$\d/i, sign: "It promises easy money", why: "Offers of guaranteed or effortless income are almost always a trap.", weight: 1 },
  { re: /\bdear (customer|user|client|sir|madam|account holder|member|valued)\b/i, sign: "It doesn't use your name", why: "A company you really deal with usually knows your name.", weight: 1 },
  { re: /\b(irs|social security administration|medicare|amazon|paypal|netflix|microsoft|apple|geek squad|norton|mcafee|fedex|ups|usps|dhl|your bank)\b/i, sign: "It claims to be from a well-known organization", why: "Scammers borrow trusted names. Check by contacting the organization yourself, using a number or website you already know.", weight: 1 },
];

export const ADVICE: Record<ScamVerdict, string[]> = {
  "likely-scam": [
    "Don't reply, and don't tap any links in it.",
    "Don't send money, gift cards or codes, and don't share any passwords.",
    "If it claims to be from your bank, a company or a relative, contact them yourself using a number you already had. Never use a number or link from the message.",
    "Delete or block it. In the United States you can report it at reportfraud.ftc.gov.",
  ],
  "be-careful": [
    "Don't tap links or share personal details for now.",
    "Check it another way: call the person or company on a number you already trust.",
    "Show it to someone you trust before you do anything.",
  ],
  "no-signs": [
    "We didn't spot the usual warning signs. That isn't proof the message is genuine.",
    "If it later asks for money, codes or personal details, stop and check with someone you trust.",
  ],
};

const RANK: Record<ScamVerdict, number> = { "no-signs": 0, "be-careful": 1, "likely-scam": 2 };
export const moreCautious = (a: ScamVerdict, b: ScamVerdict): ScamVerdict => (RANK[a] >= RANK[b] ? a : b);

export function ruleSigns(text: string) {
  const found = PATTERNS.filter((p) => p.re.test(text));
  const strong = found.filter((p) => p.weight === 2).length;
  const score = found.reduce((n, p) => n + p.weight, 0);
  // A claimed sender name alone is ordinary (real companies write too); it only counts alongside something else.
  const onlyName = found.length === 1 && found[0].sign.startsWith("It claims to be from");
  const verdict: ScamVerdict = onlyName || found.length === 0 ? "no-signs" : score >= 3 || (strong >= 1 && found.length >= 2) ? "likely-scam" : "be-careful";
  return { verdict, signs: onlyName ? [] : found.map((p) => ({ sign: p.sign, why: p.why })) };
}

const SUMMARY: Record<ScamVerdict, string> = {
  "likely-scam": "This message has several of the signs scammers rely on.",
  "be-careful": "This message has something that's worth double-checking before you act on it.",
  "no-signs": "We didn't find the usual warning signs in this message.",
};

export function fallbackScamCheck(text: string): ScamCheckResult {
  const { verdict, signs } = ruleSigns(text);
  return { verdict, summary: SUMMARY[verdict], signs: signs.slice(0, 6), advice: ADVICE[verdict] };
}
