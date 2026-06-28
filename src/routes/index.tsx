import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  ClipboardList,
  Megaphone,
  Sparkles,
  Microscope,
  Newspaper,
} from "lucide-react";
import { SiteLayout } from "@/components/site/layout";
import {
  announcementsQuery,
  calendarQuery,
  departmentsQuery,
  eventsQuery,
  homeCountsQuery,
  settingsQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Department of Anatomy — Federal University Dutse" },
      {
        name: "description",
        content:
          "Official portal of Department of Anatomy, Federal University Dutse — course materials, timetables, announcements, calendar and quizzes.",
      },
      { property: "og:title", content: "Department of Anatomy — Federal University Dutse" },
      {
        property: "og:description",
        content: "The academic home of basic medical sciences at FUD.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(departmentsQuery),
      context.queryClient.ensureQueryData(announcementsQuery(4)),
      context.queryClient.ensureQueryData(calendarQuery),
      context.queryClient.ensureQueryData(eventsQuery),
      context.queryClient.ensureQueryData(homeCountsQuery),
    ]);
  },
  component: Index,
});

const QUICK = [
  { to: "/departments", label: "Departments", icon: Microscope, countKey: "departments" },
  { to: "/courses", label: "Courses", icon: BookOpen, countKey: "courses" },
  { to: "/timetable/lectures", label: "Timetable", icon: ClipboardList, countKey: "timetable" },
  { to: "/calendar", label: "Calendar", icon: Calendar, countKey: "calendar" },
  { to: "/announcements", label: "Announcements", icon: Megaphone, countKey: "announcements" },
  { to: "/quizzes", label: "Quizzes", icon: GraduationCap, countKey: "quizzes" },
] as const;

function Index() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: departments } = useSuspenseQuery(departmentsQuery);
  const { data: announcements } = useSuspenseQuery(announcementsQuery(4));
  const { data: calendar } = useSuspenseQuery(calendarQuery);
  const { data: events } = useSuspenseQuery(eventsQuery);
  const { data: counts } = useSuspenseQuery(homeCountsQuery);

  const upcomingCalendar = (calendar ?? []).filter((c) => new Date(c.start_date) >= new Date(Date.now() - 86400000)).slice(0, 4);
  const upcomingEvents = (events ?? []).filter((e) => new Date(e.event_date) >= new Date(Date.now() - 86400000)).slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(37,99,235,0.6), transparent 55%), radial-gradient(circle at 80% 60%, rgba(16,185,129,0.45), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--emerald)] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Pioneering health excellence
            </span>
            <h1
              className="mt-6 text-5xl md:text-7xl font-display leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The future of medicine starts in Dutse.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              {settings?.about ??
                "The Department of Anatomy at FUD provides the foundational knowledge and research excellence required for the next generation of healthcare leaders."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/departments"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--medical)] px-6 py-3.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
              >
                Explore departments <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                Course materials
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="relative -mt-12 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q, i) => (
            <motion.div
              key={q.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <Link
                to={q.to}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-soft hover:-translate-y-0.5 hover:border-[var(--medical)]/40 transition"
              >
                <q.icon className="h-5 w-5 text-[var(--medical)]" />
                <p className="mt-6 text-sm font-semibold text-foreground">{q.label}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {counts[q.countKey]} {counts[q.countKey] === 1 ? "item" : "items"}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DEAN MESSAGE */}
      <section className="mx-auto max-w-7xl px-6 py-24 grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-[var(--medical)]/15 via-[var(--surface)] to-[var(--emerald)]/15 grid place-items-center text-muted-foreground">
            {settings?.dean_image_url ? (
              <img src={settings.dean_image_url} alt={settings?.dean_name ?? "Dean"} className="h-full w-full rounded-3xl object-cover" />
            ) : (
              <div className="text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-[var(--medical)]" />
                <p className="mt-3 text-xs uppercase tracking-[0.18em]">Dean's portrait</p>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--medical)]">
            Dean's welcome
          </p>
          <h2
            className="mt-3 text-4xl md:text-5xl font-display leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome to the heartbeat of healthcare education.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {settings?.dean_message}
          </p>
          <div className="mt-8 border-l-2 border-[var(--emerald)] pl-4">
            <p className="font-semibold text-foreground">{settings?.dean_name}</p>
            <p className="text-sm text-muted-foreground">{settings?.dean_title}</p>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section className="bg-[var(--surface)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--medical)]">
                Academic departments
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display" style={{ fontFamily: "var(--font-display)" }}>
                Nine pillars of basic medical science
              </h2>
            </div>
            <Link to="/departments" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[var(--medical)]">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <Link
                key={d.id}
                to="/departments/$slug"
                params={{ slug: d.slug }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:border-[var(--medical)]/40 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--medical)]/10 font-semibold text-[var(--medical)]">
                    {d.code ?? d.name.slice(0, 2).toUpperCase()}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-[var(--medical)] group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{d.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS + EVENTS */}
      <section className="mx-auto max-w-7xl px-6 py-24 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>
              <Newspaper className="inline h-5 w-5 mr-2 text-[var(--medical)]"/> Latest announcements
            </h2>
            <Link to="/announcements" className="text-sm text-[var(--medical)]">View all</Link>
          </div>
          <div className="mt-6 space-y-4">
            {announcements.map((a) => (
              <Link
                key={a.id}
                to="/announcements/$slug"
                params={{ slug: a.slug }}
                className="block rounded-2xl border border-border bg-card p-5 shadow-soft hover:border-[var(--medical)]/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[var(--medical)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--medical)]">
                    {a.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(a.publish_at).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.body}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-10">
          <div>
            <h2 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>
              <Calendar className="inline h-5 w-5 mr-2 text-[var(--emerald)]"/> Calendar highlights
            </h2>
            <div className="mt-6 divide-y rounded-2xl border border-border bg-card shadow-soft">
              {upcomingCalendar.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">No upcoming items yet.</p>
              ) : (
                upcomingCalendar.map((c) => (
                  <div key={c.id} className="flex gap-4 p-4">
                    <DateBadge date={c.start_date} />
                    <div>
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>Upcoming events</h2>
            <div className="mt-6 divide-y rounded-2xl border border-border bg-card shadow-soft">
              {upcomingEvents.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">No upcoming events.</p>
              ) : (
                upcomingEvents.map((e) => (
                  <div key={e.id} className="flex gap-4 p-4">
                    <DateBadge date={e.event_date} />
                    <div>
                      <p className="text-sm font-semibold">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.venue} {e.event_time ? `• ${e.event_time}` : ""}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          <Stat value={String(counts.departments)} label="Departments" tone="navy" />
          <Stat value={String(counts.courses)} label="Courses" tone="medical" />
          <Stat value={String(counts.timetable)} label="Timetable entries" tone="emerald" />
          <Stat value={String(counts.announcements)} label="Announcements" tone="navy" />
        </div>
      </section>
    </SiteLayout>
  );
}

function DateBadge({ date }: { date: string }) {
  const d = new Date(date);
  const m = d.toLocaleString("en", { month: "short" }).toUpperCase();
  return (
    <div className="shrink-0 grid h-12 w-12 place-items-center rounded-lg bg-[var(--surface)] text-[var(--navy)]">
      <span className="text-[10px] font-semibold">{m}</span>
      <span className="-mt-1 text-lg font-semibold leading-none">{d.getDate()}</span>
    </div>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: "navy" | "medical" | "emerald" }) {
  const color = tone === "medical" ? "text-[var(--medical)]" : tone === "emerald" ? "text-[var(--emerald)]" : "text-[var(--navy)]";
  return (
    <div>
      <div className={`text-3xl md:text-4xl font-display ${color}`} style={{ fontFamily: "var(--font-display)" }}>{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}
