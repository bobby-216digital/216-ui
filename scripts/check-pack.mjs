// Fails unless the tarball `npm pack` would publish contains only dist/,
// package.json, README.md and CHANGELOG.md. The playground, sources and
// scripts must never ship. Runs prepack (the build) first, like a real pack.
import { execFileSync } from "node:child_process";

const [pack] = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] })
);
const allowed = (path) => path.startsWith("dist/") || ["package.json", "README.md", "CHANGELOG.md"].includes(path);
const files = pack.files.map((file) => file.path);
const unexpected = files.filter((path) => !allowed(path));
const missing = ["package.json", "README.md", "CHANGELOG.md", "dist/styles/index.css", "dist/Header.js", "dist/Header.d.ts"]
    .filter((path) => !files.includes(path));

if (unexpected.length || missing.length) {
    if (unexpected.length) console.error(`Unexpected files in the tarball:\n  ${unexpected.join("\n  ")}`);
    if (missing.length) console.error(`Missing from the tarball:\n  ${missing.join("\n  ")}`);
    process.exit(1);
}
console.log(`${pack.filename}: ${files.length} files, all under dist/ or allowed at the root.`);
