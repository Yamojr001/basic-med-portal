import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, BookOpen, FileBox, Calendar, ClipboardList,
  Megaphone, CalendarClock, GraduationCap, Users, Settings, LogOut, ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/lib/use-admin";
import { useEffect } from "react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/resources", label: "Resources", icon: FileBox },
  { to: "/admin/timetable", label: "Timetable", icon: ClipboardList },
  { to: "/admin/calendar", label: "Calendar", icon: Calendar },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/events", label: "Events", icon: CalendarClock },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/admin/quizzes", label: "Quizzes", icon: GraduationCap },
  { to: "/admin/users", label: "Admins", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminShell() {
  const { loading, isAdmin, email } = useAdmin();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-[var(--surface)] text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-5 border-b">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--navy)] text-white font-bold">FB</div>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--medical)]">FUD</p>
              <p className="text-sm font-semibold">FBMS Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-[var(--medical)]/10 text-[var(--medical)] font-semibold" : "text-muted-foreground hover:bg-muted"}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <p className="px-2 text-[11px] truncate text-muted-foreground">{email}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="border-b bg-card px-6 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}