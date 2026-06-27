import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitSchema = z.object({
  quiz_id: z.string().uuid(),
  student_name: z.string().max(200).optional().nullable(),
  matric_number: z.string().max(50).optional().nullable(),
  answers: z.record(z.string(), z.string()),
});

export const submitQuizAttempt = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: quiz, error: qErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, passing_score, is_published")
      .eq("id", data.quiz_id)
      .maybeSingle();
    if (qErr) throw new Error(qErr.message);
    if (!quiz || !quiz.is_published) throw new Error("Quiz not available");

    const { data: questions, error: quesErr } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, correct_answer, points")
      .eq("quiz_id", data.quiz_id);
    if (quesErr) throw new Error(quesErr.message);

    let score = 0;
    let total = 0;
    for (const q of questions ?? []) {
      total += q.points;
      const given = (data.answers[q.id] ?? "").trim().toLowerCase();
      const correct = (q.correct_answer ?? "").trim().toLowerCase();
      if (given && given === correct) score += q.points;
    }
    const percentage = total > 0 ? Math.round((score / total) * 100 * 100) / 100 : 0;
    const passed = percentage >= quiz.passing_score;

    const { error: insErr } = await supabaseAdmin.from("quiz_attempts").insert({
      quiz_id: data.quiz_id,
      student_name: data.student_name?.trim() || null,
      matric_number: data.matric_number?.trim() || null,
      score,
      total_points: Math.max(total, 1),
      percentage,
      passed,
      answers: data.answers,
    });
    if (insErr) throw new Error(insErr.message);

    return { score, total, percentage, passed };
  });

const incrementSchema = z.object({ resource_id: z.string().uuid() });

export const incrementResourceDownload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => incrementSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: selErr } = await supabaseAdmin
      .from("resources")
      .select("download_count")
      .eq("id", data.resource_id)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);
    if (!row) return { ok: false };
    const { error } = await supabaseAdmin
      .from("resources")
      .update({ download_count: (row.download_count ?? 0) + 1 })
      .eq("id", data.resource_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });