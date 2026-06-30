import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListUsers, adminGrantAdmin, adminRevokeAdmin } from "@/lib/admin-fns";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { userId } = useAdmin();
  const { data } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminListUsers(),
  });

  async function grant(id: string) {
    try {
      await adminGrantAdmin({ data: { userId: id } });
      toast.success("Admin access granted");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke admin access for this user?")) return;
    try {
      await adminRevokeAdmin({ data: { userId: id } });
      toast.success("Admin access revoked");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <>
      <AdminHeader
        title="Users"
        description="All registered users. Grant or revoke admin access here."
      />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-[var(--medical)]/10 text-[var(--medical)]"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {u.id !== userId && (
                        u.role === "admin" ? (
                          <button
                            onClick={() => revoke(u.id)}
                            className="text-xs text-destructive hover:underline"
                          >
                            Revoke admin
                          </button>
                        ) : (
                          <button
                            onClick={() => grant(u.id)}
                            className="text-xs text-[var(--medical)] hover:underline"
                          >
                            Grant admin
                          </button>
                        )
                      )}
                      {u.id === userId && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
