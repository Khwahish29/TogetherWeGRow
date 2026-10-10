import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { createRequest } from "../lib/store";
import type { Listing, User } from "../lib/types";
import { RequestDialog } from "./RequestDialog";
import { formatPrice } from "./ui";

/** Opens the "request a mentoring session" dialog for a listing. Sends guests to log in first. */
export function useBooking(users: User[]) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState<Listing | null>(null);
  const mentor = listing ? users.find((u) => u.id === listing.mentorId) : undefined;

  function open(l: Listing) {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setListing(l);
  }

  const dialog = (
    <RequestDialog
      open={listing !== null}
      title="Request a mentoring session"
      submitLabel="Send request"
      messagePlaceholder="Hi! I'd love to learn… My experience so far is…"
      onClose={() => setListing(null)}
      summary={
        listing && (
          <>
            <p className="font-bold text-brand-900">{listing.title}</p>
            <p className="text-sm">
              with {mentor?.name} · {listing.durationMins} minutes
            </p>
            <p className="mt-2">
              <strong className="text-lg">{formatPrice(listing.price)}</strong> per session
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-ink/80">
              <li>✓ Price shown up front: {formatPrice(listing.price)} for {listing.durationMins} minutes</li>
              <li>✓ Cancellation: {listing.cancellation ?? "not stated. Ask the mentor."}</li>
              <li>✓ No payment is taken now. This prototype doesn't process payments.</li>
            </ul>
          </>
        )
      }
      onSubmit={async ({ message, proposedAt }) => {
        if (!user || !listing) return;
        await createRequest({
          kind: "session",
          fromId: user.id,
          toId: listing.mentorId,
          listingId: listing.id,
          message,
          proposedAt,
        });
      }}
    />
  );

  return { open, dialog };
}
