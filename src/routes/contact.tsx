import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { settingsQuery } from "@/lib/queries";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Anatomy, FUD" },
    { name: "description", content: "Get in touch with the Department of Anatomy." },
  ]}),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Contact,
});
function Contact() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Get in touch" title="Contact the department" />
      <div className="mx-auto max-w-3xl px-6 py-12 grid gap-6 md:grid-cols-3">
        {s?.address ? <Item icon={MapPin} label="Address" value={s.address} /> : null}
        {s?.contact_email ? <Item icon={Mail} label="Email" value={s.contact_email} href={`mailto:${s.contact_email}`} /> : null}
        {s?.contact_phone ? <Item icon={Phone} label="Phone" value={s.contact_phone} href={`tel:${s.contact_phone}`} /> : null}
      </div>
    </SiteLayout>
  );
}
function Item({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }) {
  const content = (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <Icon className="h-5 w-5 text-[var(--medical)]" />
      <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}