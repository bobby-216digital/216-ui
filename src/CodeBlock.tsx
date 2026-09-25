/**
 * Deliberately synchronous, unlike an earlier version of this component —
 * verified directly that react-dom/server's synchronous render APIs
 * (used by scripts/smoke-test-content.tsx, not Next's own App Router
 * pipeline) throw on an async Server Component ("A component suspended
 * while responding to synchronous input") rather than awaiting it, even
 * though Next's real build handled it fine. Pre-computing the highlighted
 * HTML wherever a CodeBlock's `code`/`language` are actually set (the
 * migration script, for now — see scripts/migrate-blog-content.ts) avoids
 * that whole class of async/sync mismatch rather than working around one
 * symptom of it.
 */
type CodeBlockProps = {
    code: string;
    /** A Shiki-recognized language id, kept for context/future re-highlighting — not read directly by this component. */
    language: string;
    /** Pre-rendered by Shiki at content-write time (see the migration script). Falls back to a plain escaped block if blank — e.g. a code block authored directly in the editor, not yet re-highlighted. */
    html: string;
};

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function CodeBlock({ code, html }: Readonly<CodeBlockProps>) {
    const markup = html || `<pre><code>${escapeHtml(code)}</code></pre>`;

    return (
        // Shiki's own output already includes a <pre><code> with inline
        // theme colors — no extra wrapper styling needed beyond spacing.
        <div className="my-4 overflow-x-auto rounded-(--card-radius)" dangerouslySetInnerHTML={{ __html: markup }} />
    );
}
