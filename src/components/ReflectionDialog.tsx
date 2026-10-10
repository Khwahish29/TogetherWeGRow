import { useEffect, useRef, useState, type FormEvent } from "react";
import { Heart, Lock } from "lucide-react";
import { saveReflection, sendThanks } from "../lib/store";
import type { Reflection, User } from "../lib/types";

type Feeling = Reflection["feltRespected"];

/** After a session: a few optional, private questions and an optional public thank-you note. */
export function ReflectionDialog({
  open,
  onClose,
  me,
  other,
  requestId,
  sessionTitle,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  me: User;
  other?: User;
  requestId: string;
  sessionTitle: string;
  existing?: Reflection;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [learned, setLearned] = useState("");
  const [surprised, setSurprised] = useState("");
  const [felt, setFelt] = useState<Feeling>("");
  const [next, setNext] = useState("");
  const [thanks, setThanks] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setLearned(existing?.learned ?? "");
      setSurprised(existing?.surprised ?? "");
      setFelt(existing?.feltRespected ?? "");
      setNext(existing?.next ?? "");
      setThanks("");
      setSaved(false);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open, existing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await saveReflection({ requestId, authorId: me.id, learned, surprised, feltRespected: felt, next });
    if (thanks.trim() && other) {
      await sendThanks({ fromId: me.id, toId: other.id, requestId, message: thanks.trim() });
    }
    setSaved(true);
  }

  const firstName = other?.name.split(" ")[0] ?? "them";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="reflect-title"
      className="w-[calc(100%-2rem)] max-w-xl rounded-3xl p-0 backdrop:bg-brand-900/50"
    >
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        {saved ? (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Heart aria-hidden="true" className="h-8 w-8" />
            </span>
            <h2 id="reflect-title" className="mt-4 text-2xl font-bold">
              Thank you for taking a moment
            </h2>
            <p className="mt-2 text-ink/80">
              Your notes are saved privately.{thanks.trim() ? ` Your thank-you note will appear on ${firstName}'s profile.` : ""}
            </p>
            <button className="btn-primary mt-6" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 id="reflect-title" className="text-2xl font-bold">
                How did it go?
              </h2>
              <p className="mt-1 text-ink/75">
                {sessionTitle} with {other?.name ?? "your partner"}. Every question is optional. Answer one, all, or none.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-800">
                <Lock aria-hidden="true" className="h-4 w-4" /> Only you can see these notes
              </p>
            </div>
            <div>
              <label htmlFor="rf-learned" className="label">
                What did you learn from {firstName}?
              </label>
              <textarea id="rf-learned" rows={2} className="input" value={learned} onChange={(e) => setLearned(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rf-surprised" className="label">
                Did anything surprise you about how {firstName} sees things?
              </label>
              <textarea
                id="rf-surprised"
                rows={2}
                className="input"
                placeholder="e.g. I thought they'd find this boring, but they had great questions."
                value={surprised}
                onChange={(e) => setSurprised(e.target.value)}
              />
            </div>
            <fieldset>
              <legend className="label">Did you feel listened to and supported?</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["yes", "Yes"],
                    ["mostly", "Mostly"],
                    ["not-really", "Not really"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-bold ${
                      felt === value ? "border-brand-700 bg-brand-50" : "border-brand-100"
                    }`}
                  >
                    <input type="radio" name={`felt-${requestId}`} className="sr-only" checked={felt === value} onChange={() => setFelt(value)} />
                    {label}
                  </label>
                ))}
              </div>
              {felt === "not-really" && (
                <p className="mt-2 rounded-xl bg-warm-100 p-3 text-sm">
                  We're sorry it didn't feel right. It might have been a misunderstanding, or not. You're welcome to try
                  someone else, and if something worried you, you can{" "}
                  <a href="/about#safety" className="font-bold underline">
                    tell us
                  </a>
                  .
                </p>
              )}
            </fieldset>
            <div>
              <label htmlFor="rf-next" className="label">
                What would you like to learn or share next?
              </label>
              <input id="rf-next" className="input" value={next} onChange={(e) => setNext(e.target.value)} />
            </div>
            {other && (
              <div className="rounded-2xl border-2 border-warm-100 bg-warm-50 p-4">
                <label htmlFor="rf-thanks" className="label">
                  <Heart aria-hidden="true" className="mr-1 inline h-5 w-5 align-[-3px] text-warm-700" />
                  Send {firstName} a thank-you note
                  <span className="block text-sm font-normal text-ink/60">Optional. It will be shown on their profile.</span>
                </label>
                <textarea
                  id="rf-thanks"
                  rows={2}
                  className="input"
                  placeholder={`e.g. Thank you for being so patient with my questions, ${firstName}.`}
                  value={thanks}
                  onChange={(e) => setThanks(e.target.value)}
                />
              </div>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Maybe later
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
