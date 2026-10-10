import { PageHeader } from "../components/ui";
import { VibeCheck } from "../components/VibeCheck";

export default function VibeCheckPage() {
  return (
    <>
      <PageHeader eyebrow="Vibe Check" title="Different generations. Different words. The same wish to be understood.">
        Paste a message you weren't sure about, and we'll explain what it probably means and how it sounds. Or type what you
        want to say, and we'll suggest a clearer way to say it. It works in both directions.
      </PageHeader>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <VibeCheck />
        <aside className="space-y-6 text-[0.95rem]">
          <div className="rounded-3xl bg-brand-100/70 p-6">
            <p className="font-semibold text-brand-900">Why it exists</p>
            <p className="mt-2 text-muted">
              "That advice was clutch" and "measure twice, cut once" both carry real meaning. When words get in the way, people
              can feel awkward or misunderstood. Vibe Check helps the conversation keep going.
            </p>
          </div>
          <div className="rounded-3xl border border-warm-200 bg-white p-6 text-muted">
            <p className="font-semibold text-brand-900">How to use it kindly</p>
            <ul className="mt-2 space-y-2">
              <li>It explains the usual meaning, and tells you when it isn't sure.</li>
              <li>It never guesses someone's age from their words.</li>
              <li>When in doubt, asking the person directly is always a good choice.</li>
              <li>What you type is sent to an outside text service to explain it. Leave out private details.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
