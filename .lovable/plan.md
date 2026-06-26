## Faculty of Basic Medical Sciences — Federal University Dutse

A full-stack academic portal for FUD's Faculty of Basic Medical Sciences. Public student access (no login) for browsing departments, courses, downloads, timetables, calendar, announcements, gallery, and quizzes. Secure multi-admin CMS for managing everything.

### Step 1 — Design directions (first)
Generate 3 rendered homepage directions, all locked to your palette (#0F172A / #2563EB / #10B981, white + #F8FAFC bg, #111827 text) and the premium glassmorphism / soft-shadow / rounded-card style. They'll vary in composition, hierarchy, and density:
- A. Editorial medical journal — wide hero, serif/sans pairing, calm whitespace
- B. Dashboard-style portal — bento grid, dense quick-access cards, data-forward
- C. Immersive campus — full-bleed hero imagery, glass navigation, motion-rich

You pick one, then I build the entire site to that direction.

### Step 2 — Backend (Lovable Cloud)
Enable Lovable Cloud. Schema:
- `departments`, `courses` (dept/level/semester), `resources` (file metadata + download counter), `announcements` (pinned, scheduled), `events`, `gallery_images`, `lecture_timetable`, `exam_timetable`, `academic_calendar`, `quizzes`, `quiz_questions`, `quiz_attempts`, `site_settings` (logo, banner, contact, socials, theme, SEO)
- `user_roles` table with `app_role` enum (`admin`) and `has_role()` SECURITY DEFINER function — roles never on profiles table
- RLS: public SELECT on student-facing tables; admin-only INSERT/UPDATE/DELETE via `has_role(auth.uid(),'admin')`
- Storage buckets: `resources` (public read), `gallery`, `branding`
- Seed: 9 departments (Anatomy, Physiology, Medical Biochemistry, Pharmacology, Pathology, Medical Microbiology, Chemical Pathology, Hematology, Immunology), sample courses, demo announcements
- Bootstrap admin: trigger grants `admin` role to verified `yamojr001@gmail.com` on signup; admins can promote other admins from CMS → Users

### Step 3 — Public site (no auth)
Routes (each with own SEO `head()`):
- `/` Home — hero, faculty overview, Dean's message, quick nav, departments grid, latest announcements, latest materials, calendar highlights, events, stats, gallery preview, contact, footer
- `/departments`, `/departments/$slug`
- `/courses` browse flow: department → level → semester → courses → course detail
- `/courses/$code` — metadata + downloadable resources (increments counter on download)
- `/timetable/lectures`, `/timetable/exams` — filter by dept/level/semester, print + PDF
- `/calendar` — academic calendar
- `/announcements`, `/announcements/$slug`
- `/events`, `/gallery`, `/about`, `/contact`
- `/quizzes`, `/quizzes/$id` — take quiz, instant score, review answers
- `/search?q=` — global search across courses, lecturers, resources, announcements, timetables

### Step 4 — Admin (auth-gated)
- `/auth` — email/password login + forgot password + `/reset-password`
- `/_authenticated/admin/*` CMS:
  - Dashboard (stats, charts, recent activity, storage usage, top downloads)
  - Faculty info (about/vision/mission/history/Dean's message)
  - Departments, Courses, Resources (upload via Supabase Storage)
  - Lecture & Exam Timetables, Academic Calendar
  - Announcements (publish/schedule/pin/archive), Events, Gallery
  - Quizzes (builder for MCQ / True-False / Short Answer; results dashboard)
  - Downloads analytics
  - Site Settings (logo, banner, contact, socials, footer, theme, SEO)
  - Users — list admins, invite/promote/revoke admin role

### Step 5 — Quality
- Dark/light mode toggle, fully responsive, WCAG AA, lazy loading, image optimization
- Framer Motion micro-interactions, glassmorphism cards, soft shadows
- Zod validation on all admin forms, sanitized inputs, signed/secure storage policies
- Per-route SEO (title, description, OG); sitemap.xml; robots.txt

### Technical notes
Stack is TanStack Start + React + TS + Tailwind v4 + shadcn/ui + Framer Motion + Lovable Cloud (Supabase under the hood). Server functions for admin writes via `requireSupabaseAuth`; public reads via server publishable client with narrow anon SELECT policies. Admin gate via the managed `_authenticated` layout. Note: Next.js was in your brief — this template uses TanStack Start which gives equivalent SSR/SEO/perf.

### Delivery order after design pick
1. Cloud + schema + RLS + seed
2. Public site shell + home + departments/courses/resources
3. Admin auth + CMS modules
4. Timetables, calendar, announcements, events, gallery
5. Quizzes + analytics + search + settings + polish
