import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { announcementBySlugQuery } from "@/lib/queries";
import { SiteLayout, PageHeader } from "@/components/site/layout";

export const Route = createFileRoute("/announcements/$slug")({
  loader: async ({ context, params }) => {
    const a = await context.queryClient.ensureQueryData(announcementBySlugQuery(params.slug));
    if (!a) throw notFound();
    return { a };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.a?.title ?? "Announcement"} — FBMS, FUD` },
      { name: "description", content: (loaderData?.a?.body ?? "").slice(0, 160) },
    ],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Announcement not found</h1>
        <Link to="/announcements" className="mt-6 inline-block text-[var(--medical)]">All announcements</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout><div className="mx-auto max-w-3xl px-6 py-24"><p className="text-destructive">{error.message}</p></div></SiteLayout>
  ),
  component: Detail,
});

function Detail() {
  const { a } = Route.useLoaderData();
  const { data } = useSuspenseQuery(announcementBySlugQuery(a!.slug));
  return (
    <SiteLayout>
      <PageHeader eyebrow={data!.category} title={data!.title} description={new Date(data!.publish_at).toLocaleDateString()} />
      <article className="mx-auto max-w-3xl px-6 py-10 prose prose-slate dark:prose-invert whitespace-pre-line">
        {data!.body}
      </article>
    </SiteLayout>
  );
}