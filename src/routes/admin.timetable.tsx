import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { CrudTable, type Field } from "@/components/admin/crud-table";
import { useQuery } from "@tanstack/react-query";
import { departmentsQuery } from "@/lib/queries";
import { useState } from "react";

export const Route = createFileRoute("/admin/timetable")({ component: Page });

function Page() {
  const [tab, setTab] = useState<"lectures" | "exams">("lectures");
  const { data: depts } = useQuery(departmentsQuery);
  const deptOpts = (depts ?? []).map((d) => ({ value: d.id, label: d.name }));
  const semOpts = [{value:"First",label:"First"},{value:"Second",label:"Second"}];

  const lectureFields: Field[] = [
    { key: "department_id", label: "Department", type: "select", required: true, options: deptOpts },
    { key: "level", label: "Level", type: "number", required: true },
    { key: "semester", label: "Semester", type: "select", required: true, options: semOpts },
    { key: "course_code", label: "Course code", required: true },
    { key: "course_title", label: "Course title" },
    { key: "lecturer", label: "Lecturer" },
    { key: "day_of_week", label: "Day", type: "select", required: true, options: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d)=>({value:d,label:d})) },
    { key: "start_time", label: "Start time", required: true, placeholder: "09:00" },
    { key: "end_time", label: "End time", required: true, placeholder: "11:00" },
    { key: "venue", label: "Venue" },
  ];
  const examFields: Field[] = [
    { key: "department_id", label: "Department", type: "select", required: true, options: deptOpts },
    { key: "level", label: "Level", type: "number", required: true },
    { key: "semester", label: "Semester", type: "select", required: true, options: semOpts },
    { key: "course_code", label: "Course code", required: true },
    { key: "course_title", label: "Course title" },
    { key: "exam_date", label: "Date", type: "date", required: true },
    { key: "start_time", label: "Start time", required: true },
    { key: "end_time", label: "End time", required: true },
    { key: "venue", label: "Venue" },
  ];

  return (
    <>
      <AdminHeader title="Timetable" />
      <div className="px-6 pt-4 flex gap-2">
        <button onClick={() => setTab("lectures")} className={`rounded-full border px-4 py-1.5 text-sm ${tab==="lectures"?"bg-[var(--medical)] text-white border-transparent":""}`}>Lectures</button>
        <button onClick={() => setTab("exams")} className={`rounded-full border px-4 py-1.5 text-sm ${tab==="exams"?"bg-[var(--medical)] text-white border-transparent":""}`}>Exams</button>
      </div>
      {tab === "lectures" ? (
        <CrudTable
          table="lecture_timetable"
          queryKey={["admin","lecture_timetable"]}
          title="Lecture entries"
          orderBy="day_of_week"
          ascending
          columns={[
            { key: "day_of_week", label: "Day" },
            { key: "course_code", label: "Course" },
            { key: "level", label: "L" },
            { key: "semester", label: "Sem" },
            { key: "start_time", label: "Start" },
            { key: "end_time", label: "End" },
            { key: "venue", label: "Venue" },
          ]}
          fields={lectureFields}
        />
      ) : (
        <CrudTable
          table="exam_timetable"
          queryKey={["admin","exam_timetable"]}
          title="Exam entries"
          orderBy="exam_date"
          ascending
          columns={[
            { key: "exam_date", label: "Date" },
            { key: "course_code", label: "Course" },
            { key: "level", label: "L" },
            { key: "semester", label: "Sem" },
            { key: "start_time", label: "Start" },
            { key: "end_time", label: "End" },
            { key: "venue", label: "Venue" },
          ]}
          fields={examFields}
        />
      )}
    </>
  );
}