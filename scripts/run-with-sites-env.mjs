import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const runtimeRoot = process.env.SITES_RUNTIME_ROOT ?? resolve(root, ".sites-runtime");

for (const segment of [
  "home",
  "npm-cache",
  "xdg-config",
  "tmp",
  "wrangler/logs",
  "wrangler/registry",
]) {
  await mkdir(resolve(runtimeRoot, segment), { recursive: true });
}

const env = {
  ...process.env,
  SITES_ENV_READY: "1",
  SITES_PROJECT_ROOT: root,
  HOME: resolve(runtimeRoot, "home"),
  XDG_CONFIG_HOME: resolve(runtimeRoot, "xdg-config"),
  TMPDIR: resolve(runtimeRoot, "tmp"),
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: resolve(runtimeRoot, "wrangler/logs"),
  MINIFLARE_REGISTRY_PATH: resolve(runtimeRoot, "wrangler/registry"),
  npm_config_cache: resolve(runtimeRoot, "npm-cache"),
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_update_notifier: "false",
};

for (const key of [
  "npm_config_proxy",
  "npm_config_http_proxy",
  "npm_config_https_proxy",
  "NPM_CONFIG_PROXY",
  "NPM_CONFIG_HTTP_PROXY",
  "NPM_CONFIG_HTTPS_PROXY",
  "NPM_CONFIG_CACHE",
  "npm_config_cache",
]) {
  delete env[key];
}
env.npm_config_cache = resolve(runtimeRoot, "npm-cache");

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("usage: node scripts/run-with-sites-env.mjs <command> [args...]");
  process.exit(64);
}

const child = spawn(command, args, {
  cwd: root,
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
