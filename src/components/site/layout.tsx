import type { ReactNode } from "react";
import { SiteHeader } from "./header";
import { SiteFooter } from "./footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b bg-gradient-to-b from-[var(--surface)] to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--medical)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-4xl md:text-5xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}