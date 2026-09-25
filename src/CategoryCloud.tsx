import Link from "next/link";

type CategoryCloudProps = {
    categories: Array<{ slug: string; label: string }>;
    /** Prefix of each category's archive URL; a pill links to `${basePath}${slug}/`. 216-mono: "/ideas/category/". */
    basePath: string;
    /** Highlights the category currently being viewed — set on /ideas/category/<slug>/ pages, unset on the main index. */
    activeSlug?: string;
};

/**
 * The /ideas/ index's clickable category cloud — each pill links to that
 * category's archive (app/ideas/category/[category]/page.tsx), which is
 * what actually does the filtering (a real static page per category, not
 * client-side JS — this is a static-export site with no server to filter
 * on demand). Deliberately its own component rather than a reused/
 * restyled Badges: Badges' plain centered-text layout is shared by
 * several existing pages (e.g. About's stat callouts) sitewide, and this
 * needs a distinct pill look (background, rounded, hover) that shouldn't
 * leak into those other usages.
 */
export function CategoryCloud({ categories, basePath, activeSlug }: Readonly<CategoryCloudProps>) {
    return (
        <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
                const isActive = category.slug === activeSlug;
                return (
                    <Link
                        key={category.slug}
                        href={`${basePath}${category.slug}/`}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                            isActive
                                ? "bg-(--primary-accent-color) text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                        {category.label}
                    </Link>
                );
            })}
        </div>
    );
}
