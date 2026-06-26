import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { announcementsQuery } from "@/lib/queries";
import { Pin } from "lucide-react";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [
    { title: "Announcements — FBMS, FUD" },
    { name: "description", content: "Latest faculty and departmental announcements." },
  ]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(announcementsQuery()),
  component: () => {
    const m = useMatchRoute();
    return m({ to: "/announcements" }) ? <List /> : <Outlet />;
  },
});

function List() {
  const { data } = useSuspenseQuery(announcementsQuery());
  return (
    <SiteLayout>
      <PageHeader eyebrow="Notices" title="Announcements" description="Stay up to date with academic, examination and departmental news." />
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-4">
        {data.map((a) => (
          <Link key={a.id} to="/announcements/$slug" params={{ slug: a.slug }} className="block rounded-2xl border bg-card p-6 shadow-soft hover:border-[var(--medical)]/40 transition">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[var(--medical)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--medical)]">{a.category}</span>
              <span className="text-xs text-muted-foreground">{new Date(a.publish_at).toLocaleDateString()}</span>
            </div>
            <h2 className="mt-3 flex items-center gap-2 font-semibold text-lg">
              {a.is_pinned ? <Pin className="h-4 w-4 text-[var(--emerald)]" /> : null}
              {a.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.body}</p>
          </Link>
        ))}
        {data.length === 0 ? <p className="text-muted-foreground text-center">No announcements yet.</p> : null}
      </div>
    </SiteLayout>
  );
}