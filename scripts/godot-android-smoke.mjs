import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", (error) => {
      resolve({ code: null, stdout, stderr, error: error.message });
    });
    child.once("close", (code, signal) => {
      resolve({ code, signal, stdout, stderr });
    });
  });
}

const connectedDevices = (output) =>
  output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter((parts) => parts.length >= 2 && parts[1] === "device")
    .map((parts) => parts[0]);

export async function runAndroidSmoke({
  adb = process.env.ADB_PATH ?? "adb",
  apk = process.env.GODOT_ANDROID_APK ??
    "godot/build/android/AbyssalDominion.apk",
  packageName = process.env.GODOT_ANDROID_PACKAGE ??
    "com.avenor.abyssaldominion",
  enabled = process.env.GODOT_ANDROID_SMOKE_ENABLE === "1",
  output = process.env.GODOT_ANDROID_SMOKE_OUTPUT ??
    "artifacts/godot-g0.2/android-smoke.json",
} = {}) {
  const evidence = {
    generatedAt: new Date().toISOString(),
    enabled,
    adb,
    apk: path.resolve(apk),
    packageName,
    status: "EXPORT_ONLY",
    passed: true,
    commands: [],
  };
  const version = await run(adb, ["version"]);
  evidence.commands.push({ command: "version", ...version });
  if (version.code === 0) {
    const devices = await run(adb, ["devices"]);
    evidence.commands.push({ command: "devices", ...devices });
    evidence.devices = connectedDevices(devices.stdout);
    if (enabled && evidence.devices.length > 0) {
      await access(evidence.apk);
      const install = await run(adb, ["install", "-r", evidence.apk]);
      evidence.commands.push({ command: "install", ...install });
      if (install.code !== 0) {
        evidence.status = "INSTALL_FAILED";
        evidence.passed = false;
      } else {
        const launch = await run(adb, [
          "shell",
          "monkey",
          "-p",
          packageName,
          "-c",
          "android.intent.category.LAUNCHER",
          "1",
        ]);
        evidence.commands.push({ command: "launch", ...launch });
        evidence.status = launch.code === 0 ? "LAUNCHED" : "LAUNCH_FAILED";
        evidence.passed = launch.code === 0;
      }
    }
  }
  const destination = path.resolve(output);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`GODOT_ANDROID_SMOKE ${evidence.status}`);
  console.log(`EVIDENCE ${destination}`);
  if (!evidence.passed) process.exitCode = 1;
  return evidence;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await runAndroidSmoke();
}
