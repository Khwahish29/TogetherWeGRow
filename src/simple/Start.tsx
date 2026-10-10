import { Link } from "react-router-dom";
import { BookOpen, Briefcase, GraduationCap, HandHeart, Heart, HeartHandshake, LifeBuoy, MessageSquareText, Sprout } from "lucide-react";
import { startVisitClock } from "../lib/store";
import { BigChoice, Screen } from "./parts";

/** The very first screen: one question, two answers. Nothing else. */
export function Welcome() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-76px-140px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-6">
      <p className="text-center text-xl text-muted">Sharing what we know, across generations.</p>
      <h1 tabIndex={-1} className="mt-6 text-center text-5xl outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-6xl">
        Who are you?
      </h1>
      {/* Start the "first interaction within 5 minutes" clock at the first choice. */}
      <div className="mt-10 space-y-4" onClickCapture={startVisitClock}>
        <BigChoice to="/older" emoji="🌳" label="I'm an Older Adult" sub="Share what you know, learn something new, or get help" />
        <BigChoice to="/younger" emoji="🌱" label="I'm a Younger Adult" tone="warm" sub="Learn from experienced people, or share your skills" />
      </div>
      <p className="mt-8 text-center text-lg text-muted">There are no wrong choices. You can come back and change your mind.</p>
      <p className="mt-6 text-center text-lg">
        <Link to="/family" onClick={startVisitClock} className="link inline-flex items-center gap-2">
          <Heart aria-hidden="true" className="h-5 w-5" /> Helping someone you love take a first step?
        </Link>
      </p>
      <p className="mt-4 text-center text-lg text-muted">
        Already joined?{" "}
        <Link to="/login" className="link">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function OlderHome() {
  return (
    <Screen title="What would you like to do today?" help="Choose one. Take your time.">
      <div className="space-y-4">
        <BigChoice to="/older/share" icon={HandHeart} label="Share My Experience" sub="Your work, skills and life lessons" />
        <BigChoice to="/older/learn" icon={BookOpen} tone="warm" label="Learn Something New" sub="Small, easy steps" />
        <BigChoice to="/older/help" icon={LifeBuoy} tone="sage" label="Get Help" sub="From a friendly person, or step by step" />
      </div>
      <p className="mt-8 text-lg">
        <Link to="/older/roles" className="link inline-flex items-center gap-2">
          <Briefcase aria-hidden="true" className="h-5 w-5" /> Looking for paid work that's easier on the body?
        </Link>
      </p>
    </Screen>
  );
}

export function YoungerHome() {
  return (
    <Screen title="What would you like to do?" help="People with decades of experience are here, and so are people who'd love your help.">
      <div className="space-y-4">
        <BigChoice to="/younger/learn" icon={GraduationCap} label="Learn from Older Adults" sub="Practical skills, real-world advice" />
        <BigChoice to="/younger/share" icon={HeartHandshake} tone="warm" label="Share My Skills" sub="Help someone with technology or modern tools" />
      </div>
      <p className="mt-8 text-lg">
        <Link to="/younger/understand" className="link inline-flex items-center gap-2">
          <MessageSquareText aria-hidden="true" className="h-5 w-5" /> Understand each other: explain an expression or soften a message
        </Link>
      </p>
      <p className="mt-6 flex items-center gap-2 text-lg text-muted">
        <Sprout aria-hidden="true" className="h-5 w-5 text-brand-600" /> Everyone here has something to teach, and something to learn.
      </p>
    </Screen>
  );
}
