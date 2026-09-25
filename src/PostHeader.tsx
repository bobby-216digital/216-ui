/* eslint-disable @next/next/no-img-element */
import { Reveal } from "./Reveal.tsx";
import { TableOfContents, type TocEntry } from "./TableOfContents.tsx";

type PostHeaderProps = {
    title: string;
    publishedAt: string;
    authorName?: string;
    authorPhoto?: string;
    featuredImage?: string;
    featuredImageAlt?: string;
    tableOfContents?: Array<TocEntry>;
};

/** "2024-01-15" -> "January 15, 2024". Falls back to the raw string if it doesn't parse. */
function formatDate(iso: string): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * The title/byline/cover-image block above a post's body — analogous to
 * how site.config.tsx's root wraps Header/Footer around a page's content;
 * blog.config.tsx's root wraps this around a post's body blocks instead.
 * Not a draggable Puck component itself, since every post has exactly one.
 *
 * The table of contents (when a post has one) renders beside the featured
 * image rather than below it — 75% image / 25% TOC on desktop, stacked on
 * mobile. Handled here, not as a separate block after this component, so
 * the two can actually sit in one row together.
 */
export function PostHeader({
    title,
    publishedAt,
    authorName,
    authorPhoto,
    featuredImage,
    featuredImageAlt,
    tableOfContents = [],
}: Readonly<PostHeaderProps>) {
    const hasToc = tableOfContents.length > 0;

    return (
        <Reveal className="flex flex-col gap-6 py-10">
            <div className="flex flex-col gap-3">
                <h1>{title}</h1>
                <div className="flex items-center gap-3 text-sm secondary">
                    {authorPhoto && (
                        <img
                            src={authorPhoto}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover"
                        />
                    )}
                    {authorName && <span>{authorName}</span>}
                    {authorName && publishedAt && <span aria-hidden="true">&middot;</span>}
                    {publishedAt && <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>}
                </div>
            </div>
            {(featuredImage || hasToc) && (
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    {featuredImage && (
                        <img
                            src={featuredImage}
                            alt={featuredImageAlt ?? ""}
                            className={`rounded-(--card-radius) object-cover max-h-[480px] ${hasToc ? "w-full md:w-3/4" : "w-full"}`}
                        />
                    )}
                    {hasToc && (
                        <div className="w-full md:w-1/4">
                            <TableOfContents items={tableOfContents} />
                        </div>
                    )}
                </div>
            )}
        </Reveal>
    );
}
