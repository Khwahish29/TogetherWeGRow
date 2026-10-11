import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Award,
  Coins,
  Ear,
  Heart,
  HeartHandshake,
  HelpCircle,
  Languages,
  MessageSquareText,
  Mic,
  MousePointerClick,
  ShieldCheck,
  Smile,
  Type,
  Undo2,
  Users,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Reveal } from "../components/ui";
import { EVENT_NAME, TEAM, TEAM_NAME } from "../data/team";

const NAV = [
  ["#story", "The story"],
  ["#how", "How it works"],
  ["#values", "What we believe"],
  ["#team", "Team"],
];

/** Common questions people starting out ask, by trade. */
const ASKED: [string, string][] = [
  ["Carpentry", "My cuts keep drifting off the line. What am I doing wrong with the saw?"],
  ["Cooking", "How do you keep calm and organized when every order comes in at once?"],
  ["Welding", "How do you know when a weld is strong, just by looking at it?"],
  ["Mechanics", "What sounds from an engine mean I should stop driving right away?"],
  ["Gardening", "How do you know when soil is ready for planting?"],
  ["Sewing", "How do I stop fabric from puckering when I sew a seam?"],
  ["Running a business", "What's the simplest way to keep track of money coming in and going out?"],
  ["Working life", "How do you earn the respect of people who've been there much longer than you?"],
];

const TRADES = ["Carpenters", "Nurses", "Welders", "Cooks", "Farmers", "Seamstresses", "Mechanics", "Electricians", "Bookkeepers", "Masons", "Machinists", "Caregivers"];

const CHAPTERS = [
  { n: "I", title: "He could tell a good joint by the sound it made.", body: "Thirty-eight years at the bench." },
  { n: "II", title: "Then his knees said what he wouldn't.", body: "The job ads asked for “digital natives.”" },
  { n: "III", title: "The worst part wasn't the money. It was the quiet.", body: "" },
  { n: "IV", title: "Three streets away, Maya was on her ninth video about dovetail joints.", body: "She needed ten minutes with someone who'd cut ten thousand." },
  { n: "V", title: "They never met. So we built the introduction.", body: "" },
];

const DESIGN = [
  { icon: MousePointerClick, text: "One question per screen" },
  { icon: Mic, text: "Speak or type" },
  { icon: Type, text: "Large text, large buttons" },
  { icon: Undo2, text: "Back and Home, always there" },
  { icon: Languages, text: "Many languages" },
  { icon: ShieldCheck, text: "Nothing shared without a yes" },
];

const DIFFERENT = [
  { icon: Heart, title: "It starts with someone they love", body: "A guided invitation from a son, daughter or grandchild.", to: "/family", cta: "Write an invitation" },
  { icon: MessageSquareText, title: "“Clutch,” meet “measure twice, cut once”", body: "Vibe Check explains each generation's expressions. No embarrassment.", to: "/growth/understand", cta: "Try Vibe Check" },
  { icon: HelpCircle, title: "No forms. Just a question.", body: "One tap, or a few spoken words. Nothing is invented.", to: "/roots/share", cta: "See the first question" },
  { icon: Coins, title: "They set the price. They keep 90%.", body: "Experience is expertise, and gentler work says so plainly.", to: "/roots/roles", cta: "See gentler work" },
];

const GIVES = {
  roots: ["Decades of know-how", "Honest career advice", "Paid sessions, at their price"],
  growth: ["Patience with technology", "Fresh questions", "Someone who listens"],
};

const VALUES = [
  { name: "Empathy", icon: Ear, how: "We listen first. Nobody is asked their age." },
  { name: "Compassion", icon: HeartHandshake, how: "Asking for help is ordinary here." },
  { name: "Respect", icon: Award, how: "A lifetime of skill is expertise, never charity." },
  { name: "Kindness", icon: Smile, how: "Their pace. Their hands on the phone." },
  { name: "Integrity", icon: ShieldCheck, how: "No promises we can't keep. Nothing shared without a yes." },
];

const PARTNERS = ["Colleges and universities", "Senior centers", "Counseling departments", "Local businesses", "Trade associations", "Nonprofits"];

/** Types out each question in turn. Decorative: screen readers get one static example instead. */
function TypedQuestion() {
  const [text, setText] = useState(ASKED[0][1]);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let q = 0;
    let i = 0;
    let dir: 1 | -1 = 1;
    let timer: ReturnType<typeof setTimeout>;
    setText("");
    const tick = () => {
      const full = ASKED[q][1];
      i += dir;
      setText(full.slice(0, i));
      if (dir === 1 && i >= full.length) {
        dir = -1;
        timer = setTimeout(tick, 2600);
      } else if (dir === -1 && i <= 0) {
        dir = 1;
        q = (q + 1) % ASKED.length;
        timer = setTimeout(tick, 400);
      } else {
        timer = setTimeout(tick, dir === 1 ? 34 : 12);
      }
    };
    timer = setTimeout(tick, 1600);
    return () => clearTimeout(timer);
  }, []);
  return (
    <p className="rise mt-5 min-h-[7.5rem] max-w-xl border-l-2 border-warm-400 pl-5 sm:min-h-[5.5rem]" style={{ animationDelay: "900ms" }}>
      <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">Somewhere, someone starting out is asking</span>
      <span aria-hidden="true" className="mt-1 block font-serif text-xl leading-snug text-white sm:text-2xl">
        “{text}
        <span className="caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] bg-warm-400" />”
      </span>
      <span className="sr-only">“{ASKED[0][1]}”</span>
    </p>
  );
}

/** Tap a trade, see a question people starting out ask about it. */
function WhoNeedsYou() {
  const [pick, setPick] = useState(0);
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
      <div role="group" aria-label="Choose a kind of work" className="flex flex-wrap gap-2.5">
        {ASKED.map(([trade], i) => (
          <button
            key={trade}
            type="button"
            onClick={() => setPick(i)}
            aria-pressed={pick === i}
            className={`min-h-[52px] rounded-full border-2 px-5 text-lg font-medium transition ${
              pick === i ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200 bg-white text-brand-900 hover:border-brand-600"
            }`}
          >
            {trade}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="rounded-[2rem] bg-brand-900 p-7 text-brand-100 shadow-xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">People starting out in {ASKED[pick][0].toLowerCase()} ask</p>
        <p key={pick} className="rise mt-3 font-serif text-2xl leading-snug text-white sm:text-3xl">
          “{ASKED[pick][1]}”
        </p>
        <p className="mt-5 text-lg">Could you answer that? Then someone needs you.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/roots/share?step=20" className="btn min-h-[52px] bg-warm-400 px-6 font-semibold text-brand-900 hover:bg-warm-200">
            I could answer that <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Link>
          <Link to="/growth/learn" className="btn min-h-[52px] border-2 border-brand-100/50 px-6 text-white hover:bg-white/10">
            I have a question like this
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.title = "TogetherWeGrow: experience that lives on";
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.title = "TogetherWeGrow";
    };
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 text-ink">
      <a href="#main" className="btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]">
        Skip to main content
      </a>

      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? "border-b border-warm-200/80 bg-warm-50/95 backdrop-blur-md" : "bg-transparent"}`}>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] origin-left bg-warm-400" style={{ transform: `scaleX(${progress})` }} />
        <div className="container-wide flex h-[72px] items-center justify-between gap-3">
          <Link to="/" aria-label="TogetherWeGrow, home" className="rounded-xl">
            <Logo light={!scrolled} />
          </Link>
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="flex gap-1">
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className={`rounded-full px-4 py-2 font-medium transition-colors ${scrolled ? "text-brand-800 hover:bg-brand-100" : "text-white hover:bg-white/10"}`}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            to="/start"
            className={`btn min-h-[48px] shrink-0 whitespace-nowrap px-5 font-semibold ${scrolled ? "bg-brand-700 text-white hover:bg-brand-800" : "bg-warm-400 text-brand-900 hover:bg-warm-200"}`}
          >
            Start here <ArrowRight aria-hidden="true" className="hidden h-5 w-5 sm:block" />
          </Link>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-brand-900 text-brand-100" aria-labelledby="hero-title">
          <div className="absolute inset-y-0 right-0 -z-10 w-full overflow-hidden lg:w-[60%]">
            <img
              src="/images/carpenter-1952.jpg"
              alt="A carpenter at his workbench in 1952, both hands on a wooden plane, looking up at the camera."
              className="kenburns h-full w-full object-cover object-[70%_30%] opacity-[0.16] lg:opacity-90"
            />
          </div>
          <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 hidden w-[60%] bg-gradient-to-r from-brand-900 via-brand-900/55 to-brand-900/5 lg:block" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-brand-900 to-transparent" />

          <div className="container-wide flex min-h-[100svh] flex-col justify-center pb-10 pt-24">
            <p className="rise text-sm font-semibold uppercase tracking-[0.16em] text-warm-400">
              {EVENT_NAME} · {TEAM_NAME}
            </p>
            <h1 id="hero-title" className="mt-4 max-w-3xl text-[2.6rem] leading-[1.04] text-white sm:text-6xl 2xl:text-[4.4rem]">
              <span className="rise mb-2 block text-[1.55rem] leading-snug text-brand-100 sm:text-4xl" style={{ animationDelay: "120ms" }}>
                After a lifetime of hard work,
              </span>
              <span className="rise block" style={{ animationDelay: "340ms" }}>
                their bodies deserve rest.
              </span>
              <span className="rise relative block" style={{ animationDelay: "580ms" }}>
                Their experience deserves to{" "}
                <span className="relative whitespace-nowrap text-warm-400">
                  live on.
                  <svg aria-hidden="true" viewBox="0 0 320 18" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full">
                    <path className="draw" d="M3 12 C 70 2, 150 16, 317 6" fill="none" stroke="#D8AB67" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="rise mt-5 max-w-xl text-xl leading-relaxed" style={{ animationDelay: "820ms" }}>
              People starting out are searching for exactly what they know. We introduce them.
            </p>
            <TypedQuestion />
            <div className="rise mt-5 flex flex-wrap gap-3" style={{ animationDelay: "1100ms" }}>
              <Link to="/start" className="btn min-h-[60px] bg-warm-400 px-7 text-lg font-semibold text-brand-900 hover:bg-warm-200">
                Start here <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <a href="#story" className="btn min-h-[60px] border-2 border-brand-100/50 px-7 text-lg text-white hover:bg-white/10">
                Read the story <ArrowDown aria-hidden="true" className="h-5 w-5" />
              </a>
            </div>
          </div>
          <p className="absolute bottom-3 right-4 max-w-[70%] text-right text-xs text-brand-100">Photo: Priskin János, 1952. Public domain, via Wikimedia Commons.</p>
        </section>

        {/* A moving band of trades */}
        <section className="overflow-hidden border-b border-warm-200 bg-warm-100/70 py-5" aria-label="Whose experience we mean">
          <p className="sr-only">For {TRADES.join(", ").toLowerCase()}, and everyone whose skill lives in their hands.</p>
          <div aria-hidden="true" className="marquee flex w-max gap-10 whitespace-nowrap font-serif text-2xl text-brand-800">
            {[...TRADES, ...TRADES].map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                {t} <span className="text-warm-500">✦</span>
              </span>
            ))}
          </div>
        </section>

        {/* The story */}
        <section id="story" className="container-page scroll-mt-20 py-20 lg:py-28" aria-labelledby="story-title">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">A story we kept hearing</p>
              <h2 id="story-title" className="mt-4 text-4xl leading-tight sm:text-5xl">
                The hardest barrier isn't technology or age. It's the fear of no longer being needed.
              </h2>
              <figure className="floaty mt-10 hidden max-w-md rotate-[-2deg] rounded-2xl bg-white p-3 pb-4 shadow-xl ring-1 ring-warm-200 lg:block">
                <img
                  src="/images/welding-mentor.jpg"
                  alt="An experienced welder watches closely as a newer worker welds beside him."
                  className="aspect-[4/3] w-full rounded-xl object-cover object-[30%_22%]"
                />
                <figcaption className="mt-3 px-1 text-sm text-muted">What gets passed on, when someone is there to receive it. Photo: Rwebogora, CC BY-SA 4.0.</figcaption>
              </figure>
            </div>
            <ol className="relative space-y-10 border-l-2 border-warm-200 pl-8 sm:pl-10 lg:space-y-14 lg:pt-2">
              {CHAPTERS.map((c) => (
                <li key={c.n} className="relative">
                  <span aria-hidden="true" className="absolute -left-[3.05rem] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-warm-400 font-serif text-lg text-brand-900 ring-4 ring-warm-50 sm:-left-[3.55rem]">
                    {c.n}
                  </span>
                  <Reveal>
                    <h3 className="text-2xl leading-snug sm:text-[2rem]">{c.title}</h3>
                    {c.body && <p className="mt-2 text-xl text-muted">{c.body}</p>}
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-10 text-base text-muted lg:text-right">Robert and Maya are illustrative. The situation is the one we set out to solve.</p>
        </section>

        {/* What we believe, in one line */}
        <section className="relative isolate overflow-hidden bg-brand-900 py-24 text-center text-brand-100 lg:py-36" aria-labelledby="proverb">
          <div aria-hidden="true" className="ember absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm-600/25 blur-3xl" />
          <div className="container-page">
            <Reveal>
              <p id="proverb" className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-white sm:text-6xl">
                Their bodies may grow tired, but their wisdom <span className="text-warm-400">never loses its value.</span>
              </p>
            </Reveal>
            <Reveal delay={250}>
              <p className="mx-auto mt-10 max-w-2xl text-xl leading-relaxed text-brand-100 sm:text-2xl">
                So we never ask anyone to start over. We connect them with the people who need exactly what they know.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Who needs you */}
        <section className="container-page py-20 lg:py-28" aria-labelledby="needs-title">
          <Reveal>
            <p className="eyebrow">Try it</p>
            <h2 id="needs-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
              What do you know that someone is trying to learn?
            </h2>
            <p className="mt-4 max-w-2xl text-xl leading-relaxed text-muted">Pick a kind of work. See what people starting out are asking.</p>
          </Reveal>
          <WhoNeedsYou />
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y border-warm-200 bg-white py-20 lg:py-28" aria-labelledby="how-title">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow">How it works</p>
              <h2 id="how-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
                A fair exchange, in both directions.
              </h2>
            </Reveal>

            <Reveal className="mt-12">
              <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-[2rem] bg-brand-100/70 p-7 sm:p-9">
                  <p aria-hidden="true" className="text-5xl">
                    🌳
                  </p>
                  <h3 className="mt-4 text-2xl">Deep roots give</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {GIVES.roots.map((g) => (
                      <li key={g} className="rounded-full bg-white px-4 py-2 text-lg font-medium text-brand-900 ring-1 ring-brand-200">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div aria-hidden="true" className="flex items-center justify-center">
                  <svg viewBox="0 0 120 90" className="h-20 w-28 rotate-90 md:h-24 md:w-32 md:rotate-0">
                    <path className="flow" d="M8 28 H104" fill="none" stroke="#234638" strokeWidth="3" strokeLinecap="round" />
                    <path d="M96 20 L106 28 L96 36" fill="none" stroke="#234638" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path className="flow" d="M112 62 H16" fill="none" stroke="#A4553A" strokeWidth="3" strokeLinecap="round" />
                    <path d="M24 54 L14 62 L24 70" fill="none" stroke="#A4553A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="rounded-[2rem] bg-warm-100 p-7 sm:p-9">
                  <p aria-hidden="true" className="text-5xl">
                    🌱
                  </p>
                  <h3 className="mt-4 text-2xl">New growth gives</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {GIVES.growth.map((g) => (
                      <li key={g} className="rounded-full bg-white px-4 py-2 text-lg font-medium text-brand-900 ring-1 ring-warm-200">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <h3 className="text-3xl leading-tight sm:text-4xl">It begins with one simple question.</h3>
                <p className="mt-3 text-xl text-muted">No menus. No jargon. A first name is enough.</p>
                <ul className="mt-7 flex flex-wrap gap-2.5">
                  {DESIGN.map((d) => (
                    <li key={d.text} className="flex items-center gap-2 rounded-full bg-warm-100 px-4 py-2.5 text-lg font-medium text-brand-900">
                      <d.icon aria-hidden="true" className="h-5 w-5 shrink-0 text-warm-700" />
                      {d.text}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={150}>
                <div className="floaty mx-auto max-w-md rounded-[2.2rem] bg-warm-50 p-6 shadow-2xl ring-1 ring-warm-200 sm:p-8">
                  <p className="text-center font-serif text-3xl text-brand-900 sm:text-4xl">Where are you in your journey?</p>
                  <div className="mt-6 space-y-3" aria-hidden="true">
                    {[
                      ["🌳", "Deep roots", "I've spent years learning my work"],
                      ["🌱", "New growth", "I'm early on and eager to learn"],
                    ].map(([e, l, s]) => (
                      <div key={l} className="flex items-center gap-4 rounded-2xl border-2 border-warm-200 bg-white p-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-2xl">{e}</span>
                        <span className="min-w-0">
                          <span className="block text-lg font-semibold text-brand-900">{l}</span>
                          <span className="block text-muted">{s}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link to="/start" className="btn-primary mt-6 min-h-[56px] w-full text-lg">
                    Answer it yourself <ArrowRight aria-hidden="true" className="h-5 w-5" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* What makes it different */}
        <section className="container-page py-20 lg:py-28" aria-labelledby="different-title">
          <Reveal>
            <p className="eyebrow">What makes it different</p>
            <h2 id="different-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
              Built on trust, not on applications.
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {DIFFERENT.map((d, i) => (
              <li key={d.title}>
                <Reveal delay={i * 90} className="h-full">
                  <div className="lift flex h-full flex-col rounded-3xl bg-white p-7 ring-1 ring-warm-200 sm:p-8">
                    <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 text-warm-700">
                      <d.icon className="h-7 w-7" />
                    </span>
                    <h3 className="mt-5 text-2xl leading-snug">{d.title}</h3>
                    <p className="mt-3 flex-1 text-lg leading-relaxed text-muted">{d.body}</p>
                    <Link to={d.to} className="link mt-5 inline-flex items-center gap-2 text-lg">
                      {d.cta} <ArrowRight aria-hidden="true" className="h-5 w-5" />
                    </Link>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-14">
            <p className="eyebrow">In good company</p>
            <div className="mt-4 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.25fr]">
              {[
                ["Senior Planet", "Technology training"],
                ["BACK TO WORK 50+", "Career coaching"],
                ["CoGenerate", "Generations together"],
              ].map(([name, does], i) => (
                <Fragment key={name}>
                  {i > 0 && (
                    <span aria-hidden="true" className="flex items-center justify-center text-3xl text-warm-600">
                      +
                    </span>
                  )}
                  <div className="rounded-3xl bg-white p-5 text-center ring-1 ring-warm-200">
                    <p className="text-lg font-semibold text-brand-900">{does}</p>
                    <p className="text-base text-muted">{name}</p>
                  </div>
                </Fragment>
              ))}
              <span aria-hidden="true" className="flex items-center justify-center text-3xl text-warm-600">
                =
              </span>
              <div className="rounded-3xl bg-brand-900 p-5 text-center text-brand-100">
                <p className="font-serif text-xl text-white">TogetherWeGrow</p>
                <p className="text-base">All three, in one judgment-free place</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Learning goes both ways */}
        <section className="bg-brand-100/60 py-20 lg:py-28" aria-labelledby="both-title">
          <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <Reveal>
              <div className="grid grid-cols-5 gap-4">
                <figure className="col-span-3">
                  <img
                    src="/images/learning-together.jpg"
                    alt="A woman types at a computer in a library while a helper stands beside her."
                    className="aspect-[4/5] w-full rounded-3xl object-cover object-[60%_40%] shadow-lg"
                    loading="lazy"
                  />
                </figure>
                <figure className="col-span-2 mt-12">
                  <img
                    src="/images/smiling-laptop.jpg"
                    alt="A woman lifts her glasses and smiles at something on her laptop."
                    className="aspect-[3/4] w-full rounded-3xl object-cover object-[70%_30%] shadow-lg"
                    loading="lazy"
                  />
                </figure>
              </div>
              <p className="mt-4 text-sm text-muted">
                Photos: Ivana Guslarevic (CC BY-SA 4.0) and Shixart1985 (CC BY 2.0), via Wikimedia Commons. The people pictured are not affiliated with
                TogetherWeGrow.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <p className="eyebrow">Learning goes both ways</p>
              <h2 id="both-title" className="mt-4 text-4xl leading-tight sm:text-5xl">
                Nobody is too old to learn. Nobody is too young to teach.
              </h2>
              <p className="mt-5 text-xl leading-relaxed text-muted">Small, patient steps. Read aloud if you like. A real person whenever you'd rather not do it alone.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/roots/learn" className="btn-primary min-h-[56px] px-6 text-lg">
                  See a step-by-step guide
                </Link>
                <Link to="/growth/share" className="btn-secondary min-h-[56px] px-6 text-lg">
                  Become a helper
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section id="values" className="container-page scroll-mt-20 py-20 lg:py-28" aria-labelledby="values-title">
          <Reveal>
            <p className="eyebrow">What we believe</p>
            <h2 id="values-title" className="mt-4 text-4xl sm:text-5xl">
              Five words we build by
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((v, i) => (
              <li key={v.name}>
                <Reveal delay={i * 70} className="h-full">
                  <div className="lift flex h-full flex-col items-center rounded-3xl bg-white p-6 text-center ring-1 ring-warm-200">
                    <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                      <v.icon className="h-8 w-8" />
                    </span>
                    <h3 className="mt-4 font-serif text-3xl text-brand-900 lg:text-[1.6rem] 2xl:text-3xl">{v.name}</h3>
                    <p className="mt-2 text-lg leading-snug text-muted">{v.how}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Reaching people */}
        <section className="border-y border-warm-200 bg-white py-20 lg:py-28" aria-labelledby="partners-title">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow">Reaching people</p>
              <h2 id="partners-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
                Growing the way trust grows: one family at a time.
              </h2>
            </Reveal>
            <Reveal className="mt-10">
              <div className="grid items-center gap-6 lg:grid-cols-[auto_auto_1fr]">
                <div className="rounded-[2rem] bg-brand-900 px-8 py-7 text-center text-brand-100">
                  <Heart aria-hidden="true" className="mx-auto h-8 w-8 text-warm-400" />
                  <p className="mt-2 font-serif text-3xl text-white">Families first</p>
                  <p className="mt-1 text-lg">Someone they love, sitting beside them</p>
                </div>
                <ArrowRight aria-hidden="true" className="mx-auto h-8 w-8 rotate-90 text-warm-600 lg:rotate-0" />
                <ul className="flex flex-wrap gap-2.5">
                  {PARTNERS.map((who) => (
                    <li key={who} className="rounded-full bg-warm-50 px-5 py-3 text-lg font-medium text-brand-900 ring-1 ring-warm-200">
                      {who}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <p className="mt-6 text-base text-muted">Beyond families, these are groups we hope to approach. None has agreed to work with us yet.</p>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="container-page scroll-mt-20 py-20 lg:py-28" aria-labelledby="team-title">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <Reveal>
              <p className="eyebrow">The team</p>
              <h2 id="team-title" className="mt-4 text-4xl sm:text-5xl">
                {TEAM_NAME}
              </h2>
              <p className="mt-5 text-xl leading-relaxed">Built for {EVENT_NAME}, Aging and Labor track.</p>
              {TEAM.length > 0 && (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {TEAM.map((m) => (
                    <li key={m.name} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-warm-200">
                      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 font-serif text-xl text-white">
                        {m.name.trim()[0]}
                      </span>
                      <span>
                        <span className="block text-lg font-semibold text-brand-900">{m.name}</span>
                        <span className="block text-muted">{m.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
            <Reveal delay={150}>
              <blockquote className="rounded-[2rem] bg-brand-900 p-8 text-brand-100 sm:p-10">
                <p className="font-serif text-2xl leading-snug text-white sm:text-3xl">
                  “We want a community where a lifetime of experience is heard, people starting out learn to listen, and no one's hard work is
                  forgotten.”
                </p>
                <footer className="mt-5 text-lg">From our team's mission</footer>
              </blockquote>
            </Reveal>
          </div>
        </section>

        {/* Closing */}
        <section className="container-page pb-20 lg:pb-28" aria-labelledby="cta-title">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-900 px-7 py-14 text-center text-brand-100 sm:px-14 sm:py-20">
              <p aria-hidden="true" className="text-5xl">
                🌳 <span className="mx-2 text-warm-400">·</span> 🌱
              </p>
              <h2 id="cta-title" className="mx-auto mt-6 max-w-3xl text-5xl leading-tight text-white sm:text-6xl">
                Together, we grow.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-xl">Two minutes. A first name. That's all it takes to begin.</p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link to="/start" className="btn min-h-[60px] bg-warm-400 px-7 text-lg font-semibold text-brand-900 hover:bg-warm-200">
                  Start here <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <Link to="/family" className="btn min-h-[60px] border-2 border-brand-100/50 px-7 text-lg text-white hover:bg-white/10">
                  <Users aria-hidden="true" className="h-5 w-5" /> Invite someone you love
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-warm-200">
        <div className="container-wide grid gap-8 py-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xl text-muted">
              Built by {TEAM_NAME} for {EVENT_NAME}. We never sell your information or show adverts, and no payments are taken through the site.
            </p>
            <p className="mt-2 text-sm text-muted">
              Photo credits and licenses are listed beside each image. The people pictured are not affiliated with TogetherWeGrow.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid gap-2 text-lg sm:grid-cols-2">
              {[
                ["/start", "Start here"],
                ["/family", "Invite someone you love"],
                ["/roots/roles", "Gentler work"],
                ["/impact", "Our goals"],
                ["/safety", "Safety"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
                ["/signup?role=employer", "For organizations"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
