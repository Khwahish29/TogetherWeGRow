import { useEffect, useMemo, useRef, useState } from "react";
import { GOOGLE_LANGUAGES } from "../i18n/languages";

declare global {
  interface Window {
    google?: { translate: { TranslateElement: { new (opts: object, id: string): unknown; InlineLayout: { SIMPLE: number } } } };
    googleTranslateElementInit?: () => void;
  }
}

// Google rewrites text nodes in place, which can make React throw when it later removes or
// reorders a node it no longer owns. These guards are the standard workaround.
let patched = false;
function patchDom() {
  if (patched || typeof Node === "undefined") return;
  patched = true;
  const remove = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return remove.call(this, child) as T;
  };
  const insert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insert.call(this, node, ref) as T;
  };
}

interface Option {
  code: string;
  name: string;
}

const combo = () => document.querySelector<HTMLSelectElement>("#google_translate_element select.goog-te-combo");

/** Language Google is currently translating to (from its cookie), or "en". */
function currentCode(): string {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "en";
}

function readOptions(): Option[] {
  const select = combo();
  if (select && select.options.length > 5) {
    return [...select.options].filter((o) => o.value).map((o) => ({ code: o.value, name: o.text }));
  }
  return GOOGLE_LANGUAGES.map((l) => ({ code: l.code === "zh" ? "zh-CN" : l.code, name: l.name }));
}

/**
 * Our own language menu, driving the free Google Website Translator behind the scenes.
 * Google's own dropdown is kept off-screen; choosing a language here sets it and Google
 * translates the whole page (including content added later). Google remembers it in a cookie.
 */
export function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState("en");
  const [options, setOptions] = useState<Option[]>(readOptions);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    patchDom();
    const init = () => {
      const host = document.getElementById("google_translate_element");
      if (!host || host.childElementCount > 0 || !window.google) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false, layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
        "google_translate_element",
      );
    };
    window.googleTranslateElementInit = init;
    if (window.google?.translate) init();
    else if (!document.getElementById("google-translate-script")) {
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
    setCurrent(currentCode());
    // Wait for Google's hidden list to exist, then use its exact set of languages.
    const timer = window.setInterval(() => {
      if (combo()) {
        setOptions(readOptions());
        setReady(true);
        window.clearInterval(timer);
      }
    }, 300);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    window.setTimeout(() => search.current?.focus(), 0);
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !q || o.name.toLowerCase().includes(q));
  }, [options, query]);

  const nameOf = (code: string) => options.find((o) => o.code === code)?.name ?? (code === "en" ? "English" : code);

  /** Most reliable route: set Google's cookie and reload; the widget translates on load. */
  function viaCookie(code: string) {
    const host = location.hostname;
    const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = `googtrans=; ${expire}`;
    document.cookie = `googtrans=; ${expire}; domain=${host}`;
    if (code !== "en") {
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`;
    }
    location.reload();
  }

  const isTranslated = () => /translated-(ltr|rtl)/.test(document.documentElement.className);

  function choose(code: string) {
    setOpen(false);
    if (code === currentCode()) return;
    setCurrent(code);
    const select = combo();
    if (!select) return viaCookie(code);
    // Ask Google's widget directly (no page reload) ...
    const value = code === "en" ? "" : code;
    if (![...select.options].some((o) => o.value === value)) return viaCookie(code);
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    // ... and if the page has not switched shortly after, fall back to the cookie + reload.
    window.setTimeout(() => {
      const ok = code === "en" ? !isTranslated() && currentCode() === "en" : isTranslated() && currentCode() === code;
      if (!ok) viaCookie(code);
    }, 1500);
  }

  return (
    <div ref={root} translate="no" className="notranslate fixed bottom-[88px] right-4 z-50 lg:bottom-4 print:hidden">
      {/* Google's own control, kept off-screen so it can do the translating. */}
      <div id="google_translate_element" aria-hidden="true" style={{ position: "fixed", left: -9999, top: 0 }} />

      {open && (
        <div
          role="dialog"
          aria-label="Choose a language"
          className="absolute bottom-full right-0 mb-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-xl"
        >
          <div className="border-b border-brand-100 bg-brand-50 p-3">
            <p className="font-serif text-lg font-bold text-brand-900">Read this site in your language</p>
            <label htmlFor="lang-search" className="sr-only">
              Search languages
            </label>
            <input
              id="lang-search"
              ref={search}
              type="search"
              className="input mt-2"
              placeholder="Search languages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-2">
            {(!query.trim() || "english".includes(query.trim().toLowerCase())) && (
            <li>
              <button
                type="button"
                onClick={() => choose("en")}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 text-left font-bold ${current === "en" ? "bg-brand-100 text-brand-900" : "text-ink hover:bg-brand-50"}`}
              >
                English
                {current === "en" && <span aria-hidden="true">✓</span>}
              </button>
            </li>
            )}
            {list
              .filter((o) => o.code !== "en")
              .map((o) => (
                <li key={o.code}>
                  <button
                    type="button"
                    onClick={() => choose(o.code)}
                    aria-current={current === o.code}
                    className={`flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 text-left font-bold ${current === o.code ? "bg-brand-100 text-brand-900" : "text-ink hover:bg-brand-50"}`}
                  >
                    {o.name}
                    {current === o.code && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              ))}
            {list.filter((o) => o.code !== "en").length === 0 && !"english".includes(query.trim().toLowerCase()) && <li className="px-3 py-3 text-ink/70">No language found.</li>}
          </ul>
          <p className="border-t border-brand-100 px-3 py-2 text-xs text-ink/70">
            {ready ? "Translated automatically by Google Translate." : "Connecting to Google Translate… (needs an internet connection)"}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-brand-600 bg-white px-4 font-bold text-brand-900 shadow-lg transition hover:bg-brand-50"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
        </svg>
        {nameOf(current)}
      </button>
    </div>
  );
}
