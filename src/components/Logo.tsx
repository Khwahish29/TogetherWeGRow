export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-serif text-lg font-bold sm:text-xl ${light ? "text-white" : "text-brand-900"}`}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9">
        <rect width="32" height="32" rx="9" fill={light ? "#f8ebd6" : "#23704a"} />
        <path d="M16 25V14" stroke={light ? "#164530" : "#fff"} strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M16 15c0-4 3-7 7-7 0 4-3 7-7 7zM16 18c0-3.5-2.6-6-6-6 0 3.5 2.6 6 6 6z"
          fill={light ? "#2f8a57" : "#f8ebd6"}
        />
      </svg>
      TogetherWeGrow
    </span>
  );
}
