import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, FileText, GraduationCap, HeartHandshake, Lightbulb, Search, UserRound } from "lucide-react";
import { useAuth } from "../lib/auth";
import { TextSizeToggle } from "./TextSizeToggle";

/** A calm "where do I go?" panel, reachable from every page. */
export function HelpPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const options = [
    user
      ? { to: "/profile", icon: UserRound, title: "Update my profile", body: "Change your skills, preferences, or introduction." }
      : { to: "/signup", icon: UserRound, title: "Get started", body: "Create a free account in a couple of minutes." },
    { to: "/careers", icon: Briefcase, title: "Find work that suits me now", body: "Roles that value your experience." },
    { to: "/resume", icon: FileText, title: "Make a résumé", body: "Answer a few questions and watch it build." },
    { to: "/mentors", icon: Search, title: "Learn a skill from someone experienced", body: "Browse mentors and request a session." },
    { to: "/marketplace", icon: GraduationCap, title: "Offer or book a paid session", body: "See prices up front. Nothing is charged to ask." },
    { to: "/learn/ai", icon: Lightbulb, title: "Figure out some technology", body: "Step-by-step help, as slowly as you like." },
    { to: "/learn/buddies", icon: HeartHandshake, title: "Talk to a real person", body: "A friendly digital buddy can help you." },
  ];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="help-title"
      className="m-0 ml-auto h-full max-h-none w-full max-w-md rounded-l-3xl p-0 backdrop:bg-brand-900/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-brand-100 bg-brand-50 p-6">
          <div>
            <h2 id="help-title" className="text-2xl font-bold">
              What would you like to do?
            </h2>
            <p className="mt-1 text-ink/75">Pick one. You can always come back here.</p>
          </div>
          <button className="btn-ghost px-3" onClick={onClose}>
            Close
          </button>
        </div>
        <ul className="flex-1 space-y-2 overflow-y-auto p-4">
          {options.map(({ to, icon: Icon, title, body }) => (
            <li key={to}>
              <Link
                to={to}
                onClick={onClose}
                className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4 transition hover:border-brand-600 hover:bg-brand-50"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-brand-900">{title}</span>
                  <span className="block text-sm text-ink/70">{body}</span>
                </span>
                <ArrowRight aria-hidden="true" className="h-5 w-5 text-brand-600 transition group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-brand-100 p-6 text-sm">
          <p className="font-bold">Text too small?</p>
          <TextSizeToggle />
          <p className="mt-4 text-ink/70">
            Pressed something by mistake? That's fine. Nothing here is permanent, and you can go back with your browser's
            back button.
          </p>
        </div>
      </div>
    </dialog>
  );
}
