import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Building2,
  ClipboardCheck,
  GraduationCap,
  Hammer,
  HandHeart,
  HeartHandshake,
  MessageCircleQuestion,
  MessagesSquare,
  PenLine,
  Presentation,
  Sprout,
  Users,
} from "lucide-react";
import { PhotoSlot, Reveal } from "../components/ui";
import { QuestionMoment } from "../components/QuestionMoment";
import { VibeCheck } from "../components/VibeCheck";
import { payLabel } from "../lib/comfort";
import { getOpportunities } from "../lib/store";
import { useStore } from "../lib/useStore";

const THOUGHTS = ["“This is the only work I know.”", "“Who would hire me now?”", "“I don't want to be a burden.”", "“Does anyone still need what I know?”"];

const PATH = [
  { icon: MessageCircleQuestion, title: "A familiar question", body: "Something someone is learning, that you've done a hundred times." },
  { icon: MessagesSquare, title: "A real conversation", body: "You answer in your own words. They listen, and ask what they didn't understand." },
  { icon: Sprout, title: "Growing confidence", body: "On both sides: they learn the craft, and you see how much your experience is worth." },
  { icon: HandHeart, title: "A chance to share or earn", body: "Paid advice, mentoring, or a role that's easier on the body, if and when you want it." },
];

const WAYS = [
  { icon: MessageCircleQuestion, title: "Answering practical questions", body: "A few minutes, whenever you like. Often unpaid, always appreciated." },
  { icon: Users, title: "One-to-one paid guidance", body: "Sessions at a price you set, online or in person." },
  { icon: GraduationCap, title: "Mentoring apprentices", body: "Pass on technique and judgment to people starting out." },
  { icon: Hammer, title: "Advising on trade problems", body: "Help a workshop or small business plan, price and solve." },
  { icon: Presentation, title: "Training newer workers", body: "Colleges and employers value people who've done the real thing." },
  { icon: ClipboardCheck, title: "Less physically demanding roles", body: "Inspection, assessment and advisory work that uses your eye, not your back." },
];

const PRINCIPLES = [
  { name: "Empathy", line: "We meet you where you are.", body: "We ask what kind of work feels right for you, never your age, and never assume what you can or can't do." },
  { name: "Compassion", line: "Help is offered, never pushed.", body: "\"I'm just looking\" is always an option. You can explore everything without signing up." },
  { name: "Respect", line: "Experience is expertise.", body: "You set your own price, choose what to share, and decide what your next chapter looks like." },
  { name: "Kindness", line: "Questions and mistakes are safe here.", body: "You can edit, undo, change your mind or start again. Vibe Check helps when words get in the way." },
  { name: "Integrity", line: "We tell you what's real.", body: "Pay is shown up front, unverified organizations are labeled, and we say plainly what we can't do yet." },
];

export default function Home() {
  const opportunities = useStore(getOpportunities, []);
  const examples = opportunities.filter((o) => o.status === "open").slice(0, 3);

  return (
    <>
      {/* 1. Hero: I am seen */}
      <section className="relative overflow-hidden">
        <div className="container-wide grid items-center gap-10 pb-14 pt-8 sm:pt-14 lg:grid-cols-12 lg:gap-12 lg:pb-24">
          <div className="animate-fade-up lg:col-span-7">
            <p className="eyebrow max-sm:text-[0.8rem]">You are not starting over. You are starting from experience.</p>
            <h1 className="mt-4 text-[2.05rem] leading-[1.08] sm:mt-5 sm:text-6xl lg:text-[4rem]">
              Your hands have worked hard. <em className="font-serif italic text-warm-700">Your experience still has so much to give.</em>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted sm:mt-6 sm:text-xl">
              You've spent years learning things others are only beginning to understand. TogetherWeGrow helps you share what you
              know, connect with people who appreciate it, and discover opportunities that don't demand so much from your body.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
              <a href="#question" className="btn-primary px-7 text-lg">
                See Who Could Use My Experience <ArrowDown aria-hidden="true" className="h-5 w-5" />
              </a>
              <Link to="/introduce" className="btn-secondary px-7 text-lg">
                I'm Here to Help Someone I Love
              </Link>
            </div>
            <p className="mt-5 text-lg">
              <Link to="/mentors" className="link">
                I'd love to learn from someone
              </Link>
            </p>
            <p className="mt-6 text-[0.95rem] text-muted">No sign-up needed to look around · We never ask your age</p>
          </div>

          <figure className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[2rem] shadow-[0_30px_70px_-35px_rgba(20,43,33,0.6)]">
              <img
                src="/images/welding-mentor.jpg"
                alt="An experienced welder in work overalls watches closely as a younger welder works on a steel frame, sparks flying."
                className="h-full w-full object-cover object-[50%_40%]"
                width={1000}
                height={1500}
              />
            </div>
            <figcaption className="mx-auto mt-3 max-w-[460px] text-sm text-muted">
              Knowledge passed on at the workbench. Photo: Rwebogora, CC BY-SA 4.0.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 2. The reality of a lifetime of work */}
      <section className="border-y border-warm-200 bg-white" aria-labelledby="reality">
        <div className="container-wide grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-6">
            <h2 id="reality" className="text-4xl leading-tight sm:text-5xl">
              Years of hard work should lead to respect, not uncertainty.
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-muted">
              Your body may be asking for a different kind of work. That doesn't mean everything you've learned has stopped
              mattering.
            </p>
            <blockquote className="mt-10 border-l-4 border-warm-400 pl-6 font-serif text-2xl leading-snug text-brand-900">
              After a lifetime of hard work, their bodies deserve rest, but their experience deserves to live on.
            </blockquote>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={120}>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">What people quietly wonder</p>
            <ul className="mt-5 space-y-4">
              {THOUGHTS.map((t) => (
                <li key={t} className="font-serif text-2xl leading-snug text-muted">
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-lg text-ink">TogetherWeGrow exists to gently change that last question into:</p>
            <p className="mt-2 font-serif text-3xl text-brand-800">“Someone needs what I know.”</p>
          </Reveal>
        </div>
      </section>

      {/* 3. The question-first moment */}
      <section id="question" className="scroll-mt-20 bg-brand-900 text-brand-100" aria-labelledby="question-title">
        <div className="container-wide grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">Start here</p>
            <h2 id="question-title" className="mt-3 text-4xl leading-tight text-white sm:text-5xl">
              Someone has a question only experience can answer.
            </h2>
            <p className="mt-5 text-lg">
              No forms, no résumé, nothing to prove. Just a question someone is genuinely asking. If you know the answer, share it
              in your own words, typed or spoken.
            </p>
            <p className="mt-4 text-lg">You already have something valuable. This is just a way to see it.</p>
          </Reveal>
          <Reveal className="lg:col-span-8" delay={120}>
            <QuestionMoment variant="dark" />
          </Reveal>
        </div>
      </section>

      {/* 4. Two generations, one conversation */}
      <section className="container-wide py-20 lg:py-28" aria-labelledby="both-ways">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Two generations, one conversation</p>
          <h2 id="both-ways" className="mt-3 text-4xl sm:text-5xl">
            Both people have something to give.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-8">
          <Reveal>
            <figure>
              <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem]">
                <img
                  src="/images/welding-open-house.jpg"
                  alt="An experienced welding instructor explains a technique to a group of young learners wearing welding helmets."
                  className="h-full w-full object-cover"
                  loading="lazy"
                  width={1400}
                  height={916}
                />
              </div>
              <figcaption className="mt-2 text-sm text-muted">Photo: University of the Fraser Valley, CC BY 2.0.</figcaption>
            </figure>
            <h3 className="mt-6 font-serif text-3xl font-medium">You share what life has taught you.</h3>
            <p className="mt-3 text-lg text-muted">
              The shortcuts that are safe and the ones that aren't. How to read a job before you start it. What to do when it goes
              wrong. Things nobody writes down.
            </p>
            <Link to="/questions" className="btn-primary mt-6">
              Share What You Know <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <PhotoSlot className="aspect-[4/3]" caption="A younger person and an older adult side by side at a laptop, the older person at the keyboard." />
            <h3 className="mt-[2.15rem] font-serif text-3xl font-medium">They share what they're learning today.</h3>
            <p className="mt-3 text-lg text-muted">
              How a video call works, where an online form hides its button, which message might be a scam. Explained patiently,
              at your pace, only if you'd like.
            </p>
            <Link to="/learn" className="btn-secondary mt-6">
              Learn Something Together
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5. A gentler way forward */}
      <section className="border-y border-warm-200 bg-white" aria-labelledby="path">
        <div className="container-wide py-20 lg:py-28">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">A gentler way forward</p>
            <h2 id="path" className="mt-3 text-4xl sm:text-5xl">
              It can start with one question.
            </h2>
          </Reveal>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
            <span aria-hidden="true" className="absolute left-6 right-6 top-6 hidden h-px bg-warm-200 md:block" />
            {PATH.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative">
                <Reveal delay={i * 100}>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-warm-50 text-brand-700 ring-1 ring-warm-200">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl">
                    <span className="sr-only">Step {i + 1}: </span>
                    {title}
                  </h3>
                  <p className="mt-2 text-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <p className="mt-12 max-w-2xl text-lg text-ink">
            You can stop at any step. Helping someone simply because you enjoy it is reason enough. Nobody has to become a formal
            mentor or turn their knowledge into money.
          </p>
        </div>
      </section>

      {/* 6. Vibe Check */}
      <section className="bg-brand-100/60" aria-labelledby="vibe">
        <div className="container-wide grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Vibe Check</p>
            <h2 id="vibe" className="mt-3 text-4xl leading-tight sm:text-5xl">
              Different generations. Different words. The same wish to be understood.
            </h2>
            <p className="mt-5 text-lg text-muted">
              When a younger learner writes "that advice was clutch", or a seasoned tradesperson says "measure twice, cut once",
              Vibe Check explains what they mean, and how it sounds, in plain language. It works both ways, it says when it isn't
              sure, and it never judges either side.
            </p>
            <dl className="mt-8 space-y-4">
              <div className="rounded-2xl bg-white p-5">
                <dt className="font-serif text-xl text-brand-900">“That advice was clutch.”</dt>
                <dd className="mt-1 text-muted">Your advice was especially helpful at an important moment.</dd>
              </div>
              <div className="rounded-2xl bg-white p-5">
                <dt className="font-serif text-xl text-brand-900">“Measure twice, cut once.”</dt>
                <dd className="mt-1 text-muted">Check carefully before you act, because some mistakes can't be undone.</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={120}>
            <VibeCheck idPrefix="home-vibe" />
          </Reveal>
        </div>
      </section>

      {/* 7. Opportunities */}
      <section className="container-wide py-20 lg:py-28" aria-labelledby="ways">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Ways to share your experience</p>
            <h2 id="ways" className="mt-3 text-4xl leading-tight sm:text-5xl">
              Let experience earn, not just endure.
            </h2>
            <p className="mt-5 text-lg text-muted">
              Possibilities, not promises. Some are paid, some are simply a kindness. You choose what feels right.
            </p>

            <div className="mt-8 rounded-3xl border border-warm-200 bg-white p-6">
              <p className="font-semibold text-brand-900">How a paid session is shared</p>
              <p className="mt-1 text-muted">Our proposed model for paid sessions:</p>
              <div className="mt-4 flex h-12 overflow-hidden rounded-xl text-[0.95rem] font-semibold" role="img" aria-label="90 percent to the person sharing their experience, 10 percent for running the platform">
                <span className="flex w-[90%] items-center bg-brand-700 px-4 text-white">90% to you</span>
                <span className="flex w-[10%] items-center justify-center bg-warm-200 text-warm-900">10%</span>
              </div>
              <p className="mt-3 text-[0.95rem] text-muted">
                On a $25 session, you'd keep $22.50, and $2.50 would cover running the platform. No hidden fees. Payments aren't
                handled through the site yet, so you arrange them together.
              </p>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {WAYS.map(({ icon: Icon, title, body }, i) => (
                <li key={title}>
                  <Reveal delay={i * 60}>
                    <div className="flex gap-4 border-t border-warm-200 pt-5">
                      <Icon aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-warm-700" />
                      <div>
                        <h3 className="text-lg">{title}</h3>
                        <p className="mt-1 text-muted">{body}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            {examples.length > 0 && (
              <Reveal className="mt-12">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-xl">Recent opportunities</h3>
                  <span className="badge bg-warm-100 text-warm-800">Posted by organizations · not verified</span>
                </div>
                <ul className="mt-4 divide-y divide-warm-200 rounded-3xl border border-warm-200 bg-white">
                  {examples.map((o) => (
                    <li key={o.id}>
                      <Link to={`/opportunities/${o.id}`} className="flex flex-col gap-1 p-5 hover:bg-warm-50 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <span>
                          <span className="block font-semibold text-brand-900">{o.title}</span>
                          <span className="text-muted">{o.orgName}</span>
                        </span>
                        <span className="font-semibold text-brand-800 sm:whitespace-nowrap">
                          {payLabel(o.pay)} <span className="font-normal text-muted">· {o.hoursPerWeek}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link to="/opportunities" className="btn-primary">
                    Explore ways to share my experience <ArrowRight aria-hidden="true" className="h-5 w-5" />
                  </Link>
                  <Link to="/next-chapter" className="btn-secondary">
                    Explore your next chapter
                  </Link>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* 8. Family */}
      <section className="bg-warm-100/70" aria-labelledby="family">
        <div className="container-wide grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">For family and friends</p>
            <h2 id="family" className="mt-3 text-4xl leading-tight sm:text-5xl">
              Help someone you love take the first step.
            </h2>
            <p className="mt-5 max-w-2xl text-lg text-muted">
              Sometimes the first step is easier when it begins with someone who already knows how much they have to offer. Write
              them a warm invitation that celebrates their experience, then leave the choice with them. Only they can create a
              profile, publish anything, or accept work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/introduce" className="btn-primary">
                <PenLine aria-hidden="true" className="h-5 w-5" /> Write an invitation
              </Link>
              <Link to="/learn/buddies?need=Getting%20started%20on%20TogetherWeGrow" className="btn-secondary">
                <HeartHandshake aria-hidden="true" className="h-5 w-5" /> I'd like someone to walk me through this
              </Link>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={120}>
            <figure className="rounded-3xl bg-white p-7 shadow-[0_20px_50px_-30px_rgba(20,43,33,0.45)]">
              <p className="text-sm font-medium text-muted">An example invitation</p>
              <blockquote className="mt-3 font-serif text-xl leading-relaxed text-brand-900">
                “Dad, I've been thinking about your 35 years in carpentry, and how you always know how to fix what everyone else
                gives up on. I found a place where people with experience like yours answer questions from people who are
                learning. No pressure at all. Want to look at it together?”
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* 9. Humanity 101 promise */}
      <section className="container-wide py-20 lg:py-28" aria-labelledby="promise">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Our Humanity 101 promise</p>
          <h2 id="promise" className="mt-3 text-4xl sm:text-5xl">
            Not values on a wall. How the site behaves.
          </h2>
        </Reveal>
        <ul className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <li key={p.name}>
              <Reveal delay={i * 70}>
                <div className="border-t-2 border-brand-700 pt-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-700">{p.name}</p>
                  <p className="mt-2 font-serif text-2xl leading-snug text-brand-900">{p.line}</p>
                  <p className="mt-2 text-muted">{p.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
          <li>
            <Reveal delay={350}>
              <div className="flex h-full flex-col justify-center rounded-3xl bg-brand-100/70 p-6">
                <BookOpen aria-hidden="true" className="h-6 w-6 text-brand-700" />
                <p className="mt-3 text-muted">Read more about how we handle privacy, safety and what we can't do yet.</p>
                <Link to="/about" className="link mt-3 inline-block">
                  Our story and safety
                </Link>
              </div>
            </Reveal>
          </li>
        </ul>
      </section>

      {/* 10. Closing invitation */}
      <section className="container-wide pb-20 lg:pb-28" aria-labelledby="cta">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-800 px-6 py-16 text-center sm:px-16 sm:py-20">
            <img src="/images/workshop-tools.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-[0.14] mix-blend-luminosity" />
            <div className="relative mx-auto max-w-3xl">
              <h2 id="cta" className="text-4xl leading-tight text-white sm:text-[3.3rem]">
                You have spent a lifetime learning. That deserves to be shared.
              </h2>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="#question" className="btn bg-warm-400 px-8 text-lg text-brand-900 hover:bg-warm-200">
                  Take Your First Step <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </a>
                <Link to="/opportunities" className="btn border-2 border-white/40 px-7 text-lg text-white hover:border-white hover:bg-brand-900">
                  Explore at Your Own Pace
                </Link>
              </div>
              <p className="mt-6 text-brand-100">
                <Building2 aria-hidden="true" className="mr-1 inline h-4 w-4" /> Hiring?{" "}
                <Link to="/signup?role=employer" className="font-semibold text-white underline underline-offset-4">
                  Post a role for experienced people
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
