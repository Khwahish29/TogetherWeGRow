import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Mail } from "lucide-react";
import { useAuth } from "../lib/auth";
import { getNotes, getRequests } from "../lib/store";
import { useStore } from "../lib/useStore";
import { GoogleTranslate } from "../components/GoogleTranslate";
import { Logo } from "../components/Logo";
import { TextSizeToggle } from "../components/TextSizeToggle";

/**
 * The calm frame around every simple screen: a logo, a Back button, a Home button.
 * No menus. Nothing else competing for attention.
 */
export function SimpleLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const atStart = location.pathname === "/start";
  const { user } = useAuth();
  const notes = useStore(getNotes, []);
  const requests = useStore(getRequests, []);
  const waiting = user
    ? notes.filter((n) => n.toId === user.id && !n.read).length + requests.filter((r) => r.toId === user.id && r.status === "pending").length
    : 0;

  // Back goes to the previous screen, or up one level if someone arrived here directly.
  function goBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(location.pathname.split("/").slice(0, -1).join("/") || "/start");
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    // Move focus to the page's question so screen readers announce the new screen.
    requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus());
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col bg-warm-50">
      <a href="#main" className="btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]">
        Skip to main content
      </a>
      <header className="border-b border-warm-200/80 print:hidden">
        <div className="mx-auto flex h-[76px] w-full max-w-3xl items-center justify-between gap-1 px-3 sm:gap-2 sm:px-6">
          {atStart ? (
            <Link to="/" aria-label="TogetherWeGrow, about the project" className="rounded-xl">
              <Logo />
            </Link>
          ) : (
            <button type="button" onClick={goBack} className="flex min-h-[52px] items-center gap-1.5 rounded-full px-2.5 text-lg font-semibold text-brand-800 hover:bg-brand-100 sm:gap-2 sm:px-4">
              <ArrowLeft aria-hidden="true" className="h-6 w-6" /> Back
            </button>
          )}
          <div className="flex items-center gap-1">
            {user && location.pathname !== "/inbox" && (
              <Link
                to="/inbox"
                aria-label={waiting ? `Your messages, ${waiting} new` : "Your messages"}
                className="relative flex min-h-[52px] min-w-[52px] items-center justify-center gap-1.5 rounded-full px-2.5 text-lg font-semibold text-brand-800 hover:bg-brand-100 sm:px-4"
              >
                <Mail aria-hidden="true" className="h-6 w-6" />
                <span className="hidden sm:inline">Messages</span>
                {waiting > 0 && (
                  <span aria-hidden="true" className="absolute right-0.5 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-600 px-1 text-xs font-bold text-white sm:static">
                    {waiting}
                  </span>
                )}
              </Link>
            )}
            <GoogleTranslate />
            {!atStart && (
              <Link to="/start" className="flex min-h-[52px] items-center gap-1.5 rounded-full px-2.5 text-lg font-semibold text-brand-800 hover:bg-brand-100 sm:gap-2 sm:px-4">
                <Home aria-hidden="true" className="h-6 w-6" /> Home
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>

      <footer className="border-t border-warm-200/80 print:hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-ink">Text size</p>
            <TextSizeToggle />
          </div>
          <nav aria-label="Footer" className="max-w-sm text-sm text-muted">
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end">
              {[
                ["/", "About us"],
                ["/impact", "Our goals"],
                ["/safety", "Safety"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
                [user ? "/account" : "/login", user ? "Your account" : "Sign in"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="underline underline-offset-4 hover:text-brand-800">
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
