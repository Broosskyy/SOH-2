import { execFile } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { resolveGodotBinary } from "./godot-resolve-binary.mjs";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const godotProject = path.join(rootDir, "godot", "project.godot");
const BUILD_MARKER = "M0-CLEAN-NATIVE-FOUNDATION";

export async function patchWebExportArtifacts(webBuildDir = path.join(rootDir, "godot", "build", "web")) {
  const htmlPath = path.join(webBuildDir, "index.html");
  let html = await readFile(htmlPath, "utf8");
  html = html.replace(
    /<meta name="abyssal-build" content="[^"]*">/,
    `<meta name="abyssal-build" content="${BUILD_MARKER}">`,
  );
  if (!html.includes("abyssal-build")) {
    html = html.replace("<head>", `<head>\n\t\t<meta name="abyssal-build" content="${BUILD_MARKER}">`);
  }
  await writeFile(htmlPath, html, "utf8");
}

export async function exportGodotWeb({
  godotBinary,
  projectPath = godotProject,
  preset = "Web",
} = {}) {
  const resolved = godotBinary
    ? { binary: godotBinary, version: null }
    : await resolveGodotBinary();
  const webBuildDir = path.join(rootDir, "godot", "build", "web");
  await access(projectPath);
  await mkdir(webBuildDir, { recursive: true });
  const args = ["--headless", "--path", path.dirname(projectPath), "--export-release", preset];
  const { stdout, stderr } = await execFileAsync(resolved.binary, args, {
    cwd: rootDir,
    maxBuffer: 16 * 1024 * 1024,
  });
  await patchWebExportArtifacts(webBuildDir);
  return { stdout, stderr };
}

export async function exportGodotAndroid({
  godotBinary,
  projectPath = godotProject,
  preset = "Android",
} = {}) {
  const resolved = godotBinary
    ? { binary: godotBinary, version: null }
    : await resolveGodotBinary();
  const apkDir = path.join(rootDir, "godot", "build", "android");
  await access(projectPath);
  await mkdir(apkDir, { recursive: true });
  const args = ["--headless", "--path", path.dirname(projectPath), "--export-debug", preset];
  const { stdout, stderr } = await execFileAsync(resolved.binary, args, {
    cwd: rootDir,
    maxBuffer: 16 * 1024 * 1024,
  });
  return { stdout, stderr, apkPath: path.join(apkDir, "AbyssalDominion-M0-debug.apk") };
}

async function main() {
  const preset = process.argv[2] ?? "Web";
  if (preset === "Android") {
    const result = await exportGodotAndroid();
    if (result.stdout.trim()) process.stdout.write(`${result.stdout}\n`);
    if (result.stderr.trim()) process.stderr.write(`${result.stderr}\n`);
    console.log(`GODOT_ANDROID_EXPORT_COMPLETE ${result.apkPath}`);
    return;
  }
  const result = await exportGodotWeb({ preset });
  if (result.stdout.trim()) process.stdout.write(`${result.stdout}\n`);
  if (result.stderr.trim()) process.stderr.write(`${result.stderr}\n`);
  console.log("GODOT_WEB_EXPORT_COMPLETE");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
