import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeftRight,
  BadgeDollarSign,
  Briefcase,
  Check,
  Eye,
  Feather,
  Hammer,
  HeartHandshake,
  Mic,
  NotebookPen,
  RotateCcw,
  Sprout,
  Users,
  Video,
} from "lucide-react";
import { Avatar } from "../components/ui";
import { useAuth } from "../lib/auth";
import { getThanks, getUsers } from "../lib/store";
import { useStore } from "../lib/useStore";

const STEPS = [
  {
    icon: Mic,
    title: "Tell your story",
    body: "Speak or type about your working life, the way you'd tell a friend. We turn it into a clear profile, and you approve every word.",
  },
  {
    icon: Briefcase,
    title: "See where it can take you",
    body: "Discover paid mentoring, advisory, and teaching roles that value what you know and are easier on the body.",
  },
  {
    icon: Users,
    title: "Teach, learn, connect",
    body: "Offer sessions to people who want your skills. Pick up new technology with AI or a friendly person, if and when you want to.",
  },
];

const PROMISES = [
  {
    icon: BadgeDollarSign,
    title: "Your knowledge is paid for",
    body: "Mentors set their own fair price. Nobody is expected to trade professional skills for a bit of tech help.",
  },
  {
    icon: Feather,
    title: "Work that's kinder to your body",
    body: "Career suggestions favour roles where you teach and advise, not lift and carry. You can filter for that.",
  },
  {
    icon: Sprout,
    title: "Learn at your own pace",
    body: "Step-by-step help that never rushes you, a person if you'd rather, or neither. There's no wrong way to learn here.",
  },
  {
    icon: RotateCcw,
    title: "Room to change your mind",
    body: "Withdraw a request, suggest a new time, or reconsider a no. Mistakes are part of learning, for everyone.",
  },
  {
    icon: Eye,
    title: "Nothing hidden",
    body: "Prices up front. AI drafts labelled as drafts. Demo listings marked as demos. You approve what's published.",
  },
  {
    icon: NotebookPen,
    title: "A quiet moment after each session",
    body: "Jot down what you learned and what surprised you. Just for you. And send a thank-you note if you'd like.",
  },
];

function ExchangeVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="absolute -left-6 -top-8 h-40 w-40 rounded-full bg-warm-400/25 blur-2xl" />
      <div className="absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-brand-500/20 blur-2xl" />

      <div className="relative -rotate-2 rounded-3xl border border-brand-100 bg-white p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <Avatar name="Robert Mensah" />
          <div>
            <p className="font-bold text-brand-900">Robert, 63</p>
            <p className="text-sm text-ink/70">Carpenter · 35 years</p>
          </div>
          <span className="ml-auto rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-800">$25 / session</span>
        </div>
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-brand-900">
          <Hammer className="h-5 w-5 text-brand-700" /> Teaches woodworking basics
        </p>
      </div>

      <div className="relative z-10 my-3 flex justify-center">
        <span className="flex items-center gap-2 rounded-full bg-brand-900 px-4 py-2 text-sm font-bold text-white shadow-lg">
          <ArrowLeftRight className="h-4 w-4" /> learning both ways
        </span>
      </div>

      <div className="relative ml-6 rotate-2 rounded-3xl border border-warm-100 bg-white p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <Avatar name="Maya Chen" />
          <div>
            <p className="font-bold text-brand-900">Maya, 21</p>
            <p className="text-sm text-ink/70">Design student</p>
          </div>
          <span className="ml-auto rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-800">Volunteer</span>
        </div>
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-warm-100 px-3 py-2 text-brand-900">
          <Video className="h-5 w-5 text-warm-700" /> Helped Robert join his first video call
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const thanks = useStore(getThanks, []);
  const users = useStore(getUsers, []);
  const shareLink = user ? "/profile/create" : "/signup?role=mentor";
  const name = (id: string) => users.find((u) => u.id === id)?.name ?? "A member";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-warm-50 to-warm-100">
        <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-brand-800 shadow-sm">
              <Sprout aria-hidden="true" className="h-4 w-4 text-brand-600" />
              Where experience and curiosity meet
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              A lifetime of know-how deserves a <span className="text-warm-700">new workshop.</span>
            </h1>
            <p className="mt-5 max-w-xl text-xl text-ink/80">
              Turn decades of experience into paid mentoring, teaching, and advice. Learn new things from younger people,
              at your own pace, without anyone making you feel behind.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>a]:whitespace-nowrap">
              <Link to={shareLink} className="btn-primary text-lg">
                Share my experience <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <Link to="/mentors" className="btn-secondary text-lg">
                Find a mentor
              </Link>
              <Link to="/learn" className="btn-ghost text-lg">
                Learn your way
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-ink/75">
              {["Free to join", "No résumé needed", "You approve everything"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check aria-hidden="true" className="h-5 w-5 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ExchangeVisual />
        </div>
      </section>

      {/* The why */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="why">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="why" className="text-3xl font-bold sm:text-4xl">
            Experience doesn't run out. Opportunities do.
          </h2>
          <p className="mt-4 text-lg text-ink/80">
            Heavy work gets harder. Job applications move online. Employers look past older workers. Meanwhile, younger
            people are hungry for the practical wisdom that only decades on the job can teach. We built a place where both
            sides win.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-900 py-16 text-white sm:py-20" aria-labelledby="how">
        <div className="container-page">
          <h2 id="how" className="text-3xl font-bold text-white sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative rounded-3xl bg-brand-800 p-7">
                <span className="absolute right-6 top-5 font-serif text-5xl font-bold text-brand-700" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-400 text-brand-900">
                  <Icon aria-hidden="true" className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-brand-100">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Promises */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="promises">
        <div className="max-w-2xl">
          <h2 id="promises" className="text-3xl font-bold sm:text-4xl">
            What you can count on here
          </h2>
          <p className="mt-3 text-lg text-ink/80">Small design choices that make a big difference to how people are treated.</p>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <Icon aria-hidden="true" className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-ink/80">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Notes of thanks */}
      {thanks.length > 0 && (
        <section className="bg-warm-100/70 py-16 sm:py-20" aria-labelledby="thanks">
          <div className="container-page">
            <div className="flex items-center gap-3">
              <HeartHandshake aria-hidden="true" className="h-8 w-8 text-warm-700" />
              <h2 id="thanks" className="text-3xl font-bold sm:text-4xl">
                Notes of thanks
              </h2>
            </div>
            <p className="mt-2 text-lg text-ink/80">Written by members after a session, in both directions.</p>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {thanks.slice(0, 3).map((t) => (
                <li key={t.id} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm">
                  <span aria-hidden="true" className="font-serif text-6xl leading-none text-warm-400">
                    “
                  </span>
                  <blockquote className="-mt-4 flex-1 font-serif text-lg leading-relaxed text-brand-900">{t.message}</blockquote>
                  <p className="mt-4 text-sm text-ink/70">
                    <strong className="text-ink">{name(t.fromId)}</strong> to {name(t.toId).split(" ")[0]}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Audiences */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="who">
        <h2 id="who" className="text-3xl font-bold sm:text-4xl">
          A seat at the table for everyone
        </h2>
        <p className="mt-3 text-lg text-ink/80">Age never decides what you can do. Many members both teach and learn.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { to: shareLink, kicker: "Experienced workers", title: "Turn experience into income", body: "Build a profile by voice, discover advisory roles, and offer paid sessions." },
            { to: "/mentors", kicker: "Students & apprentices", title: "Learn what textbooks can't teach", body: "Find matched mentors and request a session in a few clicks." },
            { to: "/signup?role=buddy", kicker: "Digital buddies", title: "Share your patience", body: "Help someone feel at home with technology: for free, as a volunteer, or paid." },
          ].map((c) => (
            <Link key={c.kicker} to={c.to} className="group card flex flex-col transition hover:-translate-y-1 hover:border-brand-600 hover:shadow-md">
              <p className="text-sm font-bold uppercase tracking-wider text-warm-700">{c.kicker}</p>
              <h3 className="mt-2 text-xl font-bold">{c.title}</h3>
              <p className="mt-2 flex-1 text-ink/80">{c.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-bold text-brand-700">
                Get started <ArrowRight aria-hidden="true" className="h-5 w-5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16" aria-labelledby="cta">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-700 px-6 py-14 text-center text-white sm:px-12">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-800" />
          <div className="relative">
            <h2 id="cta" className="text-3xl font-bold text-white sm:text-4xl">
              Someone out there needs exactly what you know.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-brand-50">It takes about five minutes to get started.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={user ? "/dashboard" : "/signup"} className="btn bg-white text-brand-800 hover:bg-warm-50 text-lg">
                {user ? "Go to my home" : "Join TogetherWeGrow"}
              </Link>
              <Link to="/about" className="btn border-2 border-white/70 text-white hover:bg-brand-800 text-lg">
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
