import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { lecturersQuery } from "@/lib/queries";

export const Route = createFileRoute("/lecturers")({
  head: () => ({
    meta: [
      { title: "Lecturers — Anatomy, FUD" },
      {
        name: "description",
        content:
          "Meet the lecturers of the Department of Anatomy, Federal University Dutse — their qualifications, specialties and contact details.",
      },
      { property: "og:title", content: "Lecturers — Anatomy, FUD" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(lecturersQuery),
  component: Lecturers,
});

function Lecturers() {
  const { data: lecturers } = useSuspenseQuery(lecturersQuery);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Our team"
        title="Department lecturers"
        description="The teachers and researchers shaping the next generation of healthcare professionals at FUD."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        {lecturers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No lecturer profiles published yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lecturers.map((l) => (
              <article
                key={l.id}
                className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-[var(--medical)]/40"
              >
                <div className="flex items-start gap-4">
                  {l.image_url ? (
                    <img
                      src={l.image_url}
                      alt={l.name}
                      className="h-20 w-20 rounded-xl object-cover ring-2 ring-[var(--medical)]/10"
                    />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-xl bg-[var(--medical)]/10 text-xl font-semibold text-[var(--medical)]">
                      {l.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-foreground">
                      {l.title ? `${l.title} ` : ""}
                      {l.name}
                    </h2>
                    {l.position ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--medical)]">
                        {l.position}
                      </p>
                    ) : null}
                    {l.department?.name ? (
                      <p className="mt-1 text-xs text-muted-foreground">{l.department.name}</p>
                    ) : null}
                  </div>
                </div>

                {l.specialization ? (
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Specialization
                  </p>
                ) : null}
                {l.specialization ? (
                  <p className="mt-1 text-sm text-foreground">{l.specialization}</p>
                ) : null}

                {l.bio ? (
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-4">{l.bio}</p>
                ) : null}

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {l.qualifications ? (
                    <p className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-[var(--emerald)]" />
                      {l.qualifications}
                    </p>
                  ) : null}
                  {l.office ? (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {l.office}
                    </p>
                  ) : null}
                  {l.email ? (
                    <a
                      href={`mailto:${l.email}`}
                      className="flex items-center gap-2 hover:text-[var(--medical)]"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {l.email}
                    </a>
                  ) : null}
                  {l.phone ? (
                    <a
                      href={`tel:${l.phone}`}
                      className="flex items-center gap-2 hover:text-[var(--medical)]"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {l.phone}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}