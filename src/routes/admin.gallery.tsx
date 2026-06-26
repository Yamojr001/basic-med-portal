import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/admin/gallery")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: items } = useQuery({
    queryKey: ["admin","gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function upload() {
    if (!file) return toast.error("Select an image");
    setBusy(true);
    try {
      const path = `${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = await supabase.storage.from("gallery").createSignedUrl(path, 60*60*24*365*10);
      const { error } = await supabase.from("gallery_images").insert({
        title: title || null, caption: caption || null, category: category || null, image_url: pub?.signedUrl ?? path,
      });
      if (error) throw error;
      toast.success("Uploaded");
      setTitle(""); setCaption(""); setCategory(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["admin","gallery"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin","gallery"] });
  }
  return (
    <>
      <AdminHeader title="Gallery" />
      <div className="p-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-semibold">Upload image</h2>
          <div className="mt-4 space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
            <button disabled={busy} onClick={upload} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--medical)] py-2.5 text-sm font-semibold text-white"><UploadCloud className="h-4 w-4"/>{busy?"Uploading…":"Upload"}</button>
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {(items ?? []).map((g) => (
            <div key={g.id} className="relative overflow-hidden rounded-xl border bg-card">
              <img src={g.image_url} alt={g.title ?? ""} className="h-40 w-full object-cover" loading="lazy" />
              <button onClick={() => remove(g.id)} className="absolute top-2 right-2 rounded-full bg-card/80 p-1.5 text-destructive backdrop-blur"><Trash2 className="h-3.5 w-3.5"/></button>
              {g.caption ? <p className="p-2 text-xs text-muted-foreground truncate">{g.caption}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}