import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function runWindowsSmoke({
  executable = process.env.GODOT_WINDOWS_EXE ??
    "godot/build/windows/AbyssalDominion.exe",
  timeoutMs = Number.parseInt(
    process.env.GODOT_WINDOWS_SMOKE_TIMEOUT_MS ?? "10000",
    10,
  ),
  output = process.env.GODOT_WINDOWS_SMOKE_OUTPUT ??
    "artifacts/godot-g0.2/windows-smoke.json",
} = {}) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("GODOT_WINDOWS_SMOKE_TIMEOUT_MS must be a positive integer");
  }
  const executablePath = path.resolve(executable);
  await access(executablePath);
  const startedAt = Date.now();
  const child = spawn(executablePath, [], {
    cwd: path.dirname(executablePath),
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  const exit = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  const outcome = await Promise.race([
    exit.then((result) => ({ status: "EARLY_EXIT", ...result })),
    sleep(timeoutMs).then(() => ({ status: "BOOTED" })),
  ]);
  if (outcome.status === "BOOTED") {
    child.kill();
    await Promise.race([exit, sleep(2000)]);
  }
  const evidence = {
    generatedAt: new Date().toISOString(),
    executable: executablePath,
    timeoutMs,
    elapsedMs: Date.now() - startedAt,
    passed: outcome.status === "BOOTED",
    ...outcome,
    stdout,
    stderr,
  };
  const destination = path.resolve(output);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`GODOT_WINDOWS_SMOKE_${evidence.passed ? "PASS" : "FAIL"}`);
  console.log(`EVIDENCE ${destination}`);
  if (!evidence.passed) process.exitCode = 1;
  return evidence;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await runWindowsSmoke();
}
