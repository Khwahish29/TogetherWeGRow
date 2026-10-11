import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Download, KeyRound, LogOut, Mail, MonitorSmartphone, Plus, ShieldCheck, Trash2, Type, UserRound, X } from "lucide-react";
import { Avatar } from "../components/ui";
import { TextSizeToggle } from "../components/TextSizeToggle";
import { useAuth } from "../lib/auth";
import {
  EXPORT_URL,
  changeEmail,
  changePassword,
  claimAccount,
  deleteAccount,
  emailEnabled,
  forgotPassword,
  logIn,
  logOut,
  logOutEverywhere,
  resetPassword,
  saveUser,
  signUp,
} from "../lib/store";
import type { User } from "../lib/types";
import { Actions, BigChoice, ErrorLine, Screen, SpeakOrType, useRun } from "./parts";

const firstOf = (name?: string) => {
  const f = (name ?? "").trim().split(" ")[0];
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : "";
};

/** Where to send someone after signing in: back to the door they last used. */
function homeFor(user: User) {
  if (user.roles.length === 1 && user.roles[0] === "employer") return "/employer";
  try {
    const last = localStorage.getItem("twg.lastChoice");
    if (last === "older") return "/roots";
    if (last === "younger") return "/growth";
  } catch {
    // ignore
  }
  return "/start";
}

/** Shown on pages that need you to be signed in. */
export function SignInFirst({ what }: { what: string }) {
  return (
    <Screen title={what} help="You'll see this once you've joined or signed in.">
      <div className="space-y-4">
        <BigChoice to="/start" icon={UserRound} label="I'm new here" sub="Start with one simple question" />
        <BigChoice to="/login" icon={KeyRound} tone="warm" label="Sign in" sub="With your email and password" />
      </div>
    </Screen>
  );
}

/** A password box with a "Show what I type" option, which prevents most typing mistakes. */
function PasswordField({ id, label, value, onChange, autoComplete, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label text-xl">
        {label} {hint && <span className="font-normal text-muted">({hint})</span>}
      </label>
      <input id={id} name={id} type={show ? "text" : "password"} className="input min-h-[60px] text-xl" autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} />
      <label className="mt-2 flex min-h-[44px] cursor-pointer items-center gap-3 text-lg">
        <input type="checkbox" className="h-5 w-5 accent-[#234638]" checked={show} onChange={(e) => setShow(e.target.checked)} />
        Show what I type
      </label>
    </div>
  );
}

function Saved({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="mt-4 rounded-2xl bg-brand-100 p-4 text-lg font-semibold text-brand-900">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Sign in, create an account, reset a password                        */
/* ------------------------------------------------------------------ */

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"signin" | "forgot" | "sent" | "no-email">("signin");
  const { run, busy, error } = useRun();

  function submit(e: FormEvent) {
    e.preventDefault();
    return run(async () => {
      const u = await logIn(email, password);
      navigate(from ?? homeFor(u), { replace: true });
    });
  }

  function forgot(e: FormEvent) {
    e.preventDefault();
    return run(async () => {
      const out = await forgotPassword(email);
      setView(out.emailEnabled ? "sent" : "no-email");
    });
  }

  if (view === "sent" || view === "no-email")
    return (
      <Screen title={view === "sent" ? "Check your email" : "We can't send email yet"} readAloud={false}>
        <p role="status" className="rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
          {view === "sent"
            ? "If there's an account with that email, a link is on its way. It works for one hour. Please look in your spam folder too."
            : "Password emails aren't switched on for this site yet. Please ask the person who runs it for help. You can also start again with just your first name."}
        </p>
        <div className="mt-6 space-y-4">
          <BigChoice onClick={() => setView("signin")} icon={KeyRound} label="Back to sign in" />
          <BigChoice to="/start" icon={UserRound} tone="warm" label="Start with one question" sub="No email needed" />
        </div>
      </Screen>
    );

  if (view === "forgot")
    return (
      <Screen title="Forgot your password?" help="It happens to everyone. Tell us your email and we'll send a link to choose a new one." readAloud={false}>
        <form onSubmit={forgot}>
          <label htmlFor="forgot-email" className="label text-xl">
            Email address
          </label>
          <input id="forgot-email" type="email" required className="input min-h-[60px] text-xl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <ErrorLine error={error} />
          <button type="submit" className="btn-primary mt-8 min-h-[64px] w-full text-xl" disabled={busy || !email.includes("@")}>
            {busy ? "One moment…" : "Send me a link"}
          </button>
        </form>
        <button type="button" className="btn-ghost mt-3 min-h-[56px] w-full text-lg" onClick={() => setView("signin")}>
          Back to sign in
        </button>
      </Screen>
    );

  return (
    <Screen title="Welcome back" help="Sign in with the email and password you chose." readAloud={false}>
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label htmlFor="email" className="label text-xl">
            Email address
          </label>
          <input id="email" name="email" type="email" required className="input min-h-[60px] text-xl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        <ErrorLine error={error} />
        <button type="submit" className="btn-primary min-h-[64px] w-full text-xl" disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <button type="button" className="btn-ghost mt-3 min-h-[56px] w-full text-lg" onClick={() => setView("forgot")}>
        I forgot my password
      </button>

      <div className="mt-10 border-t border-warm-200 pt-8">
        <p className="text-xl font-semibold text-brand-900">New here?</p>
        <div className="mt-4 space-y-4">
          <BigChoice to="/start" icon={UserRound} label="Start with one question" sub="A first name is all you need" />
          <BigChoice to="/join" icon={Mail} tone="warm" label="Create an account with my email" />
        </div>
      </div>
    </Screen>
  );
}

export function Join() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { run, busy, error } = useRun();

  if (user?.hasLogin)
    return (
      <Screen title={`You're already signed in, ${firstOf(user.name)}.`}>
        <div className="space-y-4">
          <BigChoice to={homeFor(user)} icon={UserRound} label="Carry on" />
          <BigChoice to="/account" icon={KeyRound} tone="warm" label="Your account" />
        </div>
      </Screen>
    );

  function submit(e: FormEvent) {
    e.preventDefault();
    return run(async () => {
      // If they already joined with a first name on this device, this keeps everything and adds the sign-in.
      const u = await signUp({ name: user?.name ?? name.trim(), email: email.trim(), password, roles: user?.roles ?? [], location: user?.location ?? "" });
      navigate(homeFor(u), { replace: true });
    });
  }

  return (
    <Screen title="Create your account" help="So you can sign in on any phone or computer. It's free, and we never sell your information." readAloud={false}>
      <form onSubmit={submit} className="space-y-6">
        {!user && (
          <div>
            <label htmlFor="join-name" className="label text-xl">
              Your first name
            </label>
            <input id="join-name" required className="input min-h-[60px] text-xl" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label htmlFor="join-email" className="label text-xl">
            Email address
          </label>
          <input id="join-email" type="email" required className="input min-h-[60px] text-xl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <PasswordField id="join-password" label="Choose a password" hint="at least 8 characters" value={password} onChange={setPassword} autoComplete="new-password" />
        <p className="text-lg text-muted">A short sentence you'll remember works well, like “my garden in spring”.</p>
        <ErrorLine error={error} />
        <button type="submit" className="btn-primary min-h-[64px] w-full text-xl" disabled={busy || (!user && !name.trim()) || !email.includes("@") || password.length < 8}>
          {busy ? "One moment…" : "Create my account"}
        </button>
      </form>
      <p className="mt-6 text-lg text-muted">
        By joining you agree to{" "}
        <Link to="/terms" className="link">
          how we look after each other
        </Link>{" "}
        and our{" "}
        <Link to="/privacy" className="link">
          privacy promise
        </Link>
        .
      </p>
      <p className="mt-6 text-lg">
        Already have an account?{" "}
        <Link to="/login" className="link">
          Sign in
        </Link>
      </p>
    </Screen>
  );
}

export function NewPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const { run, busy, error } = useRun();
  return (
    <Screen title="Choose a new password" help="At least 8 characters. A short sentence you'll remember works well." readAloud={false}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await resetPassword(params.get("token") ?? "", password);
            navigate("/account", { replace: true });
          });
        }}
      >
        <PasswordField id="new-password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
        <ErrorLine error={error} />
        <button type="submit" className="btn-primary mt-6 min-h-[64px] w-full text-xl" disabled={busy || password.length < 8}>
          {busy ? "One moment…" : "Save my new password"}
        </button>
      </form>
      <p className="mt-6 text-lg">
        <Link to="/login" className="link">
          Back to sign in
        </Link>
      </p>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Your account                                                         */
/* ------------------------------------------------------------------ */

export function Account() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const view = params.get("view");

  if (!loading && !user) return <SignInFirst what="Your account" />;
  if (!user) return <Screen title="Your account">{null}</Screen>;
  if (view === "about") return <AboutYou user={user} />;
  if (view === "signin") return <SigningIn user={user} />;
  if (view === "privacy") return <Privacy user={user} />;

  return (
    <Screen title={`Hello, ${firstOf(user.name)}`} help="Everything about you here, in one place. You're in charge of all of it.">
      <section className="rounded-[2rem] bg-brand-900 p-6 text-brand-100 sm:p-8" aria-label="What you do here">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="font-serif text-3xl text-white">{user.name}</p>
            <p className="text-lg">With us since {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-lg">
          {user.roles.includes("mentor") && (
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white">You share your experience</span>
              <Link to="/roots/share" className="font-semibold text-warm-400 underline underline-offset-4">
                Add more
              </Link>
            </li>
          )}
          {user.roles.includes("mentor") && (
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white">Paid sessions you offer</span>
              <Link to="/roots/earn" className="font-semibold text-warm-400 underline underline-offset-4">
                See or change
              </Link>
            </li>
          )}
          {user.roles.includes("buddy") && (
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white">You're a helper</span>
              <Link to="/growth/share" className="font-semibold text-warm-400 underline underline-offset-4">
                Change or pause
              </Link>
            </li>
          )}
          {!user.roles.includes("mentor") && !user.roles.includes("buddy") && <li className="text-white">You haven't shared anything publicly. That's completely fine.</li>}
        </ul>
      </section>

      <div className="mt-6 space-y-4">
        <BigChoice to="/inbox" icon={Mail} label="Your messages" />
        <BigChoice to="/account?view=about" icon={UserRound} tone="warm" label="About you" sub="Your name and what people see" />
        <BigChoice
          to="/account?view=signin"
          icon={KeyRound}
          tone={user.hasLogin ? "sage" : "warm"}
          label="Signing in"
          sub={user.hasLogin ? "Your email and password" : "Not set up yet. Worth doing soon"}
        />
        <BigChoice to="/account?view=privacy" icon={ShieldCheck} tone="sage" label="Privacy and your information" sub="Who can find you, and your data" />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 ring-1 ring-warm-200">
        <p className="flex items-center gap-3 text-xl font-semibold text-brand-900">
          <Type aria-hidden="true" className="h-6 w-6 text-warm-700" /> Text size
        </p>
        <TextSizeToggle />
      </div>
    </Screen>
  );
}

function BackToAccount() {
  return (
    <p className="mt-10 text-lg">
      <Link to="/account" className="link">
        Back to your account
      </Link>
    </p>
  );
}

/** Name, where you are, a few words about you, and what you could teach. */
function AboutYou({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location);
  const [bio, setBio] = useState(user.bio);
  const [skills, setSkills] = useState(user.skills);
  const [adding, setAdding] = useState("");
  const [saved, setSaved] = useState(false);
  const { run, busy, error } = useRun();
  const dirty = name.trim() !== user.name || location.trim() !== user.location || bio.trim() !== user.bio || skills.join("|") !== user.skills.join("|");

  // Anything they change makes the "Saved" note out of date.
  useEffect(() => setSaved(false), [name, location, bio, skills]);

  const addBox = useRef<HTMLInputElement>(null);
  function add() {
    // Read the box itself and append to the latest list, so quick typing can never drop an entry.
    const s = (addBox.current?.value ?? adding).trim().slice(0, 60);
    if (s) setSkills((list) => (list.some((x) => x.toLowerCase() === s.toLowerCase()) ? list : [...list, s]));
    setAdding("");
  }

  return (
    <Screen title="About you" help="This is what people see when they find you. Share as much or as little as you like.">
      <label htmlFor="ab-name" className="label text-xl">
        Your name
      </label>
      <input id="ab-name" className="input min-h-[60px] text-xl" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="ab-where" className="label mt-6 text-xl">
        Your town or city <span className="font-normal text-muted">(optional)</span>
      </label>
      <input id="ab-where" className="input min-h-[60px] text-xl" autoComplete="address-level2" placeholder="For example: Phoenix" value={location} onChange={(e) => setLocation(e.target.value)} />

      <p className="label mt-6 text-xl">
        A few words about you <span className="font-normal text-muted">(optional)</span>
      </p>
      <SpeakOrType id="ab-bio" label="A few words about you" value={bio} onChange={setBio} rows={3} placeholder="For example: I was a carpenter for 35 years and I still love making furniture." />

      <section className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-warm-200" aria-labelledby="ab-skills">
        <h2 id="ab-skills" className="font-sans text-xl font-semibold">
          What people could learn from you
        </h2>
        {skills.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setSkills((list) => list.filter((x) => x !== s))}
                  aria-label={`${s}. Tap to remove`}
                  className="flex min-h-[48px] items-center gap-2 rounded-full bg-brand-100 px-4 text-lg font-medium text-brand-900 hover:bg-brand-200"
                >
                  {s} <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-lg text-muted">Nothing yet. Add anything you know well.</p>
        )}
        <label htmlFor="ab-add" className="label mt-4 text-lg">
          Add something
        </label>
        <div className="flex gap-2">
          <input
            id="ab-add"
            ref={addBox}
            className="input min-h-[56px] flex-1 text-xl"
            placeholder="For example: Furniture making"
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" onClick={add} disabled={!adding.trim()} className="btn-secondary min-h-[56px] shrink-0 px-4" aria-label="Add this">
            <Plus aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </section>

      <Actions
        primary="Save"
        disabled={!name.trim() || !dirty}
        busy={busy}
        error={error}
        onPrimary={() =>
          run(async () => {
            await saveUser({ ...user, name: name.trim(), location: location.trim(), bio: bio.trim(), skills });
            setSaved(true);
          })
        }
      />
      {saved && <Saved>Saved. This is what people will see now.</Saved>}
      <BackToAccount />
    </Screen>
  );
}

/** Email and password, and signing out. */
function SigningIn({ user }: { user: User }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [current, setCurrent] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [done, setDone] = useState("");
  const [confirm, setConfirm] = useState<"" | "out" | "everywhere">("");
  const mainRun = useRun();
  const emailRun = useRun();
  const outRun = useRun();

  if (!user.hasLogin)
    return (
      <Screen title="Keep your account safe" help="Right now your account lives only in this browser. Add an email and password and you can sign in on any phone or computer." readAloud={false}>
        <div className="space-y-6">
          <div>
            <label htmlFor="acc-email" className="label text-xl">
              Email address
            </label>
            <input id="acc-email" type="email" className="input min-h-[60px] text-xl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <PasswordField id="acc-pw" label="Choose a password" hint="at least 8 characters" value={password} onChange={setPassword} autoComplete="new-password" />
        </div>
        <Actions
          primary="Save my email and password"
          disabled={!email.includes("@") || password.length < 8}
          busy={mainRun.busy}
          error={mainRun.error}
          onPrimary={() =>
            mainRun.run(async () => {
              await claimAccount(email.trim(), password);
              setPassword("");
              setDone("Your email and password are saved. You can now sign in on any device.");
            })
          }
        />
        <p className="mt-6 rounded-2xl bg-warm-100 p-5 text-lg">Without this, clearing this browser or changing phones would lose your account. It takes a minute.</p>
        <BackToAccount />
      </Screen>
    );

  return (
    <Screen title="Signing in" help={<span className="break-words">You sign in as {user.email}.</span>} readAloud={false}>
      {done && <Saved>{done}</Saved>}

      <section className="mt-2 rounded-3xl bg-white p-6 ring-1 ring-warm-200" aria-labelledby="si-pw">
        <h2 id="si-pw" className="font-sans text-xl font-semibold">
          Change your password
        </h2>
        <div className="mt-4 space-y-5">
          <PasswordField id="acc-current" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
          <PasswordField id="acc-new" label="New password" hint="at least 8 characters" value={password} onChange={setPassword} autoComplete="new-password" />
        </div>
        <ErrorLine error={mainRun.error} />
        <button
          type="button"
          className="btn-secondary mt-4 min-h-[56px] text-lg"
          disabled={mainRun.busy || password.length < 8 || !current}
          onClick={() =>
            mainRun.run(async () => {
              await changePassword(current, password);
              setCurrent("");
              setPassword("");
              setDone("Your new password is saved.");
            })
          }
        >
          Save new password
        </button>
      </section>

      <details className="mt-4 rounded-3xl bg-white p-6 ring-1 ring-warm-200">
        <summary className="cursor-pointer text-xl font-semibold text-brand-900">Change your email address</summary>
        <div className="mt-4 space-y-5">
          <div>
            <label htmlFor="acc-newemail" className="label text-xl">
              New email address
            </label>
            <input id="acc-newemail" type="email" className="input min-h-[60px] text-xl" autoComplete="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <PasswordField id="acc-emailpw" label="Your password, to confirm it's you" value={emailPassword} onChange={setEmailPassword} autoComplete="current-password" />
        </div>
        <ErrorLine error={emailRun.error} />
        <button
          type="button"
          className="btn-secondary mt-4 min-h-[56px] text-lg"
          disabled={emailRun.busy || !newEmail.includes("@") || !emailPassword}
          onClick={() =>
            emailRun.run(async () => {
              const u = await changeEmail(newEmail.trim(), emailPassword);
              setNewEmail("");
              setEmailPassword("");
              setDone(`Done. You now sign in as ${u.email}.`);
            })
          }
        >
          Save new email
        </button>
      </details>

      <section className="mt-8" aria-labelledby="si-out">
        <h2 id="si-out" className="font-sans text-xl font-semibold">
          Signing out
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <button type="button" className="btn-secondary min-h-[56px] justify-start text-lg" onClick={() => setConfirm("out")}>
            <LogOut aria-hidden="true" className="h-5 w-5" /> Sign out on this device
          </button>
          <button type="button" className="btn-ghost min-h-[56px] justify-start text-lg" onClick={() => setConfirm("everywhere")}>
            <MonitorSmartphone aria-hidden="true" className="h-5 w-5" /> Sign out everywhere
          </button>
        </div>
        {confirm && (
          <div role="alertdialog" aria-labelledby="out-title" className="mt-5 rounded-3xl bg-warm-100 p-6">
            <p id="out-title" className="text-xl font-semibold text-brand-900">
              {confirm === "out" ? "Sign out on this device?" : "Sign out on every phone and computer?"}
            </p>
            <p className="mt-2 text-lg">
              {confirm === "out" ? "You can sign in again any time with your email and password." : "Useful if you used a shared or borrowed device. You'll need your email and password to get back in."}
            </p>
            <ErrorLine error={outRun.error} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary min-h-[52px]"
                disabled={outRun.busy}
                onClick={() =>
                  outRun.run(async () => {
                    if (confirm === "out") await logOut();
                    else await logOutEverywhere();
                    navigate("/start");
                  })
                }
              >
                Yes, sign out
              </button>
              <button type="button" className="btn-ghost min-h-[52px]" onClick={() => setConfirm("")}>
                Stay signed in
              </button>
            </div>
          </div>
        )}
      </section>
      <BackToAccount />
    </Screen>
  );
}

function Switch({ id, on, onChange, disabled, label, sub }: { id: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string; sub: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-5 ring-1 ring-warm-200">
      <div className="min-w-0">
        <p id={`${id}-l`} className="text-xl font-semibold text-brand-900">
          {label}
        </p>
        <p id={`${id}-d`} className="mt-1 text-lg text-muted">
          {sub}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-l`}
        aria-describedby={`${id}-d`}
        disabled={disabled}
        onClick={() => onChange(!on)}
        className={`relative h-10 w-[4.5rem] shrink-0 rounded-full transition-colors ${on ? "bg-brand-700" : "bg-warm-200"}`}
      >
        <span aria-hidden="true" className={`absolute top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold shadow transition-all ${on ? "left-[2.25rem] text-brand-800" : "left-1 text-muted"}`}>
          {on ? "On" : "Off"}
        </span>
      </button>
    </div>
  );
}

/** Who can find you, emails, and your information. */
function Privacy({ user }: { user: User }) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<"" | "signout" | "delete">("");
  const setRun = useRun();
  const leaveRun = useRun();
  const shares = user.roles.includes("mentor") || user.roles.includes("buddy");
  const alerts = user.emailAlerts !== false;

  return (
    <Screen title="Privacy and your information" help="You decide who can find you and what we keep.">
      <div className="space-y-4">
        {shares && (
          <Switch
            id="find"
            on={user.profileApproved}
            disabled={setRun.busy}
            onChange={(v) => setRun.run(() => saveUser({ ...user, profileApproved: v }))}
            label="People can find me"
            sub={user.profileApproved ? "You appear when people look for someone to learn from or ask." : "You're hidden for now. Nothing is deleted, and you can switch back any time."}
          />
        )}
        {user.hasLogin && (
          <Switch
            id="alerts"
            on={alerts}
            disabled={setRun.busy}
            onChange={(v) => setRun.run(() => saveUser({ ...user, emailAlerts: v }))}
            label="Email me when someone writes"
            sub={
              emailEnabled()
                ? alerts
                  ? `A short note to ${user.email}. Never adverts.`
                  : "No emails. You'll see new messages when you visit."
                : "Emails aren't switched on for this site yet, so for now you'll see new messages when you visit."
            }
          />
        )}
        <ErrorLine error={setRun.error} />
      </div>

      <p className="mt-6 rounded-2xl bg-brand-100/70 p-5 text-lg">
        We never show your email or phone number on your profile, never sell your information, and never show adverts.{" "}
        <Link to="/privacy" className="link">
          Read our privacy promise
        </Link>
      </p>

      <section className="mt-8" aria-labelledby="pv-data">
        <h2 id="pv-data" className="font-sans text-xl font-semibold">
          Your information
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <a href={EXPORT_URL} download className="btn-secondary min-h-[56px] justify-start text-lg">
            <Download aria-hidden="true" className="h-5 w-5" /> Download everything we have about you
          </a>
          {!user.hasLogin && (
            <button type="button" className="btn-secondary min-h-[56px] justify-start text-lg" onClick={() => setConfirm("signout")}>
              <LogOut aria-hidden="true" className="h-5 w-5" /> Sign out
            </button>
          )}
          <button type="button" className="btn-ghost min-h-[56px] justify-start text-lg text-warm-700" onClick={() => setConfirm("delete")}>
            <Trash2 aria-hidden="true" className="h-5 w-5" /> Delete my account
          </button>
        </div>

        {confirm && (
          <div role="alertdialog" aria-labelledby="leave-title" className="mt-5 rounded-3xl bg-warm-100 p-6">
            <p id="leave-title" className="text-xl font-semibold text-brand-900">
              {confirm === "delete" ? "Delete your account for good?" : "Sign out?"}
            </p>
            <p className="mt-2 text-lg">
              {confirm === "delete"
                ? "Your profile, messages, sessions and everything you've shared will be removed straight away. This can't be undone."
                : "You haven't added an email and password, so you won't be able to get back into this account. You may want to set up signing in first."}
            </p>
            <ErrorLine error={leaveRun.error} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary min-h-[52px]"
                disabled={leaveRun.busy}
                onClick={() =>
                  leaveRun.run(async () => {
                    if (confirm === "delete") await deleteAccount();
                    else await logOut();
                    navigate("/start");
                  })
                }
              >
                {confirm === "delete" ? "Yes, delete everything" : "Yes, sign out anyway"}
              </button>
              {confirm === "signout" && (
                <Link to="/account?view=signin" className="btn-secondary min-h-[52px]">
                  Set up signing in
                </Link>
              )}
              <button type="button" className="btn-ghost min-h-[52px]" onClick={() => setConfirm("")}>
                Keep my account
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="mt-8 text-lg">
        <Link to="/safety" className="link">
          Staying safe, and reporting a concern
        </Link>
      </p>
      <BackToAccount />
    </Screen>
  );
}
