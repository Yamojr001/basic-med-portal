import { useEffect, useState } from "react";
import { getStoredUser, onAuthChange, type AuthUser } from "@/lib/auth-client";

export type AdminState = {
  loading: boolean;
  userId: string | null;
  isAdmin: boolean;
  email: string | null;
  user: AuthUser | null;
};

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>(() => {
    const user = getStoredUser();
    if (user) {
      return { loading: false, userId: user.id, isAdmin: user.role === "admin", email: user.email, user };
    }
    return { loading: true, userId: null, isAdmin: false, email: null, user: null };
  });

  useEffect(() => {
    function sync() {
      const user = getStoredUser();
      if (user) {
        setState({ loading: false, userId: user.id, isAdmin: user.role === "admin", email: user.email, user });
      } else {
        setState({ loading: false, userId: null, isAdmin: false, email: null, user: null });
      }
    }
    sync();
    return onAuthChange(sync);
  }, []);

  return state;
}
