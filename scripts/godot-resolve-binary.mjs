import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED_VERSION_PREFIX = "4.7.2";

async function fileExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function readLocalConfig() {
  const configPath = path.join(rootDir, ".godot-bin.local");
  try {
    const raw = await readFile(configPath, "utf8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch {
    return [];
  }
}

async function findOnPath(name) {
  if (process.platform === "win32") {
    try {
      const { stdout } = await execFileAsync("where.exe", [name], { encoding: "utf8" });
      const first = stdout.trim().split(/\r?\n/).find(Boolean);
      if (first && await fileExists(first)) {
        return first;
      }
    } catch {
      return null;
    }
    return null;
  }
  try {
    const { stdout } = await execFileAsync("which", [name], { encoding: "utf8" });
    const first = stdout.trim();
    if (first && await fileExists(first)) {
      return first;
    }
  } catch {
    return null;
  }
  return null;
}

export async function verifyGodotVersion(binary) {
  const { stdout } = await execFileAsync(binary, ["--version"], { encoding: "utf8" });
  const version = stdout.trim().split(/\r?\n/)[0] ?? "";
  if (!version.startsWith(REQUIRED_VERSION_PREFIX)) {
    throw new Error(
      `Expected Godot ${REQUIRED_VERSION_PREFIX} Stable, got "${version}" from ${binary}`,
    );
  }
  return version;
}

export async function resolveGodotBinary() {
  const candidates = [
    process.env.GODOT_BIN,
    process.env.GODOT4_BIN,
    ...(await readLocalConfig()),
    path.join(rootDir, ".tools", "Godot_v4.7.2-stable_win64_console.exe"),
    path.join(rootDir, ".tools", "Godot_v4.7.2-stable_win64.exe"),
    path.join(rootDir, ".tools", "Godot_v4.7.2-stable_win64", "Godot_v4.7.2-stable_win64_console.exe"),
    "C:\\Program Files\\Godot\\Godot_v4.7.2-stable_win64.exe",
    "C:\\Program Files\\Godot\\Godot_v4.7.2-stable_win64_console.exe",
    await findOnPath("godot"),
    await findOnPath("godot4"),
  ].filter(Boolean);

  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    if (!(await fileExists(candidate))) {
      continue;
    }
    try {
      const version = await verifyGodotVersion(candidate);
      return { binary: candidate, version };
    } catch {
      continue;
    }
  }

  throw new Error(
    [
      "Godot 4.7.2 Stable executable not found.",
      "Set GODOT_BIN, create .godot-bin.local (gitignored) with the full path,",
      "or place Godot_v4.7.2-stable_win64_console.exe in .tools/.",
    ].join(" "),
  );
}
