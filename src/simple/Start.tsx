import { Link } from "react-router-dom";
import { Briefcase, Heart, Mail, MessageSquareText } from "lucide-react";
import { useAuth } from "../lib/auth";
import { getNotes, getRequests, startVisitClock } from "../lib/store";
import { useStore } from "../lib/useStore";
import { Affirmation, BigChoice, ReadAloud, Screen, TreeAndSprout, greeting } from "./parts";

const LAST = "twg.lastChoice";

function remember(who: "older" | "younger") {
  startVisitClock();
  try {
    localStorage.setItem(LAST, who);
  } catch {
    // ignore
  }
}

function lastChoice(): "older" | "younger" | null {
  try {
    const v = localStorage.getItem(LAST);
    return v === "older" || v === "younger" ? v : null;
  } catch {
    return null;
  }
}

/** How many things are waiting for this person (new messages and requests to answer). */
function useWaiting() {
  const { user } = useAuth();
  const notes = useStore(getNotes, []);
  const requests = useStore(getRequests, []);
  if (!user) return 0;
  return notes.filter((n) => n.toId === user.id && !n.read).length + requests.filter((r) => r.toId === user.id && r.status === "pending").length;
}

function PhotoCredits({ children }: { children: string }) {
  return <p className="mt-10 text-sm text-muted">Photos: {children}. The people pictured are not affiliated with TogetherWeGrow.</p>;
}

/** The very first screen: one question, two answers. */
export function Welcome() {
  const { user } = useAuth();
  const last = lastChoice();
  const choices = [
    { who: "older" as const, to: "/roots", emoji: "🌳", label: "Deep roots", sub: "I've spent years learning my work", tone: "forest" as const },
    { who: "younger" as const, to: "/growth", emoji: "🌱", label: "New growth", sub: "I'm early on and eager to learn", tone: "warm" as const },
  ];
  // Someone who has been here before sees their own door first.
  if (last === "younger") choices.reverse();

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-5 pb-12 pt-6 sm:px-6 sm:pt-10">
      <TreeAndSprout className="mx-auto h-auto w-full max-w-md" />
      <p className="mt-4 text-center font-serif text-3xl text-warm-700">{greeting(user?.name)}</p>
      <p className="mt-1 text-center text-xl text-muted">You're welcome here, just as you are.</p>
      <h1 tabIndex={-1} className="mt-4 text-center text-4xl leading-tight outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-5xl">
        Where are you in your journey?
      </h1>
      <ReadAloud className="mt-5 flex justify-center" />
      <div className="mt-6 space-y-4">
        {choices.map((c) => (
          <div key={c.who} onClickCapture={() => remember(c.who)}>
            <BigChoice to={c.to} emoji={c.emoji} tone={c.tone} label={c.label} sub={last === c.who ? "Carry on where you left off" : c.sub} />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-lg text-muted">There are no wrong choices. You can always come back and change your mind.</p>
      <p className="mt-6 text-center text-lg">
        <Link to="/family" onClick={startVisitClock} className="link inline-flex items-center gap-2">
          <Heart aria-hidden="true" className="h-5 w-5" /> Helping someone you love take a first step?
        </Link>
      </p>
      {!user && (
        <p className="mt-4 text-center text-lg text-muted">
          Already joined?{" "}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}

export function OlderHome() {
  const { user } = useAuth();
  const waiting = useWaiting();
  return (
    <Screen eyebrow={greeting(user?.name)} title="What would you like to do today?" help="Choose one. There's no hurry, and nothing here can be broken.">
      <div className="space-y-4">
        {waiting > 0 && (
          <BigChoice to="/inbox" icon={Mail} tone="warm" label={waiting === 1 ? "Someone wrote to you" : `${waiting} messages are waiting for you`} sub="Somebody wants to hear from you" />
        )}
        <BigChoice to="/roots/share" image="/images/carpenter-1952.jpg" imageFocus="70% 25%" label="Share My Experience" sub="Your work, your skills, the lessons life taught you" />
        <BigChoice to="/roots/learn" image="/images/learning-together.jpg" imageFocus="70% 35%" label="Learn Something New" sub="Small, easy steps, as slowly as you like" />
        <BigChoice to="/roots/help" image="/images/smiling-laptop.jpg" imageFocus="68% 30%" label="Get Help" sub="From a friendly person, or step by step" />
      </div>

      <div className="mt-8">
        <Affirmation who="older" />
      </div>

      <p className="mt-8 text-lg">
        <Link to="/roots/roles" className="link inline-flex items-center gap-2">
          <Briefcase aria-hidden="true" className="h-5 w-5" /> Looking for paid work that's easier on the body?
        </Link>
      </p>
      <PhotoCredits>Priskin János (public domain), Ivana Guslarevic (CC BY-SA 4.0), Shixart1985 (CC BY 2.0)</PhotoCredits>
    </Screen>
  );
}

export function YoungerHome() {
  const { user } = useAuth();
  const waiting = useWaiting();
  return (
    <Screen eyebrow={greeting(user?.name)} title="What would you like to do?" help="People with decades of experience are here. So are people who would love your patience.">
      <div className="space-y-4">
        {waiting > 0 && (
          <BigChoice to="/inbox" icon={Mail} tone="warm" label={waiting === 1 ? "Someone wrote to you" : `${waiting} messages are waiting for you`} sub="See who needs you" />
        )}
        <BigChoice to="/growth/learn" image="/images/welding-mentor.jpg" imageFocus="25% 18%" label="Learn from Deep Roots" sub="Practical skills and honest, real-world advice" />
        <BigChoice to="/growth/share" image="/images/learning-together.jpg" imageFocus="70% 35%" label="Share My Skills" sub="Help someone feel at home with technology" />
      </div>

      <div className="mt-8">
        <Affirmation who="younger" />
      </div>

      <p className="mt-8 text-lg">
        <Link to="/growth/understand" className="link inline-flex items-center gap-2">
          <MessageSquareText aria-hidden="true" className="h-5 w-5" /> Understand each other: explain an expression or soften a message
        </Link>
      </p>
      <PhotoCredits>Rwebogora (CC BY-SA 4.0), Ivana Guslarevic (CC BY-SA 4.0)</PhotoCredits>
    </Screen>
  );
}
