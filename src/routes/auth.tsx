import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/layout";
import { toast } from "sonner";
import { loginFn, signupFn } from "@/lib/auth-fns";
import { storeAuth, clearStoredAuth } from "@/lib/auth-client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Administrator Login — Anatomy, FUD" },
      { name: "description", content: "Sign in to the Department of Anatomy admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const router = useRouter();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      if (mode === "signin") {
        const result = await loginFn({ data: { email, password } });
        storeAuth(result.token);
        toast.success("Signed in");
        await router.invalidate();
        navigate({ to: "/admin" });
      } else {
        const result = await signupFn({ data: { email, password } });
        storeAuth(result.token);
        toast.success("Account created — you are now signed in.");
        await router.invalidate();
        navigate({ to: "/admin" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    clearStoredAuth();
    toast.success("Signed out");
    router.invalidate();
    navigate({ to: "/" });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>
            {mode === "signup" ? "Create admin account" : "Administrator login"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Create an account. Contact an existing admin to be granted admin access."
              : "Sign in to manage the department portal."}
          </p>
          <div className="mt-6 space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm"
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder={mode === "signup" ? "Password (min 8 chars)" : "Password"}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm"
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
            <button
              disabled={loading}
              onClick={go}
              className="w-full rounded-xl bg-[var(--medical)] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </div>
          <div className="mt-6 flex justify-between text-xs text-muted-foreground">
            {mode === "signin" ? (
              <button className="hover:text-[var(--medical)]" onClick={() => setMode("signup")}>
                Need an account? Sign up
              </button>
            ) : (
              <button className="hover:text-[var(--medical)]" onClick={() => setMode("signin")}>
                ← Back to sign in
              </button>
            )}
            <button className="hover:text-destructive" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
