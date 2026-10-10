import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Check, Copy, Heart, Mail, PlusCircle, Users } from "lucide-react";
import { useAuth } from "../lib/auth";
import { payLabel } from "../lib/comfort";
import { addFeedback, createApplication, createListing, getOpportunities, getStats, markFirstInteraction, quickJoin, saveUser } from "../lib/store";
import type { Format } from "../lib/types";
import { useStore } from "../lib/useStore";
import { VibeCheck } from "../components/VibeCheck";
import { Actions, BigChoice, Screen, useRun } from "./parts";
import { useWizard } from "./useWizard";

/* ------------------------------------------------------------------ */
/* A gentle, optional "how was this?" at the end of each journey.      */
/* ------------------------------------------------------------------ */

export function Feedback({ flow, askComfort = false }: { flow: string; askComfort?: boolean }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comfort, setComfort] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  // Reaching the end of a journey is the "first interaction" we measure.
  useState(() => {
    markFirstInteraction(flow);
    return null;
  });

  async function save(r: number, c: boolean | null) {
    await addFeedback({ flow, rating: r, comfortable: c ?? undefined });
    setDone(true);
  }

  if (done) return <p className="mt-8 rounded-2xl bg-white p-5 text-lg ring-1 ring-warm-200">Thank you for telling us.</p>;

  return (
    <section aria-labelledby={`fb-${flow}`} className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-warm-200">
      {rating === null ? (
        <>
          <h2 id={`fb-${flow}`} className="font-sans text-xl font-semibold">
            How was this for you? <span className="font-normal text-muted">(optional)</span>
          </h2>
          <div role="group" aria-label="Rate from 1 to 5" className="mt-4 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => (askComfort ? setRating(n) : save(n, null))}
                className="min-h-[60px] rounded-2xl border-2 border-warm-200 text-2xl font-semibold text-brand-900 hover:border-brand-600 hover:bg-brand-50"
                aria-label={`${n} out of 5${n === 1 ? ", not good" : n === 5 ? ", very good" : ""}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 flex justify-between text-sm text-muted">
            <span>Not good</span>
            <span>Very good</span>
          </p>
        </>
      ) : (
        <>
          <h2 id={`fb-${flow}`} className="font-sans text-xl font-semibold">
            Do you feel a little more comfortable asking for help now?
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              [true, "Yes"],
              [false, "Not yet"],
            ].map(([v, l]) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => {
                  setComfort(v as boolean);
                  save(rating, v as boolean);
                }}
                aria-pressed={comfort === v}
                className="min-h-[60px] rounded-2xl border-2 border-warm-200 text-xl font-semibold text-brand-900 hover:border-brand-600 hover:bg-brand-50"
              >
                {l as string}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Family: help someone you love take a first step.                    */
/* ------------------------------------------------------------------ */

export function FamilyFlow() {
  const w = useWizard("twg.simple.family", { name: "", work: "", years: "", gift: "", message: "" });
  const { step, go, data, set } = w;
  const [copied, setCopied] = useState(false);

  function build() {
    const who = data.name.trim() || "there";
    const work = data.work.trim();
    const years = data.years.trim();
    const experience = work ? (years ? `your ${years} years in ${work}` : `all your years in ${work}`) : "everything you've done over the years";
    return `Hi ${who},

I've been thinking about ${experience}${data.gift.trim() ? `, and how good you are at ${data.gift.trim()}` : ""}. You know things people only learn by doing.

I found a simple website called TogetherWeGrow, where younger people ask practical questions and people with experience like yours answer them. Some also offer paid advice, and there's work that's easier on the body.

There's no pressure, and it's completely your choice. If you'd like, we could look at it together.

${window.location.origin}`;
  }

  if (step === 0)
    return (
      <Screen step="1 of 3" title="Who would you like to invite?" help="What do you call them? Dad, Grandma Rose, Uncle Sam…">
        <label htmlFor="fname" className="sr-only">
          Their name
        </label>
        <input id="fname" className="input min-h-[64px] text-2xl" value={data.name} onChange={(e) => set("name", e.target.value)} />
        <Actions primary="Next" onPrimary={() => go(1)} disabled={!data.name.trim()} />
      </Screen>
    );

  if (step === 1)
    return (
      <Screen step="2 of 3" title={`What work has ${data.name.trim()} done?`} help="And for about how long, if you know.">
        <label htmlFor="fwork" className="label text-xl">
          Their work
        </label>
        <input id="fwork" className="input min-h-[60px] text-xl" placeholder="For example: carpentry" value={data.work} onChange={(e) => set("work", e.target.value)} />
        <label htmlFor="fyears" className="label mt-6 text-xl">
          About how many years? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="fyears" className="input min-h-[60px] text-xl" inputMode="numeric" value={data.years} onChange={(e) => set("years", e.target.value)} />
        <Actions primary="Next" onPrimary={() => go(2)} disabled={!data.work.trim()} />
      </Screen>
    );

  if (step === 2)
    return (
      <Screen step="3 of 3" title={`What is ${data.name.trim()} especially good at?`} help="Something you admire. This is optional.">
        <label htmlFor="fgift" className="sr-only">
          What they're good at
        </label>
        <input id="fgift" className="input min-h-[60px] text-xl" placeholder="For example: fixing what others give up on" value={data.gift} onChange={(e) => set("gift", e.target.value)} />
        <Actions
          primary="Write my invitation"
          onPrimary={() => {
            set("message", build());
            go(3);
          }}
          secondary="Skip this question"
          onSecondary={() => {
            set("gift", "");
            set("message", build());
            go(3);
          }}
        />
      </Screen>
    );

  return (
    <Screen title="Here's your invitation." help="Change any words you like. Then send it however you normally would.">
      <label htmlFor="fmsg" className="sr-only">
        Your invitation
      </label>
      <textarea
        id="fmsg"
        rows={12}
        className="input font-serif text-xl leading-relaxed"
        value={data.message}
        onChange={(e) => {
          set("message", e.target.value);
          setCopied(false);
        }}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="btn-primary min-h-[60px] text-lg"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(data.message);
              setCopied(true);
              markFirstInteraction("family");
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check aria-hidden="true" className="h-5 w-5" /> : <Copy aria-hidden="true" className="h-5 w-5" />}
          {copied ? "Copied" : "Copy the message"}
        </button>
        <a className="btn-secondary min-h-[60px] text-lg" href={`mailto:?subject=${encodeURIComponent("I thought of you")}&body=${encodeURIComponent(data.message)}`}>
          <Mail aria-hidden="true" className="h-5 w-5" /> Open in my email
        </a>
      </div>
      <div className="mt-8 rounded-3xl bg-brand-100/70 p-6 text-lg">
        <p className="font-semibold text-brand-900">Their choice, always</p>
        <p className="mt-1">You can invite them and sit beside them. Only they can share their experience, or say yes to any work.</p>
      </div>
      <div className="mt-6 space-y-4">
        <BigChoice to="/older/help?step=1" icon={Users} label="Ask a helper to walk them through it" sub="A patient younger helper, at their pace" />
      </div>
      <Feedback flow="family" />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Earn: offer a paid session (90% to them).                           */
/* ------------------------------------------------------------------ */

export function OlderEarn() {
  const { user } = useAuth();
  const w = useWizard("twg.simple.earn", { topic: "", minutes: 60, price: 25, format: "both" as Format, name: user?.name.split(" ")[0] ?? "" });
  const { step, go, data, set } = w;

  const { run, busy, error } = useRun();

  function publish() {
    return run(async () => {
      // Use the person signed in on this device, or create a first-name account for them.
      const person = user ?? (await quickJoin(data.name.trim(), ["mentor"]));
      const topic = data.topic.trim();
      await saveUser({
        ...person,
        roles: person.roles.includes("mentor") ? person.roles : [...person.roles, "mentor"],
        skills: person.skills.length ? person.skills : [topic],
        bio: person.bio || `Offers sessions on ${topic.toLowerCase()}.`,
        profileApproved: true,
      });
      await createListing({
        mentorId: person.id,
        title: topic,
        category: "Other",
        description: `A one-to-one session on ${topic.toLowerCase()}.`,
        format: data.format,
        durationMins: data.minutes,
        price: data.price,
        cancellation: "Free to cancel up to 24 hours before",
      });
      go(4);
    });
  }

  if (step === 0)
    return (
      <Screen step="1 of 3" title="What would you teach in a session?" help="One thing people would come to you for.">
        <label htmlFor="etopic" className="sr-only">
          What you'd teach
        </label>
        <input id="etopic" className="input min-h-[64px] text-xl" placeholder="For example: Woodworking for beginners" value={data.topic} onChange={(e) => set("topic", e.target.value)} />
        {!user && (
          <>
            <label htmlFor="ename" className="label mt-6 text-xl">
              Your first name
            </label>
            <input id="ename" className="input min-h-[60px] text-xl" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        <Actions primary="Next" onPrimary={() => go(1)} disabled={data.topic.trim().length < 3 || (!user && !data.name.trim())} />
      </Screen>
    );

  if (step === 1)
    return (
      <Screen step="2 of 3" title="How long, and where?">
        <p className="text-xl font-semibold text-brand-900">Length</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[30, 60].map((m) => (
            <BigChoice key={m} label={`${m} minutes`} selected={data.minutes === m} onClick={() => set("minutes", m)} />
          ))}
        </div>
        <p className="mt-8 text-xl font-semibold text-brand-900">Where</p>
        <div className="mt-3 space-y-3">
          {(
            [
              ["in-person", "In person"],
              ["online", "Online"],
              ["both", "Either is fine"],
            ] as [Format, string][]
          ).map(([v, l]) => (
            <BigChoice key={v} label={l} selected={data.format === v} onClick={() => set("format", v)} />
          ))}
        </div>
        <Actions primary="Next" onPrimary={() => go(2)} />
      </Screen>
    );

  if (step === 2)
    return (
      <Screen step="3 of 3" title="What feels like a fair price?" help="You set it. You can change it later.">
        <div className="grid grid-cols-3 gap-3">
          {[15, 25, 40].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("price", p)}
              aria-pressed={data.price === p}
              className={`min-h-[72px] rounded-2xl border-2 text-2xl font-semibold ${data.price === p ? "border-brand-700 bg-brand-50" : "border-warm-200 bg-white"}`}
            >
              ${p}
            </button>
          ))}
        </div>
        <label htmlFor="eprice" className="label mt-6 text-xl">
          Or type your own ($)
        </label>
        <input id="eprice" type="number" min={1} className="input min-h-[60px] text-xl" value={data.price} onChange={(e) => set("price", Number(e.target.value) || 0)} />
        <p className="mt-6 rounded-3xl bg-brand-100/70 p-6 text-xl">
          You would keep <strong>${(data.price * 0.9).toFixed(2)}</strong> of each ${data.price} session (90%). The other $
          {(data.price * 0.1).toFixed(2)} (10%) would keep the service running. No hidden fees.
        </p>
        <Actions primary="Offer my session" onPrimary={() => go(3)} disabled={data.price < 1} />
      </Screen>
    );

  if (step === 3)
    return (
      <Screen title="Ready to offer this?" help="Please check it. Nothing is shared until you say yes.">
        <div className="rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
          <p className="font-semibold text-brand-900">{data.topic}</p>
          <p className="mt-2 text-muted">
            {data.minutes} minutes · {data.format === "both" ? "Online or in person" : data.format === "online" ? "Online" : "In person"} · ${data.price}
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <BigChoice onClick={publish} icon={Check} label={busy ? "One moment…" : "Yes, offer it"} />
          <BigChoice onClick={() => go(0)} icon={PlusCircle} tone="warm" label="Change something" />
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-warm-100 p-4 text-lg text-warm-800">
            {error}
          </p>
        )}
      </Screen>
    );

  return (
    <Screen title="Your session is offered." help="Younger adults looking to learn can now ask to book it.">
      <p className="rounded-3xl bg-warm-100 p-6 text-xl">
        When someone asks to book, you'll find it in <Link to="/inbox" className="link">your messages</Link>. Payments aren't handled through
        TogetherWeGrow yet, so you agree together how you'd like to be paid.
      </p>
      <div className="mt-8 space-y-4">
        <BigChoice to="/older/roles" icon={Briefcase} label="See roles that are easier on the body" />
        <BigChoice to="/older" icon={Users} tone="warm" label="Back to my choices" />
      </div>
      <Feedback flow="earn" askComfort />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Roles that are easier on the body.                                  */
/* ------------------------------------------------------------------ */

const LIFTING = { none: "No heavy lifting", occasional: "Some occasional lifting", regular: "Regular heavy lifting", unspecified: "Lifting not described yet" };
const POSTURE = { sitting: "Mostly sitting", standing: "Mostly standing", mix: "A mix of sitting and standing", unspecified: "Not described yet", "": "Not described yet" };

export function OlderRoles() {
  const { user } = useAuth();
  const opportunities = useStore(getOpportunities, []);
  const roles = useMemo(
    () =>
      opportunities
        .filter((o) => o.status === "open" && o.employerId !== user?.id)
        .sort((a, b) => ["none", "occasional", "unspecified", "regular"].indexOf(a.physical.heavyLifting) - ["none", "occasional", "unspecified", "regular"].indexOf(b.physical.heavyLifting)),
    [opportunities, user?.id],
  );
  const w = useWizard("twg.simple.roles", { roleId: "", name: user?.name.split(" ")[0] ?? "", contact: "", note: "" });
  const { step, go, data, set } = w;
  const { run, busy, error } = useRun();
  const role = roles.find((r) => r.id === data.roleId);

  if (step === 0 || !role)
    return (
      <Screen title="Work that's easier on the body" help="Paid roles where what you know matters most, with the physical side described plainly.">
        {roles.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-xl ring-1 ring-warm-200">
            <p>No roles have been posted yet. We're inviting local workshops, schools and businesses to share them.</p>
            <p className="mt-4 text-lg text-muted">
              Know an organization that needs experienced people?{" "}
              <Link to="/signup?role=employer" className="link">
                They can post a role here
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {roles.map((r) => (
              <li key={r.id}>
                <BigChoice
                  onClick={() => {
                    set("roleId", r.id);
                    go(1);
                  }}
                  icon={Briefcase}
                  label={r.title}
                  sub={`${payLabel(r.pay)} · ${LIFTING[r.physical.heavyLifting]}`}
                />
              </li>
            ))}
          </ul>
        )}
      </Screen>
    );

  if (step === 1)
    return (
      <Screen title={role.title} help={role.orgName}>
        <dl className="space-y-4 text-xl">
          {[
            ["Pay", `${payLabel(role.pay)} · ${role.hoursPerWeek || "Hours not stated"}`],
            ["What you'd do", role.responsibilities.filter(Boolean).join(". ") + "."],
            ["How physical it is", `${POSTURE[role.physical.posture]}. ${LIFTING[role.physical.heavyLifting]}.`],
            ["Where", `${role.setting === "on-site" ? "On site" : role.setting === "remote" ? "From home" : "Partly from home"}${role.location ? `, ${role.location}` : ""}`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white p-5 ring-1 ring-warm-200">
              <dt className="text-lg text-muted">{k}</dt>
              <dd className="mt-1 font-semibold text-brand-900">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-lg text-muted">
          Only you can judge if a role suits you. It's fine to ask about the real day-to-day work first. Organizations on TogetherWeGrow are not
          checked by us, so meet somewhere public the first time and never pay to apply.
        </p>
        <Actions primary="I'm interested" onPrimary={() => go(2)} secondary="Look at other roles" onSecondary={() => go(0)} />
      </Screen>
    );

  if (step === 2)
    return (
      <Screen title={`Tell ${role.orgName} a little about you`} help="Your first name, and how they can reach you. A sentence about your experience helps too.">
        {!user && (
          <>
            <label htmlFor="rname" className="label text-xl">
              Your first name
            </label>
            <input id="rname" className="input mb-6 min-h-[60px] text-xl" autoComplete="given-name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </>
        )}
        <label htmlFor="rcontact" className="label text-xl">
          Phone or email
        </label>
        <input id="rcontact" className="input min-h-[60px] text-xl" value={data.contact} onChange={(e) => set("contact", e.target.value)} />
        <label htmlFor="rnote" className="label mt-6 text-xl">
          About your experience <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea id="rnote" rows={3} className="input text-xl" value={data.note} onChange={(e) => set("note", e.target.value)} />
        <Actions
          primary="Send my interest"
          disabled={(!user && !data.name.trim()) || !data.contact.trim()}
          busy={busy}
          error={error}
          onPrimary={() =>
            run(async () => {
              if (!user) await quickJoin(data.name.trim());
              await createApplication({
                opportunityId: role.id,
                workerId: "",
                employerId: role.employerId,
                initiatedBy: "worker",
                message: [data.note.trim(), `You can reach me at: ${data.contact.trim()}`].filter(Boolean).join("\n\n"),
              });
              go(3);
            })
          }
        />
      </Screen>
    );

  return (
    <Screen title="Your interest has been sent." help="Saying you're interested doesn't commit you to anything.">
      <p className="rounded-3xl bg-brand-100/70 p-6 text-xl">
        {role.orgName} will see your message and how to reach you. Any reply will appear in{" "}
        <Link to="/inbox" className="link">
          your messages
        </Link>
        .
      </p>
      <div className="mt-8 space-y-4">
        <BigChoice onClick={() => go(0)} icon={Briefcase} label="Look at other roles" />
        <BigChoice to="/older" icon={Users} tone="warm" label="Back to my choices" />
      </div>
      <Feedback flow="roles" />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* What does this message mean? (Vibe Check)                           */
/* ------------------------------------------------------------------ */

export function MeaningScreen({ younger = false }: { younger?: boolean }) {
  return (
    <Screen
      title={younger ? "Understand each other" : "What does this message mean?"}
      help={younger ? "Explain an expression an older adult used, or find a clearer way to say something." : "Paste or type a message that confused you. We'll explain it in plain words."}
    >
      <VibeCheck idPrefix={younger ? "yvibe" : "ovibe"} />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Our goals: the pilot's key metrics, and what this device recorded.  */
/* ------------------------------------------------------------------ */

export function Impact() {
  const stats = useStore(getStats, null);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "No answers yet");
  const of = (a: number, b: number, none: string) => (b ? `${a} of ${b}` : none);
  const v = (n: number | undefined) => (stats ? String(n ?? 0) : "…");

  const rows: [string, string, string][] = [
    ["Older adults sharing their experience", "10 to 15", v(stats?.elders)],
    ["Younger helpers offering their skills", "10", v(stats?.helpers)],
    ["Questions, help and session requests", "10 learning sessions", v(stats?.connections)],
    ["Older adults offering a paid session", "5 sharing a skill", v(stats?.listings)],
    ["First visit finished within 5 minutes", "Most people", stats ? of(stats.firstUnder5, stats.firstTimes, "Not measured yet") : "…"],
    ["Feel more comfortable asking for help", "7 out of 10", stats ? of(stats.comfortable, stats.comfortAsked, "No answers yet") : "…"],
    ["Rated their experience 4 or 5 out of 5", "80%", stats ? pct(stats.ratedGood, stats.rated) : "…"],
    ["Pairs who met again for a second session", "5 pairs", v(stats?.returningPairs)],
  ];

  return (
    <Screen title="Our goals" help="The targets for our first local pilot, next to how we're doing so far. Everything here is counted anonymously.">
      <ul className="space-y-4">
        {rows.map(([what, goal, now]) => (
          <li key={what} className="rounded-3xl bg-white p-5 ring-1 ring-warm-200">
            <p className="text-xl font-semibold text-brand-900">{what}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-lg">
              <div>
                <dt className="text-base text-muted">Pilot goal</dt>
                <dd className="font-medium">{goal}</dd>
              </div>
              <div>
                <dt className="text-base text-muted">So far</dt>
                <dd className="font-medium">{now}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex items-start gap-2 text-lg text-muted">
        <Heart aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-warm-700" />
        The ratings come from the optional "How was this for you?" question at the end of each step. We never link them to your name.
      </p>
      <h2 className="mt-12 font-sans text-2xl font-semibold">Who we hope to work with</h2>
      <p className="mt-3 text-lg leading-relaxed">
        Families are the main way people find us: a son, daughter or grandchild sitting down with someone they love. For a local pilot, we would
        like to approach senior centers, trade associations, community colleges and universities (such as Maricopa Community Colleges and Arizona
        State University), psychology and counseling departments, and groups like AARP and Senior Planet.
      </p>
      <p className="mt-3 text-lg text-muted">These are possible partners we hope to talk to. None of them has agreed to work with us yet.</p>
    </Screen>
  );
}
