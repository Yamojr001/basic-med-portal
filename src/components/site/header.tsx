import { Link } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/departments", label: "Departments" },
  { to: "/courses", label: "Courses" },
  { to: "/timetable/lectures", label: "Timetable" },
  { to: "/calendar", label: "Calendar" },
  { to: "/announcements", label: "Announcements" },
  { to: "/quizzes", label: "Quizzes" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--navy)] text-[var(--surface)] font-bold">
            FB
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--medical)]">
              Federal University Dutse
            </span>
            <span className="text-sm font-semibold text-foreground">
              Faculty of Basic Medical Sciences
            </span>
          </div>
        </Link>
        <nav className="ml-auto hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-[var(--medical)] transition-colors"
              activeProps={{ className: "text-[var(--medical)]" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/search"
          className="ml-auto lg:ml-0 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground hover:border-[var(--medical)]/40"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search portal…</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="lg:hidden rounded-md border border-border p-2"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              >
                Contact
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}