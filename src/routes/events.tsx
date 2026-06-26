import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { eventsQuery } from "@/lib/queries";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [
    { title: "Faculty Events — FBMS, FUD" },
    { name: "description", content: "Seminars, workshops and conferences hosted by the faculty." },
  ]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  component: Events,
});
function Events() {
  const { data } = useSuspenseQuery(eventsQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Calendar" title="Events" description="Seminars, workshops, conferences and faculty meetings." />
      <div className="mx-auto max-w-5xl px-6 py-12 grid gap-4 md:grid-cols-2">
        {data.map((e) => (
          <div key={e.id} className="rounded-2xl border bg-card p-6 shadow-soft">
            <span className="rounded-full bg-[var(--emerald)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--emerald)]">{e.category ?? "Event"}</span>
            <h3 className="mt-3 font-semibold text-lg">{e.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{new Date(e.event_date).toLocaleDateString()} {e.event_time ? `· ${e.event_time}` : ""}</p>
            <p className="text-sm text-muted-foreground">{e.venue}</p>
            {e.description ? <p className="mt-3 text-sm">{e.description}</p> : null}
          </div>
        ))}
        {data.length === 0 ? <p className="text-muted-foreground col-span-2 text-center">No events yet.</p> : null}
      </div>
    </SiteLayout>
  );
}