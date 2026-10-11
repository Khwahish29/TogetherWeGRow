import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Coins,
  Heart,
  HelpCircle,
  Languages,
  MessageSquareText,
  Mic,
  MousePointerClick,
  ShieldCheck,
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
  {
    n: "I",
    title: "He could tell a good joint by the sound it made.",
    body: "Thirty-eight years at the bench. Robert never needed a manual. His hands remembered everything.",
  },
  {
    n: "II",
    title: "Then his knees said what he wouldn't.",
    body: "The lifting got harder. The job ads moved online and asked for “digital natives.” The interviews went to younger hands.",
  },
  {
    n: "III",
    title: "The worst part wasn't the money.",
    body: "It was the quiet. The feeling that everything he knew had stopped mattering on the day he stopped lifting.",
  },
  {
    n: "IV",
    title: "Three streets away, Maya was on her ninth video about dovetail joints.",
    body: "She didn't need another video. She needed ten minutes with someone who had cut ten thousand of them.",
  },
  {
    n: "V",
    title: "They never met.",
    body: "Not because they didn't need each other. Because nothing was built to introduce them. So we built it.",
  },
];

const DESIGN = [
  { icon: MousePointerClick, text: "One question per screen" },
  { icon: Mic, text: "Speak or type" },
  { icon: Type, text: "Large text, large buttons" },
  { icon: Undo2, text: "Back and Home, always in the same place" },
  { icon: Languages, text: "Many languages" },
  { icon: ShieldCheck, text: "Nothing shared without a clear yes" },
];

const DIFFERENT = [
  {
    icon: Heart,
    title: "It starts with someone they love",
    body: "People try something new when someone they trust suggests it. A guided invitation helps a son, daughter or grandchild begin that conversation, in words that honor a lifetime of work.",
    to: "/family",
    cta: "Write an invitation",
  },
  {
    icon: MessageSquareText,
    title: "“Clutch,” meet “measure twice, cut once”",
    body: "Every generation has its own way of speaking. Vibe Check explains an expression or softens a message, so nobody has to feel embarrassed for asking.",
    to: "/younger/understand",
    cta: "Try Vibe Check",
  },
  {
    icon: HelpCircle,
    title: "No forms. Just a question.",
    body: "Older adults describe their work in their own words, or answer something a younger person is really asking. Their skills are drawn from what they said. Nothing is invented.",
    to: "/older/share",
    cta: "See the first question",
  },
  {
    icon: Coins,
    title: "They set the price. They keep 90%.",
    body: "Experience is professional knowledge. Mentors choose what a session costs, and roles that are easier on the body state pay, hours and physical demands in plain words.",
    to: "/older/roles",
    cta: "See gentler work",
  },
];

const VALUES = [
  { name: "Empathy", how: "We begin by listening. Nobody is asked their age, and nearly every question can be skipped." },
  { name: "Compassion", how: "Asking for help is treated as ordinary. Steps repeat as often as needed, and “Explain it more simply” is always there." },
  { name: "Respect", how: "A lifetime of skill is treated as expertise, never as charity. Mentors name their price and keep 90% of it." },
  { name: "Kindness", how: "Younger helpers are reminded: go at their pace, let them do the tapping, never ask for passwords." },
  { name: "Integrity", how: "Suggestions are never promises. Organizations are labeled as unverified. Nothing is shared or charged without a clear yes." },
];

const PARTNERS = [
  ["Families and trusted friends", "Where it begins: a gentle conversation at the kitchen table."],
  ["Colleges and universities", "Such as Arizona State University and Maricopa Community Colleges, where students and apprentices are looking for mentors."],
  ["Senior centers and community groups", "Trusted places for patient, in-person first steps."],
  ["Psychology and counseling departments", "To help us design onboarding that eases the fear of being judged."],
  ["Local businesses and trade associations", "For paid mentoring and roles that are easier on the body."],
  ["Nonprofits", "Such as AARP Foundation and Senior Planet, to connect people with support that already exists."],
];

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
    <p className="rise mt-7 min-h-[7.5rem] max-w-xl border-l-2 border-warm-400 pl-5 sm:min-h-[5.5rem]" style={{ animationDelay: "900ms" }}>
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
          <Link to="/older/share?step=20" className="btn min-h-[52px] bg-warm-400 px-6 font-semibold text-brand-900 hover:bg-warm-200">
            I could answer that <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Link>
          <Link to="/younger/learn" className="btn min-h-[52px] border-2 border-brand-100/50 px-6 text-white hover:bg-white/10">
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
              alt="An older carpenter at his workbench in 1952, both hands on a wooden plane, looking up at the camera."
              className="kenburns h-full w-full object-cover object-[70%_30%] opacity-[0.16] lg:opacity-90"
            />
          </div>
          <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 hidden w-[60%] bg-gradient-to-r from-brand-900 via-brand-900/55 to-brand-900/5 lg:block" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-brand-900 to-transparent" />

          <div className="container-wide flex min-h-[100svh] flex-col justify-center pb-12 pt-24">
            <p className="rise text-sm font-semibold uppercase tracking-[0.16em] text-warm-400">
              {EVENT_NAME} · {TEAM_NAME}
            </p>
            <h1 id="hero-title" className="mt-5 max-w-3xl text-[2.6rem] leading-[1.04] text-white sm:text-6xl 2xl:text-[4.4rem]">
              <span className="rise block" style={{ animationDelay: "120ms" }}>
                Their bodies deserve rest.
              </span>
              <span className="rise relative block" style={{ animationDelay: "380ms" }}>
                Their experience deserves to{" "}
                <span className="relative whitespace-nowrap text-warm-400">
                  live on.
                  <svg aria-hidden="true" viewBox="0 0 320 18" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full">
                    <path className="draw" d="M3 12 C 70 2, 150 16, 317 6" fill="none" stroke="#D8AB67" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="rise mt-7 max-w-xl text-xl leading-relaxed" style={{ animationDelay: "650ms" }}>
              After decades of hard physical work, too many people are told they're finished. A younger generation is searching for exactly
              what they know. We introduce them.
            </p>
            <TypedQuestion />
            <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "1100ms" }}>
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
                  alt="An experienced welder watches closely as a younger worker welds beside him."
                  className="aspect-[4/3] w-full rounded-xl object-cover object-[30%_22%]"
                />
                <figcaption className="mt-3 px-1 text-sm text-muted">What gets passed on, when someone is there to receive it. Photo: Rwebogora, CC BY-SA 4.0.</figcaption>
              </figure>
            </div>
            <ol className="space-y-12 lg:space-y-20 lg:pt-6">
              {CHAPTERS.map((c) => (
                <li key={c.n}>
                  <Reveal>
                    <div className="flex gap-5 sm:gap-7">
                      <span aria-hidden="true" className="w-10 shrink-0 font-serif text-4xl text-warm-600 sm:w-14 sm:text-5xl">
                        {c.n}
                      </span>
                      <div className="border-l-2 border-warm-200 pl-5 sm:pl-7">
                        <h3 className="text-2xl leading-snug sm:text-[2rem]">{c.title}</h3>
                        <p className="mt-3 text-xl leading-relaxed text-muted">{c.body}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
              <li>
                <Reveal>
                  <p className="text-muted">Robert and Maya are illustrative. The situation they're in is the challenge our team set out to solve.</p>
                </Reveal>
              </li>
            </ol>
          </div>
        </section>

        {/* A proverb */}
        <section className="relative isolate overflow-hidden bg-brand-900 py-24 text-center text-brand-100 lg:py-36" aria-labelledby="proverb">
          <div aria-hidden="true" className="ember absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm-600/25 blur-3xl" />
          <div className="container-page">
            <Reveal>
              <blockquote>
                <p id="proverb" className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-white sm:text-6xl">
                  “When an elder dies, a library burns to the ground.”
                </p>
                <footer className="mt-6 text-lg">A saying made famous by the Malian writer Amadou Hampâté Bâ</footer>
              </blockquote>
            </Reveal>
            <Reveal delay={250}>
              <p className="mx-auto mt-12 max-w-2xl font-serif text-2xl leading-snug text-warm-400 sm:text-3xl">
                We don't have to wait for the fire. We can open the library while the librarian is still here.
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
                  <h3 className="mt-4 text-2xl">Older adults give</h3>
                  <p className="mt-2 text-xl leading-relaxed text-muted">Decades of know-how. Honest career advice. Paid one-to-one sessions, at a price they set.</p>
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
                  <h3 className="mt-4 text-2xl">Younger adults give</h3>
                  <p className="mt-2 text-xl leading-relaxed text-muted">Patience with phones, video calls and online forms. Fresh questions. Someone who wants to listen.</p>
                </div>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <h3 className="text-3xl leading-tight sm:text-4xl">It begins with one simple question.</h3>
                <p className="mt-4 text-xl leading-relaxed text-muted">
                  No menus, no jargon, no long sign-up. A first name is enough. Each screen asks one thing in plain words, and the next step is
                  always obvious.
                </p>
                <ul className="mt-7 grid gap-4 sm:grid-cols-2">
                  {DESIGN.map((d) => (
                    <li key={d.text} className="flex items-start gap-3 text-lg">
                      <d.icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warm-600" />
                      {d.text}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={150}>
                <div className="floaty mx-auto max-w-md rounded-[2.2rem] bg-warm-50 p-6 shadow-2xl ring-1 ring-warm-200 sm:p-8">
                  <p className="text-center font-serif text-3xl text-brand-900 sm:text-4xl">Who are you?</p>
                  <div className="mt-6 space-y-3" aria-hidden="true">
                    {[
                      ["🌳", "I'm an Older Adult", "Share what you know · Learn · Get help"],
                      ["🌱", "I'm a Younger Adult", "Learn from experience · Share your skills"],
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
          <Reveal className="mt-12">
            <p className="max-w-4xl text-lg leading-relaxed text-muted">
              <strong className="text-brand-900">Standing on good shoulders.</strong> Senior Planet by AARP teaches technology. AARP Foundation's BACK
              TO WORK 50+ offers career coaching. CoGenerate brings generations together. Each does vital work on one part of this challenge.
              TogetherWeGrow joins the parts in one judgment-free place: two-way skill exchange, paid mentoring, and gentler work.
            </p>
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
                    alt="An older woman types at a computer in a library while a helper stands beside her."
                    className="aspect-[4/5] w-full rounded-3xl object-cover object-[60%_40%] shadow-lg"
                    loading="lazy"
                  />
                </figure>
                <figure className="col-span-2 mt-12">
                  <img
                    src="/images/smiling-laptop.jpg"
                    alt="An older woman lifts her glasses and smiles at something on her laptop."
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
              <p className="mt-5 text-xl leading-relaxed text-muted">
                The same person who can teach you to read the grain of a board may want help joining a video call with her grandchildren. So she
                gets small, patient steps, read aloud if she likes, and a real person whenever she'd rather not do it alone.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/older/learn" className="btn-primary min-h-[56px] px-6 text-lg">
                  See a step-by-step guide
                </Link>
                <Link to="/younger/share" className="btn-secondary min-h-[56px] px-6 text-lg">
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
          <ol className="mt-10 divide-y divide-warm-200 border-y border-warm-200">
            {VALUES.map((v, i) => (
              <li key={v.name}>
                <Reveal delay={i * 60}>
                  <div className="group grid gap-2 py-7 md:grid-cols-[18rem_1fr] md:items-baseline md:gap-8">
                    <h3 className="font-serif text-4xl text-brand-900 transition-colors group-hover:text-warm-600 sm:text-5xl">{v.name}</h3>
                    <p className="text-xl leading-relaxed text-muted">{v.how}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Reaching people */}
        <section className="border-y border-warm-200 bg-white py-20 lg:py-28" aria-labelledby="partners-title">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow">Reaching people</p>
              <h2 id="partners-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
                Growing the way trust grows: one family at a time.
              </h2>
              <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted">
                Nobody's grandfather signs up because of an advert. He tries it because someone he loves sat down beside him. So families come
                first, with the community around them.
              </p>
            </Reveal>
            <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PARTNERS.map(([who, why], i) => (
                <li key={who}>
                  <Reveal delay={i * 60} className="h-full">
                    <div className="h-full rounded-3xl bg-warm-50 p-6 ring-1 ring-warm-200">
                      <p className="text-xl font-semibold text-brand-900">{who}</p>
                      <p className="mt-2 text-lg text-muted">{why}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-lg text-muted">Apart from families, these are organizations we hope to approach. None of them has agreed to work with us yet.</p>
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
              <p className="mt-5 text-xl leading-relaxed">
                We built TogetherWeGrow for {EVENT_NAME}, in the Aging and Labor track. We believe everyone whose hands built something deserves to
                be asked what they know.
              </p>
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
                  “We want a community where older adults feel heard, younger people learn to listen, and no one's lifetime of hard work is
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
              <p className="mx-auto mt-6 max-w-3xl font-serif text-2xl leading-snug sm:text-3xl">
                “A society grows great when the old plant trees in whose shade they know they will never sit.”
              </p>
              <p className="mt-3">A saying often shared as a Greek proverb</p>
              <h2 id="cta-title" className="mx-auto mt-10 max-w-3xl text-4xl leading-tight text-white sm:text-5xl">
                We just want the young to come and sit beside them.
              </h2>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link to="/start" className="btn min-h-[60px] bg-warm-400 px-7 text-lg font-semibold text-brand-900 hover:bg-warm-200">
                  Start here <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <Link to="/family" className="btn min-h-[60px] border-2 border-brand-100/50 px-7 text-lg text-white hover:bg-white/10">
                  <Users aria-hidden="true" className="h-5 w-5" /> Invite someone you love
                </Link>
              </div>
              <p className="mt-6">It takes about two minutes. A first name is all you need.</p>
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
                ["/older/roles", "Gentler work"],
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
