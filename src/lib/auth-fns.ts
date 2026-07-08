import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const signupSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryOne } = await import("@/lib/db");
    const { verifyPassword, signToken } = await import("@/lib/auth-server");

    const user = await queryOne<{ id: string; email: string; password_hash: string; role: string }>(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1",
      [data.email.toLowerCase()]
    );

    if (!user) throw new Error("Invalid email or password.");
    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) throw new Error("Invalid email or password.");

    const token = await signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  });

export const signupFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryOne, execute } = await import("@/lib/db");
    const { hashPassword, signToken } = await import("@/lib/auth-server");

    const existing = await queryOne("SELECT id FROM users WHERE email = $1", [data.email.toLowerCase()]);
    if (existing) throw new Error("An account with this email already exists.");

    const passwordHash = await hashPassword(data.password);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
    const role = adminEmail && data.email.toLowerCase() === adminEmail ? "admin" : "user";

    const id = crypto.randomUUID();
    await execute(
      "INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      [id, data.email.toLowerCase(), passwordHash, role]
    );
    const user = await queryOne<{ id: string; email: string; role: string }>(
      "SELECT id, email, role FROM users WHERE id = $1",
      [id]
    );
    if (!user) throw new Error("Failed to create account.");

    const token = await signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  });

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const { verifyToken } = await import("@/lib/auth-server");
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
});
