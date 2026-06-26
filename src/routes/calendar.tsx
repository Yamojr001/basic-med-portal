import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { calendarQuery } from "@/lib/queries";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [
    { title: "Academic Calendar — FBMS, FUD" },
    { name: "description", content: "Registration, lectures, exams, breaks and result release dates." },
  ]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(calendarQuery),
  component: CalendarPage,
});

function CalendarPage() {
  const { data } = useSuspenseQuery(calendarQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Session" title="Academic Calendar" description="Key academic dates for the current and upcoming sessions." />
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-4">
        {data.map((c) => (
          <div key={c.id} className="flex gap-5 rounded-2xl border bg-card p-5 shadow-soft">
            <div className="shrink-0 grid h-14 w-14 place-items-center rounded-xl bg-[var(--medical)]/10 text-[var(--medical)]">
              <span className="text-[10px] font-semibold uppercase">{new Date(c.start_date).toLocaleString("en", { month: "short" })}</span>
              <span className="-mt-1 text-xl font-semibold">{new Date(c.start_date).getDate()}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.category} {c.session ? `· ${c.session}` : ""}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(c.start_date).toLocaleDateString()} {c.end_date ? `— ${new Date(c.end_date).toLocaleDateString()}` : ""}
              </p>
              {c.description ? <p className="mt-2 text-sm">{c.description}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}