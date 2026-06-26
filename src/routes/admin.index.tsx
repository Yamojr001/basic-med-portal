import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, FileBox, Megaphone, Building2, GraduationCap, Download } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function useCount(table: string) {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table as never).select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function useTotalDownloads() {
  return useQuery({
    queryKey: ["downloads-total"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("download_count");
      if (error) throw error;
      return (data ?? []).reduce((s, r) => s + (r.download_count ?? 0), 0);
    },
  });
}

function Dashboard() {
  const dept = useCount("departments");
  const courses = useCount("courses");
  const res = useCount("resources");
  const anns = useCount("announcements");
  const quiz = useCount("quizzes");
  const dl = useTotalDownloads();

  const cards = [
    { label: "Departments", value: dept.data, icon: Building2 },
    { label: "Courses", value: courses.data, icon: BookOpen },
    { label: "Resources", value: res.data, icon: FileBox },
    { label: "Announcements", value: anns.data, icon: Megaphone },
    { label: "Quizzes", value: quiz.data, icon: GraduationCap },
    { label: "Total downloads", value: dl.data, icon: Download },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="Overview of faculty content and engagement." />
      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-6 shadow-soft">
            <c.icon className="h-5 w-5 text-[var(--medical)]" />
            <p className="mt-4 text-3xl font-semibold">{c.value ?? "—"}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}