import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ListingCard } from "../components/cards";
import { useBooking } from "../components/useBooking";
import { EmptyState, PageHeader, PeopleTabs } from "../components/ui";
import { useAuth } from "../lib/auth";
import { createListing, getListings, getUsers } from "../lib/store";
import type { Format } from "../lib/types";
import { useStore } from "../lib/useStore";

const CATEGORIES = ["Carpentry", "Business", "Mechanical", "Cooking", "Plumbing", "Electrical", "Health & Care", "Teaching", "Other"];

function CreateOfferForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState(25);
  if (!user) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    await createListing({
      mentorId: user!.id,
      title: String(form.get("title")).trim(),
      category: String(form.get("category")),
      description: String(form.get("description")).trim(),
      format: String(form.get("format")) as Format,
      durationMins: Number(form.get("duration")),
      price: Number(form.get("price")),
      cancellation: String(form.get("cancellation")),
    });
    setBusy(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 border-2 border-brand-600" aria-labelledby="create-title">
      <h2 id="create-title" className="text-2xl font-bold">
        Create a mentoring offer
      </h2>
      <p className="text-muted">
        Your knowledge is valuable. Set a price that feels fair. You can change or remove the offer any time.
      </p>
      <div>
        <label htmlFor="title" className="label">
          Session title
        </label>
        <input id="title" name="title" className="input" required placeholder="e.g. Traditional Woodworking Basics" />
      </div>
      <div>
        <label htmlFor="description" className="label">
          What will learners get from it?
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          required
          placeholder="e.g. Learn material selection, woodworking techniques, and how to plan your first project."
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="label">
            Skill category
          </label>
          <select id="category" name="category" className="input" defaultValue={CATEGORIES[0]}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="format" className="label">
            Session format
          </label>
          <select id="format" name="format" className="input" defaultValue={user.format}>
            <option value="both">Online or in person</option>
            <option value="online">Online</option>
            <option value="in-person">In person</option>
          </select>
        </div>
        <div>
          <label htmlFor="duration" className="label">
            Length
          </label>
          <select id="duration" name="duration" className="input" defaultValue="60">
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1½ hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="label">
            Price per session ($)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            max={1000}
            className="input"
            required
            defaultValue={25}
            aria-describedby="price-share"
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
          />
          <p id="price-share" className="hint mt-1.5">
            Under our proposed model you'd keep 90%: ${(price * 0.9).toFixed(2)} a session. The other 10% (${(price * 0.1).toFixed(2)}) would
            cover running the platform. Payments aren't handled through the site yet.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cancellation" className="label">
            Cancellation terms (shown before anyone books)
          </label>
          <select id="cancellation" name="cancellation" className="input" defaultValue="Free to cancel up to 24 hours before">
            <option>Free to cancel up to 24 hours before</option>
            <option>Free to cancel up to 48 hours before</option>
            <option>Free to cancel any time</option>
            <option>Reschedule only, with 24 hours' notice</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" className="btn-ghost" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={busy}>
          Publish offer
        </button>
      </div>
    </form>
  );
}

export default function Marketplace() {
  const { user } = useAuth();
  const users = useStore(getUsers, []);
  const listings = useStore(getListings, []);
  const booking = useBooking(users);
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState("All");
  const creating = params.get("create") === "1";
  const isMentor = user?.roles.includes("mentor");

  const categories = ["All", ...new Set(listings.map((l) => l.category))];
  const shown = listings.filter((l) => category === "All" || l.category === category);

  return (
    <>
      <PageHeader eyebrow="Mentorship marketplace" title="Paid sessions with experienced professionals">
        Every mentor sets their own fair price. Requesting a session is free; nothing is charged until you both agree.
      </PageHeader>
      <PeopleTabs />
      <div className="container-page py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${
                  category === c ? "border-brand-700 bg-brand-700 text-white" : "border-brand-200 bg-white text-brand-800"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {isMentor && !creating && (
            <button className="btn-warm" onClick={() => setParams({ create: "1" })}>
              + Create an offer
            </button>
          )}
          {!user && (
            <Link to="/signup?role=mentor" className="btn-secondary">
              Offer your own sessions
            </Link>
          )}
        </div>

        {creating && (
          <div className="mb-10">
            {isMentor ? (
              <CreateOfferForm onDone={() => setParams({})} />
            ) : (
              <p className="notice">
                To create offers, add <strong>Mentor / expert</strong> to your roles on{" "}
                <Link to="/profile" className="font-bold underline">
                  your profile
                </Link>
                .
              </p>
            )}
          </div>
        )}

        <h2 className="sr-only">Mentoring sessions</h2>
        {shown.length === 0 ? (
          <EmptyState title="No sessions in this category yet" />
        ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                mentor={users.find((u) => u.id === l.mentorId)}
                isOwn={l.mentorId === user?.id}
                onRequest={() => booking.open(l)}
              />
            ))}
          </div>
        )}
      </div>
      {booking.dialog}
    </>
  );
}
