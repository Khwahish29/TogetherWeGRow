import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Home as HomeIcon,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { getRequests, logOut } from "../lib/store";
import { useStore } from "../lib/useStore";
import { HelpPanel } from "./HelpPanel";
import { Logo } from "./Logo";
import { TextSizeToggle } from "./TextSizeToggle";
import { Avatar } from "./ui";

const NAV = [
  { to: "/mentors", label: "Find Mentors", icon: Search },
  { to: "/marketplace", label: "Sessions", icon: GraduationCap },
  { to: "/careers", label: "Careers", icon: Briefcase },
  { to: "/learn", label: "Learn", icon: Lightbulb },
];

export function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const requests = useStore(getRequests, []);
  const waiting = user ? requests.filter((r) => r.toId === user.id && r.status === "pending").length : 0;

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  async function handleLogOut() {
    await logOut();
    navigate("/");
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-bold transition ${
      isActive ? "bg-brand-700 text-white shadow-sm" : "text-brand-800 hover:bg-brand-100"
    }`;

  const RequestsLink = (
    <NavLink to="/requests" className={navClass} aria-label={`Requests${waiting ? `, ${waiting} waiting` : ""}`}>
      <Inbox aria-hidden="true" className="h-5 w-5" />
      <span>Requests</span>
      {waiting > 0 && (
        <span className="ml-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-warm-500 px-1.5 text-xs text-white">
          {waiting}
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn-primary">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 print:hidden border-b border-brand-100/80 bg-warm-50/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to={user ? "/dashboard" : "/"} className="rounded-xl" aria-label="TogetherWeGrow home">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
            {user && (
              <NavLink to="/dashboard" className={navClass}>
                <LayoutDashboard aria-hidden="true" className="h-5 w-5" />
                My Home
              </NavLink>
            )}
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navClass}>
                <Icon aria-hidden="true" className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <NavLink
                to="/requests"
                aria-label={`Requests${waiting ? `, ${waiting} waiting` : ""}`}
                title="Requests"
                className={({ isActive }) =>
                  `relative hidden h-11 w-11 items-center justify-center rounded-full xl:inline-flex ${
                    isActive ? "bg-brand-700 text-white" : "text-brand-800 hover:bg-brand-100"
                  }`
                }
              >
                <Inbox aria-hidden="true" className="h-5 w-5" />
                {waiting > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warm-500 px-1 text-xs font-bold text-white">
                    {waiting}
                  </span>
                )}
              </NavLink>
            )}
            <button className="btn-ghost px-3" aria-label="Help" title="Help: what would you like to do?" onClick={() => setHelpOpen(true)}>
              <LifeBuoy aria-hidden="true" className="h-5 w-5" />
              <span className="hidden sm:inline xl:hidden 2xl:inline">Help</span>
            </button>
            <div className="hidden items-center gap-2 xl:flex">
              {user ? (
                <>
                  <Link to="/profile" className="rounded-full" aria-label="My profile">
                    <Avatar name={user.name} size="sm" />
                  </Link>
                  <button className="btn-ghost whitespace-nowrap px-3" onClick={handleLogOut}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost whitespace-nowrap px-3">
                    Log in
                  </Link>
                  <Link to="/signup" className="btn-primary whitespace-nowrap">
                    Join free
                  </Link>
                </>
              )}
            </div>
            <button
              className="btn-secondary px-3 xl:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="Main" className="mx-auto grid max-w-7xl gap-1 px-4 pb-4 sm:grid-cols-2 sm:px-6 xl:hidden">
            {user && (
              <NavLink to="/dashboard" className={navClass}>
                <LayoutDashboard aria-hidden="true" className="h-5 w-5" /> My Home
              </NavLink>
            )}
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navClass}>
                <Icon aria-hidden="true" className="h-5 w-5" /> {label}
              </NavLink>
            ))}
            {user ? (
              <>
                {RequestsLink}
                <NavLink to="/profile" className={navClass}>
                  <UserRound aria-hidden="true" className="h-5 w-5" /> My Profile
                </NavLink>
                <button className="btn-secondary mt-2 sm:col-span-2" onClick={handleLogOut}>
                  <LogOut aria-hidden="true" className="h-5 w-5" /> Log out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:col-span-2">
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Join free
                </Link>
              </div>
            )}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1 pb-24 xl:pb-0 print:pb-0">
        <Outlet />
      </main>

      <footer className="print:hidden mb-[72px] border-t border-brand-100 bg-brand-900 text-brand-50 xl:mb-0">
        <div className="container-page grid gap-10 py-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo light />
            <p className="mt-3 text-sm text-brand-100">
              Experience is worth paying for. Asking for help is never something to be embarrassed about.
            </p>
          </div>
          <nav aria-label="Footer" className="text-sm">
            <p className="font-bold text-white">Explore</p>
            <ul className="mt-3 space-y-2">
              <li><Link className="hover:underline" to="/mentors">Find a mentor</Link></li>
              <li><Link className="hover:underline" to="/marketplace">Mentoring sessions</Link></li>
              <li><Link className="hover:underline" to="/learn">Learn your way</Link></li>
              <li><Link className="hover:underline" to="/about">Our story</Link></li>
              <li><Link className="hover:underline" to="/about#safety">Safety & support</Link></li>
            </ul>
          </nav>
          <div className="text-sm">
            <p className="font-bold text-white">Reading comfort</p>
            <p className="mt-1 text-brand-100">Make the text bigger anytime.</p>
            <TextSizeToggle dark />
          </div>
          <div className="text-sm text-brand-100">
            <p className="font-bold text-white">Our promises</p>
            <ul className="mt-3 space-y-2">
              <li>Prices are always shown up front.</li>
              <li>AI drafts are labelled, and you approve them.</li>
              <li>You can say no, change your mind, or start again.</li>
              <li>Demo listings are clearly marked. No payments are taken in this prototype.</li>
            </ul>
          </div>
        </div>
      </footer>

      <nav
        aria-label="Quick"
        className="print:hidden fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur xl:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {[
            user ? { to: "/dashboard", label: "Home", icon: HomeIcon } : { to: "/", label: "Home", icon: HomeIcon },
            { to: "/mentors", label: "Mentors", icon: Search },
            { to: "/learn", label: "Learn", icon: Lightbulb },
            user ? { to: "/requests", label: "Requests", icon: Inbox } : { to: "/marketplace", label: "Sessions", icon: GraduationCap },
            user ? { to: "/profile", label: "Me", icon: UserRound } : { to: "/login", label: "Log in", icon: UserRound },
          ].map(({ to, label, icon: Icon }) => (
            <li key={label}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-xs font-bold ${
                    isActive ? "text-brand-700" : "text-ink/60"
                  }`
                }
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
                {label}
                {label === "Requests" && waiting > 0 && (
                  <span className="absolute right-[22%] top-2 h-2.5 w-2.5 rounded-full bg-warm-500" aria-label={`${waiting} waiting`} />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
