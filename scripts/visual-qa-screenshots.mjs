/**
 * V20.2.5 automated visual QA screenshots.
 * Requires: preview server at BASE_URL, playwright via npx.
 * Usage: node scripts/visual-qa-screenshots.mjs
 */
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "artifacts", "v20.2.5-visual-qa", "iteration-final");
const BASE_URL = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:3000";

const viewports = [
  { name: "01-mobile-out", width: 1920, height: 1080, zoom: 0.65 },
  { name: "02-mobile-mid", width: 1920, height: 1080, zoom: 0.96 },
  { name: "03-mobile-in", width: 1920, height: 1080, zoom: 1.24 },
  { name: "05-mobile-small-landscape", width: 1280, height: 720, zoom: 0.96 },
  { name: "06-mobile-wide-landscape", width: 2400, height: 1080, zoom: 0.96 },
];

async function main() {
  await mkdir(outDir, { recursive: true });

  const runner = join(root, "scripts", "visual-qa-playwright-runner.mjs");
  const result = spawnSync(
    process.execPath,
    [runner, BASE_URL, outDir, JSON.stringify(viewports)],
    { stdio: "inherit", cwd: root },
  );

  if (result.status !== 0) {
    console.error(
      "[visual-qa] Screenshot runner failed. Install playwright: npx playwright install chromium",
    );
    process.exit(result.status ?? 1);
  }

  console.log(`[visual-qa] Screenshots saved to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
