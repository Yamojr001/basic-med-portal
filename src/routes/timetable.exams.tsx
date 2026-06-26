import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { departmentsQuery, examTimetableQuery } from "@/lib/queries";
import { useState } from "react";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/timetable/exams")({
  head: () => ({ meta: [
    { title: "Examination Timetable — FBMS, FUD" },
    { name: "description", content: "Examination timetable across departments and levels." },
  ]}),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(examTimetableQuery),
      context.queryClient.ensureQueryData(departmentsQuery),
    ]);
  },
  component: Exams,
});

function Exams() {
  const { data: items } = useSuspenseQuery(examTimetableQuery);
  const { data: depts } = useSuspenseQuery(departmentsQuery);
  const [dept, setDept] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [sem, setSem] = useState<string>("all");

  const levels = Array.from(new Set(items.map((i) => i.level))).sort();
  const filtered = items.filter((i) =>
    (dept === "all" || i.department_id === dept) &&
    (level === "all" || String(i.level) === level) &&
    (sem === "all" || i.semester === sem));

  return (
    <SiteLayout>
      <PageHeader eyebrow="Schedule" title="Examination Timetable" />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap gap-3 print:hidden">
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-full border px-4 py-1.5 text-sm bg-card">
            <option value="all">All departments</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-full border px-4 py-1.5 text-sm bg-card">
            <option value="all">All levels</option>
            {levels.map((l) => <option key={l} value={String(l)}>{l} Level</option>)}
          </select>
          <select value={sem} onChange={(e) => setSem(e.target.value)} className="rounded-full border px-4 py-1.5 text-sm bg-card">
            <option value="all">All semesters</option>
            <option value="First">First</option>
            <option value="Second">Second</option>
          </select>
          <button onClick={() => window.print()} className="ml-auto inline-flex items-center gap-2 rounded-full bg-[var(--medical)] px-4 py-1.5 text-sm text-white">
            <Printer className="h-4 w-4"/> Print / PDF
          </button>
          <Link to="/timetable/lectures" className="rounded-full border px-4 py-1.5 text-sm">View lecture timetable</Link>
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Venue</th></tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{e.course_code}<span className="ml-2 text-muted-foreground font-normal">{e.course_title}</span></td>
                  <td className="px-4 py-3">{new Date(e.exam_date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-3">{e.start_time} – {e.end_time}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.venue ?? "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No exam entries yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </SiteLayout>
  );
}