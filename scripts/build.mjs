// dist/ = plain tsc output (one .js + .d.ts per source file) plus the CSS,
// copied as-is. See tsconfig.build.json for why there's no bundler.
import { execFileSync } from "node:child_process";
import { cpSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
execFileSync("npx", ["tsc", "-p", "tsconfig.build.json"], { stdio: "inherit" });

// The sources import each other as "./Reveal.tsx" so the playground's
// Turbopack can resolve them straight from src/. rewriteRelativeImportExtensions
// turns those into "./Reveal.js" in the emitted JS, but declaration emit
// leaves them as written, and a consumer's TypeScript can't resolve a .tsx
// specifier inside node_modules. Rewrite them the same way here.
for (const file of readdirSync("dist").filter((name) => name.endsWith(".d.ts"))) {
    const path = `dist/${file}`;
    const source = readFileSync(path, "utf8");
    const rewritten = source.replace(/(from\s+["']\.\/[^"']+)\.tsx?(["'])/g, "$1.js$2");
    if (rewritten !== source) writeFileSync(path, rewritten);
}

cpSync("src/styles", "dist/styles", { recursive: true });
