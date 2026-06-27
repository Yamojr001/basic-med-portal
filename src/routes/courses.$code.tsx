import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { courseByCodeQuery, resourcesByCourseQuery } from "@/lib/queries";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/$code")({
  loader: async ({ context, params }) => {
    const course = await context.queryClient.ensureQueryData(courseByCodeQuery(params.code));
    if (!course) throw notFound();
    await context.queryClient.ensureQueryData(resourcesByCourseQuery(course.id));
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.course?.code ?? "Course"} — ${loaderData?.course?.title ?? ""} — FBMS, FUD` },
      { name: "description", content: loaderData?.course?.description ?? "Course resources." },
    ],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Course not found</h1>
        <Link to="/courses" className="mt-6 inline-block text-[var(--medical)]">Back to courses</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24"><p className="text-destructive">{error.message}</p></div>
    </SiteLayout>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData();
  const { data: resources } = useSuspenseQuery(resourcesByCourseQuery(course!.id));

  async function download(r: { id: string; file_url: string; file_name: string | null }) {
    try {
      let href = r.file_url;
      if (!/^https?:\/\//.test(r.file_url)) {
        const { data } = await supabase.storage.from("resources").createSignedUrl(r.file_url, 60 * 60);
        href = data?.signedUrl ?? "";
      }
      if (!href) throw new Error("File unavailable");
      await incrementResourceDownload({ data: { resource_id: r.id } });
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      if (r.file_name) a.download = r.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    }
  }

  const dept = (course as { department?: { name?: string } }).department;

  return (
    <SiteLayout>
      <PageHeader eyebrow={dept?.name ?? "Department"} title={`${course!.code} — ${course!.title}`} />
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-10 lg:grid-cols-3">
        <aside className="space-y-6 lg:col-span-1">
          <Info label="Course code" value={course!.code} />
          <Info label="Credit units" value={String(course!.credit_unit)} />
          <Info label="Level" value={`${course!.level} Level`} />
          <Info label="Semester" value={`${course!.semester} Semester`} />
          {course!.lecturer ? <Info label="Lecturer" value={course!.lecturer} /> : null}
          <Info label="Status" value={course!.status} />
        </aside>
        <div className="lg:col-span-2 space-y-10">
          {course!.description ? (
            <section>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{course!.description}</p>
            </section>
          ) : null}
          {course!.objectives ? (
            <section>
              <h2 className="text-lg font-semibold">Learning objectives</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-line">{course!.objectives}</p>
            </section>
          ) : null}
          <section>
            <h2 className="text-lg font-semibold">Downloadable resources</h2>
            <div className="mt-4 grid gap-3">
              {resources.length === 0 ? (
                <p className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">
                  No resources uploaded yet. Check back soon.
                </p>
              ) : (
                resources.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-2xl border bg-card p-5 shadow-soft">
                    <div className="flex items-start gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--medical)]/10 text-[var(--medical)]">
                        <FileText className="h-5 w-5"/>
                      </div>
                      <div>
                        <p className="font-semibold">{r.title}</p>
                        {r.description ? <p className="text-xs text-muted-foreground mt-1">{r.description}</p> : null}
                        <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                          {r.category} · {new Date(r.created_at).toLocaleDateString()} · {r.download_count} downloads
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => download(r)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--medical)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                    >
                      <Download className="h-4 w-4" /> Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}