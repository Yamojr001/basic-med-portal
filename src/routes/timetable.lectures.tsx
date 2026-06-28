import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { departmentsQuery, lectureTimetableQuery } from "@/lib/queries";
import { useState } from "react";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/timetable/lectures")({
  head: () => ({ meta: [
    { title: "Lecture Timetable — Anatomy, FUD" },
    { name: "description", content: "Lecture timetables across all departments and levels." },
  ]}),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(lectureTimetableQuery),
      context.queryClient.ensureQueryData(departmentsQuery),
    ]);
  },
  component: Lectures,
});

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function Lectures() {
  const { data: items } = useSuspenseQuery(lectureTimetableQuery);
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
      <PageHeader eyebrow="Schedule" title="Lecture Timetable" description="Filter by department, level and semester. Print or save as PDF." />
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
          <Link to="/timetable/exams" className="rounded-full border px-4 py-1.5 text-sm">View exam timetable</Link>
        </div>
        <div className="mt-8 grid gap-6">
          {DAYS.map((day) => {
            const rows = filtered.filter((i) => i.day_of_week === day);
            if (rows.length === 0) return null;
            return (
              <div key={day} className="rounded-2xl border bg-card overflow-hidden">
                <h2 className="px-5 py-3 bg-[var(--surface)] font-semibold">{day}</h2>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="px-4 py-2">Course</th><th className="px-4 py-2">Lecturer</th><th className="px-4 py-2">Time</th><th className="px-4 py-2">Venue</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-4 py-2 font-semibold">{r.course_code}<span className="ml-2 text-muted-foreground font-normal">{r.course_title}</span></td>
                        <td className="px-4 py-2 text-muted-foreground">{r.lecturer ?? "—"}</td>
                        <td className="px-4 py-2">{r.start_time} – {r.end_time}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.venue ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
          {filtered.length === 0 ? (
            <p className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">No timetable entries yet.</p>
          ) : null}
        </div>
      </div>
    </SiteLayout>
  );
}