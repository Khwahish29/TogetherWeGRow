import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { setTextSize } from "../components/TextSizeToggle";
import { logIn, signUp } from "../lib/store";
import type { Role } from "../lib/types";

const COMFORT_OPTIONS = [
  "Larger text",
  "Speaking instead of typing",
  "Taking things one step at a time",
  "A person to help me get set up",
];

const ROLE_OPTIONS: { value: Role; title: string; body: string }[] = [
  { value: "mentor", title: "Share my experience", body: "Offer paid mentoring, training, or advice based on your work." },
  { value: "learner", title: "Learn something new", body: "Learn practical skills from mentors, or technology at your own pace." },
  { value: "buddy", title: "Be a digital buddy", body: "Patiently help others feel comfortable with technology." },
  { value: "employer", title: "Offer paid work (organisations)", body: "Workshops, schools and community groups posting mentoring, training or advisory roles." },
];

function AuthShell({ title, children, footer }: { title: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12">
      <div className="card w-full max-w-xl p-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {children}
        <p className="mt-6 text-center">{footer}</p>
      </div>
    </div>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preset = params.get("role") as Role | null;
  const [roles, setRoles] = useState<Role[]>(preset ? [preset] : []);
  const [comfort, setComfort] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (roles.length === 0) {
      setError("Please choose at least one way you'd like to take part. You can change this later.");
      return;
    }
    setBusy(true);
    try {
      await signUp({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        location: String(form.get("location") ?? ""),
        roles,
        comfort,
        org: roles.includes("employer")
          ? { name: String(form.get("org") ?? "").trim(), kind: "workshop", about: "", verified: false }
          : undefined,
      });
      if (comfort.includes("Larger text")) setTextSize("large");
      navigate(roles.length === 1 && roles[0] === "employer" ? "/employer" : "/profile/create");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const toggle = (role: Role) => setRoles((r) => (r.includes(role) ? r.filter((x) => x !== role) : [...r, role]));

  return (
    <AuthShell
      title="Join TogetherWeGrow"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-700 underline">
            Log in
          </Link>
        </>
      }
    >
      <p className="mt-2 text-ink/80">It's free. We never ask your age. What you can do here is up to you.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate={false}>
        <fieldset>
          <legend className="label">How would you like to take part? Choose any.</legend>
          <div className="mt-2 grid gap-3">
            {ROLE_OPTIONS.map((opt) => {
              const checked = roles.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition ${
                    checked ? "border-brand-600 bg-brand-50" : "border-brand-100 hover:border-brand-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-6 w-6 shrink-0 accent-brand-700"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                  />
                  <span>
                    <span className="block font-bold text-brand-900">{opt.title}</span>
                    <span className="block text-sm text-ink/75">{opt.body}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">
            Is there anything that would make this easier for you?{" "}
            <span className="font-normal text-ink/60">(optional)</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMFORT_OPTIONS.map((c) => {
              const on = comfort.includes(c);
              return (
                <label
                  key={c}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-sm font-bold ${
                    on ? "border-brand-700 bg-brand-50 text-brand-900" : "border-brand-100 text-ink/80"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand-700"
                    checked={on}
                    onChange={() => setComfort((x) => (on ? x.filter((y) => y !== c) : [...x, c]))}
                  />
                  {c}
                </label>
              );
            })}
          </div>
          <p className="hint mt-2">We'll set things up to suit you. You can change this anytime.</p>
        </fieldset>
        {roles.includes("employer") && (
          <div>
            <label htmlFor="org" className="label">
              Organisation name
            </label>
            <input id="org" name="org" className="input" required autoComplete="organization" />
          </div>
        )}
        <div>
          <label htmlFor="name" className="label">
            Your name
          </label>
          <input id="name" name="name" className="input" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="location" className="label">
            Town or city <span className="font-normal text-ink/60">(optional, helps find people nearby)</span>
          </label>
          <input id="location" name="location" className="input" autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Choose a password
          </label>
          <input id="password" name="password" type="password" className="input" required minLength={6} autoComplete="new-password" />
          <p className="hint mt-1">At least 6 characters. Demo only: stored in this browser, so don't reuse a real password.</p>
        </div>
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full text-lg" disabled={busy}>
          {busy ? "Creating your account…" : "Create my account"}
        </button>
      </form>
    </AuthShell>
  );
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const u = await logIn(String(form.get("email")), String(form.get("password")));
      navigate(u.roles.length === 1 && u.roles[0] === "employer" && from === "/dashboard" ? "/employer" : from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function demoLogin(email: string) {
    const u = await logIn(email, "demo1234");
    navigate(u.roles.length === 1 && u.roles[0] === "employer" && from === "/dashboard" ? "/employer" : from, { replace: true });
  }

  return (
    <AuthShell
      title="Welcome back"
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-bold text-brand-700 underline">
            Create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input id="password" name="password" type="password" className="input" required autoComplete="current-password" />
        </div>
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full text-lg">
          Log in
        </button>
      </form>
      <div className="mt-8 rounded-xl bg-brand-50 p-4">
        <p className="font-bold text-brand-900">Exploring the demo?</p>
        <p className="text-sm text-ink/75">Step into a sample account:</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button className="btn-secondary" onClick={() => demoLogin("robert@demo.twg")}>
            Robert · carpenter
          </button>
          <button className="btn-secondary" onClick={() => demoLogin("maya@demo.twg")}>
            Maya · student
          </button>
          <button className="btn-secondary sm:col-span-2" onClick={() => demoLogin("hiring@woodcenter.demo")}>
            Community Woodworking Center · employer
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
