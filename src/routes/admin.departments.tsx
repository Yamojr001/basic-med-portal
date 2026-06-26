import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { CrudTable, type Field } from "@/components/admin/crud-table";

export const Route = createFileRoute("/admin/departments")({ component: Page });

const FIELDS: Field[] = [
  { key: "name", label: "Name", required: true },
  { key: "slug", label: "Slug", required: true, placeholder: "anatomy" },
  { key: "code", label: "Code" },
  { key: "head_of_department", label: "Head of Department" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "description", label: "Description", type: "textarea", fullWidth: true },
  { key: "image_url", label: "Image URL", fullWidth: true },
];

function Page() {
  return (
    <>
      <AdminHeader title="Departments" description="Manage the nine faculty departments." />
      <CrudTable
        table="departments"
        queryKey={["admin", "departments"]}
        title="All departments"
        orderBy="sort_order"
        ascending
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "code", label: "Code" },
          { key: "head_of_department", label: "HOD" },
          { key: "sort_order", label: "Order" },
        ]}
        fields={FIELDS}
      />
    </>
  );
}