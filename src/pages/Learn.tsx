import { Link } from "react-router-dom";

export default function Learn() {
  return (
    <div className="bg-gradient-to-b from-brand-50 to-warm-50">
      <div className="container-page py-14 text-center">
        <p className="font-bold uppercase tracking-widest text-warm-700 text-sm">Learn your way</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">How would you like to learn today?</h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-ink/80">
          Choose what feels comfortable. You can change your mind anytime.
        </p>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 text-left md:grid-cols-2">
          <Link to="/learn/ai" className="group card border-2 border-transparent p-8 transition hover:-translate-y-1 hover:border-brand-600 hover:shadow-lg">
            <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
              💬
            </span>
            <h2 className="mt-5 text-2xl font-bold group-hover:underline">Learn with AI</h2>
            <p className="mt-2 text-lg text-ink/80">
              Simple explanations, voice questions, step-by-step instructions, and unlimited patience.
            </p>
            <span className="btn-primary mt-6">Start with AI</span>
          </Link>
          <Link to="/learn/buddies" className="group card border-2 border-transparent p-8 transition hover:-translate-y-1 hover:border-brand-600 hover:shadow-lg">
            <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-100 text-3xl">
              🤝
            </span>
            <h2 className="mt-5 text-2xl font-bold group-hover:underline">Learn with a Human</h2>
            <p className="mt-2 text-lg text-ink/80">
              Find a friendly digital buddy who can guide you through unfamiliar technology, online or in person.
            </p>
            <span className="btn-primary mt-6">Find a buddy</span>
          </Link>
        </div>

        <p className="mt-10 font-serif text-2xl text-brand-900">No pressure. No judgment. Just support.</p>
        <p className="mx-auto mt-2 max-w-xl text-ink/75">
          You can use both options, or choose not to learn a particular tool at all. That's a perfectly good choice too.
        </p>
      </div>
    </div>
  );
}
