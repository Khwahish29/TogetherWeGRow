import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import type { ResumeJob } from "../../shared/types";

export interface ResumeData {
  name: string;
  phone: string;
  email: string;
  location: string;
  summary: string;
  jobs: ResumeJob[];
  skills: string[];
  training: string[];
}

export type ResumeSection = "name" | "phone" | "email" | "location" | "summary" | "jobs" | "skills" | "training" | null;

/** Highlights the part of the résumé currently being filled in. */
function Spot({ active, children, className = "" }: { active: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-lg transition-colors ${
        active ? "resume-active bg-warm-50 outline outline-2 outline-offset-4 outline-warm-400" : ""
      } ${className}`}
    >
      {active && (
        <span className="resume-active-label absolute -top-3 right-2 rounded-full bg-warm-500 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">
          Filling in now
        </span>
      )}
      {children}
    </div>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="resume-placeholder inline-block rounded border border-dashed border-ink/20 px-2 text-ink/35">{children}</span>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b-2 border-brand-700 pb-1 font-sans text-[0.8rem] font-bold uppercase tracking-[0.15em] text-brand-800">
      {children}
    </h3>
  );
}

export function ResumePreview({ data, active }: { data: ResumeData; active: ResumeSection }) {
  const contact = [
    { key: "phone" as const, icon: Phone, value: data.phone, label: "Phone number" },
    { key: "email" as const, icon: Mail, value: data.email, label: "Email" },
    { key: "location" as const, icon: MapPin, value: data.location, label: "Town or city" },
  ];

  return (
    <article
      id="resume-paper"
      aria-label="Résumé preview"
      className="rounded-md border border-ink/10 bg-white p-7 text-[0.9rem] leading-relaxed text-ink shadow-[0_20px_50px_-20px_rgba(16,48,33,0.35)] sm:p-10"
    >
      <Spot active={active === "name"}>
        <h2 className="font-serif text-3xl font-bold text-brand-900 sm:text-4xl">
          {data.name || <Placeholder>Your name</Placeholder>}
        </h2>
      </Spot>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-ink/80">
        {contact.map(({ key, icon: Icon, value, label }) =>
          value || active === key ? (
            <li key={key}>
              <Spot active={active === key} className="px-1">
                <span className="inline-flex items-center gap-1.5">
                  <Icon aria-hidden="true" className="h-4 w-4 text-brand-600" />
                  {value || <Placeholder>{label}</Placeholder>}
                </span>
              </Spot>
            </li>
          ) : null,
        )}
      </ul>

      {(data.summary || active === "summary") && (
        <section className="mt-6">
          <SectionTitle>Profile</SectionTitle>
          <Spot active={active === "summary"} className="mt-2">
            {data.summary ? <p className="pop-in">{data.summary}</p> : <Placeholder>A short introduction will appear here</Placeholder>}
          </Spot>
        </section>
      )}

      <section className="mt-6">
        <SectionTitle>Experience</SectionTitle>
        <Spot active={active === "jobs"} className="mt-2 space-y-4">
          {data.jobs.length === 0 && <Placeholder>Your jobs will appear here as you describe them</Placeholder>}
          {data.jobs.map((job, i) => (
            <div key={i} className="pop-in">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="font-bold text-brand-900">
                  {job.title || "Role"}
                  {job.employer && <span className="font-normal text-ink/80"> · {job.employer}</span>}
                  {job.location && <span className="font-normal text-ink/60">, {job.location}</span>}
                </p>
                {(job.start || job.end) && (
                  <p className="text-sm text-ink/60">
                    {job.start}
                    {job.start && job.end ? " – " : ""}
                    {job.end}
                  </p>
                )}
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {job.bullets.filter(Boolean).map((b) => (
                  <li key={b} className="pop-in rounded">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Spot>
      </section>

      {(data.skills.length > 0 || active === "skills") && (
        <section className="mt-6">
          <SectionTitle>Skills</SectionTitle>
          <Spot active={active === "skills"} className="mt-2">
            {data.skills.length ? (
              <p>{data.skills.join(" · ")}</p>
            ) : (
              <Placeholder>Your skills will appear here</Placeholder>
            )}
          </Spot>
        </section>
      )}

      {(data.training.length > 0 || active === "training") && (
        <section className="mt-6">
          <SectionTitle>Training & certificates</SectionTitle>
          <Spot active={active === "training"} className="mt-2">
            {data.training.length ? (
              <ul className="list-disc pl-5">
                {data.training.map((t) => (
                  <li key={t} className="pop-in">
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder>Any courses, licences, or certificates</Placeholder>
            )}
          </Spot>
        </section>
      )}
    </article>
  );
}
