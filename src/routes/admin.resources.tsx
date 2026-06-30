import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminInsert, adminDelete, adminFetch } from "@/lib/admin-fns";
import { allCoursesQuery } from "@/lib/queries";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/resources")({ component: Page });

type ResourceRow = {
  id: string; course_id: string; title: string; description: string | null;
  category: string; file_url: string; file_name: string | null; file_size: number | null;
  file_type: string | null; download_count: number; created_at: string;
  course: { code: string; title: string } | null;
};

function Page() {
  const qc = useQueryClient();
  const { data: courses } = useQuery(allCoursesQuery);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("handout");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: resources } = useQuery({
    queryKey: ["admin", "resources"],
    queryFn: () => adminFetch({ data: { table: "resources", orderBy: "created_at", ascending: false } }) as Promise<ResourceRow[]>,
  });

  async function add() {
    if (!courseId || !title || !fileUrl) {
      return toast.error("Course, title and file URL are required.");
    }
    setBusy(true);
    try {
      await adminInsert({
        data: {
          table: "resources",
          data: {
            course_id: courseId,
            title,
            description: desc || null,
            category,
            file_url: fileUrl,
            file_name: fileName || null,
          },
        },
      });
      toast.success("Resource added");
      setTitle(""); setDesc(""); setFileUrl(""); setFileName("");
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this resource?")) return;
    try {
      await adminDelete({ data: { table: "resources", id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <>
      <AdminHeader
        title="Course resources"
        description="Add links to PDFs, slides, manuals and other course materials."
      />
      <div className="p-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-semibold">Add a resource</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste a direct link to the file (Google Drive, Dropbox, any CDN URL).
          </p>
          <div className="mt-4 space-y-3">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">Choose course…</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {["handout", "assignment", "outline", "slides", "manual", "past-question", "video", "reference"].map(
                (c) => <option key={c} value={c}>{c}</option>
              )}
            </select>
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="File URL (required)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="File name (optional, e.g. notes.pdf)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <button
              disabled={busy}
              onClick={add}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--medical)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {busy ? "Adding…" : "Add resource"}
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Downloads</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(resources ?? []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--medical)]">
                      {r.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.course?.code ?? "—"}
                  </td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.download_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded-md p-2 text-destructive hover:bg-muted"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(resources ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No resources yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
