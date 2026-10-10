import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { logOut } from "../lib/store";
import { Avatar } from "./ui";
import { TextSizeToggle } from "./TextSizeToggle";

const NAV = [
  { to: "/mentors", label: "Find Mentors" },
  { to: "/marketplace", label: "Mentoring Sessions" },
  { to: "/careers", label: "SkillBridge Careers" },
  { to: "/learn", label: "Learn Your Way" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-brand-900">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-9 w-9">
        <rect width="32" height="32" rx="8" fill="#23704a" />
        <path d="M16 25V14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 15c0-4 3-7 7-7 0 4-3 7-7 7zM16 18c0-3.5-2.6-6-6-6 0 3.5 2.6 6 6 6z" fill="#f8ebd6" />
      </svg>
      TogetherWeGrow
    </Link>
  );
}

export function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 font-bold ${isActive ? "bg-brand-100 text-brand-900" : "text-brand-800 hover:bg-brand-50"}`;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn-primary">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-warm-50/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 xl:flex">
            {user ? (
              <>
                <NavLink to="/dashboard" className={navClass}>
                  Dashboard
                </NavLink>
                <Link to="/profile" aria-label="My profile" className="rounded-full">
                  <Avatar name={user.name} size="sm" />
                </Link>
                <button
                  className="btn-ghost whitespace-nowrap px-3"
                  onClick={async () => {
                    await logOut();
                    navigate("/");
                  }}
                >
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
            className="btn-secondary px-4 xl:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-menu" aria-label="Main" className="container-page flex flex-col gap-1 pb-4 xl:hidden">
            {user && (
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
            )}
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/requests" className={navClass}>
                  Requests
                </NavLink>
                <NavLink to="/profile" className={navClass}>
                  My Profile
                </NavLink>
                <button className="btn-secondary mt-2" onClick={() => logOut().then(() => navigate("/"))}>
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary whitespace-nowrap">
                  Join free
                </Link>
              </div>
            )}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-brand-100 bg-brand-900 text-brand-50">
        <div className="container-page grid gap-8 py-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl font-bold text-white">TogetherWeGrow</p>
            <p className="mt-2 text-sm text-brand-100">
              Experience is worth paying for. Learning is never something to be embarrassed about.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-bold text-white">Reading comfort</p>
            <TextSizeToggle dark />
          </div>
          <div className="text-sm text-brand-100">
            <p className="font-bold text-white">About this prototype</p>
            <p className="mt-2">
              Hackathon demo. Accounts and data are stored only in this browser. Listings marked “Demo” are illustrative,
              not live offers. No payments are taken.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
