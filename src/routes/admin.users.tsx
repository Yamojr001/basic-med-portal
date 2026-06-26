import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin","user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  async function revoke(id: string) {
    if (!confirm("Revoke admin access for this user?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Revoked"); qc.invalidateQueries({ queryKey: ["admin","user_roles"] }); }
  }
  return (
    <>
      <AdminHeader title="Administrators" description="Anyone you want to promote should first sign up at /auth. Then paste their user ID below to grant admin." />
      <div className="p-6 space-y-6">
        <GrantForm onDone={() => qc.invalidateQueries({ queryKey: ["admin","user_roles"] })} />
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">User ID</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Granted</th><th></th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{r.user_id}</td>
                  <td className="px-4 py-3">{r.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => revoke(r.id)} className="text-destructive text-sm">Revoke</button></td>
                </tr>
              ))}
              {(data ?? []).length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No administrators yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function GrantForm({ onDone }: { onDone: () => void }) {
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const user_id = String(fd.get("user_id") ?? "").trim();
    if (!user_id) return toast.error("User ID required");
    const { error } = await supabase.from("user_roles").insert({ user_id, role: "admin" });
    if (error) toast.error(error.message); else { toast.success("Admin granted"); (e.target as HTMLFormElement).reset(); onDone(); }
  }
  return (
    <form onSubmit={submit} className="rounded-2xl border bg-card p-5 shadow-soft flex gap-3 items-end">
      <div className="flex-1">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">User ID (UUID from auth)</label>
        <input name="user_id" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono" placeholder="uuid…"/>
      </div>
      <button className="rounded-xl bg-[var(--medical)] px-4 py-2 text-sm font-semibold text-white">Grant admin</button>
    </form>
  );
}