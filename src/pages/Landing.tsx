import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Coins,
  GraduationCap,
  HandHeart,
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
import { EVENT_NAME, TEAM, TEAM_NAME } from "../data/team";

const NAV = [
  ["#challenge", "The challenge"],
  ["#how", "How it works"],
  ["#impact", "Impact"],
  ["#team", "Team"],
];

const BARRIERS = [
  {
    title: "Bodies that are tired",
    body: "Decades of lifting, standing and repetition take their toll. Yet the usual alternative is starting over at the bottom.",
  },
  {
    title: "Doors that quietly close",
    body: "Age discrimination and online-only hiring leave experienced people out, and their confidence often goes with them.",
  },
  {
    title: "The fear of asking",
    body: "Many hesitate to learn new technology. They feel embarrassed to ask, or worry they're too old to start again.",
  },
];

const STORIES = [
  {
    icon: HandHeart,
    who: "A carpenter ready to put down the heavy tools",
    what: "He answers a few questions in his own words and discovers that younger people want exactly what he knows. He offers paid mentoring sessions, and looks at advisory roles that are easier on his body.",
    to: "/older/share",
    cta: "Try “Share my experience”",
  },
  {
    icon: BookOpen,
    who: "A grandmother who wants to video-call her family",
    what: "She learns one small step at a time, with the words read aloud if she likes. When she'd rather have a person, a patient younger helper is there.",
    to: "/older/learn",
    cta: "Try “Learn something new”",
  },
  {
    icon: GraduationCap,
    who: "A student looking for career advice",
    what: "She finds someone with forty years in the trade, asks a question for free, or books a paid session. She learns what no course could teach her.",
    to: "/younger/learn",
    cta: "Try “Learn from older adults”",
  },
];

const DESIGN = [
  { icon: MousePointerClick, text: "One question per screen" },
  { icon: Mic, text: "Speak or type, whichever is easier" },
  { icon: Type, text: "Large text and large buttons" },
  { icon: Undo2, text: "Back and Home always in the same place" },
  { icon: Languages, text: "Works in many languages" },
  { icon: ShieldCheck, text: "Nothing is shared without a clear yes" },
];

const DIFFERENT = [
  {
    icon: Heart,
    title: "Introduced by someone they love",
    body: "People try something new when someone they trust suggests it. A guided invitation helps children and grandchildren start that conversation in a way that celebrates their loved one's experience.",
    to: "/family",
  },
  {
    icon: MessageSquareText,
    title: "Vibe Check: understanding each other",
    body: "“That advice was clutch” and “measure twice, cut once” both carry real meaning. Vibe Check explains expressions and softens messages, so neither generation feels embarrassed.",
    to: "/younger/understand",
  },
  {
    icon: HelpCircle,
    title: "It begins with familiar questions",
    body: "Instead of a long form, older adults describe their work in their own words, or answer a real question a younger person is asking. Their skills are drawn from what they said, never invented.",
    to: "/older/share",
  },
  {
    icon: Coins,
    title: "Fair pay, shown up front",
    body: "Mentors set their own price and keep 90%. Roles that are easier on the body show pay, hours and physical demands in plain words.",
    to: "/older/roles",
  },
];

const VALUES = [
  { name: "Empathy", how: "We start by listening. Nobody is asked their age, and nearly every question can be skipped." },
  { name: "Compassion", how: "Asking for help is treated as normal. Steps repeat as often as needed, and “Explain it more simply” is always there." },
  { name: "Respect", how: "Experience is professional knowledge. Mentors set their own price and keep 90% of it." },
  { name: "Kindness", how: "Younger helpers are reminded to go at the other person's pace, let them do the tapping, and never ask for passwords." },
  { name: "Integrity", how: "Example people are labeled. Suggestions are never promises. Nothing is shared or charged without a clear yes." },
];

const METRICS = [
  ["10–15", "older adults and 10 younger helpers taking part through local community organizations"],
  ["10", "intergenerational learning sessions"],
  ["5 min", "for an older adult to finish a first interaction, with little or no help"],
  ["7 in 10", "older participants feeling more comfortable asking for help"],
  ["5", "older adults sharing a practical skill or professional experience"],
  ["80%", "of participants rating their experience 4 or more out of 5"],
  ["5", "matched pairs returning for a second session"],
];

const REVENUE = [
  { title: "A small 10% fee", body: "On completed paid sessions only. On a $40 session, the mentor keeps $36." },
  { title: "Employer and institution partnerships", body: "Subscriptions for businesses, vocational schools and training groups that need experienced trainers and advisers." },
  { title: "Sponsorships and grants", body: "From nonprofits, local businesses and workforce programs, keeping help free for older adults." },
];

const COSTS = [
  ["Reaching people", "Family referrals, campus outreach, in-person demos", "$50–150"],
  ["Hosting and technology", "Website, database, security", "$30–100"],
  ["Outreach materials", "Printed guides, community events, assisted sign-up", "$20–75"],
  ["People and operations", "Student volunteers and team members at first", "$0–500"],
];

const PARTNERS = [
  ["Families and trusted friends", "The main way people find us: gentle, familiar conversations."],
  ["Community colleges and universities", "Such as Arizona State University and Maricopa Community Colleges, connecting students and apprentices with experienced mentors."],
  ["Senior centers and community groups", "Building trust early and offering patient, in-person help."],
  ["Psychology and counseling departments", "Helping design gentle onboarding that reduces the fear of judgment and builds confidence."],
  ["Local businesses and trade associations", "Paid mentoring and roles that are easier on the body."],
  ["Nonprofits", "Such as AARP Foundation and Senior Planet, for outreach and connecting people with existing support."],
];

export default function Landing() {
  useEffect(() => {
    document.title = "TogetherWeGrow: experience that lives on";
    return () => {
      document.title = "TogetherWeGrow";
    };
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 text-ink">
      <a href="#main" className="btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]">
        Skip to main content
      </a>

      <header className="border-b border-warm-200/80">
        <div className="container-wide flex h-[76px] items-center justify-between gap-3">
          <Link to="/" aria-label="TogetherWeGrow, home" className="rounded-xl">
            <Logo />
          </Link>
          <nav aria-label="On this page" className="hidden lg:block">
            <ul className="flex gap-1">
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="rounded-full px-4 py-2 font-medium text-brand-800 hover:bg-brand-100">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Link to="/start" className="btn-primary min-h-[48px] shrink-0 whitespace-nowrap px-5">
            Start here <ArrowRight aria-hidden="true" className="hidden h-5 w-5 sm:block" />
          </Link>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="container-wide grid items-center gap-12 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-24" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">
              {EVENT_NAME} · {TEAM_NAME}
            </p>
            <h1 id="hero-title" className="mt-5 text-[2.6rem] leading-[1.08] sm:text-6xl">
              Their bodies deserve rest. Their experience deserves to live on.
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted">
              After decades of physically demanding work, many older adults face age discrimination and the feeling that what they know no
              longer matters. TogetherWeGrow connects them with younger people who need that knowledge, so they can earn from experience,
              learn at their own pace, and find gentler work without starting over.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/start" className="btn-primary min-h-[60px] px-7 text-lg">
                Start here <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <a href="#how" className="btn-secondary min-h-[60px] px-7 text-lg">
                See how it works
              </a>
            </div>
            <p className="mt-5 text-muted">Free to try. No sign-up. One question per screen.</p>
          </div>
          <figure>
            <img
              src="/images/welding-mentor.jpg"
              alt="An experienced instructor guides a younger learner through a welding task in a workshop."
              className="aspect-[4/3] w-full rounded-[2rem] object-cover object-[30%_22%] shadow-lg lg:aspect-[5/6]"
            />
            <figcaption className="mt-3 text-sm text-muted">
              Photo: Rwebogora, CC BY-SA 4.0, via Wikimedia Commons. The people pictured are not affiliated with TogetherWeGrow.
            </figcaption>
          </figure>
        </section>

        {/* The challenge */}
        <section id="challenge" className="scroll-mt-4 border-y border-warm-200 bg-white py-16 lg:py-24" aria-labelledby="challenge-title">
          <div className="container-page">
            <p className="eyebrow">The challenge</p>
            <h2 id="challenge-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
              The hardest barrier isn't technology or age. It's the fear of no longer being needed.
            </h2>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {BARRIERS.map((b) => (
                <li key={b.title} className="rounded-3xl bg-warm-50 p-7 ring-1 ring-warm-200">
                  <h3 className="font-sans text-xl font-semibold text-brand-900">{b.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{b.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-3xl text-xl leading-relaxed">
              Meanwhile, younger people are searching for exactly what these workers know: practical skills, honest career advice, and someone
              patient to learn from. The two groups rarely meet.
            </p>
          </div>
        </section>

        {/* Stories */}
        <section className="container-page py-16 lg:py-24" aria-labelledby="stories-title">
          <p className="eyebrow">Who it's for</p>
          <h2 id="stories-title" className="mt-4 text-4xl sm:text-5xl">
            Three people, three first steps
          </h2>
          <p className="mt-4 text-lg text-muted">Illustrative examples of how people would use TogetherWeGrow.</p>
          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            {STORIES.map((s) => (
              <li key={s.who} className="flex flex-col rounded-3xl bg-white p-7 ring-1 ring-warm-200">
                <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
                  <s.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-sans text-xl font-semibold text-brand-900">{s.who}</h3>
                <p className="mt-3 flex-1 text-lg leading-relaxed text-muted">{s.what}</p>
                <Link to={s.to} className="link mt-6 inline-flex items-center gap-2 text-lg">
                  {s.cta} <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-4 bg-brand-900 py-16 text-brand-100 lg:py-24" aria-labelledby="how-title">
          <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-warm-400">How it works</p>
              <h2 id="how-title" className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
                It begins with one simple question.
              </h2>
              <p className="mt-5 text-xl leading-relaxed">
                No menus, no account, no jargon. Each screen asks one thing, in plain words, and the next step is always obvious.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {DESIGN.map((d) => (
                  <li key={d.text} className="flex items-start gap-3 text-lg">
                    <d.icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warm-400" />
                    {d.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-warm-50 p-6 text-ink shadow-xl sm:p-8">
              <p className="text-center font-serif text-3xl text-brand-900 sm:text-4xl">Who are you?</p>
              <div className="mt-6 space-y-3" aria-hidden="true">
                {[
                  ["🌳", "I'm an Older Adult", "Share what you know · Learn something new · Get help"],
                  ["🌱", "I'm a Younger Adult", "Learn from experienced people · Share your skills"],
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
                Try it yourself <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* What's different */}
        <section className="container-page py-16 lg:py-24" aria-labelledby="different-title">
          <p className="eyebrow">What makes it different</p>
          <h2 id="different-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
            Built on trust and human connection, not complicated applications.
          </h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {DIFFERENT.map((d) => (
              <li key={d.title} className="rounded-3xl bg-white p-7 ring-1 ring-warm-200">
                <d.icon aria-hidden="true" className="h-8 w-8 text-warm-700" />
                <h3 className="mt-4 font-sans text-xl font-semibold text-brand-900">{d.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted">{d.body}</p>
                <Link to={d.to} className="link mt-5 inline-flex items-center gap-2">
                  See it <span className="sr-only">: {d.title}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-3xl bg-brand-100/60 p-7 sm:p-10">
            <h3 className="font-sans text-2xl font-semibold text-brand-900">Learning from those who came before</h3>
            <p className="mt-3 text-lg leading-relaxed">
              Senior Planet by AARP offers free technology training. AARP Foundation's BACK TO WORK 50+ provides career coaching. CoGenerate
              brings generations together around shared work. Each does important work on one part of this challenge. TogetherWeGrow brings
              the parts together in one judgment-free place: two-way skill exchange, paid mentoring, and gentler work.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-warm-200 bg-white py-16 lg:py-24" aria-labelledby="values-title">
          <div className="container-page">
            <p className="eyebrow">What we believe</p>
            <h2 id="values-title" className="mt-4 text-4xl sm:text-5xl">
              The values behind every screen
            </h2>
            <ol className="mt-12 divide-y divide-warm-200">
              {VALUES.map((v) => (
                <li key={v.name} className="grid gap-2 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
                  <h3 className="font-serif text-3xl text-brand-900">{v.name}</h3>
                  <p className="text-xl leading-relaxed text-muted">{v.how}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Impact */}
        <section id="impact" className="container-page scroll-mt-4 py-16 lg:py-24" aria-labelledby="impact-title">
          <p className="eyebrow">Impact</p>
          <h2 id="impact-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
            How we'll know it's working
          </h2>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted">
            We'll start with a local pilot, aiming to reach hundreds of older adults and young learners, and thousands as TogetherWeGrow
            grows. These are the pilot's goals.
          </p>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map(([n, label]) => (
              <li key={label} className="rounded-3xl bg-white p-6 ring-1 ring-warm-200">
                <p className="font-serif text-4xl text-brand-800">{n}</p>
                <p className="mt-2 text-lg leading-snug">{label}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-lg">
            The site measures these as people use it, anonymously.{" "}
            <Link to="/impact" className="link">
              See how we're doing so far
            </Link>
          </p>
        </section>

        {/* Sustainability */}
        <section className="bg-warm-100/70 py-16 lg:py-24" aria-labelledby="model-title">
          <div className="container-page">
            <p className="eyebrow">Sustainability</p>
            <h2 id="model-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
              Fair to older adults, built to last
            </h2>
            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-sans text-2xl font-semibold text-brand-900">How it pays for itself</h3>
                <ul className="mt-5 space-y-4">
                  {REVENUE.map((r) => (
                    <li key={r.title} className="rounded-3xl bg-white p-6 ring-1 ring-warm-200">
                      <p className="text-xl font-semibold text-brand-900">{r.title}</p>
                      <p className="mt-1 text-lg text-muted">{r.body}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-lg leading-relaxed">
                  Repeat sessions and long-term partnerships bring steady income. As more people join, the shared platform supports more
                  sessions at little extra cost.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-2xl font-semibold text-brand-900">What a pilot costs each month</h3>
                <div className="mt-5 overflow-x-auto rounded-3xl bg-white ring-1 ring-warm-200">
                  <table className="w-full min-w-[22rem] text-left text-lg">
                    <caption className="sr-only">Estimated monthly pilot costs</caption>
                    <thead>
                      <tr className="border-b border-warm-200 text-base text-muted">
                        <th scope="col" className="p-4 font-medium">
                          Cost
                        </th>
                        <th scope="col" className="p-4 text-right font-medium">
                          Per month
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COSTS.map(([what, detail, amount]) => (
                        <tr key={what} className="border-b border-warm-200">
                          <th scope="row" className="p-4 font-normal">
                            <span className="block font-semibold text-brand-900">{what}</span>
                            <span className="block text-base text-muted">{detail}</span>
                          </th>
                          <td className="whitespace-nowrap p-4 text-right">{amount}</td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row" className="p-4 text-left font-semibold text-brand-900">
                          Estimated total
                        </th>
                        <td className="whitespace-nowrap p-4 text-right font-semibold text-brand-900">$100–825</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-muted">Excludes paid staff salaries and major development. Payments aren't handled through the site yet.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="container-page py-16 lg:py-24" aria-labelledby="partners-title">
          <p className="eyebrow">Reaching people</p>
          <h2 id="partners-title" className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
            Growing through trust, one family at a time
          </h2>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted">
            Older adults are far more comfortable exploring something introduced by someone they love than an unfamiliar website. So families
            come first, supported by the community around them.
          </p>
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map(([who, why]) => (
              <li key={who} className="rounded-3xl bg-white p-6 ring-1 ring-warm-200">
                <p className="text-xl font-semibold text-brand-900">{who}</p>
                <p className="mt-2 text-lg text-muted">{why}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-lg text-muted">
            Apart from families, these are organizations we hope to approach. None of them has agreed to work with us yet.
          </p>
        </section>

        {/* Team */}
        <section id="team" className="scroll-mt-4 border-t border-warm-200 bg-white py-16 lg:py-24" aria-labelledby="team-title">
          <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="eyebrow">The team</p>
              <h2 id="team-title" className="mt-4 text-4xl sm:text-5xl">
                {TEAM_NAME}
              </h2>
              <p className="mt-5 text-xl leading-relaxed">
                We built TogetherWeGrow for {EVENT_NAME}, in the Aging and Labor track. We believe every generation deserves to be heard,
                valued, and given the chance to grow.
              </p>
              {TEAM.length > 0 && (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {TEAM.map((m) => (
                    <li key={m.name} className="flex items-center gap-4 rounded-2xl bg-warm-50 p-4 ring-1 ring-warm-200">
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
            </div>
            <blockquote className="rounded-[2rem] bg-brand-900 p-8 text-brand-100 sm:p-10">
              <p className="font-serif text-2xl leading-snug text-white sm:text-3xl">
                “We want a community where older adults feel heard, younger people learn to listen, and no one's lifetime of hard work is
                forgotten.”
              </p>
              <footer className="mt-5 text-lg">From our team's mission</footer>
            </blockquote>
          </div>
        </section>

        {/* Closing */}
        <section className="container-page py-16 lg:py-24" aria-labelledby="cta-title">
          <div className="rounded-[2rem] bg-brand-100/70 p-8 text-center sm:p-14">
            <h2 id="cta-title" className="text-4xl leading-tight sm:text-5xl">
              Their wisdom never loses its value.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-muted">
              Begin the way an older adult or a younger adult would. It takes about two minutes, and a first name is all you need.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/start" className="btn-primary min-h-[60px] px-7 text-lg">
                Start here <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <Link to="/family" className="btn-secondary min-h-[60px] px-7 text-lg">
                <Users aria-hidden="true" className="h-5 w-5" /> Invite someone you love
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-warm-200">
        <div className="container-wide grid gap-8 py-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xl text-muted">
              Built by {TEAM_NAME} for {EVENT_NAME}. We never sell your information or show adverts, and no payments are taken through the
              site.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid gap-2 text-lg sm:grid-cols-2">
              <li>
                <Link to="/start" className="link">
                  Start here
                </Link>
              </li>
              <li>
                <Link to="/impact" className="link">
                  Our goals
                </Link>
              </li>
              <li>
                <Link to="/family" className="link">
                  Invite someone you love
                </Link>
              </li>
              <li>
                <Link to="/older/roles" className="inline-flex items-center gap-1 link">
                  <Briefcase aria-hidden="true" className="h-4 w-4" /> Gentler work
                </Link>
              </li>
              <li className="sm:col-span-2">
                <Link to="/explore" className="link">
                  Explore every feature
                </Link>{" "}
                <span className="text-base text-muted">(the full website)</span>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
