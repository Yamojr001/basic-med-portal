import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { CrudTable, type Field } from "@/components/admin/crud-table";

export const Route = createFileRoute("/admin/announcements")({ component: Page });
const FIELDS: Field[] = [
  { key: "title", label: "Title", required: true },
  { key: "slug", label: "Slug", required: true, placeholder: "resumption-2025" },
  { key: "category", label: "Category", placeholder: "academic, examination, department, general" },
  { key: "publish_at", label: "Publish at", type: "date" },
  { key: "is_pinned", label: "Pinned", type: "boolean" },
  { key: "is_archived", label: "Archived", type: "boolean" },
  { key: "body", label: "Body", type: "textarea", fullWidth: true, required: true },
];
function Page() {
  return (
    <>
      <AdminHeader title="Announcements" />
      <CrudTable
        table="announcements"
        queryKey={["admin","announcements"]}
        title="All announcements"
        orderBy="publish_at"
        ascending={false}
        columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "publish_at", label: "Publish at", render: (r) => new Date(r.publish_at as string).toLocaleDateString() },
          { key: "is_pinned", label: "Pinned", render: (r) => r.is_pinned ? "Yes" : "—" },
          { key: "is_archived", label: "Archived", render: (r) => r.is_archived ? "Yes" : "—" },
        ]}
        fields={FIELDS}
        defaults={{ category: "general", publish_at: new Date().toISOString().slice(0,10) }}
      />
    </>
  );
}