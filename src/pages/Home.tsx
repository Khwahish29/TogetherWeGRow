import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

const STEPS = [
  {
    n: "1",
    title: "Share your experience",
    body: "Speak or type about your working life. AI turns it into a clear skills profile, and you check and approve every word.",
  },
  {
    n: "2",
    title: "Discover new ways to earn",
    body: "SkillBridge suggests paid mentoring, advisory, and training roles that value your knowledge, with less physical strain.",
  },
  {
    n: "3",
    title: "Teach, learn, and connect",
    body: "Offer paid sessions to learners who want your skills, and learn new technology with AI or a friendly buddy. Only if you want to.",
  },
];

const PRINCIPLES = [
  { title: "Earn with dignity", body: "Professional expertise is paid fairly. Nobody is expected to trade their skills for basic tech help." },
  { title: "Your choice, always", body: "Learn with AI, with a person, both, or neither. Age never decides what you can do here." },
  { title: "Honest by design", body: "AI drafts are labelled, demo listings are marked, and we never promise a role is right for you." },
];

export default function Home() {
  const { user } = useAuth();
  const shareLink = user ? "/profile/create" : "/signup?role=mentor";

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-warm-50 to-warm-100">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="font-bold uppercase tracking-widest text-warm-700 text-sm">Experience × Curiosity</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Forty years of know-how deserves a new workshop.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-ink/80">
              TogetherWeGrow helps experienced workers turn what they know into paid mentoring, teaching, and advisory
              work, while generations learn from each other without pressure or judgment.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>a]:whitespace-nowrap">
              <Link to={shareLink} className="btn-primary text-lg">
                Share My Experience
              </Link>
              <Link to="/mentors" className="btn-secondary text-lg">
                Find a Mentor
              </Link>
              <Link to="/learn" className="btn-ghost text-lg">
                Learn Your Way →
              </Link>
            </div>
          </div>

          <figure className="card relative rotate-1 border-2 border-warm-100 bg-white/90 p-7 shadow-lg">
            <span aria-hidden="true" className="absolute -top-6 left-6 font-serif text-7xl leading-none text-warm-400">
              “
            </span>
            <blockquote className="font-serif text-2xl leading-snug text-brand-900">
              I've worked in carpentry for 35 years. I can't do the heavy lifting anymore, but I can still teach someone to
              read the grain.
            </blockquote>
            <figcaption className="mt-5 border-t border-brand-100 pt-4">
              <p className="font-bold">Robert, 63 · Carpenter turned paid mentor</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                <li className="chip">Carpentry Mentor</li>
                <li className="chip">Workshop Adviser</li>
                <li className="chip bg-warm-100 text-warm-700">Learning: video calls</li>
              </ul>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="problem">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 id="problem" className="text-3xl font-bold">
              The problem isn't that experience runs out.
            </h2>
            <p className="mt-4 text-lg text-ink/80">
              It's that society rarely makes room for it. Physical work gets harder, job applications move online, and
              employers look past older workers. Meanwhile, younger people are hungry for the practical wisdom that only
              decades on the job can teach.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="rounded-2xl border-l-4 border-brand-600 bg-white p-5">
                <p className="font-bold text-brand-900">{p.title}</p>
                <p className="mt-1 text-ink/80">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-brand-900 py-16 text-white" aria-labelledby="how">
        <div className="container-page">
          <h2 id="how" className="text-3xl font-bold text-white">
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl bg-brand-800 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-400 font-serif text-2xl font-bold text-brand-900">
                  {s.n}
                </span>
                <h3 className="mt-4 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-brand-100">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="who">
        <h2 id="who" className="text-3xl font-bold">
          Built for every side of the table
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link to={shareLink} className="card group transition hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-bold uppercase tracking-wider text-warm-700">Experienced workers</p>
            <h3 className="mt-2 text-xl font-bold group-hover:underline">Turn experience into income</h3>
            <p className="mt-2 text-ink/80">Build a profile by voice, discover advisory roles, and offer paid sessions.</p>
          </Link>
          <Link to="/mentors" className="card group transition hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-bold uppercase tracking-wider text-warm-700">Students & apprentices</p>
            <h3 className="mt-2 text-xl font-bold group-hover:underline">Learn what textbooks can't teach</h3>
            <p className="mt-2 text-ink/80">Find matched mentors and request a session in a few clicks.</p>
          </Link>
          <Link to="/learn/buddies" className="card group transition hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-bold uppercase tracking-wider text-warm-700">Digital buddies</p>
            <h3 className="mt-2 text-xl font-bold group-hover:underline">Share patience, not pity</h3>
            <p className="mt-2 text-ink/80">Help someone feel at home with technology, for free, as a volunteer, or paid.</p>
          </Link>
        </div>
      </section>

      <section className="container-page" aria-labelledby="cta">
        <div className="rounded-3xl bg-warm-100 px-6 py-12 text-center sm:px-12">
          <h2 id="cta" className="text-3xl font-bold">
            Someone out there needs exactly what you know.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink/80">
            It takes about five minutes to get started. No résumé needed.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={user ? "/dashboard" : "/signup"} className="btn-primary text-lg">
              {user ? "Go to my dashboard" : "Join TogetherWeGrow"}
            </Link>
            <Link to="/marketplace" className="btn-secondary text-lg">
              Browse mentoring sessions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
