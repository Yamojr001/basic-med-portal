import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteLayout } from "@/components/site/layout";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Administrator Login — Anatomy, FUD" }, { name: "description", content: "Sign in to the Department of Anatomy admin dashboard." }, { name: "robots", content: "noindex" }]}),
  component: Auth,
});

function Auth() {
  const router = useRouter();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        await router.invalidate();
        navigate({ to: "/admin" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          <h1 className="text-2xl font-display" style={{ fontFamily: "var(--font-display)" }}>
            {mode === "signup" ? "Create admin account" : mode === "forgot" ? "Reset password" : "Administrator login"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup" ? "Only verified admins gain dashboard access." : mode === "forgot" ? "We will email you a reset link." : "Sign in to manage the department portal."}
          </p>
          <div className="mt-6 space-y-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-xl border bg-background px-4 py-3 text-sm" />
            {mode !== "forgot" ? (
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-xl border bg-background px-4 py-3 text-sm" />
            ) : null}
            <button disabled={loading} onClick={go} className="w-full rounded-xl bg-[var(--medical)] py-3 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset email"}
            </button>
            {mode !== "forgot" ? (
              <button onClick={google} className="w-full rounded-xl border py-3 text-sm font-medium hover:bg-muted">
                Continue with Google
              </button>
            ) : null}
          </div>
          <div className="mt-6 flex justify-between text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                <button className="hover:text-[var(--medical)]" onClick={() => setMode("forgot")}>Forgot password?</button>
                <button className="hover:text-[var(--medical)]" onClick={() => setMode("signup")}>Need an account? Sign up</button>
              </>
            ) : (
              <button className="hover:text-[var(--medical)]" onClick={() => setMode("signin")}>← Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}