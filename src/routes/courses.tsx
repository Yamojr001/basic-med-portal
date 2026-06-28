import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { allCoursesQuery } from "@/lib/queries";
import { useState } from "react";

export const Route = createFileRoute("/courses")({
  loader: ({ context }) => context.queryClient.ensureQueryData(allCoursesQuery),
  head: () => ({
    meta: [
      { title: "Courses — Anatomy, FUD" },
      { name: "description", content: "All courses across the Department of Anatomy." },
    ],
  }),
  component: CoursesShell,
});

function CoursesShell() {
  const matchRoute = useMatchRoute();
  const isIndex = matchRoute({ to: "/courses" });
  if (!isIndex) return <Outlet />;
  return <CoursesIndex />;
}

function CoursesIndex() {
  const { data } = useSuspenseQuery(allCoursesQuery);
  const [q, setQ] = useState("");
  const filtered = data.filter((c) =>
    `${c.code} ${c.title} ${c.lecturer ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <SiteLayout>
      <PageHeader eyebrow="All courses" title="Course catalogue" description="Browse every course offered across the department." />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by code, title or lecturer…"
          className="w-full max-w-md rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-[var(--medical)]"
        />
        <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Dept</th>
                <th className="px-4 py-3">Level/Sem</th>
                <th className="px-4 py-3 text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-[var(--medical)]">
                    <Link to="/courses/$code" params={{ code: c.code }}>{c.code}</Link>
                  </td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{(c as { department?: { name?: string } }).department?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.level}L · {c.semester}</td>
                  <td className="px-4 py-3 text-right">{c.credit_unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SiteLayout>
  );
}