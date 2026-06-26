import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: Page });

const TEXT_FIELDS: { key: string; label: string; textarea?: boolean }[] = [
  { key: "faculty_name", label: "Faculty name" },
  { key: "university_name", label: "University name" },
  { key: "about", label: "About", textarea: true },
  { key: "vision", label: "Vision", textarea: true },
  { key: "mission", label: "Mission", textarea: true },
  { key: "history", label: "History", textarea: true },
  { key: "dean_name", label: "Dean name" },
  { key: "dean_title", label: "Dean title" },
  { key: "dean_message", label: "Dean message", textarea: true },
  { key: "dean_image_url", label: "Dean image URL" },
  { key: "logo_url", label: "Logo URL" },
  { key: "banner_url", label: "Banner URL" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "address", label: "Address", textarea: true },
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_twitter", label: "Twitter URL" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
  { key: "footer_text", label: "Footer text" },
  { key: "seo_title", label: "SEO title" },
  { key: "seo_description", label: "SEO description", textarea: true },
];

function Page() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) {
      const v: Record<string, string> = {};
      for (const f of TEXT_FIELDS) v[f.key] = (data as Record<string, unknown>)[f.key] as string ?? "";
      setValues(v);
    }
  }, [data]);

  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...values });
    if (error) toast.error(error.message);
    else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["site_settings"] }); }
  }

  return (
    <>
      <AdminHeader title="Site settings" action={
        <button onClick={save} className="rounded-xl bg-[var(--medical)] px-4 py-2 text-sm font-semibold text-white">Save</button>
      } />
      <div className="p-6 grid gap-4 md:grid-cols-2">
        {TEXT_FIELDS.map((f) => (
          <div key={f.key} className={f.textarea ? "md:col-span-2" : undefined}>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</label>
            {f.textarea ? (
              <textarea rows={4} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm" />
            ) : (
              <input value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}