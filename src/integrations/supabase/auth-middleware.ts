import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { verifyToken } = await import("@/lib/auth-server");
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const payload = await verifyToken(authHeader.slice(7));
  if (!payload) throw new Error("Unauthorized: Invalid or expired token");
  return next({ context: { userId: payload.sub, email: payload.email, role: payload.role } });
});

export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { verifyToken } = await import("@/lib/auth-server");
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const payload = await verifyToken(authHeader.slice(7));
  if (!payload) throw new Error("Unauthorized: Invalid token");
  if (payload.role !== "admin") throw new Error("Forbidden: Admin access required");
  return next({ context: { userId: payload.sub, email: payload.email, role: payload.role } });
});
