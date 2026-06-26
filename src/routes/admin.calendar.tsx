import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { CrudTable, type Field } from "@/components/admin/crud-table";

export const Route = createFileRoute("/admin/calendar")({ component: Page });
const FIELDS: Field[] = [
  { key: "title", label: "Title", required: true },
  { key: "category", label: "Category", placeholder: "registration | lectures | exam | break | results" },
  { key: "start_date", label: "Start date", type: "date", required: true },
  { key: "end_date", label: "End date", type: "date" },
  { key: "session", label: "Session", placeholder: "2025/2026" },
  { key: "is_archived", label: "Archived", type: "boolean" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
];
function Page() {
  return (
    <>
      <AdminHeader title="Academic Calendar" />
      <CrudTable
        table="academic_calendar"
        queryKey={["admin","calendar"]}
        title="Calendar entries"
        orderBy="start_date"
        ascending
        columns={[
          { key: "start_date", label: "Start" },
          { key: "end_date", label: "End" },
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "session", label: "Session" },
        ]}
        fields={FIELDS}
      />
    </>
  );
}