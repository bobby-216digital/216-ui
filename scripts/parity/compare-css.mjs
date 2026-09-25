// Compares two compiled stylesheets rule by rule. Run it from inside the
// scratch 216-mono copy (it has postcss installed):
//
//   node ../216-ui/scripts/parity/compare-css.mjs /tmp/out-before/_next/static/chunks/*.css -- /tmp/out-after/_next/static/chunks/*.css
//
// A rule's identity is its at-rule/layer context + selector + declarations.
// Prints rules missing after the cutover (a missing utility is the
// partially-styled-page trap: the package's dist/ isn't being scanned),
// rules added, and, per cascade layer, which rules changed position relative
// to the rest (a longest-common-subsequence, so one removal doesn't count as
// every later rule moving). Expected after the cutover: the utilities only
// app/dev/components used go missing, and the site-only rules move to the
// end of @layer site.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "package.json"));
const postcss = require("postcss");

const args = process.argv.slice(2);
const split = args.indexOf("--");
if (split < 1 || split === args.length - 1) {
    console.error("usage: compare-css.mjs <before.css…> -- <after.css…>");
    process.exit(2);
}

function rules(files) {
    const out = [];
    for (const file of files) {
        postcss.parse(fs.readFileSync(file, "utf8")).walk((node) => {
            if (node.type !== "rule" && !(node.type === "atrule" && !node.nodes)) return;
            if (node.parent?.type === "atrule" && node.parent.name === "keyframes") return;
            const context = [];
            for (let p = node.parent; p && p.type !== "root"; p = p.parent) context.unshift(p.type === "atrule" ? `@${p.name} ${p.params}` : p.selector);
            const body = node.type === "rule"
                ? node.nodes.filter((d) => d.type === "decl").map((d) => `${d.prop}:${d.value}${d.important ? "!important" : ""}`).join(";")
                : "";
            const head = node.type === "rule" ? node.selector : `@${node.name} ${node.params}`;
            out.push({ layer: context.find((c) => c.startsWith("@layer")) ?? "(unlayered)", key: `${context.join(" > ")} | ${head} { ${body} }` });
        });
    }
    return out;
}

// Longest common subsequence of two key lists; returns the keys of `a` outside it.
function movedOutOfOrder(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
    for (let i = a.length - 1; i >= 0; i--)
        for (let j = b.length - 1; j >= 0; j--)
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const kept = new Set();
    for (let i = 0, j = 0; i < a.length && j < b.length;) {
        if (a[i] === b[j]) { kept.add(i); i++; j++; }
        else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
        else j++;
    }
    return a.filter((_, i) => !kept.has(i));
}

const before = rules(args.slice(0, split));
const after = rules(args.slice(split + 1));
const count = (xs) => xs.reduce((m, x) => m.set(x.key, (m.get(x.key) || 0) + 1), new Map());
const cb = count(before), ca = count(after);
const missing = [...cb].filter(([k, n]) => (ca.get(k) || 0) < n).map(([k]) => k);
const added = [...ca].filter(([k, n]) => (cb.get(k) || 0) < n).map(([k]) => k);

console.log(`rules: before ${before.length}, after ${after.length}`);
console.log(`missing after: ${missing.length}`);
missing.forEach((k) => console.log(`  - ${k.slice(0, 220)}`));
console.log(`added after: ${added.length}`);
added.forEach((k) => console.log(`  + ${k.slice(0, 220)}`));
for (const layer of new Set(before.map((r) => r.layer))) {
    const shared = (xs, other) => xs.filter((r) => r.layer === layer && other.has(r.key)).map((r) => r.key);
    const moved = movedOutOfOrder(shared(before, ca), shared(after, cb));
    console.log(`${layer}: ${moved.length} rule(s) changed position`);
    moved.forEach((k) => console.log(`  ~ ${k.slice(0, 160)}`));
}
