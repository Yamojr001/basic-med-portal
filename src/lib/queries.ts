import { queryOptions } from "@tanstack/react-query";
import {
  fetchSettings, fetchDepartments, fetchDepartmentBySlug,
  fetchAllCourses, fetchCourseByCode, fetchCoursesByDepartment,
  fetchResourcesByCourse, fetchAnnouncements, fetchAnnouncementBySlug,
  fetchCalendar, fetchEvents, fetchGallery, fetchLecturers,
  fetchLectureTimetable, fetchExamTimetable, fetchQuizzes,
  fetchQuizDetail, fetchHomeCounts, getFileUrl,
} from "@/lib/data-fns";

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: () => fetchSettings(),
});

export const departmentsQuery = queryOptions({
  queryKey: ["departments"],
  queryFn: () => fetchDepartments(),
});

export const departmentBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["departments", slug],
    queryFn: () => fetchDepartmentBySlug({ data: slug }),
  });

export const allCoursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: () => fetchAllCourses(),
});

export const courseByCodeQuery = (code: string) =>
  queryOptions({
    queryKey: ["course", code],
    queryFn: () => fetchCourseByCode({ data: code }),
  });

export const coursesByDepartmentQuery = (departmentId: string) =>
  queryOptions({
    queryKey: ["courses", "byDept", departmentId],
    queryFn: () => fetchCoursesByDepartment({ data: departmentId }),
  });

export const resourcesByCourseQuery = (courseId: string) =>
  queryOptions({
    queryKey: ["resources", courseId],
    queryFn: () => fetchResourcesByCourse({ data: courseId }),
  });

export const announcementsQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["announcements", limit ?? "all"],
    queryFn: () => fetchAnnouncements({ data: limit ?? null }),
  });

export const announcementBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["announcement", slug],
    queryFn: () => fetchAnnouncementBySlug({ data: slug }),
  });

export const calendarQuery = queryOptions({
  queryKey: ["calendar"],
  queryFn: () => fetchCalendar(),
});

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: () => fetchEvents(),
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => fetchGallery(),
});

export const lecturersQuery = queryOptions({
  queryKey: ["lecturers"],
  queryFn: () => fetchLecturers(),
});

export const lectureTimetableQuery = queryOptions({
  queryKey: ["lecture_timetable"],
  queryFn: () => fetchLectureTimetable(),
});

export const examTimetableQuery = queryOptions({
  queryKey: ["exam_timetable"],
  queryFn: () => fetchExamTimetable(),
});

export const quizzesQuery = queryOptions({
  queryKey: ["quizzes"],
  queryFn: () => fetchQuizzes(),
});

export const quizDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["quiz", id],
    queryFn: () => fetchQuizDetail({ data: id }),
  });

export const homeCountsQuery = queryOptions({
  queryKey: ["home_counts"],
  queryFn: () => fetchHomeCounts(),
});

export async function fileUrl(path: string): Promise<string> {
  return getFileUrl({ data: path });
}
