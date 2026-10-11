import { useEffect, useRef, useState, type ReactNode } from "react";

// Muted, palette-friendly tones (all pass AA with white initials).
const AVATAR_COLORS = ["bg-brand-700", "bg-warm-700", "bg-brand-500", "bg-[#5B5470]", "bg-[#7A5C2E]", "bg-[#3E5A6B]"];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  const dims = { sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-lg", lg: "h-20 w-20 text-2xl" }[size];
  return (
    <span aria-hidden="true" className={`${color} ${dims} inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white`}>
      {initials}
    </span>
  );
}

/** Fades content in as it scrolls into view. Shows immediately for people who prefer reduced motion. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const inOrAbove = () => el.getBoundingClientRect().top < window.innerHeight * 1.05;
    if (reduce || typeof IntersectionObserver === "undefined" || inOrAbove()) {
      setShown(true);
      return;
    }
    const show = () => {
      setShown(true);
      cleanup();
    };
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && show(), {
      rootMargin: "0px 0px 10% 0px",
    });
    const onScroll = () => inOrAbove() && show();
    const cleanup = () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, []);
  return (
    <div
      ref={ref}
      className={`${className} transition duration-700 ease-out motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      style={shown ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
