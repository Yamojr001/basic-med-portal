import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const departmentsQuery = queryOptions({
  queryKey: ["departments"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const departmentBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["departments", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const coursesByDepartmentQuery = (departmentId: string) =>
  queryOptions({
    queryKey: ["courses", "byDept", departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("department_id", departmentId)
        .order("level")
        .order("semester")
        .order("code");
      if (error) throw error;
      return data;
    },
  });

export const allCoursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*, department:departments(name,slug,code)")
      .order("code");
    if (error) throw error;
    return data;
  },
});

export const courseByCodeQuery = (code: string) =>
  queryOptions({
    queryKey: ["course", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, department:departments(name,slug,code)")
        .eq("code", code)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const resourcesByCourseQuery = (courseId: string) =>
  queryOptions({
    queryKey: ["resources", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const announcementsQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["announcements", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("announcements")
        .select("*")
        .lte("publish_at", new Date().toISOString())
        .eq("is_archived", false)
        .order("is_pinned", { ascending: false })
        .order("publish_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const announcementBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["announcement", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const calendarQuery = queryOptions({
  queryKey: ["calendar"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("academic_calendar")
      .select("*")
      .eq("is_archived", false)
      .order("start_date");
    if (error) throw error;
    return data;
  },
});

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const lectureTimetableQuery = queryOptions({
  queryKey: ["lecture_timetable"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("lecture_timetable")
      .select("*, department:departments(name,slug)")
      .order("day_of_week")
      .order("start_time");
    if (error) throw error;
    return data;
  },
});

export const examTimetableQuery = queryOptions({
  queryKey: ["exam_timetable"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("exam_timetable")
      .select("*, department:departments(name,slug)")
      .order("exam_date")
      .order("start_time");
    if (error) throw error;
    return data;
  },
});

export const quizzesQuery = queryOptions({
  queryKey: ["quizzes"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, course:courses(code,title), department:departments(name)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const quizDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["quiz", id],
    queryFn: async () => {
      const [{ data: quiz, error: e1 }, { data: questions, error: e2 }] = await Promise.all([
        supabase
          .from("quizzes")
          .select("*, course:courses(code,title), department:departments(name)")
          .eq("id", id)
          .maybeSingle(),
        supabase.from("quiz_questions").select("*").eq("quiz_id", id).order("sort_order"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { quiz, questions: questions ?? [] };
    },
  });

export async function fileUrl(path: string) {
  const { data } = await supabase.storage.from("resources").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? "";
}