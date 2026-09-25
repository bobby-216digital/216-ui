// Fails unless src/palette.ts (what consumers read to emit overrides and
// check contrast) and the BRAND PALETTE block in tokens.css (what actually
// paints) name the same custom properties with the same defaults. Runs
// against dist/, so build first.
import { readFileSync } from "node:fs";
import { PALETTE } from "../dist/palette.js";

const css = readFileSync("dist/styles/tokens.css", "utf8");
const inCss = new Map([...css.matchAll(/^\s*(--brand-[a-z-]+):\s*(#[0-9a-f]{6});/gim)].map((m) => [m[1], m[2].toLowerCase()]));
const inTs = new Map(PALETTE.map((color) => [color.cssVar, color.defaultValue.toLowerCase()]));

const problems = [];
for (const [name, value] of inTs) {
    if (!inCss.has(name)) problems.push(`${name} is in palette.ts but not tokens.css`);
    else if (inCss.get(name) !== value) problems.push(`${name}: palette.ts says ${value}, tokens.css says ${inCss.get(name)}`);
}
for (const name of inCss.keys()) if (!inTs.has(name)) problems.push(`${name} is in tokens.css but not palette.ts`);

if (problems.length) {
    console.error(`Palette out of sync:\n  ${problems.join("\n  ")}`);
    process.exit(1);
}
console.log(`Palette in sync: ${inTs.size} colors.`);
