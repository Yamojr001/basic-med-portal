const TOKEN_KEY = "fud_anatomy_token";
const AUTH_EVENT = "fud-auth-change";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

function parseJwt(token: string): (AuthUser & { exp?: number }) | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    if (!decoded.sub || !decoded.email) return null;
    return { id: decoded.sub, email: decoded.email, role: decoded.role ?? "user", exp: decoded.exp };
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const token = getStoredToken();
  if (!token) return null;
  const user = parseJwt(token);
  if (!user) return null;
  if (user.exp && user.exp * 1000 < Date.now()) {
    clearStoredAuth();
    return null;
  }
  return { id: user.id, email: user.email, role: user.role };
}

export function storeAuth(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function onAuthChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_EVENT, cb);
  return () => window.removeEventListener(AUTH_EVENT, cb);
}
