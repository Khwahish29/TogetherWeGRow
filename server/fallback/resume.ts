import type { ResumeJobResult, ResumeSummaryInput } from "../../shared/types.js";

const titleCase = (s: string) => s.trim().replace(/\b\w/g, (c) => c.toUpperCase());
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Plain verbs -> résumé verbs. Only swaps that mean the same thing, so nothing is overstated.
const STRONG: Record<string, string> = {
  fix: "Repaired", repair: "Repaired", train: "Trained", teach: "Taught", build: "Built", make: "Produced",
  run: "Managed the day-to-day running of", manage: "Managed", lead: "Led", help: "Supported", handle: "Handled",
  order: "Managed the ordering of", supervise: "Supervised", serve: "Served", cook: "Prepared", plan: "Planned",
  check: "Inspected", install: "Installed", maintain: "Maintained", sell: "Sold", deal: "Handled", diagnose: "Diagnosed",
  keep: "Kept", work: "Worked", talk: "Communicated", explain: "Explained", organise: "Organized",
  organize: "Organized", look: "Looked", sort: "Resolved", show: "Showed", design: "Designed", deliver: "Delivered",
  drive: "Drove", give: "Provided", clean: "Cleaned", measure: "Measured", cut: "Cut", paint: "Painted", fit: "Fitted", test: "Tested",
};
const IRREGULAR: Record<string, string> = {
  ran: "run", made: "make", built: "build", taught: "teach", led: "lead", sold: "sell", kept: "keep", dealt: "deal",
  showed: "show", drove: "drive", cut: "cut", gave: "give",
};

function baseVerb(word: string): string {
  const w = word.toLowerCase();
  if (IRREGULAR[w]) return IRREGULAR[w];
  for (const candidate of [w, w.replace(/ed$/, ""), w.replace(/d$/, ""), w.replace(/s$/, ""), w.replace(/ing$/, ""), w.replace(/ied$/, "y")]) {
    if (STRONG[candidate]) return candidate;
  }
  return w;
}

function toBullet(clause: string): string {
  let c = clause
    .trim()
    .replace(/^(and|also|then|so|but)\s+/i, "")
    .replace(/^(i|we)\s+(also\s+|used to\s+|would\s+|always\s+|often\s+)?/i, "");
  // "Customers always asked for me by name" -> "Frequently requested by name by customers"
  c = c.replace(/^([\w ]+?)\s+(?:always|often|usually)?\s*asked for me(\s+by name)?/i, (_m, who: string, byName?: string) =>
    `Frequently requested${byName ? " by name" : ""} by ${who.toLowerCase()}`,
  );
  // "because I explained" -> "for explaining"
  c = c.replace(/\bbecause (?:i|we) (\w+?)e?d\b/gi, (_m, v: string) => `for ${v.toLowerCase()}${/e$/.test(v) ? "" : ""}ing`);
  c = c.replace(/\b(my|our)\s+/gi, "");
  const [first, ...rest] = c.split(/\s+/);
  const base = first ? baseVerb(first) : "";
  if (STRONG[base]) {
    // "looked after" / "dealt with" / "sorted out" keep their particle only when it still reads naturally.
    const next = rest[0]?.toLowerCase();
    if (base === "look" && next === "after") {
      rest.shift();
      c = ["Cared for", ...rest].join(" ");
    } else {
      if ((base === "deal" && next === "with") || (base === "sort" && next === "out") || (base === "talk" && next === "to")) {
        rest.shift();
        if (base === "talk") rest.unshift("with");
      }
      c = [STRONG[base], ...rest].join(" ");
    }
  }
  return capitalize(c.replace(/[.,;]+$/, "").trim());
}

const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** Shape the points into exactly three where possible, merging extras and never inventing new ones. */
function intoThree(points: string[], introPoint: string | null): string[] {
  const list = [...points];
  if (list.length < 3 && introPoint) list.unshift(introPoint);
  const words = (x: string) => x.split(/\s+/).length;
  // Merge the two neighboring points that are shortest together, until three remain.
  while (list.length > 3) {
    let best = 0;
    for (let i = 1; i < list.length - 1; i++) {
      if (words(list[i]) + words(list[i + 1]) < words(list[best]) + words(list[best + 1])) best = i;
    }
    const [a, b] = [list[best], list[best + 1]];
    list.splice(best, 2, `${a}${/\band\b/.test(a) ? ", and" : " and"} ${lowerFirst(b)}`);
  }
  return list;
}

export function fallbackResumeJob(text: string): ResumeJobResult {
  const t = text.replace(/\s+/g, " ").trim();

  const titleMatch = t.match(
    /\b(?:(?:worked|work|working|job)\s+as\s+(?:an?\s+|the\s+)?|(?:was|been)\s+(?:an?|the)\s+)([a-z][a-z\- ]{2,40}?)(?=\s+(?:at|for|in|with|from|since|between)\b|[,.]|$)/i,
  );
  const title = titleMatch?.[1] ?? "";
  const employer =
    t.match(/\b(?:at|for)\s+((?:[A-Z][\w&'’.\-]*\s?){1,5})(?=\s+(?:in|from|for|since|between|where)\b|[,.]|$)/)?.[1]?.trim() ?? "";
  const location = t.match(/\bin\s+([A-Z][a-zA-Z.]+(?:\s[A-Z][a-zA-Z.]+)?)(?=[,.]|\s|$)/)?.[1] ?? "";

  let start = "";
  let end = "";
  const range = t.match(/(?:from|between)\s+(\d{4})\s+(?:to|and|until|till|-)\s+(\d{4}|now|today|present)/i);
  const since = t.match(/since\s+(\d{4})/i);
  if (range) {
    start = range[1];
    end = /\d/.test(range[2]) ? range[2] : "Present";
  } else if (since) {
    start = since[1];
    end = "Present";
  }

  const intro = /\b(worked|work|working|was|been)\s+(as|at|for|an?)\b|\b(from|since|between)\s+\d{4}|\bfor\s+[\w-]+\s+years/i;
  const points = t
    .split(/[.;!\n]|,\s*(?:and\s+)?|\s+and\s+(?=i\s|[a-z]+ed\b)/i)
    .map((c) => c.trim())
    .filter((c) => c.split(" ").length >= 2 && !intro.test(c))
    .map(toBullet);

  // If they only gave a few details, their time in the role is itself a truthful point.
  const duration = t.match(/\bfor\s+([\w-]+)\s+years/i)?.[1];
  const span = start && end ? `${start} to ${end === "Present" ? "the present" : end}` : "";
  const introPoint = title
    ? `Worked as ${/^[aeiou]/i.test(title) ? "an" : "a"} ${title.toLowerCase()}${employer ? ` at ${employer}` : ""}${
        duration ? ` for ${duration} years` : span ? ` from ${span}` : ""
      }`
    : null;
  const bullets = intoThree(points, introPoint);

  const mentionsPeople = /train|teach|supervis|manag|led\b|apprentic|mentor/i.test(t);
  const followUp = !start
    ? "Roughly which years did you work there? An estimate is fine."
    : bullets.length < 2
      ? "What did a typical day involve? Anything you were trusted with or proud of?"
      : !mentionsPeople
        ? "Did you train, supervise, or help anyone there? That's worth mentioning."
        : "Is there anything there you were especially proud of, or that customers relied on you for?";

  return { title: title ? titleCase(title) : "", employer, location, start, end, bullets, followUp };
}

export function fallbackResumeSummary(input: ResumeSummaryInput): { summary: string } {
  const job = input.jobs[0];
  const years = input.jobs
    .map((j) => (Number(j.end) || (j.end === "Present" ? new Date().getFullYear() : 0)) - Number(j.start))
    .filter((n) => n > 0 && n < 70)
    .reduce((a, b) => a + b, 0);
  const role = job?.title ? job.title.toLowerCase() : "professional";
  const skills = input.skills.slice(0, 3).join(", ").toLowerCase();
  const summary =
    `Experienced ${role}${years ? ` with ${years} years of hands-on work` : ""}` +
    (skills ? `, skilled in ${skills}` : "") +
    ". Looking for a role where this experience can be put to good use.";
  return { summary };
}
