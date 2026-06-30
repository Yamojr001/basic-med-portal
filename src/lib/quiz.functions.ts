import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitSchema = z.object({
  quiz_id: z.string().uuid(),
  student_name: z.string().max(200).optional().nullable(),
  matric_number: z.string().max(50).optional().nullable(),
  answers: z.record(z.string(), z.string()),
});

export const submitQuizAttempt = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryOne, query, execute } = await import("@/lib/db");

    const quiz = await queryOne<{ id: string; passing_score: number; is_published: boolean }>(
      "SELECT id, passing_score, is_published FROM quizzes WHERE id = $1",
      [data.quiz_id]
    );
    if (!quiz || !quiz.is_published) throw new Error("Quiz not available");

    const questions = await query<{ id: string; correct_answer: string; points: number }>(
      "SELECT id, correct_answer, points FROM quiz_questions WHERE quiz_id = $1",
      [data.quiz_id]
    );

    let score = 0;
    let total = 0;
    for (const q of questions) {
      total += q.points;
      const given = (data.answers[q.id] ?? "").trim().toLowerCase();
      const correct = (q.correct_answer ?? "").trim().toLowerCase();
      if (given && given === correct) score += q.points;
    }
    const percentage = total > 0 ? Math.round((score / total) * 100 * 100) / 100 : 0;
    const passed = percentage >= quiz.passing_score;

    await execute(
      `INSERT INTO quiz_attempts (quiz_id, student_name, matric_number, score, total_points, percentage, passed, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.quiz_id,
        data.student_name?.trim() || null,
        data.matric_number?.trim() || null,
        score,
        Math.max(total, 1),
        percentage,
        passed,
        JSON.stringify(data.answers),
      ]
    );

    return { score, total, percentage, passed };
  });

const incrementSchema = z.object({ resource_id: z.string().uuid() });

export const incrementResourceDownload = createServerFn({ method: "POST" })
  .validator((data: unknown) => incrementSchema.parse(data))
  .handler(async ({ data }) => {
    const { execute } = await import("@/lib/db");
    const count = await execute(
      "UPDATE resources SET download_count = download_count + 1 WHERE id = $1",
      [data.resource_id]
    );
    return { ok: count > 0 };
  });
