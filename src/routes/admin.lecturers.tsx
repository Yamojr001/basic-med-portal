import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin/shell";
import { CrudTable, type Field } from "@/components/admin/crud-table";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/lecturers")({ component: Page });

function Page() {
  const { data: depts } = useQuery({
    queryKey: ["departments", "options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("id,name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
  const FIELDS: Field[] = [
    { key: "name", label: "Full name", required: true },
    { key: "title", label: "Title", placeholder: "Prof., Dr., Mr., Mrs." },
    { key: "position", label: "Position", placeholder: "Senior Lecturer, HOD…" },
    {
      key: "department_id",
      label: "Department",
      type: "select",
      options: (depts ?? []).map((d) => ({ value: d.id, label: d.name })),
    },
    { key: "qualifications", label: "Qualifications", placeholder: "B.Sc., M.Sc., Ph.D." },
    { key: "specialization", label: "Specialization" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "office", label: "Office" },
    { key: "image_url", label: "Photo", type: "image", bucket: "lecturers", uploadFolder: "photos", fullWidth: true, placeholder: "Paste an image URL or upload below" },
    { key: "bio", label: "Brief bio", type: "textarea", fullWidth: true },
    { key: "sort_order", label: "Sort order", type: "number" },
    { key: "is_published", label: "Published", type: "boolean", placeholder: "Visible on site" },
  ];
  return (
    <>
      <AdminHeader title="Lecturers" description="Faculty staff profiles shown on the public Lecturers page." />
      <CrudTable
        table="lecturers"
        queryKey={["admin", "lecturers"]}
        title="Faculty lecturers"
        orderBy="sort_order"
        ascending
        defaults={{ is_published: true, sort_order: 0 }}
        columns={[
          { key: "name", label: "Name" },
          { key: "position", label: "Position" },
          { key: "specialization", label: "Specialization" },
          { key: "email", label: "Email" },
          { key: "is_published", label: "Published", render: (r) => (r.is_published ? "Yes" : "No") },
        ]}
        fields={FIELDS}
      />
    </>
  );
}