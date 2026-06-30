import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/layout";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Anatomy, FUD" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border bg-card p-8 shadow-soft text-center">
          <h1 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>
            Password Reset
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            To change your password, please contact the system administrator or sign in with
            your existing credentials.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-block rounded-xl bg-[var(--medical)] px-6 py-3 text-sm font-semibold text-white"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
