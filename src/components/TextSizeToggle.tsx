import { useEffect, useState } from "react";

const SIZES = [
  { value: "standard", label: "A", name: "Standard text" },
  { value: "large", label: "A+", name: "Large text" },
  { value: "xlarge", label: "A++", name: "Extra large text" },
] as const;

type Size = (typeof SIZES)[number]["value"];

function readSize(): Size {
  try {
    return (localStorage.getItem("twg.textSize") as Size) || "standard";
  } catch {
    return "standard";
  }
}

/** Apply the saved text size on first load. */
export function applySavedTextSize() {
  document.documentElement.dataset.text = readSize();
}

export function setTextSize(size: Size) {
  try {
    localStorage.setItem("twg.textSize", size);
  } catch {
    // ignore
  }
  document.documentElement.dataset.text = size;
  window.dispatchEvent(new Event("twg:textsize"));
}

export function TextSizeToggle({ dark = false }: { dark?: boolean }) {
  const [size, setSize] = useState<Size>(readSize);

  useEffect(() => {
    const sync = () => setSize(readSize());
    window.addEventListener("twg:textsize", sync);
    return () => window.removeEventListener("twg:textsize", sync);
  }, []);

  return (
    <div role="group" aria-label="Text size" className="mt-2 flex gap-2">
      {SIZES.map((s) => (
        <button
          key={s.value}
          aria-pressed={size === s.value}
          aria-label={s.name}
          onClick={() => setTextSize(s.value)}
          className={`min-h-[44px] min-w-[52px] rounded-lg border-2 px-3 font-bold ${
            size === s.value
              ? "border-warm-400 bg-warm-400 text-brand-900"
              : dark
                ? "border-brand-200 text-white hover:bg-brand-800"
                : "border-brand-200 text-brand-800 hover:bg-brand-50"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
