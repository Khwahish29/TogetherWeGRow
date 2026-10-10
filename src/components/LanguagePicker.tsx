import { useState } from "react";
import { GOOGLE_LANGUAGES, langName } from "../i18n/languages";

/** Chips of chosen languages plus a list of every language Google supports to add more. Keeps at least one. */
export function LanguagePicker({ id, values, onChange }: { id: string; values: string[]; onChange: (v: string[]) => void }) {
  const [choice, setChoice] = useState("");
  const options = GOOGLE_LANGUAGES.filter((l) => !values.includes(l.code));
  const add = () => {
    if (choice && !values.includes(choice)) onChange([...values, choice]);
    setChoice("");
  };
  return (
    <div>
      <ul className="mb-2 flex flex-wrap gap-2">
        {values.map((code) => (
          <li key={code} className="chip">
            {langName(code)}
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== code))}
                aria-label={`Remove ${langName(code)}`}
                className="ml-1 rounded-full px-1.5 text-brand-700 hover:bg-brand-200"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <select id={id} className="input" value={choice} onChange={(e) => setChoice(e.target.value)} aria-label="Add a language">
          <option value="">Add a language…</option>
          {options.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
        <button type="button" className="btn-secondary shrink-0" onClick={add} disabled={!choice}>
          Add
        </button>
      </div>
    </div>
  );
}
