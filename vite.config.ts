// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// NITRO_PRESET controls deployment target:
//   "vercel"      → Vercel (default) — outputs to .vercel/output/
//   "node-server" → Railway / Render / VPS — outputs to .output/server/index.mjs
//   "netlify"     → Netlify — outputs to .netlify/functions-internal/
const preset = (process.env.NITRO_PRESET as string | undefined) ?? "vercel";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    serverFns: { disableCsrfMiddlewareWarning: true },
  },
  nitro: {
    preset,
  },
  vite: {
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: true,
      headers: {
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy": "frame-ancestors *",
      },
    },
  },
});
