import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdmin() {
  const [state, setState] = useState<{ loading: boolean; userId: string | null; isAdmin: boolean; email: string | null }>({
    loading: true,
    userId: null,
    isAdmin: false,
    email: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (!cancelled) setState({ loading: false, userId: null, isAdmin: false, email: null });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      if (!cancelled)
        setState({ loading: false, userId: data.user.id, isAdmin, email: data.user.email ?? null });
    }
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}