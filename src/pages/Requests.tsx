import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, EmptyState, PageHeader, formatPrice } from "../components/ui";
import { useAuth } from "../lib/auth";
import { getListings, getRequests, getUsers, setRequestStatus } from "../lib/store";
import type { ConnectionRequest, Listing, RequestStatus, User } from "../lib/types";
import { useStore } from "../lib/useStore";

const STATUS_STYLE: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  declined: "bg-gray-200 text-gray-700",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Waiting for reply",
  accepted: "Accepted",
  declined: "Declined",
};

export function formatWhen(iso: string) {
  if (!iso) return "Time to be agreed";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
}

export function RequestItem({
  req,
  incoming,
  users,
  listings,
}: {
  req: ConnectionRequest;
  incoming: boolean;
  users: User[];
  listings: Listing[];
}) {
  const other = users.find((u) => u.id === (incoming ? req.fromId : req.toId));
  const listing = req.listingId ? listings.find((l) => l.id === req.listingId) : undefined;
  const title = req.kind === "session" ? (listing?.title ?? "Mentoring session") : `Digital help: ${req.topic ?? "technology"}`;

  return (
    <li className="card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {other && <Avatar name={other.name} />}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${STATUS_STYLE[req.status]}`}>{STATUS_LABEL[req.status]}</span>
            <span className="badge bg-brand-100 text-brand-800">{req.kind === "session" ? "Paid mentoring" : "Buddy help"}</span>
          </div>
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
          <p className="text-ink/80">
            {incoming ? "From" : "With"}{" "}
            {other ? (
              <Link to={`/mentors/${other.id}`} className="font-bold underline">
                {other.name}
              </Link>
            ) : (
              "a member"
            )}{" "}
            · {formatWhen(req.proposedAt)}
          </p>
          {listing && (
            <p className="mt-1 text-sm">
              {formatPrice(listing.price)} for {listing.durationMins} minutes · <em>payment arranged after acceptance (not part of this demo)</em>
            </p>
          )}
          {req.message && <p className="mt-3 rounded-xl bg-brand-50 p-3 italic">“{req.message}”</p>}
        </div>
        {incoming && req.status === "pending" && (
          <div className="flex gap-2 sm:flex-col">
            <button className="btn-primary" onClick={() => setRequestStatus(req.id, "accepted")}>
              Accept
            </button>
            <button className="btn-secondary" onClick={() => setRequestStatus(req.id, "declined")}>
              Decline
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default function Requests() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const requests = useStore(getRequests, []);
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  if (!user) return null;

  const incoming = requests.filter((r) => r.toId === user.id);
  const outgoing = requests.filter((r) => r.fromId === user.id);
  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <>
      <PageHeader eyebrow="Connections" title="Requests & sessions">
        Accept or decline requests, and follow the ones you've sent. Saying no is always fine.
      </PageHeader>
      <div className="container-page max-w-4xl py-10">
        <div role="tablist" aria-label="Request direction" className="mb-6 inline-flex rounded-xl bg-brand-100 p-1">
          {(["incoming", "outgoing"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-[44px] rounded-lg px-5 font-bold ${tab === t ? "bg-white text-brand-900 shadow" : "text-brand-800"}`}
            >
              {t === "incoming" ? `Received (${incoming.length})` : `Sent (${outgoing.length})`}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <EmptyState title={tab === "incoming" ? "No requests received yet" : "You haven't sent any requests yet"}>
            {tab === "incoming" ? (
              <Link to="/marketplace?create=1" className="btn-primary mt-3">
                Create a mentoring offer
              </Link>
            ) : (
              <Link to="/mentors" className="btn-primary mt-3">
                Find a mentor
              </Link>
            )}
          </EmptyState>
        ) : (
          <ul className="space-y-4">
            {list.map((r) => (
              <RequestItem key={r.id} req={r} incoming={tab === "incoming"} users={users} listings={listings} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
