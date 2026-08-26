import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const wranglerConfig = resolve(root, "preview-wrangler.json");
const wranglerCli = resolve(root, "node_modules/wrangler/bin/wrangler.js");

if (!existsSync(wranglerConfig)) {
  console.error("Missing preview-wrangler.json");
  process.exit(66);
}
if (!existsSync(resolve(root, "dist/server/index.js"))) {
  console.error("Missing dist/server/index.js");
  console.error("Run npm run build before preview:web.");
  process.exit(66);
}

const port = String(process.env.PORT ?? "8787");
const host = process.env.HOST ?? "127.0.0.1";
const persistTo =
  process.env.WRANGLER_PERSIST_DIR ??
  resolve(root, ".sites-runtime/wrangler/persist");

console.log(
  `[preview:web] Cloudflare Worker preview (OpenAI Sites runtime parity)\n` +
    `  config: preview-wrangler.json\n` +
    `  persist: ${persistTo}\n` +
    `  url: http://${host}:${port}\n`,
);

const child = spawn(
  process.execPath,
  [
    wranglerCli,
    "dev",
    "--config",
    wranglerConfig,
    "--local",
    "--port",
    port,
    "--ip",
    host,
    "--persist-to",
    persistTo,
  ],
  { cwd: root, stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
