import type { NextChapterInput, NextChapterPlan } from "../../shared/types";

/** A sensible five-step pathway built from the person's own profile, used when AI is unavailable. */
export function fallbackPlan(input: NextChapterInput): NextChapterPlan {
  const trade = input.industries[0]?.split(" & ")[0] ?? input.skills[0] ?? "your trade";
  const target = input.targetRole || `${trade} mentor or trainer`;
  const years = input.yearsExperience ? `${input.yearsExperience} years of ` : "";
  const strengths = input.skills.slice(0, 4).join(", ").toLowerCase();
  const gentle = input.comfort?.avoidHeavyLifting ? " with less routine heavy lifting" : "";
  const opp = input.opportunities[0];

  return {
    from: input.industries[0] ? `${input.industries[0]} work` : "Your current work",
    to: target,
    intro: "A possible pathway based on your experience and preferences. Change any step so it fits your life.",
    steps: [
      {
        title: "Recognize your strengths",
        detail: `${years}experience${strengths ? ` in ${strengths}` : ""}. Make sure your profile tells that story in your own words.`,
        actions: [{ kind: "profile", label: "Review my profile" }],
      },
      {
        title: "Choose a direction",
        detail: `Explore roles like ${target}${gentle}. Read each listing's actual duties before deciding it suits you.`,
        actions: [
          { kind: "careers", label: "See career ideas" },
          { kind: "opportunities", label: "Browse paid opportunities" },
        ],
      },
      {
        title: "Check what might be missing",
        detail: "Some organizations ask for a teaching credential, references or a certificate. Note what local employers require. Many will support you to get it.",
        actions: [{ kind: "opportunities", label: "Compare requirements" }],
      },
      {
        title: "Get ready",
        detail: `${input.hasResume ? "Update your résumé" : "Create a résumé"}${input.hasOffer ? "" : ", set up a paid mentoring offer"}, and practice a short introduction about what you'd like to do next.`,
        actions: [
          { kind: "resume", label: input.hasResume ? "Update my résumé" : "Build my résumé" },
          ...(input.hasOffer ? [] : [{ kind: "offer" as const, label: "Create a mentoring offer" }]),
          { kind: "practise", label: "Practice step by step" },
        ],
      },
      {
        title: "Take your first step",
        detail: opp
          ? `Reach out about an opening such as "${opp.title}" at ${opp.org}, or ask a digital buddy to help you apply.`
          : "Apply to one opening that fits, or ask a digital buddy to help you apply.",
        actions: [
          { kind: "opportunities", label: "Find an opening" },
          { kind: "buddy", label: "Ask a buddy for help" },
        ],
      },
    ],
  };
}
