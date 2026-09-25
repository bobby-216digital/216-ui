// Structural parity check between two static exports of 216-mono
// (before/after the cutover). Run it from inside the scratch 216-mono copy,
// which has cheerio installed:
//
//   node ../216-ui/scripts/parity/compare-html.mjs /tmp/out-before /tmp/out-after
//
// A plain `diff -r` can't be the test: two builds of the SAME commit differ,
// because Next embeds a random build ID and streams <head> metadata and RSC
// rows in nondeterministic order. So:
//
//   DOM  Every page is parsed, <script> elements dropped, build ID and hashed
//        /_next/static names normalized. <head> is compared as an unordered
//        set, <body> exactly. This must report 0 differences.
//   RSC  The self.__next_f payload (client component props, route tree) is
//        split into rows, row ids and $L refs normalized, and compared as a
//        multiset. Differences are printed as the distinct edits, with a
//        count of pages each. Expected after the cutover: the props the site
//        now passes to client components (Header's `logo`, ContactForm's
//        endpoint/contact props) and a route deleted with app/dev. Between
//        two builds of one commit, expect ~1 page of noise from Next's row
//        deduplication.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "package.json"));
const cheerio = require("cheerio");

const [A, B] = process.argv.slice(2);
if (!A || !B) {
    console.error("usage: compare-html.mjs <out-before> <out-after>");
    process.exit(2);
}

const pages = (root, dir = "") => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (rel.startsWith("_next")) return [];
    return entry.isDirectory() ? pages(root, rel) : rel.endsWith(".html") ? [rel] : [];
});

function normalize(html) {
    const buildId = html.match(/\\"b\\":\\"([A-Za-z0-9_-]+)\\"/)?.[1];
    if (buildId) html = html.split(buildId).join("BUILD_ID");
    return html.replace(/\/_next\/static\/(chunks|media|css)\/[^"'\\\s)]+/g, "/_next/static/$1/ASSET");
}

function dom(html) {
    const $ = cheerio.load(html);
    $("script").remove();
    return JSON.stringify([$("head").children().toArray().map((el) => $.html(el)).sort(), $("body").html()]);
}

// Rows are `<hex id>:<payload>\n`, except text rows, `<id>:T<hex byte length>,<bytes>`,
// whose bytes may contain newlines.
function rscRows(html) {
    const pushed = [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)].map((m) => JSON.parse(`"${m[1]}"`));
    const buf = Buffer.from(pushed.join(""), "utf8");
    const rows = [];
    for (let i = 0; i < buf.length;) {
        const colon = buf.indexOf(0x3a, i);
        if (colon < 0) break;
        if (buf[colon + 1] === 0x54) {
            const comma = buf.indexOf(0x2c, colon);
            const length = parseInt(buf.subarray(colon + 2, comma).toString(), 16);
            rows.push("T:" + buf.subarray(comma + 1, comma + 1 + length).toString());
            i = comma + 1 + length;
        } else {
            const newline = buf.indexOf(0x0a, colon) < 0 ? buf.length : buf.indexOf(0x0a, colon);
            rows.push(buf.subarray(colon + 1, newline).toString());
            i = newline + 1;
        }
    }
    // Client module ids (I[<id>,…]) change when a module moves into node_modules.
    return rows.map((row) => row.replace(/\$L?[0-9a-f]+\b/g, "$REF").replace(/^I\[\d+,/, "I[MOD,"));
}

function multisetDiff(a, b) {
    const count = (rows) => rows.reduce((m, r) => m.set(r, (m.get(r) || 0) + 1), new Map());
    const ca = count(a), cb = count(b);
    return [
        [...ca].filter(([r, n]) => cb.get(r) !== n).map(([r]) => r).sort(),
        [...cb].filter(([r, n]) => ca.get(r) !== n).map(([r]) => r).sort(),
    ];
}

// The changed span between two rows: strip the common prefix and suffix.
function edit(a, b) {
    let start = 0;
    while (start < a.length && a[start] === b[start]) start++;
    let end = 0;
    while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end++;
    return `- ${a.slice(start, a.length - end).slice(0, 200)}\n    + ${b.slice(start, b.length - end).slice(0, 200)}`;
}

const before = pages(A).sort();
const after = new Set(pages(B));
const domDiffs = [];
const edits = new Map();
for (const page of before.filter((p) => after.has(p))) {
    const a = normalize(fs.readFileSync(path.join(A, page), "utf8"));
    const b = normalize(fs.readFileSync(path.join(B, page), "utf8"));
    if (dom(a) !== dom(b)) domDiffs.push(page);
    const [onlyA, onlyB] = multisetDiff(rscRows(a), rscRows(b));
    const keys = onlyA.length === onlyB.length ? onlyA.map((r, i) => edit(r, onlyB[i])) : [`row count changed: ${onlyA.length} → ${onlyB.length}`];
    for (const key of new Set(keys)) edits.set(key, (edits.get(key) || 0) + 1);
}

console.log(`pages: ${before.length}`);
console.log(`only in before: ${before.filter((p) => !after.has(p)).join(", ") || "none"}`);
console.log(`only in after: ${[...after].filter((p) => !before.includes(p)).join(", ") || "none"}`);
console.log(`DOM differences: ${domDiffs.length}`);
domDiffs.slice(0, 20).forEach((p) => console.log(`  ${p}`));
console.log(`RSC payload edits (pages affected):`);
[...edits].sort((x, y) => y[1] - x[1]).forEach(([key, n]) => console.log(`  ${n}  ${key}`));
process.exit(domDiffs.length ? 1 : 0);
