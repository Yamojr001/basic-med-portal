import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { CrudTable, type Field } from "@/components/admin/crud-table";

export const Route = createFileRoute("/admin/events")({ component: Page });
const FIELDS: Field[] = [
  { key: "title", label: "Title", required: true },
  { key: "category", label: "Category", placeholder: "seminar, workshop, conference" },
  { key: "event_date", label: "Date", type: "date", required: true },
  { key: "event_time", label: "Time", placeholder: "09:00 AM" },
  { key: "venue", label: "Venue" },
  { key: "image_url", label: "Image URL" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
];
function Page() {
  return (
    <>
      <AdminHeader title="Events" />
      <CrudTable
        table="events"
        queryKey={["admin","events"]}
        title="Department events"
        orderBy="event_date"
        ascending
        columns={[
          { key: "event_date", label: "Date" },
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "venue", label: "Venue" },
        ]}
        fields={FIELDS}
      />
    </>
  );
}