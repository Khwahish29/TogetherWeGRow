import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ChevronDown,
  GraduationCap,
  Home as HomeIcon,
  Inbox,
  LayoutGrid,
  LifeBuoy,
  Lightbulb,
  LogOut,
  PlusCircle,
  MessageCircleQuestion,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { getApplications, getRequests, logOut } from "../lib/store";
import { useStore } from "../lib/useStore";
import { GoogleTranslate } from "./GoogleTranslate";
import { HelpPanel } from "./HelpPanel";
import { Logo } from "./Logo";
import { TextSizeToggle } from "./TextSizeToggle";
import { Avatar } from "./ui";

interface NavItem {
  to: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  /** Other paths that belong to this section, for the active state. */
  also?: string[];
  exact?: boolean;
}

const PUBLIC_NAV: NavItem[] = [
  { to: "/explore", label: "Home", icon: HomeIcon, exact: true, also: ["/introduce"] },
  { to: "/questions", label: "Share What You Know", short: "Share", icon: MessageCircleQuestion },
  { to: "/mentors", label: "Find Mentors", short: "Mentors", icon: Search, also: ["/marketplace"] },
  { to: "/opportunities", label: "Opportunities", short: "Work", icon: Briefcase, also: ["/careers", "/next-chapter"] },
  { to: "/learn", label: "Learn", icon: Lightbulb, also: ["/resume", "/vibe-check"] },
];

const EMPLOYER_NAV: NavItem[] = [
  { to: "/employer", label: "Portal", icon: LayoutGrid, exact: true, also: ["/employer/edit"] },
  { to: "/employer/new", label: "Post a role", short: "Post", icon: PlusCircle },
  { to: "/opportunities", label: "Opportunities", short: "Listings", icon: Briefcase },
  { to: "/mentors", label: "Find Mentors", short: "People", icon: Search },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.to || (item.also ?? []).some((p) => pathname.startsWith(p));
  return [item.to, ...(item.also ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function AccountMenu({ waiting, onLogOut }: { waiting: number; onLogOut: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!user) return null;
  const employer = user.roles.length === 1 && user.roles[0] === "employer";
  const item = "flex min-h-[48px] items-center gap-3 rounded-xl px-3 font-medium text-ink hover:bg-brand-50";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Your account${waiting ? `, ${waiting} waiting for you` : ""}`}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full p-0.5 hover:bg-brand-50 sm:min-h-[48px] sm:min-w-[48px] sm:p-1 sm:pr-2"
      >
        <span className="relative">
          <Avatar name={user.name} size="sm" />
          {waiting > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-600 px-1 text-xs font-semibold text-white ring-2 ring-warm-50 xl:hidden">
              {waiting}
            </span>
          )}
        </span>
        <ChevronDown aria-hidden="true" className={`hidden h-4 w-4 text-muted transition sm:block ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-warm-200 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(20,43,33,0.35)]">
          <div className="px-3 pb-2 pt-1">
            <p className="font-semibold text-brand-900">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.org?.name ?? user.email}</p>
          </div>
          <div className="divider my-1" />
          <Link to="/profile" className={item}>
            <UserRound aria-hidden="true" className="h-5 w-5 text-brand-600" /> My profile
          </Link>
          {!employer && (
            <>
              <Link to="/requests" className={item}>
                <Inbox aria-hidden="true" className="h-5 w-5 text-brand-600" /> Requests & sessions
                {waiting > 0 && <span className="ml-auto rounded-full bg-warm-600 px-2 text-sm font-semibold text-white">{waiting}</span>}
              </Link>
              <Link to="/marketplace" className={item}>
                <GraduationCap aria-hidden="true" className="h-5 w-5 text-brand-600" /> Paid mentoring sessions
              </Link>
            </>
          )}
          <div className="divider my-1" />
          <button type="button" className={`${item} w-full text-left`} onClick={onLogOut}>
            <LogOut aria-hidden="true" className="h-5 w-5 text-brand-600" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  const requests = useStore(getRequests, []);
  const applications = useStore(getApplications, []);
  const waiting = user
    ? requests.filter((r) => r.toId === user.id && r.status === "pending").length +
      applications.filter((a) => a.workerId === user.id && a.status === "invited" && a.initiatedBy === "employer" && !a.reply).length
    : 0;
  const employerOnly = Boolean(user?.roles.includes("employer") && user.roles.length === 1);
  // The logo always links home, so the desktop menu can stay short.
  const nav: NavItem[] = employerOnly
    ? EMPLOYER_NAV
    : user
      ? [...PUBLIC_NAV.filter((n) => n.to !== "/explore"), { to: "/dashboard", label: "My Home", icon: LayoutGrid, also: ["/requests", "/profile"] }]
      : PUBLIC_NAV.filter((n) => n.to !== "/explore");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  async function handleLogOut() {
    await logOut();
    navigate("/explore");
  }

  // Mobile tab bar: five clear destinations.
  const tabs: (NavItem & { badge?: number })[] = employerOnly
    ? EMPLOYER_NAV
    : user
      ? [
          { to: "/dashboard", label: "My Home", icon: HomeIcon, also: ["/profile", "/requests"], badge: waiting },
          { to: "/questions", label: "Share", icon: MessageCircleQuestion },
          { to: "/mentors", label: "Mentors", icon: Search, also: ["/marketplace"] },
          { to: "/opportunities", label: "Work", icon: Briefcase, also: ["/careers", "/next-chapter"] },
          { to: "/learn", label: "Learn", icon: Lightbulb, also: ["/resume", "/vibe-check"] },
        ]
      : [
          { to: "/explore", label: "Home", icon: HomeIcon, exact: true, also: ["/introduce"] },
          { to: "/questions", label: "Share", icon: MessageCircleQuestion },
          { to: "/mentors", label: "Mentors", icon: Search, also: ["/marketplace"] },
          { to: "/opportunities", label: "Work", icon: Briefcase, also: ["/careers", "/next-chapter"] },
          { to: "/learn", label: "Learn", icon: Lightbulb, also: ["/resume", "/vibe-check"] },
        ];

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-warm-200/80 bg-warm-50/90 backdrop-blur-md print:hidden">
        <div className="container-wide flex h-[72px] items-center justify-between gap-2 max-sm:px-4 sm:gap-4">
          <Link to="/" className="rounded-xl" aria-label="TogetherWeGrow, home">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden h-full items-stretch xl:flex">
            {nav.map((item) => {
              const active = isActive(location.pathname, item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center whitespace-nowrap px-3 font-medium transition-colors ${
                    active ? "text-brand-900" : "text-muted hover:text-brand-800"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-brand-700 transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center sm:gap-0.5">
            <GoogleTranslate />
            <button
              type="button"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full px-2 font-medium text-brand-800 hover:bg-brand-50 sm:min-h-[48px] sm:min-w-[48px] sm:px-3"
              onClick={() => setHelpOpen(true)}
              aria-label="Get a little help"
            >
              <LifeBuoy aria-hidden="true" className="h-5 w-5" />
              <span className="hidden 2xl:inline">Get a little help</span>
            </button>
            {user && !employerOnly && (
              <Link
                to="/requests"
                aria-label={`Requests${waiting ? `, ${waiting} waiting for you` : ""}`}
                className="relative hidden min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-brand-800 hover:bg-brand-50 xl:flex"
              >
                <Inbox aria-hidden="true" className="h-5 w-5" />
                {waiting > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-600 px-1 text-xs font-semibold text-white">
                    {waiting}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <AccountMenu waiting={waiting} onLogOut={handleLogOut} />
            ) : (
              <>
                <Link to="/login" className="hidden min-h-[48px] items-center whitespace-nowrap rounded-full px-4 font-medium text-brand-800 hover:bg-brand-50 sm:flex">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary hidden whitespace-nowrap px-5 sm:inline-flex">
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>


      <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none xl:pb-0 print:pb-0">
        <Outlet />
      </main>

      <footer className="mb-[76px] bg-brand-900 text-brand-100 xl:mb-0 print:hidden">
        <div className="container-wide grid gap-10 py-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo light />
            <p className="mt-4 max-w-sm font-serif text-xl leading-snug text-white">
              Experience never expires. Let it earn, not just endure.
            </p>
          </div>
          <nav aria-label="Footer" className="text-[0.95rem] md:col-span-2">
            <p className="font-semibold text-white">Explore</p>
            <ul className="mt-3 space-y-2.5">
              <li><Link className="hover:text-white hover:underline" to="/questions">Share what you know</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/mentors">Find a mentor</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/opportunities">Opportunities</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/marketplace">Mentoring sessions</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/learn">Learn your way</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/vibe-check">Vibe Check</Link></li>
            </ul>
          </nav>
          <nav aria-label="About" className="text-[0.95rem] md:col-span-2">
            <p className="font-semibold text-white">About</p>
            <ul className="mt-3 space-y-2.5">
              <li><Link className="hover:text-white hover:underline" to="/about">Our story</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/about#safety">Safety & support</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/introduce">For family and friends</Link></li>
              <li><Link className="hover:text-white hover:underline" to="/signup?role=employer">For organizations</Link></li>
            </ul>
          </nav>
          <div className="text-[0.95rem] md:col-span-4">
            <p className="font-semibold text-white">Reading comfort</p>
            <p className="mt-1">Make the text bigger anytime.</p>
            <TextSizeToggle dark />
            <p className="mt-6 text-sm text-brand-200">
              Organizations and members aren't verified by us. No payments are taken through TogetherWeGrow.{" "}
              <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link> ·{" "}
              <Link to="/safety" className="underline">Safety</Link>
            </p>
          </div>
        </div>
      </footer>

      <nav
        aria-label="Quick"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-200 bg-white/95 backdrop-blur xl:hidden print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => {
            const active = isActive(location.pathname, t);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-[68px] flex-col items-center justify-center gap-1 whitespace-nowrap text-[13px] font-medium ${
                    active ? "text-brand-800" : "text-muted"
                  }`}
                >
                  <span aria-hidden="true" className={`absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-brand-700 ${active ? "" : "hidden"}`} />
                  <span className={`flex h-8 w-12 items-center justify-center rounded-full ${active ? "bg-brand-100" : ""}`}>
                    <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
                  </span>
                  {t.short ?? t.label}
                  {t.badge ? (
                    <span className="absolute right-[18%] top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-600 px-1 text-xs font-semibold text-white">
                      {t.badge}
                      <span className="sr-only"> waiting</span>
                    </span>
                  ) : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
