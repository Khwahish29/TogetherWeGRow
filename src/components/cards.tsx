import { Link } from "react-router-dom";
import type { MentorMatch } from "../lib/matching";
import type { Listing, User } from "../lib/types";
import { Avatar, DemoBadge, FormatBadge, formatPrice } from "./ui";

export function ListingCard({
  listing,
  mentor,
  onRequest,
  isOwn,
}: {
  listing: Listing;
  mentor?: User;
  onRequest?: () => void;
  isOwn?: boolean;
}) {
  return (
    <article className="card flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-warm-100 text-warm-700">{listing.category}</span>
        <FormatBadge format={listing.format} />
        {listing.isDemo && <DemoBadge />}
      </div>
      <h3 className="mt-3 text-xl font-bold">{listing.title}</h3>
      <p className="mt-2 flex-1 text-ink/80">{listing.description}</p>
      {mentor && (
        <Link to={`/mentors/${mentor.id}`} className="mt-4 flex items-center gap-3 rounded-xl p-1 hover:bg-brand-50">
          <Avatar name={mentor.name} size="sm" />
          <span>
            <span className="block font-bold text-brand-900">{mentor.name}</span>
            <span className="block text-sm text-ink/70">
              {mentor.yearsExperience ? `${mentor.yearsExperience} years' experience` : mentor.industries[0] ?? "Mentor"}
            </span>
          </span>
        </Link>
      )}
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-brand-100 pt-4">
        <div>
          <p className="text-2xl font-bold text-brand-900">{formatPrice(listing.price)}</p>
          <p className="text-sm text-ink/70">per {listing.durationMins}-minute session</p>
        </div>
        {isOwn ? (
          <span className="badge bg-brand-100 text-brand-800">Your offer</span>
        ) : (
          onRequest && (
            <button className="btn-primary" onClick={onRequest}>
              Request session
            </button>
          )
        )}
      </div>
      {listing.isDemo && <p className="mt-2 text-xs text-ink/60">Illustrative price per session; not a live listing.</p>}
    </article>
  );
}

export function MentorCard({ match, showScore }: { match: MentorMatch; showScore: boolean }) {
  const { mentor } = match;
  return (
    <article className="card flex h-full flex-col">
      <div className="flex items-start gap-4">
        <Avatar name={mentor.name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold">
            <Link to={`/mentors/${mentor.id}`} className="hover:underline">
              {mentor.name}
            </Link>
          </h3>
          <p className="text-ink/70">
            {mentor.industries[0] ?? "Mentor"}
            {mentor.yearsExperience ? ` · ${mentor.yearsExperience} years` : ""} · {mentor.location}
          </p>
        </div>
        {showScore && match.score > 0 && (
          <span className="badge shrink-0 bg-brand-700 text-white" title="How well this mentor fits what you want to learn">
            {match.score}% match
          </span>
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-ink/80">{mentor.bio}</p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Skills">
        {mentor.skills.slice(0, 5).map((s) => (
          <li key={s} className={`chip ${match.matchedSkills.includes(s) ? "bg-warm-100 text-warm-700" : ""}`}>
            {s}
          </li>
        ))}
      </ul>
      {showScore && match.reasons.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-brand-800">
          {match.reasons.map((r) => (
            <li key={r}>✓ {r}</li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex items-center justify-between pt-4">
        <FormatBadge format={mentor.format} />
        <Link to={`/mentors/${mentor.id}`} className="btn-secondary">
          View profile
        </Link>
      </div>
    </article>
  );
}
