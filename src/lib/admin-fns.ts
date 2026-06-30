import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED_TABLES = new Set([
  "departments", "courses", "resources", "announcements", "academic_calendar",
  "events", "gallery_images", "lecturers", "lecture_timetable", "exam_timetable",
  "quizzes", "quiz_questions", "quiz_attempts", "site_settings",
]);

const SAFE_COLUMN_RE = /^[a-z_][a-z0-9_]*$/;

function safeColumn(col: string): string {
  if (!SAFE_COLUMN_RE.test(col)) throw new Error(`Invalid column name: ${col}`);
  return col;
}

const TABLE_SELECT_SQL: Record<string, string> = {
  departments: "SELECT * FROM departments",
  courses: `SELECT c.*, json_build_object('id', d.id, 'name', d.name, 'slug', d.slug, 'code', d.code) as department
            FROM courses c LEFT JOIN departments d ON c.department_id = d.id`,
  resources: "SELECT * FROM resources",
  announcements: "SELECT * FROM announcements",
  academic_calendar: "SELECT * FROM academic_calendar",
  events: "SELECT * FROM events",
  gallery_images: "SELECT * FROM gallery_images",
  lecturers: `SELECT l.*, json_build_object('id', d.id, 'name', d.name, 'slug', d.slug, 'code', d.code) as department
              FROM lecturers l LEFT JOIN departments d ON l.department_id = d.id`,
  lecture_timetable: `SELECT lt.*, json_build_object('id', d.id, 'name', d.name, 'slug', d.slug) as department
                      FROM lecture_timetable lt LEFT JOIN departments d ON lt.department_id = d.id`,
  exam_timetable: `SELECT et.*, json_build_object('id', d.id, 'name', d.name, 'slug', d.slug) as department
                   FROM exam_timetable et LEFT JOIN departments d ON et.department_id = d.id`,
  quizzes: `SELECT q.*, json_build_object('code', c.code, 'title', c.title) as course,
            json_build_object('name', d.name) as department
            FROM quizzes q LEFT JOIN courses c ON q.course_id = c.id
            LEFT JOIN departments d ON q.department_id = d.id`,
  quiz_questions: "SELECT * FROM quiz_questions",
  quiz_attempts: "SELECT * FROM quiz_attempts",
  site_settings: "SELECT * FROM site_settings",
};

async function ensureAdmin(): Promise<{ sub: string; email: string; role: string }> {
  const { getRequest } = await import("@tanstack/react-start/server");
  const { verifyToken } = await import("@/lib/auth-server");
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const payload = await verifyToken(authHeader.slice(7));
  if (!payload) throw new Error("Unauthorized: Invalid token");
  if (payload.role !== "admin") throw new Error("Forbidden: Admin access required");
  return payload;
}

const adminFetchSchema = z.object({
  table: z.string(),
  orderBy: z.string().default("created_at"),
  ascending: z.boolean().default(false),
});

export const adminFetch = createServerFn({ method: "GET" })
  .validator((data: unknown) => adminFetchSchema.parse(data))
  .handler(async ({ data }) => {
    await ensureAdmin();
    if (!ALLOWED_TABLES.has(data.table)) throw new Error(`Table not allowed: ${data.table}`);
    const { query } = await import("@/lib/db");
    const col = safeColumn(data.orderBy);
    const dir = data.ascending ? "ASC" : "DESC";
    const baseQuery = TABLE_SELECT_SQL[data.table] ?? `SELECT * FROM ${data.table}`;
    return query(`${baseQuery} ORDER BY ${col} ${dir}`);
  });

const adminInsertSchema = z.object({
  table: z.string(),
  data: z.record(z.unknown()),
});

export const adminInsert = createServerFn({ method: "POST" })
  .validator((data: unknown) => adminInsertSchema.parse(data))
  .handler(async ({ data }) => {
    await ensureAdmin();
    if (!ALLOWED_TABLES.has(data.table)) throw new Error(`Table not allowed: ${data.table}`);
    const { query } = await import("@/lib/db");
    const clean = Object.fromEntries(
      Object.entries(data.data).filter(([, v]) => v !== "" && v !== undefined && v !== null || v === false || v === 0)
    );
    const cols = Object.keys(clean).map(safeColumn);
    const vals = Object.values(clean);
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
    if (cols.length === 0) throw new Error("No data provided");
    const rows = await query(
      `INSERT INTO ${data.table} (${cols.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      vals
    );
    return rows[0] ?? null;
  });

const adminUpdateSchema = z.object({
  table: z.string(),
  id: z.string(),
  data: z.record(z.unknown()),
});

export const adminUpdate = createServerFn({ method: "POST" })
  .validator((data: unknown) => adminUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await ensureAdmin();
    if (!ALLOWED_TABLES.has(data.table)) throw new Error(`Table not allowed: ${data.table}`);
    const { query } = await import("@/lib/db");
    const clean = Object.fromEntries(
      Object.entries(data.data).filter(([k]) => k !== "id")
        .filter(([, v]) => v !== "" && v !== undefined || v === false || v === 0)
    );
    const cols = Object.keys(clean).map(safeColumn);
    if (cols.length === 0) throw new Error("No data to update");
    const vals = Object.values(clean);
    const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const rows = await query(
      `UPDATE ${data.table} SET ${sets} WHERE id = $${vals.length + 1} RETURNING *`,
      [...vals, data.id]
    );
    return rows[0] ?? null;
  });

const adminDeleteSchema = z.object({ table: z.string(), id: z.string() });

export const adminDelete = createServerFn({ method: "POST" })
  .validator((data: unknown) => adminDeleteSchema.parse(data))
  .handler(async ({ data }) => {
    await ensureAdmin();
    if (!ALLOWED_TABLES.has(data.table)) throw new Error(`Table not allowed: ${data.table}`);
    const { execute } = await import("@/lib/db");
    const count = await execute(`DELETE FROM ${data.table} WHERE id = $1`, [data.id]);
    return { deleted: count > 0 };
  });

const settingsUpsertSchema = z.record(z.string());

export const adminUpsertSettings = createServerFn({ method: "POST" })
  .validator((data: unknown) => settingsUpsertSchema.parse(data))
  .handler(async ({ data }) => {
    await ensureAdmin();
    const { execute } = await import("@/lib/db");
    const allowed = [
      "faculty_name", "university_name", "about", "vision", "mission", "history",
      "dean_name", "dean_title", "dean_message", "dean_image_url", "logo_url", "banner_url",
      "contact_email", "contact_phone", "address", "social_facebook", "social_twitter",
      "social_instagram", "social_linkedin", "footer_text", "seo_title", "seo_description",
    ];
    const clean = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
    const cols = Object.keys(clean);
    const vals = Object.values(clean);
    if (cols.length === 0) return { ok: true };
    const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    await execute(
      `INSERT INTO site_settings (id, ${cols.join(", ")}) VALUES (1, ${vals.map((_, i) => `$${i + 1}`).join(", ")})
       ON CONFLICT (id) DO UPDATE SET ${sets}`,
      vals
    );
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" }).handler(async () => {
  await ensureAdmin();
  const { query } = await import("@/lib/db");
  return query<{ id: string; email: string; role: string; created_at: string }>(
    "SELECT id, email, role, created_at FROM users ORDER BY created_at"
  );
});

const roleSchema = z.object({ userId: z.string().uuid() });

export const adminGrantAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => roleSchema.parse(data))
  .handler(async ({ data }) => {
    await ensureAdmin();
    const { execute } = await import("@/lib/db");
    await execute("UPDATE users SET role = 'admin' WHERE id = $1", [data.userId]);
    return { ok: true };
  });

export const adminRevokeAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => roleSchema.parse(data))
  .handler(async ({ data }) => {
    const me = await ensureAdmin();
    if (me.sub === data.userId) throw new Error("Cannot revoke your own admin access.");
    const { execute } = await import("@/lib/db");
    await execute("UPDATE users SET role = 'user' WHERE id = $1", [data.userId]);
    return { ok: true };
  });
