import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch, adminInsert, adminDelete } from "@/lib/admin-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/gallery")({ component: Page });

type GalleryItem = { id: string; title: string | null; caption: string | null; category: string | null; image_url: string; sort_order: number; created_at: string };

function Page() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: () => adminFetch({ data: { table: "gallery_images", orderBy: "created_at", ascending: false } }) as Promise<GalleryItem[]>,
  });

  async function add() {
    if (!imageUrl) return toast.error("Image URL is required");
    setBusy(true);
    try {
      await adminInsert({
        data: {
          table: "gallery_images",
          data: {
            title: title || null,
            caption: caption || null,
            category: category || null,
            image_url: imageUrl,
            sort_order: 0,
          },
        },
      });
      toast.success("Image added");
      setTitle(""); setCaption(""); setCategory(""); setImageUrl("");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    try {
      await adminDelete({ data: { table: "gallery_images", id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <>
      <AdminHeader title="Gallery" />
      <div className="p-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-semibold">Add image</h2>
          <div className="mt-4 space-y-3">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (required)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="h-24 w-full rounded-lg object-cover border" />
            )}
            <button
              disabled={busy}
              onClick={add}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--medical)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {busy ? "Adding…" : "Add image"}
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {(items ?? []).map((g) => (
            <div key={g.id} className="relative overflow-hidden rounded-xl border bg-card">
              <img src={g.image_url} alt={g.title ?? ""} className="h-40 w-full object-cover" loading="lazy" />
              <button
                onClick={() => remove(g.id)}
                className="absolute top-2 right-2 rounded-full bg-card/80 p-1.5 text-destructive backdrop-blur"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {g.caption ? (
                <p className="p-2 text-xs text-muted-foreground truncate">{g.caption}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
