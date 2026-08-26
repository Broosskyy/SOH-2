import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const wranglerCache = resolve(root, "dist/server/.wrangler");

try {
  await rm(wranglerCache, { recursive: true, force: true });
  console.log("Removed dist/server/.wrangler preview cache.");
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "EPERM" || code === "EBUSY") {
    console.warn(
      "dist/server/.wrangler is locked. Stop preview:web/start, then delete dist/server/.wrangler manually.",
    );
  } else {
    console.warn(
      "Could not remove dist/server/.wrangler:",
      error instanceof Error ? error.message : error,
    );
  }
}
