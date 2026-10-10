import { useState } from "react";
import { Link } from "react-router-dom";
import { ProfileForm } from "../components/ProfileForm";
import { Avatar, PageHeader } from "../components/ui";
import { useAuth } from "../lib/auth";
import { saveUser } from "../lib/store";

export default function Profile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  if (!user) return null;

  return (
    <>
      <PageHeader eyebrow="My profile" title={user.name}>
        Keep your skills and preferences up to date. Changes are saved when you press Save.
      </PageHeader>
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        <ProfileForm
          key={user.id}
          initial={user}
          submitLabel="Save changes"
          onSubmit={async (fields) => {
            await saveUser({ ...user, ...fields });
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
          }}
          intro={
            saved && (
              <p role="status" className="rounded-xl bg-brand-100 p-4 font-bold text-brand-800">
                ✓ Your profile has been saved.
              </p>
            )
          }
        />
        <aside className="space-y-4">
          <div className="card text-center">
            <Avatar name={user.name} size="lg" />
            <p className="mt-3 font-bold">{user.name}</p>
            <p className="text-sm text-ink/70">{user.email}</p>
            <Link to={`/mentors/${user.id}`} className="btn-secondary mt-4 w-full">
              View public profile
            </Link>
          </div>
          <Link to="/profile/create" className="btn-ghost w-full">
            Describe my experience again
          </Link>
        </aside>
      </div>
    </>
  );
}
