import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeftRight,
  Bot,
  Briefcase,
  Building2,
  ClipboardCheck,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Mic,
  Presentation,
  Quote,
  Search,
  Sprout,
  Users,
} from "lucide-react";
import { PhotoSlot, Reveal } from "../components/ui";
import { useAuth } from "../lib/auth";
import { getThanks, getUsers } from "../lib/store";
import { useStore } from "../lib/useStore";

const ROLES = [
  {
    icon: Users,
    title: "Paid mentor",
    body: "One-to-one sessions teaching the craft you know best, at a price you set.",
    detail: "Usually seated or light demonstration work",
  },
  {
    icon: GraduationCap,
    title: "Vocational trainer",
    body: "Help colleges and apprenticeship programmes teach real-world technique and safety.",
    detail: "A teaching credential is sometimes requested",
  },
  {
    icon: Hammer,
    title: "Workshop adviser",
    body: "Guide teams on planning, materials and problem-solving, without carrying the load.",
    detail: "Part-time and flexible arrangements are common",
  },
  {
    icon: Presentation,
    title: "Consultant",
    body: "Advise small businesses and makers on pricing, operations and getting started.",
    detail: "Often remote or by appointment",
  },
  {
    icon: ClipboardCheck,
    title: "Quality adviser",
    body: "Use a trained eye to review workmanship and help others know what good looks like.",
    detail: "Some roles need certification",
  },
];

const STEPS = [
  {
    icon: Mic,
    title: "Tell us what you know",
    body: "Speak or type about your working life, the way you'd tell a friend. We turn it into a clear profile, and nothing is published until you approve it.",
  },
  {
    icon: Search,
    title: "Discover people and opportunities",
    body: "See paid roles that value experience, with pay and duties shown up front, and learners who want exactly what you can teach.",
  },
  {
    icon: Sprout,
    title: "Earn, learn and grow together",
    body: "Offer sessions, take your next step with a plan, and pick up new tools with AI or a patient person, only if and when you want to.",
  },
];

const PROMISES = [
  "We respect your experience.",
  "We believe everyone can keep growing.",
  "We make room for questions.",
  "We believe your work deserves fair pay.",
  "We tell you what's real, and what's a suggestion.",
  "We leave room to change your mind.",
];

const AUDIENCES = [
  { kicker: "Experienced workers", title: "Turn what you know into paid work", to: "/signup?role=mentor", cta: "Share your experience" },
  { kicker: "Students & learners", title: "Learn what textbooks can't teach", to: "/mentors", cta: "Find a mentor" },
  { kicker: "Digital buddies", title: "Lend your patience, help someone feel at home with technology", to: "/signup?role=buddy", cta: "Become a buddy" },
  { kicker: "Employers & organisations", title: "Hire for experience, not age", to: "/signup?role=employer", cta: "Post a role" },
];

export default function Home() {
  const { user } = useAuth();
  const thanks = useStore(getThanks, []);
  const users = useStore(getUsers, []);
  const shareLink = user ? "/profile/create" : "/signup?role=mentor";
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "A member";
  const stories = thanks.slice(0, 3);
  const storiesAreDemo = stories.some((t) => t.isDemo);

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div className="container-wide grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-24">
          <div className="animate-fade-up lg:col-span-6">
            <p className="eyebrow">Experience never expires</p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.2rem]">
              A lifetime of experience deserves a <em className="font-serif italic text-warm-700">future.</em>
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted">
              Turn years of knowledge into meaningful opportunities. Share your skills, discover paid mentoring work, and
              connect across generations, with support every step of the way.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={shareLink} className="btn-primary px-7 text-lg">
                Share Your Experience <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <Link to="/mentors" className="btn-secondary px-7 text-lg">
                Find a Mentor
              </Link>
            </div>
            <p className="mt-6 text-[0.95rem] text-muted">Free to join · No résumé needed · We never ask your age</p>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative ml-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[2rem] lg:aspect-[4/5]">
              <img
                src="/images/workshop-tools.jpg"
                alt="A well-used woodworking workshop, with hand planes, saws and chisels hanging above a worn workbench."
                className="h-full w-full object-cover object-[35%_50%]"
                width={1400}
                height={898}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-900/45 via-transparent to-transparent" />
              <p className="absolute bottom-4 right-5 text-xs text-white/85">Photo: s w wengenroad, CC0</p>
            </div>
            {/* An example of the change the platform makes possible. */}
            <div className="relative -mt-20 max-w-[380px] rounded-2xl border border-warm-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(20,43,33,0.5)] sm:ml-6 lg:absolute lg:-left-8 lg:bottom-10 lg:ml-0 lg:mt-0">
              <p className="text-sm font-medium text-muted">An example from the demo</p>
              <p className="mt-1 font-semibold text-brand-900">Robert, carpenter for 35 years</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.95rem] [&>span]:whitespace-nowrap">
                <span className="rounded-full bg-warm-100 px-3 py-1 text-warm-800">Site work</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-muted" />
                <span className="rounded-full bg-brand-100 px-3 py-1 text-brand-800">Workshop mentor</span>
              </div>
              <p className="mt-3 text-sm text-muted">$30/hour · 10 hours a week · no routine heavy lifting</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The problem */}
      <section className="border-y border-warm-200 bg-white" aria-labelledby="problem">
        <div className="container-wide grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-6">
            <h2 id="problem" className="text-4xl leading-tight sm:text-5xl">
              Your skills don't expire.
              <br />
              <span className="text-warm-700">Opportunities shouldn't either.</span>
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={120}>
            <dl className="space-y-7">
              {[
                ["The work gets harder on the body", "Decades of skill remain, while lifting, standing and long shifts get tougher."],
                ["The doors moved online", "Applications, interviews and meetings now assume confidence with technology."],
                ["Experience gets overlooked", "Too often, people are judged by their age instead of what they know."],
              ].map(([t, d]) => (
                <div key={t} className="border-l-2 border-warm-400 pl-5">
                  <dt className="text-lg font-semibold text-brand-900">{t}</dt>
                  <dd className="mt-1 text-muted">{d}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-lg text-ink">
              Meanwhile, younger people are looking for exactly the practical wisdom those decades hold.{" "}
              <strong className="font-semibold text-brand-800">TogetherWeGrow brings the two together.</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="container-wide py-20 lg:py-28" aria-labelledby="how">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 id="how" className="mt-3 max-w-2xl text-4xl sm:text-5xl">
            Three steps. At your pace.
          </h2>
        </Reveal>
        <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title}>
              <Reveal delay={i * 120}>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-6xl leading-none text-warm-400" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-warm-200" />
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="mt-6 text-xl">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Two generations */}
      <section className="bg-brand-100/60" aria-labelledby="both-ways">
        <div className="container-wide py-20 lg:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Two generations, shared growth</p>
            <h2 id="both-ways" className="mt-3 text-4xl sm:text-5xl">
              Knowledge flows both ways.
            </h2>
            <p className="mt-5 text-lg text-muted">
              An experienced professional teaches a practical skill and is paid fairly for it. Separately, and only if they'd
              like, a younger buddy helps with the tools that changed. Nobody is "the helper". Everyone teaches, everyone
              learns.
            </p>
          </Reveal>
          <div className="mt-14 grid items-stretch gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            <Reveal>
              <PhotoSlot className="aspect-[4/3]" caption="An experienced carpenter guiding an apprentice through a joint at the workbench." />
              <p className="mt-5 text-lg font-semibold text-brand-900">Robert teaches Maya joinery</p>
              <p className="text-muted">A paid session, booked through the marketplace.</p>
            </Reveal>
            <div className="hidden items-center md:flex" aria-hidden="true">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm">
                <ArrowLeftRight className="h-6 w-6" />
              </span>
            </div>
            <Reveal delay={150}>
              <PhotoSlot className="aspect-[4/3]" caption="A younger buddy and an older adult side by side at a laptop, the older person at the keyboard." />
              <p className="mt-5 text-lg font-semibold text-brand-900">Maya helps Robert join video calls</p>
              <p className="text-muted">Her choice, as a volunteer buddy. Never a condition of his paid work.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. Ways to earn: the heart of the Aging & Labour track */}
      <section className="bg-brand-900 text-brand-100" aria-labelledby="earn">
        <div className="container-wide py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">More ways to earn from experience</p>
              <h2 id="earn" className="mt-3 text-4xl text-white sm:text-5xl">
                Let experience earn, not just endure.
              </h2>
              <p className="mt-5 text-lg text-brand-100">
                Roles where what you know is the main thing you bring, usually with far less physical strain. Every paid
                opportunity shows pay, duties and physical requirements before you apply.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:[&>a]:whitespace-nowrap">
                <Link to="/opportunities" className="btn bg-white text-brand-900 hover:bg-warm-100">
                  Explore paid opportunities <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <Link
                  to={user ? "/next-chapter" : "/signup?role=mentor"}
                  className="btn border-2 border-white/40 text-white hover:border-white hover:bg-brand-800"
                >
                  Plan your next chapter
                </Link>
              </div>
            </Reveal>
            <ul className="grid gap-px overflow-hidden rounded-3xl bg-brand-700/70 sm:grid-cols-2 lg:col-span-7">
              {ROLES.map(({ icon: Icon, title, body, detail }, i) => (
                <li key={title} className={`bg-brand-900 p-7 ${i === ROLES.length - 1 ? "sm:col-span-2" : ""}`}>
                  <Icon aria-hidden="true" className="h-7 w-7 text-warm-400" />
                  <h3 className="mt-4 text-xl text-white">{title}</h3>
                  <p className="mt-2 text-brand-100">{body}</p>
                  <p className="mt-3 text-sm text-brand-200">{detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Learn your way */}
      <section className="container-wide py-20 lg:py-28" aria-labelledby="learn">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Learn your way</p>
          <h2 id="learn" className="mt-3 text-4xl sm:text-5xl">
            No pressure. No judgment. Your choice.
          </h2>
          <p className="mt-5 text-lg text-muted">
            Pick up new tools with an endlessly patient AI companion, with a friendly person beside you, both, or neither.
            Every option is a good one.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <Link to="/learn/ai" className="card card-hover group flex h-full flex-col p-8 sm:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <Bot aria-hidden="true" className="h-7 w-7" />
              </span>
              <h3 className="mt-6 font-serif text-3xl font-medium">Learn with AI</h3>
              <p className="mt-3 flex-1 text-lg text-muted">Take your time. Ask anything. Learn one step at a time.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700">
                Start learning <ArrowRight aria-hidden="true" className="h-5 w-5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <Link to="/learn/buddies" className="card card-hover group flex h-full flex-col p-8 sm:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 text-warm-700">
                <HeartHandshake aria-hidden="true" className="h-7 w-7" />
              </span>
              <h3 className="mt-6 font-serif text-3xl font-medium">Learn with a person</h3>
              <p className="mt-3 flex-1 text-lg text-muted">Sometimes it's easier when someone is there to help.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700">
                Meet a digital buddy <ArrowRight aria-hidden="true" className="h-5 w-5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 7. Who it's for */}
      <section className="border-y border-warm-200 bg-white" aria-labelledby="who">
        <div className="container-wide grid gap-10 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Who it's for</p>
            <h2 id="who" className="mt-3 text-4xl sm:text-5xl">
              A seat at the table for everyone.
            </h2>
            <p className="mt-5 text-lg text-muted">Age never decides what you can do here. Many members both teach and learn.</p>
          </Reveal>
          <ul className="divide-y divide-warm-200 border-y border-warm-200 lg:col-span-7 lg:col-start-6">
            {AUDIENCES.map((a) => (
              <li key={a.kicker}>
                <Link to={a.to} className="group flex items-center gap-6 py-7 transition-colors hover:bg-warm-50/70 sm:px-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-warm-700">{a.kicker}</p>
                    <p className="mt-1.5 font-serif text-2xl leading-snug text-brand-900 sm:text-[1.7rem]">{a.title}</p>
                  </div>
                  <span className="hidden whitespace-nowrap font-semibold text-brand-700 md:inline">{a.cta}</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-warm-200 text-brand-700 transition group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-white">
                    <ArrowRight aria-hidden="true" className="h-5 w-5" />
                    <span className="sr-only md:hidden">{a.cta}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Stories */}
      {stories.length > 0 && (
        <section className="container-wide py-20 lg:py-28" aria-labelledby="stories">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Community stories</p>
              <h2 id="stories" className="mt-3 text-4xl sm:text-5xl">
                Notes of thanks, in both directions.
              </h2>
            </div>
            {storiesAreDemo && (
              <p className="max-w-sm rounded-2xl bg-warm-100 px-5 py-4 text-[0.95rem] text-warm-900">
                <strong>Fictional examples.</strong> These notes are demo data showing how thanks appear after a session. They
                aren't from real members yet.
              </p>
            )}
          </Reveal>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {stories.map((t, i) => (
              <li key={t.id}>
                <Reveal delay={i * 100} className="h-full">
                  <figure className="flex h-full flex-col rounded-3xl bg-white p-8 ring-1 ring-warm-200/80">
                    <Quote aria-hidden="true" className="h-8 w-8 text-warm-400" />
                    <blockquote className="mt-4 flex-1 font-serif text-xl leading-relaxed text-brand-900">{t.message}</blockquote>
                    <figcaption className="mt-6 text-[0.95rem] text-muted">
                      <strong className="font-semibold text-ink">{nameOf(t.fromId)}</strong>, to {nameOf(t.toId).split(" ")[0]}
                      {t.isDemo && <span className="ml-2 rounded-full bg-warm-100 px-2 py-0.5 text-sm text-warm-800">Demo example</span>}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 9. Promise */}
      <section className="bg-brand-100/60" aria-labelledby="promise">
        <div className="container-wide grid gap-10 py-20 lg:grid-cols-12 lg:py-28">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Our Humanity Promise</p>
            <h2 id="promise" className="mt-3 text-4xl sm:text-5xl">
              How we treat people.
            </h2>
            <Link to="/about" className="link mt-6 inline-block">
              Read our story
            </Link>
          </Reveal>
          <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-8">
            {PROMISES.map((p, i) => (
              <li key={p}>
                <Reveal delay={i * 60}>
                  <div className="flex gap-4 border-t border-brand-200 pt-5">
                    <span className="font-serif text-lg text-warm-700" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-serif text-2xl leading-snug text-brand-900">{p}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="container-wide py-20 lg:py-28" aria-labelledby="cta">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-800 px-6 py-16 text-center sm:px-16 sm:py-20">
            <img src="/images/workshop-tools.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-luminosity" />
            <div className="relative mx-auto max-w-3xl">
              <h2 id="cta" className="text-4xl leading-tight text-white sm:text-[3.4rem]">
                What you've learned matters. What comes next matters too.
              </h2>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={user ? "/next-chapter" : "/signup"} className="btn bg-warm-400 px-8 text-lg text-brand-900 hover:bg-warm-200">
                  Start Your Next Chapter <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <Link to="/signup?role=employer" className="btn border-2 border-white/40 px-7 text-lg text-white hover:border-white hover:bg-brand-900">
                  <Building2 aria-hidden="true" className="h-5 w-5" /> I'm hiring
                </Link>
              </div>
              <p className="mt-6 text-brand-100">
                <Briefcase aria-hidden="true" className="mr-1 inline h-4 w-4" /> Free to join. It takes about five minutes.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
