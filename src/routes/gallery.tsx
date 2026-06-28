import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { galleryQuery } from "@/lib/queries";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Anatomy, FUD" }, { name: "description", content: "Department gallery — laboratories, events and student life." }]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  component: Gallery,
});
function Gallery() {
  const { data } = useSuspenseQuery(galleryQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Visual archive" title="Gallery" />
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data.map((g) => (
          <figure key={g.id} className="overflow-hidden rounded-2xl border bg-card">
            <img src={g.image_url} alt={g.title ?? ""} className="h-56 w-full object-cover" loading="lazy" />
            {g.caption ? <figcaption className="p-3 text-xs text-muted-foreground">{g.caption}</figcaption> : null}
          </figure>
        ))}
        {data.length === 0 ? <p className="text-muted-foreground col-span-full text-center py-12">No gallery images yet.</p> : null}
      </div>
    </SiteLayout>
  );
}