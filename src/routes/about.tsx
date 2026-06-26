import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — FBMS, FUD" },
    { name: "description", content: "About the Faculty of Basic Medical Sciences, Federal University Dutse." },
  ]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: About,
});
function About() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="About" title="The Faculty" description={s?.about ?? undefined} />
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        {s?.vision ? <Section title="Vision" body={s.vision} /> : null}
        {s?.mission ? <Section title="Mission" body={s.mission} /> : null}
        {s?.history ? <Section title="History" body={s.history} /> : null}
        {s?.dean_message ? (
          <Section title={`Message from the Dean — ${s.dean_name ?? ""}`} body={s.dean_message} />
        ) : null}
      </div>
    </SiteLayout>
  );
}
function Section({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
    </section>
  );
}