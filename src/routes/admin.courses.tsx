import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { CrudTable, type Field } from "@/components/admin/crud-table";
import { useQuery } from "@tanstack/react-query";
import { departmentsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/courses")({ component: Page });

function Page() {
  const { data: depts } = useQuery(departmentsQuery);
  const fields: Field[] = [
    { key: "code", label: "Course code", required: true, placeholder: "MBC301" },
    { key: "title", label: "Title", required: true },
    { key: "department_id", label: "Department", type: "select", required: true, options: (depts ?? []).map((d) => ({ value: d.id, label: d.name })) },
    { key: "level", label: "Level", type: "number", required: true, placeholder: "300" },
    { key: "semester", label: "Semester", type: "select", required: true, options: [{value:"First",label:"First"},{value:"Second",label:"Second"}] },
    { key: "credit_unit", label: "Credit units", type: "number" },
    { key: "lecturer", label: "Lecturer" },
    { key: "status", label: "Status", placeholder: "active" },
    { key: "description", label: "Description", type: "textarea", fullWidth: true },
    { key: "objectives", label: "Learning objectives", type: "textarea", fullWidth: true },
  ];
  return (
    <>
      <AdminHeader title="Courses" />
      <CrudTable
        table="courses"
        queryKey={["admin","courses"]}
        selectQuery="*, department:departments(name)"
        title="All courses"
        orderBy="code"
        ascending
        columns={[
          { key: "code", label: "Code" },
          { key: "title", label: "Title" },
          { key: "department", label: "Dept", render: (r) => (r as { department?: { name?: string } }).department?.name ?? "—" },
          { key: "level", label: "Level" },
          { key: "semester", label: "Sem" },
          { key: "credit_unit", label: "Units" },
        ]}
        fields={fields}
        defaults={{ status: "active", credit_unit: 2, semester: "First" }}
      />
    </>
  );
}