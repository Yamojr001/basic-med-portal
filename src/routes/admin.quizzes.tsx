import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminInsert, adminDelete, adminFetch } from "@/lib/admin-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { departmentsQuery, allCoursesQuery } from "@/lib/queries";
import { createServerFn } from "@tanstack/react-start";

const fetchQuizzesWithQuestions = createServerFn({ method: "GET" }).handler(async () => {
  const { query } = await import("@/lib/db");
  const quizzes = await query<{
    id: string; title: string; description: string | null;
    passing_score: number; is_published: boolean;
    course_id: string | null; department_id: string | null;
    created_at: string;
  }>("SELECT * FROM quizzes ORDER BY created_at DESC");

  const questions = await query<{
    id: string; quiz_id: string; question_text: string; question_type: string;
    correct_answer: string; options: unknown; points: number; sort_order: number;
  }>("SELECT * FROM quiz_questions ORDER BY sort_order");

  return quizzes.map((q) => ({
    ...q,
    questions: questions.filter((qq) => qq.quiz_id === q.id),
  }));
});

export const Route = createFileRoute("/admin/quizzes")({ component: Page });

type Question = {
  id: string; quiz_id: string; question_text: string; question_type: string;
  correct_answer: string; options: unknown; points: number; sort_order: number;
};

function Page() {
  const qc = useQueryClient();
  const { data: depts } = useQuery(departmentsQuery);
  const { data: courses } = useQuery(allCoursesQuery);
  const { data: quizzes } = useQuery({
    queryKey: ["admin", "quizzes"],
    queryFn: () => fetchQuizzesWithQuestions(),
  });
  const [open, setOpen] = useState<string | null>(null);
  const [newQ, setNewQ] = useState({
    title: "", description: "", course_id: "", department_id: "", passing_score: 50,
  });

  async function createQuiz() {
    if (!newQ.title) return toast.error("Title required");
    try {
      const payload: Record<string, unknown> = {
        title: newQ.title,
        description: newQ.description || null,
        passing_score: newQ.passing_score,
        is_published: true,
      };
      if (newQ.course_id) payload.course_id = newQ.course_id;
      if (newQ.department_id) payload.department_id = newQ.department_id;
      await adminInsert({ data: { table: "quizzes", data: payload } });
      setNewQ({ title: "", description: "", course_id: "", department_id: "", passing_score: 50 });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function delQuiz(id: string) {
    if (!confirm("Delete quiz and all its questions?")) return;
    try {
      await adminDelete({ data: { table: "quizzes", id } });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <>
      <AdminHeader title="Quizzes" />
      <div className="p-6 space-y-6">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="font-semibold mb-3">New quiz</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={newQ.title}
              onChange={(e) => setNewQ({ ...newQ, title: e.target.value })}
              placeholder="Quiz title"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <select
              value={newQ.department_id}
              onChange={(e) => setNewQ({ ...newQ, department_id: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">— Department (optional) —</option>
              {(depts ?? []).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={newQ.course_id}
              onChange={(e) => setNewQ({ ...newQ, course_id: e.target.value })}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">— Course (optional) —</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
            <input
              type="number"
              value={newQ.passing_score}
              onChange={(e) => setNewQ({ ...newQ, passing_score: Number(e.target.value) })}
              placeholder="Passing score %"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              value={newQ.description}
              onChange={(e) => setNewQ({ ...newQ, description: e.target.value })}
              placeholder="Description"
              className="rounded-lg border bg-background px-3 py-2 text-sm md:col-span-2"
            />
          </div>
          <button
            onClick={createQuiz}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--medical)] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Create quiz
          </button>
        </div>

        <div className="space-y-3">
          {(quizzes ?? []).map((q) => (
            <div key={q.id} className="rounded-2xl border bg-card shadow-soft overflow-hidden">
              <button
                onClick={() => setOpen(open === q.id ? null : q.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-semibold">{q.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.questions.length} questions · pass {q.passing_score}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); delQuiz(q.id); }}
                    className="rounded-md p-2 text-destructive hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {open === q.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </button>
              {open === q.id ? (
                <QuestionsEditor quizId={q.id} initial={q.questions} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function QuestionsEditor({ quizId, initial }: { quizId: string; initial: Question[] }) {
  const qc = useQueryClient();
  const [q, setQ] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: "Option A\nOption B\nOption C\nOption D",
    correct_answer: "",
    points: 1,
  });

  async function addQ() {
    if (!q.question_text || !q.correct_answer) return toast.error("Question and correct answer required");
    const opts = q.question_type === "multiple_choice"
      ? q.options.split("\n").map((s) => s.trim()).filter(Boolean)
      : null;
    try {
      await adminInsert({
        data: {
          table: "quiz_questions",
          data: {
            quiz_id: quizId,
            question_text: q.question_text,
            question_type: q.question_type,
            options: opts ? JSON.stringify(opts) : null,
            correct_answer: q.correct_answer,
            points: q.points,
            sort_order: initial.length,
          },
        },
      });
      setQ({
        question_text: "",
        question_type: "multiple_choice",
        options: "Option A\nOption B\nOption C\nOption D",
        correct_answer: "",
        points: 1,
      });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function delQ(id: string) {
    if (!confirm("Delete question?")) return;
    try {
      await adminDelete({ data: { table: "quiz_questions", id } });
      qc.invalidateQueries({ queryKey: ["admin", "quizzes"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="border-t p-5 space-y-4 bg-[var(--surface)]">
      <div className="space-y-2">
        {initial.map((item, i) => (
          <div key={item.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <span className="text-xs text-muted-foreground mt-0.5">{i + 1}.</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.question_text}</p>
              <p className="text-xs text-muted-foreground">
                {item.question_type} · {item.points} pts · answer: {item.correct_answer}
              </p>
            </div>
            <button onClick={() => delQ(item.id)} className="text-destructive p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-3 space-y-2">
        <input
          value={q.question_text}
          onChange={(e) => setQ({ ...q, question_text: e.target.value })}
          placeholder="Question text"
          className="w-full rounded border bg-background px-3 py-2 text-sm"
        />
        <div className="grid gap-2 md:grid-cols-3">
          <select
            value={q.question_type}
            onChange={(e) => setQ({ ...q, question_type: e.target.value })}
            className="rounded border bg-background px-3 py-2 text-sm"
          >
            <option value="multiple_choice">Multiple choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short answer</option>
          </select>
          <input
            value={q.correct_answer}
            onChange={(e) => setQ({ ...q, correct_answer: e.target.value })}
            placeholder="Correct answer"
            className="rounded border bg-background px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={q.points}
            onChange={(e) => setQ({ ...q, points: Number(e.target.value) })}
            className="rounded border bg-background px-3 py-2 text-sm"
          />
        </div>
        {q.question_type === "multiple_choice" ? (
          <textarea
            value={q.options}
            onChange={(e) => setQ({ ...q, options: e.target.value })}
            placeholder="One option per line"
            className="w-full rounded border bg-background px-3 py-2 text-sm"
            rows={4}
          />
        ) : null}
        <button
          onClick={addQ}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--medical)] px-3 py-1.5 text-sm text-white"
        >
          <Plus className="h-4 w-4" /> Add question
        </button>
      </div>
    </div>
  );
}
