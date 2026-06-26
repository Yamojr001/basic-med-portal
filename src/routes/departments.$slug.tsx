import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { coursesByDepartmentQuery, departmentBySlugQuery } from "@/lib/queries";
import { useState } from "react";

export const Route = createFileRoute("/departments/$slug")({
  loader: async ({ context, params }) => {
    const dept = await context.queryClient.ensureQueryData(departmentBySlugQuery(params.slug));
    if (!dept) throw notFound();
    await context.queryClient.ensureQueryData(coursesByDepartmentQuery(dept.id));
    return { dept };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.dept?.name ?? "Department"} — FBMS, FUD` },
      { name: "description", content: loaderData?.dept?.description ?? "Department of basic medical sciences." },
    ],
  }),
  component: DepartmentDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Department not found</h1>
        <Link to="/departments" className="mt-6 inline-block text-[var(--medical)]">Back to departments</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-destructive">{error.message}</p>
      </div>
    </SiteLayout>
  ),
});

function DepartmentDetail() {
  const { dept } = Route.useLoaderData();
  const { data: courses } = useSuspenseQuery(coursesByDepartmentQuery(dept!.id));
  const [level, setLevel] = useState<number | "all">("all");
  const [semester, setSemester] = useState<string>("all");

  const levels = Array.from(new Set(courses.map((c) => c.level))).sort();
  const filtered = courses.filter(
    (c) => (level === "all" || c.level === level) && (semester === "all" || c.semester === semester),
  );

  return (
    <SiteLayout>
      <PageHeader eyebrow="Department" title={dept!.name} description={dept!.description ?? undefined} />
      <div className="mx-auto max-w-7xl px-6 py-10">
        {dept!.head_of_department ? (
          <p className="text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-foreground">Head of Department:</span> {dept!.head_of_department}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 mb-8">
          <Chip label="All levels" active={level === "all"} onClick={() => setLevel("all")} />
          {levels.map((l) => (
            <Chip key={l} label={`${l} Level`} active={level === l} onClick={() => setLevel(l)} />
          ))}
          <span className="mx-2 text-muted-foreground">·</span>
          {(["all", "First", "Second"] as const).map((s) => (
            <Chip
              key={s}
              label={s === "all" ? "All semesters" : `${s} semester`}
              active={semester === s}
              onClick={() => setSemester(s)}
            />
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            No courses match the selected filters yet.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to="/courses/$code"
                params={{ code: c.code }}
                className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:border-[var(--medical)]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[var(--medical)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--medical)]">
                    {c.code}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.level} Level · {c.semester} Semester · {c.credit_unit} units
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{c.title}</h3>
                {c.lecturer ? <p className="mt-1 text-xs text-muted-foreground">{c.lecturer}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${active ? "border-[var(--medical)] bg-[var(--medical)]/10 text-[var(--medical)]" : "border-border text-muted-foreground hover:border-foreground/30"}`}
    >
      {label}
    </button>
  );
}