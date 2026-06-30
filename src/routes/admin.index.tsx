import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { BookOpen, FileBox, Megaphone, Building2, GraduationCap, Download } from "lucide-react";

const fetchDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const { queryOne } = await import("@/lib/db");
  const row = await queryOne<{
    departments: string; courses: string; resources: string;
    announcements: string; quizzes: string; downloads: string;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM departments)::text as departments,
      (SELECT COUNT(*) FROM courses)::text as courses,
      (SELECT COUNT(*) FROM resources)::text as resources,
      (SELECT COUNT(*) FROM announcements)::text as announcements,
      (SELECT COUNT(*) FROM quizzes)::text as quizzes,
      (SELECT COALESCE(SUM(download_count), 0) FROM resources)::text as downloads
  `);
  return {
    departments: Number(row?.departments ?? 0),
    courses: Number(row?.courses ?? 0),
    resources: Number(row?.resources ?? 0),
    announcements: Number(row?.announcements ?? 0),
    quizzes: Number(row?.quizzes ?? 0),
    downloads: Number(row?.downloads ?? 0),
  };
});

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: () => fetchDashboardStats(),
  });

  const cards = [
    { label: "Departments", value: data?.departments, icon: Building2 },
    { label: "Courses", value: data?.courses, icon: BookOpen },
    { label: "Resources", value: data?.resources, icon: FileBox },
    { label: "Announcements", value: data?.announcements, icon: Megaphone },
    { label: "Quizzes", value: data?.quizzes, icon: GraduationCap },
    { label: "Total downloads", value: data?.downloads, icon: Download },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="Overview of department content and engagement." />
      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-6 shadow-soft">
            <c.icon className="h-5 w-5 text-[var(--medical)]" />
            <p className="mt-4 text-3xl font-semibold">
              {isLoading ? "…" : (c.value ?? "—")}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}
