'use client'

import { useLayoutEffect, useRef, type ReactNode } from "react"

type RevealProps = {
    children: ReactNode
    className?: string
    /** Stagger delay in ms — for a sequence of Reveals (e.g. a row of stats). */
    delay?: number
    /**
     * Jump-link target, for the blocks that carry one (RichText's anchorId).
     * Here because this element replaces the wrapper those blocks used to
     * render themselves, rather than nesting inside it.
     */
    id?: string
}

/**
 * Scroll-triggered fade-up, used selectively (Hero copy, FeatureCard,
 * Badges' stat rows) rather than applied blanket-wide — see the note on
 * .reveal in styles/components.css for the full accessibility/safety reasoning this
 * implementation follows. The short version: this component adds the
 * `.reveal` (hidden) class itself, in the same synchronous effect that sets
 * up the IntersectionObserver, and does it via a ref + classList rather
 * than React state so there's no intermediate render where the element
 * would flash from visible to hidden. If this effect never runs at all —
 * JS disabled, an error earlier on the page — the element simply keeps
 * whatever fully-visible state it was server-rendered with.
 */
export function Reveal({ children, className = "", delay = 0, id }: Readonly<RevealProps>) {
    const ref = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        /**
         * An element with no layout box at mount is inside something that is
         * `display: none` — in practice an inactive tab panel, since Tabs
         * renders every panel and hides all but one with `hidden`. An
         * IntersectionObserver on it can never fire, so adding `.reveal`
         * would leave it at opacity 0 permanently, and the moment the user
         * selects that tab they get a panel that is empty to look at while
         * still being read out by a screen reader.
         *
         * This was live on /radar/, whose four tabs each hold a Hero: three
         * of the four were invisible on selection. Bailing out here means
         * such an element simply keeps the visible state it was rendered
         * with — the same fail-open behaviour as JS being disabled entirely.
         */
        if (el.getClientRects().length === 0) return

        el.classList.add('reveal')

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('reveal-visible')
                    observer.disconnect()
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} id={id || undefined} className={className || undefined} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
            {children}
        </div>
    )
}
