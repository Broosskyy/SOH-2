import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RUNTIME_MATRIX = [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 2400, height: 1080 },
].flatMap((dimensions) => [
  { ...dimensions, mobile: false },
  { ...dimensions, mobile: true },
]);

function runCase(testCase, outputDirectory) {
  const mode = testCase.mobile ? "mobile" : "desktop";
  const screenshot = path.join(
    outputDirectory,
    `web-runtime-${testCase.width}x${testCase.height}-${mode}.png`,
  );
  const child = spawn(process.execPath, ["scripts/godot-web-runtime-qa.mjs"], {
    env: {
      ...process.env,
      GODOT_WEB_WIDTH: `${testCase.width}`,
      GODOT_WEB_HEIGHT: `${testCase.height}`,
      GODOT_WEB_MOBILE: testCase.mobile ? "1" : "0",
      GODOT_WEB_SCREENSHOT: screenshot,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
    process.stdout.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
    process.stderr.write(chunk);
  });
  return new Promise((resolve) => {
    child.on("close", (code, signal) => {
      resolve({ ...testCase, mode, screenshot, code, signal, stdout, stderr });
    });
  });
}

export async function runMatrix() {
  const outputDirectory = path.resolve(
    process.env.GODOT_WEB_MATRIX_OUTPUT_DIR ?? "artifacts/godot-g0.2",
  );
  await mkdir(outputDirectory, { recursive: true });
  const results = [];
  for (const testCase of RUNTIME_MATRIX) {
    results.push(await runCase(testCase, outputDirectory));
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    passed: results.every((result) => result.code === 0),
    results,
  };
  const summaryPath = path.join(outputDirectory, "web-runtime-matrix.json");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`GODOT_WEB_RUNTIME_MATRIX ${summary.passed ? "PASS" : "FAIL"}`);
  console.log(`EVIDENCE ${summaryPath}`);
  if (!summary.passed) process.exitCode = 1;
  return summary;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await runMatrix();
}
