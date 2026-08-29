import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const godotProject = path.join(rootDir, "godot", "project.godot");
const exportPreset = "Web";

export function resolveGodotBinary() {
  const candidates = [
    process.env.GODOT_BIN,
    process.env.GODOT4_BIN,
    "godot",
    "godot4",
    "C:\\Program Files\\Godot\\Godot_v4.7.2-stable_win64.exe",
    path.join(rootDir, ".tools", "Godot_v4.7.2-stable_win64.exe"),
  ].filter(Boolean);
  return candidates[0] ?? "godot";
}

export async function exportGodotWeb({
  godotBinary = resolveGodotBinary(),
  projectPath = godotProject,
  preset = exportPreset,
} = {}) {
  await access(projectPath);
  const args = ["--headless", "--path", path.dirname(projectPath), "--export-release", preset];
  const { stdout, stderr } = await execFileAsync(godotBinary, args, {
    cwd: rootDir,
    maxBuffer: 16 * 1024 * 1024,
  });
  return { stdout, stderr };
}

async function main() {
  const result = await exportGodotWeb();
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
