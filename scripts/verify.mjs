/**
 * verify.mjs — Local project verification (replaces GitHub Actions CI).
 *
 * Runs with zero dependencies, fully offline:
 *   1. Syntax-checks every JS / MJS module (+ the service worker).
 *   2. Runs the deterministic engine unit-test suite.
 *
 * Usage:  npm run verify      (or: node scripts/verify.mjs)
 */
import { execSync } from "node:child_process";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".js") || e.endsWith(".mjs")) out.push(p);
  }
  return out;
}

let failures = 0;

console.log("\nCortexSim Pro — local verification\n===================================\n");
console.log("1) Syntax check");
const files = [...walk("src"), ...walk("tests"), ...walk("scripts")];
if (existsSync("sw.js")) files.push("sw.js");
for (const f of files) {
  try {
    execSync("node --input-type=module --check", { input: readFileSync(f) });
    console.log("  \u2713 " + f);
  } catch {
    console.error("  \u2717 SYNTAX ERROR: " + f);
    failures++;
  }
}

console.log("\n2) Engine unit tests");
try {
  execSync("node tests/engine.test.mjs", { stdio: "inherit" });
} catch {
  failures++;
}

console.log(
  failures === 0
    ? "\n\u2705 All checks passed.\n"
    : `\n\u274c ${failures} check group(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
