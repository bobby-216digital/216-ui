/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Reveal } from "./Reveal.tsx";

type PostCardProps = {
    href: string;
    title: string;
    excerpt?: string;
    publishedAt?: string;
    image?: string;
    imageAlt?: string;
    authorName?: string;
    authorPhoto?: string;
    /** Larger layout with the image beside (not above) the text — used once for the /ideas/ index's featured pick. */
    featured?: boolean;
};

function formatDate(iso: string): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * A post preview — used for both the /ideas/ index's regular post grid and
 * (with `featured`) its one larger featured-pick slot. Deliberately its
 * own component rather than a repurposed FeatureCard: FeatureCard's
 * `icon`/`accentColor` fields are about a small circular icon badge, not a
 * rectangular cover photo, and overloading that semantic would be more
 * confusing than a second small component.
 */
export function PostCard({
    href,
    title,
    excerpt,
    publishedAt,
    image,
    imageAlt,
    authorName,
    authorPhoto,
    featured = false,
}: Readonly<PostCardProps>) {
    return (
        <Reveal
            className={`card overflow-hidden flex ${featured ? "flex-col md:flex-row gap-6" : "flex-col"}`}
        >
            {/* Hidden from assistive tech: it points at the same post as the title
                link below, and its image is either decorative or captioned with the
                title itself, so exposing it only adds an unnamed duplicate. */}
            <Link
                href={href}
                className={`block ${featured ? "md:w-1/2" : ""}`}
                aria-hidden="true"
                tabIndex={-1}
            >
                {image ? (
                    <img
                        src={image}
                        alt={imageAlt ?? ""}
                        className={`w-full object-cover ${featured ? "h-full min-h-[240px]" : "h-48"}`}
                    />
                ) : (
                    <div className="w-full h-48 bg-(--secondary-bg-color)" aria-hidden="true" />
                )}
            </Link>
            <div className={`flex flex-col gap-2 p-6 ${featured ? "md:w-1/2 justify-center" : ""}`}>
                {(publishedAt || authorName) && (
                    <div className="flex items-center justify-between gap-3">
                        {publishedAt ? (
                            <time dateTime={publishedAt} className="secondary text-sm">
                                {formatDate(publishedAt)}
                            </time>
                        ) : (
                            <span />
                        )}
                        {authorName && (
                            <div className="flex items-center gap-2">
                                {authorPhoto && (
                                    <img
                                        src={authorPhoto}
                                        alt=""
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                )}
                                <span className="secondary text-sm">{authorName}</span>
                            </div>
                        )}
                    </div>
                )}
                <Link href={href} className="block">
                    <h3 className={featured ? "" : "subheading"}>{title}</h3>
                </Link>
                {excerpt && <p className="secondary">{excerpt}</p>}
            </div>
        </Reveal>
    );
}
