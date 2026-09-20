// Self-serve video generation: install a script file as the current video,
// validate it, and render it — one command, no manual editing.
//
//   npm run make -- path/to/my-story.ts
//
// The script file just needs to `export const video = { ... }` matching the
// schema in src/schema/video.ts — the ChatVideo import is added automatically
// if missing. Output: out/<video-id>.mp4

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("usage: npm run make -- <script-file.ts>");
  process.exit(1);
}

const sourcePath = resolve(input);
let source = readFileSync(sourcePath, "utf8");

const hasChatVideoImport =
  /import\s+type\s*\{[^}]*ChatVideo[^}]*\}\s*from\s*["'][^"']*schema\/video["']/.test(
    source,
  );

if (!hasChatVideoImport) {
  source = `import type { ChatVideo } from "../schema/video";\n\n${source}`;
}

// Install as the current video.
const target = resolve("src/videos/current-video.ts");
writeFileSync(target, source);
console.log(`installed ${input} → src/videos/current-video.ts`);

const idMatch = /id:\s*"([^"]+)"/.exec(source);
const videoId = idMatch ? idMatch[1] : "video";

const run = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    console.error(`\n✗ step failed: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
};

// 1. Validate + show the compiled timeline (any [validation] warnings appear here).
console.log("\n— compiling timeline —");
run("npx", [
  "esbuild",
  "scripts/print-timeline.ts",
  "--bundle",
  "--platform=node",
  "--format=cjs",
  "--outfile=out/print-timeline.cjs",
  "--log-level=error",
]);
run("node", ["out/print-timeline.cjs"]);

// 2. Render.
const output = `out/${videoId}.mp4`;
console.log(`\n— rendering → ${output} —`);
run("npx", ["remotion", "render", "ChatStoryVideo", output]);

console.log(`\n✓ done: ${output}`);
