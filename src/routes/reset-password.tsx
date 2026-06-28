import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Anatomy, FUD" }, { name: "robots", content: "noindex" }]}),
  component: Reset,
});
function Reset() {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function go() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update password");
    } finally { setLoading(false); }
  }
  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>Set a new password</h1>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-6 w-full rounded-xl border bg-background px-4 py-3 text-sm" placeholder="New password (min 8 chars)" />
          <button disabled={loading || pwd.length < 8} onClick={go} className="mt-4 w-full rounded-xl bg-[var(--medical)] py-3 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}