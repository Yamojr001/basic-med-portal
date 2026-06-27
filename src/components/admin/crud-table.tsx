import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, Save, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select" | "boolean" | "image";
  options?: { value: string; label: string }[];
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  /** For type: "image" — storage bucket to upload to. */
  bucket?: string;
  /** For type: "image" — folder prefix inside the bucket. */
  uploadFolder?: string;
};

export function CrudTable<T extends { id: string } & Record<string, unknown>>({
  table,
  queryKey,
  selectQuery = "*",
  columns,
  fields,
  orderBy = "created_at",
  ascending = false,
  title,
  defaults = {},
}: {
  table: string;
  queryKey: readonly unknown[];
  selectQuery?: string;
  columns: { key: string; label: string; render?: (row: T) => React.ReactNode }[];
  fields: Field[];
  orderBy?: string;
  ascending?: boolean;
  title: string;
  defaults?: Record<string, unknown>;
}) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select(selectQuery)
        .order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState<Record<string, unknown> | null>(null);

  function startCreate() {
    setCreating({ ...defaults });
  }

  async function save(values: Record<string, unknown>, id?: string) {
    try {
      const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "" && v !== undefined));
      if (id) {
        const { error } = await supabase.from(table as never).update(clean as never).eq("id", id);
        if (error) throw error;
        toast.success("Updated");
      } else {
        const { error } = await supabase.from(table as never).insert(clean as never);
        if (error) throw error;
        toast.success("Created");
      }
      setEditing(null);
      setCreating(null);
      qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-xl bg-[var(--medical)] px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>
      {creating ? <FormCard fields={fields} initial={creating} onCancel={() => setCreating(null)} onSave={(v) => save(v)} /> : null}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : (data ?? []).length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">No items yet.</td></tr>
            ) : (data ?? []).map((row) => (
              editing?.id === row.id ? (
                <tr key={row.id}>
                  <td colSpan={columns.length + 1} className="p-4 bg-[var(--surface)]">
                    <FormCard fields={fields} initial={row} onCancel={() => setEditing(null)} onSave={(v) => save(v, row.id)} />
                  </td>
                </tr>
              ) : (
                <tr key={row.id} className="border-t">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(row)} className="rounded-md p-2 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(row.id)} className="rounded-md p-2 text-destructive hover:bg-muted" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FormCard({
  fields, initial, onSave, onCancel,
}: {
  fields: Field[];
  initial: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  function set(k: string, v: unknown) { setValues((s) => ({ ...s, [k]: v })); }
  return (
    <div className="mb-4 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.fullWidth ? "md:col-span-2" : undefined}>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}{f.required ? " *" : ""}</label>
            {f.type === "textarea" ? (
              <textarea rows={3} value={(values[f.key] as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            ) : f.type === "select" ? (
              <select value={(values[f.key] as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="">—</option>
                {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === "boolean" ? (
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!values[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
                {f.placeholder ?? "Yes"}
              </label>
            ) : f.type === "image" ? (
              <ImageField
                value={(values[f.key] as string) ?? ""}
                onChange={(v) => set(f.key, v)}
                bucket={f.bucket ?? "lecturers"}
                folder={f.uploadFolder}
                placeholder={f.placeholder}
              />
            ) : (
              <input
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                value={(values[f.key] as string | number | undefined) ?? ""}
                onChange={(e) => set(f.key, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm"><X className="h-4 w-4"/>Cancel</button>
        <button onClick={() => onSave(values)} className="inline-flex items-center gap-1 rounded-lg bg-[var(--medical)] px-3 py-1.5 text-sm text-white"><Save className="h-4 w-4"/>Save</button>
      </div>
    </div>
  );
}

function ImageField({
  value, onChange, bucket, folder, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  bucket: string;
  folder?: string;
  placeholder?: string;
}) {
  const [busy, setBusy] = useState(false);
  async function handleFile(file: File) {
    if (!file) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder ? folder.replace(/\/$/, "") + "/" : ""}${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data, error: sErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !data?.signedUrl) throw sErr ?? new Error("Failed to sign URL");
      onChange(data.signedUrl);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-1 space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Paste an image URL"}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
          <UploadCloud className="h-3.5 w-3.5" />
          {busy ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="h-12 w-12 rounded-md border object-cover" />
            <button type="button" onClick={() => onChange("")} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
          </>
        ) : null}
      </div>
    </div>
  );
}