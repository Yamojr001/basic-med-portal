import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { departmentsQuery } from "@/lib/queries";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Anatomy, FUD" },
      { name: "description", content: "The Department of Anatomy, Federal University Dutse." },
      { property: "og:title", content: "Departments — Anatomy, FUD" },
      { property: "og:description", content: "Nine specialised departments of basic medical sciences at FUD." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(departmentsQuery),
  component: DepartmentsLayout,
});

function DepartmentsLayout() {
  const matchRoute = useMatchRoute();
  const isIndex = matchRoute({ to: "/departments" });
  if (!isIndex) return <Outlet />;
  return <DepartmentsIndex />;
}

function DepartmentsIndex() {
  const { data } = useSuspenseQuery(departmentsQuery);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Academic structure"
        title="Departments"
        description="Each department offers its own curriculum, lecturers, and research focus."
      />
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((d) => (
          <Link
            key={d.id}
            to="/departments/$slug"
            params={{ slug: d.slug }}
            className="group rounded-2xl border bg-card p-6 shadow-soft hover:border-[var(--medical)]/40 hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--medical)]/10 text-[var(--medical)] font-semibold">
                {d.code ?? d.name.slice(0, 2).toUpperCase()}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--medical)] transition" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{d.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{d.description}</p>
            {d.head_of_department ? (
              <p className="mt-4 text-xs text-muted-foreground">HOD: {d.head_of_department}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </SiteLayout>
  );
}