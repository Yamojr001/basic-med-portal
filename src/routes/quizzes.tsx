import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { quizzesQuery } from "@/lib/queries";

export const Route = createFileRoute("/quizzes")({
  head: () => ({ meta: [{ title: "Quizzes — FBMS, FUD" }, { name: "description", content: "Self-test quizzes across FBMS courses." }]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(quizzesQuery),
  component: () => {
    const m = useMatchRoute();
    return m({ to: "/quizzes" }) ? <List /> : <Outlet />;
  },
});
function List() {
  const { data } = useSuspenseQuery(quizzesQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Self-assessment" title="Quizzes" description="Take quick quizzes to test your understanding. No login required." />
      <div className="mx-auto max-w-5xl px-6 py-12 grid gap-4 md:grid-cols-2">
        {data.map((q) => (
          <Link key={q.id} to="/quizzes/$id" params={{ id: q.id }} className="rounded-2xl border bg-card p-6 shadow-soft hover:border-[var(--medical)]/40 transition">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--medical)]">{(q as { department?: { name?: string } }).department?.name ?? "General"}</p>
            <h3 className="mt-2 font-semibold">{q.title}</h3>
            {q.description ? <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{q.description}</p> : null}
            <p className="mt-4 text-xs text-muted-foreground">Pass score: {q.passing_score}% {q.time_limit_minutes ? `· ${q.time_limit_minutes} min` : ""}</p>
          </Link>
        ))}
        {data.length === 0 ? <p className="text-muted-foreground col-span-2 text-center">No quizzes published yet.</p> : null}
      </div>
    </SiteLayout>
  );
}