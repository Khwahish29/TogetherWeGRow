import { useState } from "react";
import { langName } from "../i18n/languages";
import { translateText } from "../lib/gtranslate";
import { languageFit, speaks } from "../lib/matching";
import type { User } from "../lib/types";

export const langNames = (langs: string[]) => langs.map((l) => langName(l)).join(" + ");

/** Small badges showing which languages a person speaks, and whether you share one. */
export function LanguageBadges({ person, viewer }: { person: User; viewer?: User | null }) {
  const fit = viewer && viewer.id !== person.id ? languageFit(viewer, person) : null;
  return (
    <>
      <span className="badge bg-sky-100 text-sky-900">
        <span aria-hidden="true">🗣 </span>Speaks {langNames(speaks(person))}
      </span>
      {fit &&
        (fit.shared.length ? (
          <span className="badge bg-emerald-100 text-emerald-900">✓ You both speak {langNames(fit.shared)}</span>
        ) : (
          <span className="badge bg-amber-100 text-amber-900">No shared language yet</span>
        ))}
    </>
  );
}

const PHRASES = ["Hello! Nice to meet you.", "Can we meet by video call?", "Could you speak a little more slowly, please?", "Thank you very much!", "What time works for you?"];

/** Shown when two people have no language in common: explains it and offers two-language phrases (translated by Google). */
export function BridgeNotice({ viewer, person, onPhrase }: { viewer: User; person: User; onPhrase?: (text: string) => void }) {
  const [busy, setBusy] = useState(false);
  const target = speaks(person)[0];
  return (
    <div role="note" className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm">
      <p className="font-bold text-amber-900">You may not share a language</p>
      <p className="mt-1">
        {person.name.split(" ")[0]} speaks {langNames(speaks(person))}; you speak {langNames(speaks(viewer))}. You can still send a request. Short
        phrases in both languages can help, and the site can be translated with the language button.
      </p>
      {onPhrase && (
        <>
          <p className="mt-3 font-bold">Add a phrase to your message:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PHRASES.map((en) => (
              <button
                key={en}
                type="button"
                disabled={busy}
                className="chip min-h-[40px] cursor-pointer hover:bg-brand-200"
                onClick={async () => {
                  setBusy(true);
                  const other = await translateText(en, target);
                  setBusy(false);
                  onPhrase(other && other !== en ? `${en} / ${other}` : en);
                }}
              >
                {en}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
