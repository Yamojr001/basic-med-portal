import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Anatomy, FUD" }, { name: "description", content: "Search courses, announcements, lecturers and resources." }]}),
  component: SearchPage,
});

type Result =
  | { kind: "course"; id: string; code: string; title: string }
  | { kind: "announcement"; id: string; slug: string; title: string }
  | { kind: "resource"; id: string; title: string; course_code: string }
  | { kind: "department"; id: string; slug: string; name: string };

function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); return; }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const like = `%${term}%`;
        const [courses, anns, deps, res] = await Promise.all([
          supabase.from("courses").select("id,code,title,lecturer").or(`code.ilike.${like},title.ilike.${like},lecturer.ilike.${like}`).limit(20),
          supabase.from("announcements").select("id,slug,title").ilike("title", like).eq("is_archived", false).limit(20),
          supabase.from("departments").select("id,slug,name").or(`name.ilike.${like},description.ilike.${like}`).limit(10),
          supabase.from("resources").select("id,title,course:courses(code)").or(`title.ilike.${like},description.ilike.${like}`).limit(20),
        ]);
        const merged: Result[] = [
          ...(deps.data ?? []).map((d) => ({ kind: "department" as const, id: d.id, slug: d.slug, name: d.name })),
          ...(courses.data ?? []).map((c) => ({ kind: "course" as const, id: c.id, code: c.code, title: c.title })),
          ...(anns.data ?? []).map((a) => ({ kind: "announcement" as const, id: a.id, slug: a.slug, title: a.title })),
          ...(res.data ?? []).map((r: { id: string; title: string; course: { code: string } | null }) => ({
            kind: "resource" as const, id: r.id, title: r.title, course_code: r.course?.code ?? "",
          })),
        ];
        setResults(merged);
      } finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Find anything" title="Search the portal" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, announcements, lecturers, resources…"
            className="w-full rounded-full border bg-card pl-12 pr-5 py-4 outline-none focus:border-[var(--medical)]" />
        </div>
        <div className="mt-8 space-y-2">
          {loading ? <p className="text-sm text-muted-foreground">Searching…</p> : null}
          {!loading && q.length >= 2 && results.length === 0 ? <p className="text-sm text-muted-foreground">No results.</p> : null}
          {results.map((r) => {
            if (r.kind === "course")
              return <Link key={r.id} to="/courses/$code" params={{ code: r.code }} className="block rounded-xl border bg-card p-4 hover:border-[var(--medical)]/40"><Pill text="Course"/> <span className="ml-2 font-semibold text-[var(--medical)]">{r.code}</span> · {r.title}</Link>;
            if (r.kind === "department")
              return <Link key={r.id} to="/departments/$slug" params={{ slug: r.slug }} className="block rounded-xl border bg-card p-4 hover:border-[var(--medical)]/40"><Pill text="Department"/> <span className="ml-2">{r.name}</span></Link>;
            if (r.kind === "announcement")
              return <Link key={r.id} to="/announcements/$slug" params={{ slug: r.slug }} className="block rounded-xl border bg-card p-4 hover:border-[var(--medical)]/40"><Pill text="Announcement"/> <span className="ml-2">{r.title}</span></Link>;
            return <div key={r.id} className="block rounded-xl border bg-card p-4"><Pill text="Resource"/> <span className="ml-2">{r.title}</span> {r.course_code ? <span className="text-muted-foreground"> · {r.course_code}</span> : null}</div>;
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
function Pill({ text }: { text: string }) {
  return <span className="rounded-full bg-[var(--medical)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--medical)]">{text}</span>;
}