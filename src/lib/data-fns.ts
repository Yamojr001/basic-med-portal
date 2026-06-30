import { createServerFn } from "@tanstack/react-start";

export const fetchSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { queryOne } = await import("@/lib/db");
  return queryOne("SELECT * FROM site_settings WHERE id = 1");
});

export const fetchDepartments = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query("SELECT * FROM departments ORDER BY sort_order ASC");
});

export const fetchDepartmentBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { queryOne } = await import("@/lib/db");
    return queryOne("SELECT * FROM departments WHERE slug = $1", [slug]);
  });

export const fetchAllCourses = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query<{
    id: string; department_id: string; code: string; title: string;
    credit_unit: number; lecturer: string | null; level: number;
    semester: string; description: string | null; objectives: string | null;
    status: string; created_at: string; updated_at: string;
    department: { name: string; slug: string; code: string | null } | null;
  }>(`
    SELECT c.*, json_build_object('name', d.name, 'slug', d.slug, 'code', d.code) as department
    FROM courses c LEFT JOIN departments d ON c.department_id = d.id
    ORDER BY c.code
  `);
});

export const fetchCourseByCode = createServerFn({ method: "GET" })
  .validator((code: string) => code)
  .handler(async ({ data: code }) => {
    const { queryOne } = await import("@/lib/db");
    return queryOne<{
      id: string; department_id: string; code: string; title: string;
      credit_unit: number; lecturer: string | null; level: number;
      semester: string; description: string | null; objectives: string | null;
      status: string; created_at: string; updated_at: string;
      department: { name: string; slug: string; code: string | null } | null;
    }>(`
      SELECT c.*, json_build_object('name', d.name, 'slug', d.slug, 'code', d.code) as department
      FROM courses c LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.code = $1
    `, [code]);
  });

export const fetchCoursesByDepartment = createServerFn({ method: "GET" })
  .validator((departmentId: string) => departmentId)
  .handler(async ({ data: departmentId }) => {
    const { query } = await import("@/lib/db");
    return query(
      "SELECT * FROM courses WHERE department_id = $1 ORDER BY level, semester, code",
      [departmentId]
    );
  });

export const fetchResourcesByCourse = createServerFn({ method: "GET" })
  .validator((courseId: string) => courseId)
  .handler(async ({ data: courseId }) => {
    const { query } = await import("@/lib/db");
    return query(
      "SELECT * FROM resources WHERE course_id = $1 ORDER BY created_at DESC",
      [courseId]
    );
  });

export const fetchAnnouncements = createServerFn({ method: "GET" })
  .validator((limit: number | null) => limit)
  .handler(async ({ data: limit }) => {
    const { query } = await import("@/lib/db");
    const sql = `
      SELECT * FROM announcements
      WHERE publish_at <= NOW() AND is_archived = false
      ORDER BY is_pinned DESC, publish_at DESC
      ${limit ? `LIMIT ${Number(limit)}` : ""}
    `;
    return query(sql);
  });

export const fetchAnnouncementBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { queryOne } = await import("@/lib/db");
    return queryOne("SELECT * FROM announcements WHERE slug = $1", [slug]);
  });

export const fetchCalendar = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query("SELECT * FROM academic_calendar WHERE is_archived = false ORDER BY start_date");
});

export const fetchEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query("SELECT * FROM events ORDER BY event_date ASC");
});

export const fetchGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query("SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC");
});

export const fetchLecturers = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query<{
    id: string; name: string; title: string | null; position: string | null;
    department_id: string | null; qualifications: string | null;
    specialization: string | null; bio: string | null; office: string | null;
    image_url: string | null; sort_order: number; is_published: boolean;
    department: { name: string; slug: string; code: string | null } | null;
  }>(`
    SELECT l.id, l.name, l.title, l.position, l.department_id, l.qualifications,
           l.specialization, l.bio, l.office, l.image_url, l.sort_order, l.is_published,
           json_build_object('name', d.name, 'slug', d.slug, 'code', d.code) as department
    FROM lecturers l LEFT JOIN departments d ON l.department_id = d.id
    WHERE l.is_published = true
    ORDER BY l.sort_order, l.name
  `);
});

export const fetchLectureTimetable = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query<{
    id: string; department_id: string; level: number; semester: string;
    course_code: string; course_title: string | null; lecturer: string | null;
    day_of_week: string; start_time: string; end_time: string; venue: string | null;
    created_at: string; department: { name: string; slug: string } | null;
  }>(`
    SELECT lt.*, json_build_object('name', d.name, 'slug', d.slug) as department
    FROM lecture_timetable lt LEFT JOIN departments d ON lt.department_id = d.id
    ORDER BY lt.day_of_week, lt.start_time
  `);
});

export const fetchExamTimetable = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query<{
    id: string; department_id: string; level: number; semester: string;
    course_code: string; course_title: string | null; exam_date: string;
    start_time: string; end_time: string; venue: string | null;
    created_at: string; department: { name: string; slug: string } | null;
  }>(`
    SELECT et.*, json_build_object('name', d.name, 'slug', d.slug) as department
    FROM exam_timetable et LEFT JOIN departments d ON et.department_id = d.id
    ORDER BY et.exam_date, et.start_time
  `);
});

export const fetchQuizzes = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  return query(`
    SELECT q.*,
           json_build_object('code', c.code, 'title', c.title) as course,
           json_build_object('name', d.name) as department
    FROM quizzes q
    LEFT JOIN courses c ON q.course_id = c.id
    LEFT JOIN departments d ON q.department_id = d.id
    WHERE q.is_published = true
    ORDER BY q.created_at DESC
  `);
});

export const fetchQuizDetail = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { queryOne, query } = await import("@/lib/db");
    const [quiz, questions] = await Promise.all([
      queryOne(`
        SELECT q.*,
               json_build_object('code', c.code, 'title', c.title) as course,
               json_build_object('name', d.name) as department
        FROM quizzes q
        LEFT JOIN courses c ON q.course_id = c.id
        LEFT JOIN departments d ON q.department_id = d.id
        WHERE q.id = $1
      `, [id]),
      query(
        "SELECT id, quiz_id, question_type, question_text, options, points, sort_order FROM quiz_questions WHERE quiz_id = $1 ORDER BY sort_order",
        [id]
      ),
    ]);
    return { quiz, questions };
  });

export const fetchHomeCounts = createServerFn({ method: "GET" }).handler(async () => {
  const { queryOne } = await import("@/lib/db");
  const row = await queryOne<{
    departments: string; courses: string; lectures: string;
    exams: string; announcements: string; quizzes: string; calendar: string;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM departments) as departments,
      (SELECT COUNT(*) FROM courses) as courses,
      (SELECT COUNT(*) FROM lecture_timetable) as lectures,
      (SELECT COUNT(*) FROM exam_timetable) as exams,
      (SELECT COUNT(*) FROM announcements) as announcements,
      (SELECT COUNT(*) FROM quizzes) as quizzes,
      (SELECT COUNT(*) FROM academic_calendar) as calendar
  `);
  return {
    departments: Number(row?.departments ?? 0),
    courses: Number(row?.courses ?? 0),
    timetable: Number(row?.lectures ?? 0) + Number(row?.exams ?? 0),
    announcements: Number(row?.announcements ?? 0),
    quizzes: Number(row?.quizzes ?? 0),
    calendar: Number(row?.calendar ?? 0),
  };
});

export const getFileUrl = createServerFn({ method: "GET" })
  .validator((path: string) => path)
  .handler(async ({ data: path }) => {
    return path;
  });
