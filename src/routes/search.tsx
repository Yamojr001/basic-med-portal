import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Search } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type Result =
  | { kind: "course"; id: string; code: string; title: string }
  | { kind: "announcement"; id: string; slug: string; title: string }
  | { kind: "resource"; id: string; title: string; course_code: string }
  | { kind: "department"; id: string; slug: string; name: string };

const searchFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ term: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { query } = await import("@/lib/db");
    const like = `%${data.term}%`;
    const [courses, anns, deps, res] = await Promise.all([
      query<{ id: string; code: string; title: string }>(
        "SELECT id, code, title FROM courses WHERE code ILIKE $1 OR title ILIKE $1 OR lecturer ILIKE $1 LIMIT 20",
        [like]
      ),
      query<{ id: string; slug: string; title: string }>(
        "SELECT id, slug, title FROM announcements WHERE title ILIKE $1 AND is_archived = false LIMIT 20",
        [like]
      ),
      query<{ id: string; slug: string; name: string }>(
        "SELECT id, slug, name FROM departments WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 10",
        [like]
      ),
      query<{ id: string; title: string; course_code: string | null }>(
        `SELECT r.id, r.title, c.code as course_code
         FROM resources r LEFT JOIN courses c ON r.course_id = c.id
         WHERE r.title ILIKE $1 OR r.description ILIKE $1 LIMIT 20`,
        [like]
      ),
    ]);
    const merged: Result[] = [
      ...deps.map((d) => ({ kind: "department" as const, id: d.id, slug: d.slug, name: d.name })),
      ...courses.map((c) => ({ kind: "course" as const, id: c.id, code: c.code, title: c.title })),
      ...anns.map((a) => ({ kind: "announcement" as const, id: a.id, slug: a.slug, title: a.title })),
      ...res.map((r) => ({ kind: "resource" as const, id: r.id, title: r.title, course_code: r.course_code ?? "" })),
    ];
    return merged;
  });

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Anatomy, FUD" },
      { name: "description", content: "Search courses, announcements, lecturers and resources." },
    ],
  }),
  component: SearchPage,
});

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
        const data = await searchFn({ data: { term } });
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Find anything" title="Search the portal" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses, announcements, lecturers, resources…"
            className="w-full rounded-full border bg-card pl-12 pr-5 py-4 outline-none focus:border-[var(--medical)]"
          />
        </div>
        <div className="mt-8 space-y-2">
          {loading ? <p className="text-sm text-muted-foreground">Searching…</p> : null}
          {!loading && q.length >= 2 && results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No results.</p>
          ) : null}
          {results.map((r) => {
            if (r.kind === "course")
              return (
                <Link key={r.id} to="/courses/$code" params={{ code: r.code }} className="block rounded-xl border bg-card p-4 hover:border-[var(--medical)]/40">
                  <Pill text="Course" />{" "}
                  <span className="ml-2 font-semibold text-[var(--medical)]">{r.code}</span> · {r.title}
                </Link>
              );
            if (r.kind === "department")
              return (
                <Link key={r.id} to="/departments/$slug" params={{ slug: r.slug }} className="block rounded-xl border bg-card p-4 hover:border-[var(--medical)]/40">
                  <Pill text="Department" /> <span className="ml-2">{r.name}</span>
                </Link>
              );
            if (r.kind === "announcement")
              return (
                <Link key={r.id} to="/announcements/$slug" params={{ slug: r.slug }} className="block rounded-xl border bg-card p-4 hover:border-[var(--medical)]/40">
                  <Pill text="Announcement" /> <span className="ml-2">{r.title}</span>
                </Link>
              );
            return (
              <div key={r.id} className="block rounded-xl border bg-card p-4">
                <Pill text="Resource" /> <span className="ml-2">{r.title}</span>
                {r.course_code ? <span className="text-muted-foreground"> · {r.course_code}</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span className="rounded-full bg-[var(--medical)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--medical)]">
      {text}
    </span>
  );
}
