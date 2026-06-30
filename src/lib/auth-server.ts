import * as jose from "jose";
import * as bcrypt from "bcryptjs";

const JWT_ALG = "HS256";
const JWT_EXPIRY = "7d";

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[Auth] JWT_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new jose.SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret(), { algorithms: [JWT_ALG] });
    if (!payload.sub || !payload.email) return null;
    return {
      sub: payload.sub,
      email: payload.email as string,
      role: (payload.role as string) ?? "user",
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getRequestUser(request: Request | null): Promise<JwtPayload | null> {
  if (!request?.headers) return null;
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
