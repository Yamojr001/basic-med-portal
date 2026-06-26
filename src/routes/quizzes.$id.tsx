import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { quizDetailQuery } from "@/lib/queries";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/quizzes/$id")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(quizDetailQuery(params.id));
    if (!d.quiz) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.quiz?.title ?? "Quiz"} — FBMS, FUD` }, { name: "description", content: loaderData?.quiz?.description ?? "Quiz" }],
  }),
  notFoundComponent: () => (<SiteLayout><div className="mx-auto max-w-3xl px-6 py-24 text-center"><h1 className="text-3xl font-semibold">Quiz not found</h1></div></SiteLayout>),
  errorComponent: ({ error }) => (<SiteLayout><div className="mx-auto max-w-3xl px-6 py-24"><p className="text-destructive">{error.message}</p></div></SiteLayout>),
  component: QuizPage,
});

type Question = { id: string; question_type: string; question_text: string; options: unknown; correct_answer: string; points: number };

function QuizPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(quizDetailQuery(id));
  const quiz = data.quiz!;
  const questions = data.questions as Question[];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [submitted, setSubmitted] = useState<null | { score: number; total: number; percentage: number; passed: boolean }>(null);

  async function submit() {
    let score = 0;
    let total = 0;
    for (const q of questions) {
      total += q.points;
      const given = (answers[q.id] ?? "").trim().toLowerCase();
      const correct = q.correct_answer.trim().toLowerCase();
      if (given && given === correct) score += q.points;
    }
    const percentage = total > 0 ? Math.round((score / total) * 100 * 100) / 100 : 0;
    const passed = percentage >= quiz.passing_score;
    setSubmitted({ score, total, percentage, passed });
    try {
      await supabase.from("quiz_attempts").insert({
        quiz_id: quiz.id,
        student_name: name || null,
        matric_number: matric || null,
        score, total_points: total, percentage, passed,
        answers,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save attempt");
    }
  }

  if (submitted) {
    return (
      <SiteLayout>
        <PageHeader eyebrow="Result" title={`${submitted.percentage}%`} description={submitted.passed ? "You passed!" : "Keep practising."} />
        <div className="mx-auto max-w-3xl px-6 py-10 space-y-4">
          <p className="text-muted-foreground">You scored {submitted.score} out of {submitted.total} points.</p>
          <h2 className="font-semibold mt-6">Review</h2>
          {questions.map((q, idx) => {
            const given = (answers[q.id] ?? "").trim();
            const ok = given.toLowerCase() === q.correct_answer.trim().toLowerCase();
            return (
              <div key={q.id} className="rounded-2xl border bg-card p-5">
                <p className="font-semibold">{idx + 1}. {q.question_text}</p>
                <p className="mt-2 text-sm">Your answer: <span className={ok ? "text-[var(--emerald)]" : "text-destructive"}>{given || "—"}</span></p>
                {!ok ? <p className="text-sm">Correct: <span className="text-[var(--emerald)]">{q.correct_answer}</span></p> : null}
              </div>
            );
          })}
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Quiz" title={quiz.title} description={quiz.description ?? undefined} />
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="rounded-xl border bg-card px-4 py-2 text-sm outline-none focus:border-[var(--medical)]" />
          <input value={matric} onChange={(e) => setMatric(e.target.value)} placeholder="Matric number (optional)" className="rounded-xl border bg-card px-4 py-2 text-sm outline-none focus:border-[var(--medical)]" />
        </div>
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border bg-card p-5">
            <p className="font-semibold">{idx + 1}. {q.question_text}</p>
            <div className="mt-3 space-y-2">
              {q.question_type === "multiple_choice" && Array.isArray(q.options) ? (
                (q.options as string[]).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                    {opt}
                  </label>
                ))
              ) : q.question_type === "true_false" ? (
                ["True","False"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                    {opt}
                  </label>
                ))
              ) : (
                <input value={answers[q.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} placeholder="Your answer" className="w-full rounded-xl border bg-background px-4 py-2 text-sm" />
              )}
            </div>
          </div>
        ))}
        <button onClick={submit} className="rounded-xl bg-[var(--medical)] px-6 py-3 text-white font-semibold">Submit quiz</button>
      </div>
    </SiteLayout>
  );
}