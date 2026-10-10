import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, ArrowLeft, ArrowRight, Building2, Check, GraduationCap, HeartHandshake, Hammer } from "lucide-react";
import { setTextSize } from "../components/TextSizeToggle";
import { LanguagePicker } from "../components/LanguagePicker";
import { browserLangCode } from "../i18n/languages";
import { forgotPassword, logIn, resetPassword, signUp } from "../lib/store";
import type { Role } from "../lib/types";

const COMFORT_OPTIONS = [
  "Larger text",
  "Speaking instead of typing",
  "Taking things one step at a time",
  "A person to help me get set up",
];

const ROLE_OPTIONS: { value: Role; title: string; body: string; icon: typeof Hammer }[] = [
  { value: "mentor", title: "Share my experience", body: "Offer paid mentoring, training or advice based on your working life.", icon: Hammer },
  { value: "learner", title: "Learn something new", body: "Learn practical skills from experienced people, or technology at your own pace.", icon: GraduationCap },
  { value: "buddy", title: "Be a digital buddy", body: "Patiently help others feel at home with technology.", icon: HeartHandshake },
  { value: "family", title: "Support someone I love", body: "Help a parent, grandparent or friend take a first step, without deciding for them.", icon: Heart },
  { value: "employer", title: "Offer paid work", body: "For workshops, schools and community groups posting mentoring, training or advisory roles.", icon: Building2 },
];

const STEP_TITLES = ["How you'll take part", "A few details", "Make it comfortable"];

/** Two-column frame: a calm message on the left, the task on the right. */
function AuthFrame({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className="container-wide grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-5 lg:pt-6">{aside}</aside>
      <div className="lg:col-span-7">{children}</div>
    </div>
  );
}

function Steps({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Sign-up steps">
      {STEP_TITLES.map((t, i) => (
        <li key={t} className="flex items-center gap-3" aria-current={i === current ? "step" : undefined}>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              i < current ? "bg-brand-700 text-white" : i === current ? "bg-warm-400 text-brand-900" : "bg-warm-100 text-muted"
            }`}
          >
            {i < current ? <Check aria-hidden="true" className="h-4 w-4" /> : i + 1}
          </span>
          <span className={`font-medium ${i === current ? "text-brand-900" : "text-muted"}`}>
            <span className="sr-only">Step {i + 1}: </span>
            {t}
          </span>
          {i < STEP_TITLES.length - 1 && <span aria-hidden="true" className="hidden h-px w-6 bg-warm-200 sm:block" />}
        </li>
      ))}
    </ol>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preset = params.get("role") as Role | null;
  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState<Role[]>(preset ? [preset] : []);
  const [comfort, setComfort] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(() => [browserLangCode()]);
  const [details, setDetails] = useState({ name: "", email: "", location: "", password: "", org: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const detailsForm = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const go = (n: number) => {
    setError(null);
    setStep(n);
    requestAnimationFrame(() => headingRef.current?.focus());
  };
  const toggle = (role: Role) => setRoles((r) => (r.includes(role) ? r.filter((x) => x !== role) : [...r, role]));
  const set = (k: keyof typeof details) => (e: React.ChangeEvent<HTMLInputElement>) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  async function create() {
    setBusy(true);
    setError(null);
    try {
      await signUp({
        name: details.name,
        email: details.email,
        password: details.password,
        location: details.location,
        roles,
        comfort,
        languages,
        org: roles.includes("employer") ? { name: details.org.trim(), kind: "workshop", about: "", verified: false } : undefined,
      });
      if (comfort.includes("Larger text")) setTextSize("large");
      const only = roles.length === 1 ? roles[0] : null;
      navigate(only === "employer" ? "/employer" : only === "family" ? "/dashboard" : "/profile/create");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
      go(1);
    }
  }

  function submitStep(e: FormEvent) {
    e.preventDefault();
    if (step === 0) {
      if (roles.length === 0) {
        setError("Please choose at least one way you'd like to take part. You can change this later.");
        return;
      }
      go(1);
    } else if (step === 1) {
      if (!detailsForm.current?.reportValidity()) return;
      go(2);
    } else {
      create();
    }
  }

  return (
    <AuthFrame
      aside={
        <>
          <p className="eyebrow">Join TogetherWeGrow</p>
          <p className="mt-4 font-serif text-4xl leading-tight text-brand-900 sm:text-5xl">Your experience is welcome here.</p>
          <ul className="mt-8 space-y-4 text-lg text-muted">
            {["It's free, and takes about five minutes.", "We never ask your age.", "You can change any answer later.", "Choose as many roles as you like."].map((t) => (
              <li key={t} className="flex gap-3">
                <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-600" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-muted">
            Already a member?{" "}
            <Link to="/login" className="link">
              Log in
            </Link>
          </p>
        </>
      }
    >
      <div className="card p-6 sm:p-10">
        <Steps current={step} />
        <form ref={detailsForm} onSubmit={submitStep} noValidate={step !== 1} className="mt-8">
          {step === 0 && (
            <fieldset>
              <legend>
                <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none sm:text-4xl">
                  How would you like to take part?
                </h1>
                <p className="mt-2 text-muted">Choose any that fit. Many people do more than one.</p>
              </legend>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map(({ value, title, body, icon: Icon }) => {
                  const checked = roles.includes(value);
                  return (
                    <label
                      key={value}
                      className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border-2 p-5 transition ${
                        checked ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(value)} />
                      <span className="flex items-center justify-between">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${checked ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-700"}`}>
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span
                          aria-hidden="true"
                          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${checked ? "border-brand-700 bg-brand-700 text-white" : "border-warm-200"}`}
                        >
                          {checked && <Check className="h-4 w-4" />}
                        </span>
                      </span>
                      <span>
                        <span className="block text-lg font-semibold text-brand-900">{title}</span>
                        <span className="mt-1 block text-[0.95rem] text-muted">{body}</span>
                      </span>
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:ring-4 peer-focus-visible:ring-warm-400" />
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none sm:text-4xl">
                A few details
              </h1>
              {roles.includes("employer") && (
                <div>
                  <label htmlFor="org" className="label">
                    Organization name
                  </label>
                  <input id="org" name="org" className="input" required autoComplete="organization" value={details.org} onChange={set("org")} />
                </div>
              )}
              <div>
                <label htmlFor="name" className="label">
                  Your name
                </label>
                <input id="name" name="name" className="input" required autoComplete="name" value={details.name} onChange={set("name")} />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input id="email" name="email" type="email" className="input" required autoComplete="email" value={details.email} onChange={set("email")} />
              </div>
              <div>
                <label htmlFor="location" className="label">
                  Town or city <span className="font-normal text-muted">(optional, helps find people nearby)</span>
                </label>
                <input id="location" name="location" className="input" autoComplete="address-level2" value={details.location} onChange={set("location")} />
              </div>
              <div>
                <label htmlFor="signup-langs" className="label">
                  Languages you speak <span className="font-normal text-muted">(we match you with people you can talk to)</span>
                </label>
                <LanguagePicker id="signup-langs" values={languages} onChange={setLanguages} />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Choose a password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-describedby="pw-hint"
                  value={details.password}
                  onChange={set("password")}
                />
                <p id="pw-hint" className="hint mt-1.5">
                  At least 8 characters. A short sentence you'll remember works well.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <fieldset>
              <legend>
                <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none sm:text-4xl">
                  Is there anything that would make this easier?
                </h1>
                <p className="mt-2 text-muted">Optional. We'll set things up to suit you, and you can change this anytime.</p>
              </legend>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {COMFORT_OPTIONS.map((c) => {
                  const on = comfort.includes(c);
                  return (
                    <label
                      key={c}
                      className={`flex min-h-[64px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-5 font-medium transition ${
                        on ? "border-brand-700 bg-brand-50 text-brand-900" : "border-warm-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-brand-700"
                        checked={on}
                        onChange={() => setComfort((x) => (on ? x.filter((y) => y !== c) : [...x, c]))}
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {error && (
            <p role="alert" className="notice mt-6">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-warm-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <button type="button" className="btn-ghost" onClick={() => go(step - 1)}>
                <ArrowLeft aria-hidden="true" className="h-5 w-5" /> Back
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {step === 2 && comfort.length === 0 && (
                <span className="self-center text-muted">Nothing needed? That's fine.</span>
              )}
              <button type="submit" className="btn-primary px-8 text-lg" disabled={busy}>
                {step < 2 ? (
                  <>
                    Continue <ArrowRight aria-hidden="true" className="h-5 w-5" />
                  </>
                ) : busy ? (
                  "Creating your account…"
                ) : (
                  "Create my account"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AuthFrame>
  );
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState<"no" | "asking" | "sent" | "no-email">("no");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const u = await logIn(String(form.get("email")), String(form.get("password")));
      navigate(u.roles.length === 1 && u.roles[0] === "employer" && from === "/dashboard" ? "/employer" : from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const out = await forgotPassword(String(form.get("forgot-email")));
      setForgot(out.emailEnabled ? "sent" : "no-email");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame
      aside={
        <>
          <p className="eyebrow">Welcome back</p>
          <p className="mt-4 font-serif text-4xl leading-tight text-brand-900 sm:text-5xl">Good to see you again.</p>
          <p className="mt-6 text-lg text-muted">
            New here?{" "}
            <Link to="/signup" className="link">
              Create a free account
            </Link>
          </p>
          <p className="mt-4 text-lg text-muted">
            Or simply{" "}
            <Link to="/start" className="link">
              start with one question
            </Link>
            . No email needed.
          </p>
        </>
      }
    >
      <div className="card p-6 sm:p-10">
        {forgot === "no" ? (
          <>
            <h1 className="text-3xl sm:text-4xl">Sign in</h1>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              <button type="submit" className="btn-primary w-full text-lg" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <button type="button" className="link mt-6" onClick={() => setForgot("asking")}>
              Forgot your password?
            </button>
          </>
        ) : forgot === "asking" ? (
          <>
            <h1 className="text-3xl sm:text-4xl">Choose a new password</h1>
            <p className="mt-3 text-muted">Tell us your email and we'll send you a link to choose a new password.</p>
            <form onSubmit={handleForgot} className="mt-8 space-y-5">
              <div>
                <label htmlFor="forgot-email" className="label">
                  Email address
                </label>
                <input id="forgot-email" name="forgot-email" type="email" className="input" required autoComplete="email" />
              </div>
              {error && (
                <p role="alert" className="notice">
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full text-lg" disabled={busy}>
                Send me a link
              </button>
            </form>
            <button type="button" className="link mt-6" onClick={() => setForgot("no")}>
              Back to sign in
            </button>
          </>
        ) : (
          <div role="status">
            <h1 className="text-3xl sm:text-4xl">{forgot === "sent" ? "Check your email" : "We can't send email yet"}</h1>
            <p className="mt-4 text-lg">
              {forgot === "sent"
                ? "If there's an account with that email, a link is on its way. It works for one hour. Please check your spam folder too."
                : "Password reset emails aren't switched on for this site yet. Please ask the person who runs it to help, or create a new account."}
            </p>
            <button type="button" className="link mt-6" onClick={() => setForgot("no")}>
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </AuthFrame>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await resetPassword(params.get("token") ?? "", String(form.get("new-password")));
      navigate("/account", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page max-w-xl py-14">
      <div className="card p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl">Choose a new password</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="new-password" className="label">
              New password
            </label>
            <input id="new-password" name="new-password" type="password" minLength={8} className="input" required autoComplete="new-password" />
            <p className="hint mt-1.5">At least 8 characters.</p>
          </div>
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full text-lg" disabled={busy}>
            Save my new password
          </button>
        </form>
      </div>
    </div>
  );
}
