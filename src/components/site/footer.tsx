import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <footer className="mt-24 bg-[var(--navy)] text-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--medical)] text-white font-bold">
                FB
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--emerald)]">
                  {s?.university_name ?? "Federal University Dutse"}
                </p>
                <p className="text-sm font-semibold">{s?.faculty_name ?? "Faculty of Basic Medical Sciences"}</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm text-white/60">
              {s?.about ??
                "Located in Dutse, Jigawa State, Nigeria. Dedicated to excellence in biomedical research and education."}
            </p>
            <div className="mt-6 flex gap-3">
              {s?.social_facebook ? (
                <a href={s.social_facebook} className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-[var(--medical)]" aria-label="Facebook"><Facebook className="h-4 w-4"/></a>
              ) : null}
              {s?.social_twitter ? (
                <a href={s.social_twitter} className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-[var(--medical)]" aria-label="Twitter"><Twitter className="h-4 w-4"/></a>
              ) : null}
              {s?.social_instagram ? (
                <a href={s.social_instagram} className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-[var(--medical)]" aria-label="Instagram"><Instagram className="h-4 w-4"/></a>
              ) : null}
              {s?.social_linkedin ? (
                <a href={s.social_linkedin} className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-[var(--medical)]" aria-label="LinkedIn"><Linkedin className="h-4 w-4"/></a>
              ) : null}
            </div>
          </div>
          <div>
            <h6 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Quick links
            </h6>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/departments" className="hover:text-white">Departments</Link></li>
              <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
              <li><Link to="/timetable/lectures" className="hover:text-white">Lecture Timetable</Link></li>
              <li><Link to="/timetable/exams" className="hover:text-white">Exam Timetable</Link></li>
              <li><Link to="/calendar" className="hover:text-white">Academic Calendar</Link></li>
              <li><Link to="/quizzes" className="hover:text-white">Quizzes</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Contact
            </h6>
            <ul className="space-y-3 text-sm text-white/70">
              {s?.address ? (
                <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0"/>{s.address}</li>
              ) : null}
              {s?.contact_email ? (
                <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5"/><a href={`mailto:${s.contact_email}`} className="hover:text-white">{s.contact_email}</a></li>
              ) : null}
              {s?.contact_phone ? (
                <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5"/>{s.contact_phone}</li>
              ) : null}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/40">
            {s?.footer_text ?? "© 2025 Federal University Dutse. All rights reserved."}
          </p>
          <Link to="/auth" className="text-xs uppercase tracking-[0.18em] text-white/40 hover:text-white">
            Administrator Login
          </Link>
        </div>
      </div>
    </footer>
  );
}