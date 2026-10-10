import type { Opportunity, WorkComfort } from "./types";

export const EMPTY_COMFORT: WorkComfort = {
  posture: "",
  avoidHeavyLifting: null,
  hoursPerWeek: "",
  setting: "",
  moreOf: [],
  lessOf: [],
  shareWithEmployers: false,
};

const HOURS_LABEL: Record<WorkComfort["hoursPerWeek"], string> = {
  "": "",
  "up-to-10": "Up to 10 hours a week",
  "10-20": "10 to 20 hours a week",
  "20-30": "20 to 30 hours a week",
  "full-time": "Full time",
};

/** Plain-language phrases describing someone's work-comfort answers. */
export function comfortSummary(wc?: WorkComfort): string[] {
  if (!wc) return [];
  const out: string[] = [];
  if (wc.posture === "sitting") out.push("Prefers mostly seated work");
  if (wc.posture === "standing") out.push("Happy to stand for most of the day");
  if (wc.posture === "mix") out.push("Prefers a mix of sitting and standing");
  if (wc.avoidHeavyLifting) out.push("Would like to avoid routine heavy lifting");
  if (wc.hoursPerWeek) out.push(HOURS_LABEL[wc.hoursPerWeek]);
  if (wc.setting === "remote") out.push("Prefers remote work");
  if (wc.setting === "in-person") out.push("Prefers in-person work");
  if (wc.setting === "flexible") out.push("Flexible about remote or in-person");
  if (wc.moreOf.length) out.push(`Would like more: ${wc.moreOf.join(", ")}`);
  if (wc.lessOf.length) out.push(`Would like less: ${wc.lessOf.join(", ")}`);
  return out;
}

export interface FitCheck {
  fits: string[];
  check: string[];
  unclear: string[];
  verdict: "fits" | "check" | "unclear" | "none";
}

/**
 * Compares a person's stated preferences with what an opportunity *says* about its duties.
 * Deliberately simple and explainable: it never decides that a role is physically suitable.
 */
export function fitCheck(wc: WorkComfort | undefined, opp: Opportunity): FitCheck {
  const fits: string[] = [];
  const check: string[] = [];
  const unclear: string[] = [];
  const { posture, heavyLifting } = opp.physical;

  if (heavyLifting === "unspecified") unclear.push("Lifting isn't described. Ask before accepting.");
  else if (wc?.avoidHeavyLifting) {
    if (heavyLifting === "none") fits.push("No routine heavy lifting listed");
    else if (heavyLifting === "occasional") check.push("Occasional lifting is listed");
    else check.push("Regular heavy lifting is listed");
  }

  if (posture === "unspecified") unclear.push("Sitting or standing isn't described.");
  else if (wc?.posture === "sitting" && posture === "standing") check.push("Mostly standing; you prefer seated work");
  else if (wc?.posture === "standing" && posture === "sitting") check.push("Mostly seated work");
  else if (wc?.posture && (posture === wc.posture || posture === "mix" || wc.posture === "mix")) fits.push("Sitting/standing matches your preference");

  if (wc?.setting === "remote" && opp.setting === "on-site") check.push("On-site; you prefer remote");
  else if (wc?.setting === "in-person" && opp.setting === "remote") check.push("Remote; you prefer in person");
  else if (wc?.setting && wc.setting !== "flexible") fits.push(opp.setting === "hybrid" ? "Hybrid, so partly as you prefer" : "Work setting matches your preference");

  const hours = Number(opp.hoursPerWeek.match(/\d+/)?.[0]);
  if (wc?.hoursPerWeek === "up-to-10" && hours > 10 && /week/i.test(opp.hoursPerWeek)) check.push(`${opp.hoursPerWeek}; you'd prefer up to 10`);

  const hasPrefs = Boolean(wc && (wc.posture || wc.avoidHeavyLifting !== null || wc.setting || wc.hoursPerWeek));
  const verdict = !hasPrefs ? (unclear.length ? "unclear" : "none") : check.length ? "check" : unclear.length ? "unclear" : fits.length ? "fits" : "none";
  return { fits, check, unclear, verdict };
}

/** Which of the "know before you accept" details an opportunity actually states. */
export function transparency(opp: Pick<Opportunity, "pay" | "responsibilities" | "physical" | "qualificationsRequired" | "paymentTerms" | "cancellationTerms">) {
  return [
    { label: "Pay is clearly shown", ok: opp.pay.amount > 0 },
    { label: "Expected duties are described", ok: opp.responsibilities.filter(Boolean).length > 0 },
    { label: "Physical requirements are stated", ok: opp.physical.posture !== "unspecified" && opp.physical.heavyLifting !== "unspecified" },
    { label: "Required qualifications are stated", ok: opp.qualificationsRequired.trim().length > 0 },
    { label: "Payment terms are explained", ok: opp.paymentTerms.trim().length > 0 },
    { label: "Cancellation or notice terms are explained", ok: opp.cancellationTerms.trim().length > 0 },
  ];
}

export function payLabel(pay: Opportunity["pay"]) {
  return `$${pay.amount}/${pay.unit === "hour" ? "hour" : pay.unit}`;
}

export const OPP_TYPE_LABEL: Record<Opportunity["type"], string> = {
  mentoring: "Paid mentoring",
  training: "Training & teaching",
  advisory: "Advisory",
  consulting: "Consulting",
};
