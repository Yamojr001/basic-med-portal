import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { allCoursesQuery } from "@/lib/queries";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Trash2, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/admin/resources")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { data: courses } = useQuery(allCoursesQuery);
  const [courseId, setCourseId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("handout");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: resources } = useQuery({
    queryKey: ["admin", "resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*, course:courses(code,title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function upload() {
    if (!file || !courseId || !title) {
      toast.error("Course, title and file are required.");
      return;
    }
    setBusy(true);
    try {
      const path = `${courseId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("resources").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { error } = await supabase.from("resources").insert({
        course_id: courseId,
        title,
        description: desc || null,
        category,
        file_url: path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });
      if (error) throw error;
      toast.success("Resource uploaded");
      setTitle(""); setDesc(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setBusy(false); }
  }

  async function remove(id: string, path: string) {
    if (!confirm("Delete this resource?")) return;
    try {
      await supabase.storage.from("resources").remove([path]);
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "resources"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <>
      <AdminHeader title="Course resources" description="Upload PDFs, slides, manuals and other materials." />
      <div className="p-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-semibold">Upload a resource</h2>
          <div className="mt-4 space-y-3">
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">Choose course…</option>
              {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["handout","assignment","outline","slides","manual","past-question","video","reference"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
            <button disabled={busy} onClick={upload} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--medical)] py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              <UploadCloud className="h-4 w-4" /> {busy ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Downloads</th><th></th></tr>
            </thead>
            <tbody>
              {(resources ?? []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{(r as { course?: { code?: string } }).course?.code ?? "—"}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.download_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(r.id, r.file_url)} className="rounded-md p-2 text-destructive hover:bg-muted"><Trash2 className="h-4 w-4"/></button>
                  </td>
                </tr>
              ))}
              {(resources ?? []).length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No resources yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}