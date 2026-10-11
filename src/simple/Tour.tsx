import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Globe, Home, Mic, ShieldCheck, Volume2 } from "lucide-react";
import { TextSizeToggle } from "../components/TextSizeToggle";
import { Screen, TreeAndSprout } from "./parts";

const SEEN = "twg.tourSeen";

/** Whether this device has already been shown around. */
export function tourSeen() {
  try {
    return localStorage.getItem(SEEN) === "1";
  } catch {
    // If the browser won't let us remember, don't show the tour on every visit.
    return true;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN, "1");
  } catch {
    // ignore
  }
}

/* Small pictures of the real controls, so people recognize them later. They are not clickable. */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden="true" className="flex min-h-[220px] items-center justify-center rounded-[2rem] bg-brand-100/60 p-6 sm:min-h-[250px]">
      {children}
    </div>
  );
}

function PicChoice() {
  return (
    <div className="relative w-full max-w-sm">
      <div className="flex items-center gap-4 rounded-3xl border-2 border-brand-700 bg-white p-5 shadow-lg">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-3xl">🌳</span>
        <span className="flex-1 text-2xl font-semibold text-brand-900">One clear choice</span>
        <ArrowRight className="h-7 w-7 text-brand-600" />
      </div>
      <span className="ember absolute -bottom-5 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-warm-400/80 ring-8 ring-warm-400/30" />
    </div>
  );
}

function PicBackHome() {
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between rounded-3xl bg-white p-3 shadow-lg ring-1 ring-warm-200">
        <span className="flex min-h-[52px] items-center gap-2 rounded-full bg-brand-100 px-4 text-lg font-semibold text-brand-800">
          <ArrowLeft className="h-6 w-6" /> Back
        </span>
        <span className="flex min-h-[52px] items-center gap-2 rounded-full bg-brand-100 px-4 text-lg font-semibold text-brand-800">
          <Home className="h-6 w-6" /> Home
        </span>
      </div>
      <div className="mt-3 flex justify-between px-2 text-base font-medium text-brand-900">
        <span>One step back</span>
        <span>Start again</span>
      </div>
    </div>
  );
}

function PicSpeak() {
  return (
    <div className="w-full max-w-sm">
      <div className="h-20 rounded-2xl border-2 border-warm-200 bg-white" />
      <div className="mt-3 flex min-h-[56px] items-center justify-center gap-3 rounded-full border-2 border-brand-700 bg-white text-xl font-semibold text-brand-800 shadow-lg">
        <span className="ember flex h-9 w-9 items-center justify-center rounded-full bg-warm-600 text-white">
          <Mic className="h-5 w-5" />
        </span>
        Speak
      </div>
    </div>
  );
}

function PicYours() {
  return (
    <span className="flex h-32 w-32 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg">
      <ShieldCheck className="h-16 w-16" />
    </span>
  );
}

const STEPS: { title: string; body: string; picture: "tree" | "choice" | "backhome" | "comfort" | "speak" | "yours" }[] = [
  {
    title: "Welcome. Let us show you around.",
    body: "This is a place to share what you know, and to learn what you'd like to. It takes one minute to see how it works.",
    picture: "tree",
  },
  {
    title: "One question at a time",
    body: "Every screen asks one simple thing. Tap the big button that fits. There are no menus to get lost in.",
    picture: "choice",
  },
  {
    title: "You can always go back",
    body: "Back takes you one step back. Home brings you to the beginning. They are always at the top, in the same place.",
    picture: "backhome",
  },
  {
    title: "Make it comfortable",
    body: "Try the buttons below to make the words bigger. “Read this to me” reads any screen aloud, and the globe at the top changes the language.",
    picture: "comfort",
  },
  {
    title: "You don't have to type",
    body: "Wherever there's a box to write in, there's a Speak button too. Tap it and just talk.",
    picture: "speak",
  },
  {
    title: "You're in charge",
    body: "A first name is all you need. Nothing is shared without your yes, and we never ask for passwords or money. You can't break anything here.",
    picture: "yours",
  },
];

/** A short, skippable tour shown the first time someone arrives. */
export function Tour() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const index = Math.min(STEPS.length - 1, Math.max(0, Number(params.get("step") ?? 0) || 0));
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  // Seeing the tour at all counts, so nobody is ever sent back into it.
  useEffect(markSeen, []);

  const go = (n: number) => setParams(n === 0 ? {} : { step: String(n) });
  const finish = () => navigate("/start");

  return (
    <Screen step={`Step ${index + 1} of ${STEPS.length}`} title={step.title} help={step.body}>
      {step.picture === "tree" && <TreeAndSprout className="mx-auto h-auto w-full max-w-md" />}
      {step.picture === "choice" && (
        <Frame>
          <PicChoice />
        </Frame>
      )}
      {step.picture === "backhome" && (
        <Frame>
          <PicBackHome />
        </Frame>
      )}
      {step.picture === "speak" && (
        <Frame>
          <PicSpeak />
        </Frame>
      )}
      {step.picture === "yours" && (
        <Frame>
          <PicYours />
        </Frame>
      )}
      {step.picture === "comfort" && (
        <div className="rounded-[2rem] bg-brand-100/60 p-6">
          <p className="text-xl font-semibold text-brand-900">Try it now:</p>
          <div className="mt-3">
            <TextSizeToggle />
          </div>
          <ul className="mt-6 space-y-3 text-lg text-brand-900">
            <li className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-warm-200">
                <Volume2 className="h-5 w-5 text-brand-800" />
              </span>
              “Read this to me” is under the title of every screen, including this one.
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-warm-200">
                <Globe className="h-5 w-5 text-brand-800" />
              </span>
              The globe at the top of the screen changes the language.
            </li>
          </ul>
        </div>
      )}

      {/* Where you are in the tour */}
      <ol aria-hidden="true" className="mt-8 flex justify-center gap-2.5">
        {STEPS.map((_, i) => (
          <li key={i} className={`h-3 rounded-full transition-all ${i === index ? "w-8 bg-brand-700" : i < index ? "w-3 bg-brand-600" : "w-3 bg-warm-200"}`} />
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3">
        <button type="button" onClick={() => (last ? finish() : go(index + 1))} className="btn-primary min-h-[64px] w-full text-xl">
          {last ? "Let's begin" : "Next"} <ArrowRight aria-hidden="true" className="h-6 w-6" />
        </button>
        {index > 0 && (
          <button type="button" onClick={() => go(index - 1)} className="btn-ghost min-h-[56px] w-full text-lg">
            <ArrowLeft aria-hidden="true" className="h-5 w-5" /> Go back a step
          </button>
        )}
        {!last && (
          <button type="button" onClick={finish} className="mx-auto min-h-[48px] px-4 text-lg text-muted underline underline-offset-4 hover:text-brand-800">
            Skip the tour
          </button>
        )}
      </div>
    </Screen>
  );
}
