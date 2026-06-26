import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/shell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FBMS, FUD" }, { name: "robots", content: "noindex" }]}),
  component: AdminShell,
});