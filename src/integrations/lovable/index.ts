// Lovable auth integration — stubbed (app uses custom JWT auth via src/lib/auth-fns.ts)
export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: string, _opts?: unknown) => {
      throw new Error("OAuth sign-in is not configured. Use email/password auth instead.");
    },
  },
};
