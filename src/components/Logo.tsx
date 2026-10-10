/** Wordmark: a sprouting seedling and a two-tone name. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 whitespace-nowrap font-serif text-[19px] font-semibold tracking-tight sm:gap-2.5 sm:text-[22px] ${light ? "text-white" : "text-brand-900"}`}>
      <svg aria-hidden="true" viewBox="0 0 36 36" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9">
        <circle cx="18" cy="18" r="18" fill={light ? "#E4EDE5" : "#234638"} />
        <path d="M18 27V16" stroke={light ? "#234638" : "#FAF8F3"} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18 17c0-4.4 3.3-7.6 7.6-7.6 0 4.4-3.3 7.6-7.6 7.6Z" fill="#D8AB67" />
        <path d="M18 20.2c0-3.7-2.8-6.4-6.4-6.4 0 3.7 2.8 6.4 6.4 6.4Z" fill={light ? "#4C7461" : "#CADBCF"} />
      </svg>
      <span>
        Together<span className={light ? "text-warm-400" : "text-warm-700"}>We</span>Grow
      </span>
    </span>
  );
}
