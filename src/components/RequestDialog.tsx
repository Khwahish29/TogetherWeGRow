import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

export interface RequestDialogResult {
  message: string;
  proposedAt: string;
}

/** Accessible modal used for both mentoring session requests and buddy help requests. */
export function RequestDialog({
  open,
  title,
  summary,
  messagePlaceholder,
  submitLabel,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  summary: ReactNode;
  messagePlaceholder: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (result: RequestDialogResult) => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [proposedAt, setProposedAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setSent(false);
      setMessage("");
      setProposedAt("");
      dialog.showModal();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSubmit({ message: message.trim(), proposedAt });
    setBusy(false);
    setSent(true);
  }

  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="request-title"
      className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 backdrop:bg-brand-900/50"
    >
      <div className="p-6">
        <h2 id="request-title" className="text-2xl font-bold">
          {sent ? "Request sent" : title}
        </h2>
        {sent ? (
          <>
            <p className="mt-3">
              Your request is waiting for a reply. You'll see the status under <strong>Requests</strong> on your dashboard.
              You can change your mind at any time.
            </p>
            <button className="btn-primary mt-6 w-full" onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="rounded-xl bg-brand-50 p-4">{summary}</div>
            <div>
              <label htmlFor="req-when" className="label">
                Suggested date and time
              </label>
              <input
                id="req-when"
                type="datetime-local"
                className="input"
                required
                min={minDate}
                value={proposedAt}
                onChange={(e) => setProposedAt(e.target.value)}
              />
              <p className="hint mt-1">They can accept or suggest another time.</p>
            </div>
            <div>
              <label htmlFor="req-msg" className="label">
                A short message <span className="font-normal text-ink/60">(optional)</span>
              </label>
              <textarea
                id="req-msg"
                rows={3}
                className="input"
                placeholder={messagePlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? "Sending…" : submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
