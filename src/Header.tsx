/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"

type NavigationProps = {
    items: Array<NavigationItem>
    /** The home link's image. `alt` names the link's destination (216-mono: "216digital homepage"), since the image is the link's only content. */
    logo: { src: string, alt: string }
}

type NavigationItem = {
    title: string,
    url: string,
    childLinks?: Array<NavChild>,
    navPromo?: NavPromo,
    button?: boolean
}

type NavChild = {
    title: string,
    subtitle?: string,
    url: string
}

type NavPromo = {
    title: string,
    subtitle: string,
    image: string,
    imageAlt?: string,
    cta: string,
    url: string
}

/** Breathing room kept between a dropdown panel and the window edge before
    it flips to right-aligned — see checkOverflow below. */
const NAV_EDGE_GUTTER = 16

function NavItem({
    title,
    url,
    childLinks,
    navPromo
}: Readonly<Omit<NavigationItem, 'button'>>) {
    const [open, setOpen] = useState(false)
    // Whether the dropdown would spill past the right edge of the
    // viewport if left-aligned to its trigger (the default) — flips it to
    // right-aligned instead so nav items toward the right side of a wide
    // header (e.g. the last dropdown before a trailing "Contact Us"
    // button) never open off-screen. The panel is always mounted (see the
    // note below), so its width is measurable even while visually
    // collapsed — no need to wait for `open` before checking.
    const [flip, setFlip] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hasSubmenu = Boolean(childLinks && childLinks.length > 0)
    /* The submenu panel is sized for a links column beside a promo. "About"
       is the first item to have child links and no promo, and without this
       it rendered 3 links in 60% of a 36rem panel with the other 40% blank.
       Both the panel width and the column width follow from it. */
    const hasPromo = Boolean(navPromo?.url)

    /**
     * Hover only opens the submenu where hovering is actually a thing: a
     * fine pointer that can hover, at the desktop breakpoint. Below `md`
     * this same component renders the in-flow mobile accordion, where a
     * hover-open would fight the tap that is meant to toggle it — and on a
     * touchscreen `mouseenter` fires on tap in several browsers, which
     * would open a panel the same tap then closes. Checked at call time
     * rather than in state because it can change mid-session (a window
     * resize, or a laptop with a touchscreen and a trackpad).
     */
    function hoverIsMeaningful() {
        return window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches
    }

    function cancelClose() {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current)
            closeTimer.current = null
        }
    }

    function openOnHover() {
        if (!hoverIsMeaningful()) return
        cancelClose()
        setOpen(true)
    }

    /**
     * Closing on a short delay rather than immediately. The panel is a DOM
     * child of this wrapper, so `mouseleave` does not fire while the pointer
     * is inside the panel itself (mouseleave counts descendants) — but it
     * does fire on the way past a sibling nav item, and a 120ms grace period
     * stops the menu flickering shut and open again as the pointer travels
     * along the row.
     */
    function closeOnHover() {
        if (!hoverIsMeaningful()) return
        cancelClose()
        closeTimer.current = setTimeout(() => setOpen(false), 120)
    }

    useEffect(() => cancelClose, [])

    /**
     * Dismissal, which is the other half of opening on hover. WCAG 1.4.13
     * requires content revealed by pointer hover to be dismissible without
     * moving the pointer, so Escape closes and returns focus to the trigger
     * — the panel goes `inert` when closed, so focus left inside it would
     * otherwise be dropped to the body and lose the user's place.
     *
     * `pointerdown` rather than `click`: it fires before focus moves, so the
     * panel is already closing as the new target takes focus, and it covers
     * touch and pen without a second listener. A press inside this wrapper
     * is left alone — the trigger's own onClick owns that, and closing here
     * would race it. Only listening while open keeps this off the document
     * for the nav items that are closed, which is all of them most of the time.
     */
    useEffect(() => {
        if (!open) return

        function onPointerDown(event: PointerEvent) {
            if (wrapperRef.current?.contains(event.target as Node)) return
            cancelClose()
            setOpen(false)
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Escape') return
            cancelClose()
            setOpen(false)
            if (wrapperRef.current?.contains(document.activeElement)) {
                triggerRef.current?.focus()
            }
        }

        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    useLayoutEffect(() => {
        if (!hasSubmenu) return

        /* Measures the panel's WIDTH plus the trigger's own left edge, not
           the panel's current right edge. Reading `rect.right` made this a
           one-way latch that then unlatched itself: once flipped, the panel
           is right-aligned, so its right edge no longer overflows, so the
           next resize measured it as fitting and set flip back to false —
           re-rendering it left-aligned and off-screen again, with no further
           resize event to correct it. That's the "Marketing drop downs cut
           off page" note: correct on first load, broken after any resize or
           zoom, which is exactly the kind of intermittent that makes it look
           like a random layout bug. Computing the would-be-unflipped
           position instead makes this idempotent — it gives the same answer
           whatever the current flip state is.

           NAV_EDGE_GUTTER so a panel that technically fits by three pixels
           still flips rather than sitting flush against the window edge. */
        function checkOverflow() {
            const wrapper = wrapperRef.current
            const panel = panelRef.current
            if (!wrapper || !panel) return
            const wouldBeRight = wrapper.getBoundingClientRect().left + panel.offsetWidth
            setFlip(wouldBeRight > window.innerWidth - NAV_EDGE_GUTTER)
        }

        checkOverflow()
        window.addEventListener('resize', checkOverflow)
        return () => window.removeEventListener('resize', checkOverflow)
    }, [hasSubmenu])

    return (
        /* onBlur is the keyboard counterpart of the outside-press handler
           above: React's onBlur is focusout, so it fires as focus leaves any
           descendant, and a relatedTarget still inside the wrapper means the
           user has just tabbed from the trigger into the panel. */
        <div
            ref={wrapperRef}
            className="relative"
            onMouseEnter={openOnHover}
            onMouseLeave={closeOnHover}
            onBlur={(event) => {
                if (wrapperRef.current?.contains(event.relatedTarget as Node | null)) return
                cancelClose()
                setOpen(false)
            }}
        >
            <div className="flex items-center gap-1">
                <Link href={url}>
                    {title}
                </Link>
                {hasSubmenu &&
                <button
                    ref={triggerRef}
                    type="button"
                    className="control-button"
                    aria-expanded={open}
                    aria-label={`${open ? 'Collapse' : 'Expand'} ${title} submenu`}
                    onClick={() => setOpen((value) => !value)}
                >
                    {/* A thin SVG chevron reads far cleaner at nav-text size
                        than the ▼ glyph did — that character renders much
                        heavier/darker than the surrounding text in most
                        fonts, with its own baseline quirks that threw off
                        vertical alignment next to the link. currentColor
                        keeps it matched to the link's own text color, and
                        the rotate mirrors the Accordion's +/rotate-45 open
                        state for the same kind of feedback. */}
                    <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    >
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                }
            </div>
            {hasSubmenu &&
            /* Always mounted (not conditionally rendered) so both opening
               and closing can transition — a conditional `open && <div>`
               can only ever animate the entrance. Mobile is in-flow, so it
               collapses via the grid-rows 0fr/1fr trick (an inner
               overflow-hidden wrapper is required for that trick to work);
               desktop is absolutely positioned and floats over content, so
               it fades/slides instead — different mechanisms because one
               affects layout and the other doesn't, not one shared rule.
               `inert` removes the closed panel from tab order and the
               accessibility tree together — without it, a keyboard user
               could tab into links that are invisible (desktop, opacity: 0)
               or squashed to zero height (mobile). */
            <div
                ref={panelRef}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-300 md:absolute md:top-full md:z-10 md:block ${hasPromo ? 'md:w-xl' : 'md:w-sm'} md:transition-[opacity,transform] md:duration-200 ${
                    flip ? 'md:left-auto md:right-0' : 'md:left-0'
                } ${
                    open
                        ? 'grid-rows-[1fr] md:opacity-100 md:translate-y-0'
                        : 'grid-rows-[0fr] md:opacity-0 md:-translate-y-2 md:pointer-events-none'
                }`}
            >
                <div className="overflow-hidden md:overflow-visible">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:p-6 md:shadow-lg md:bg-(--primary-bg-color) md:rounded-(--card-radius)">
                        <div className={`flex flex-col gap-1 ${hasPromo ? 'md:w-3/5' : 'md:w-full'} `}>
                            {childLinks!.map((item) => (
                                <Link key={item.title} href={item.url} className="block nav-submenu-link">
                                    <strong className="block">{item.title}</strong>
                                    {item.subtitle &&
                                    <span className="block">{item.subtitle}</span>
                                    }
                                </Link>
                            ))}
                        </div>
                        {navPromo?.url &&
                        <Link
                            href={navPromo.url}
                            className="block nav-promo md:w-2/5 md:bg-(--secondary-bg-color) md:p-4 md:rounded-(--card-radius)"
                        >
                            <div className="nav-promo-image">
                                <img
                                    src={navPromo.image}
                                    alt={navPromo.imageAlt ?? ''}
                                />
                            </div>
                            <strong className="block">{navPromo.title}</strong>
                            <div>{navPromo.subtitle}</div>
                            {/* The closing line is the call to action ("Find Out
                                Today!"), so it carries the emphasis of one. */}
                            <strong className="block">{navPromo.cta}</strong>
                        </Link>
                        }
                    </div>
                </div>
            </div>
            }
        </div>
    )
}

export function Header(
    {items, logo}: Readonly<NavigationProps>
) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 8)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header className={`sticky top-0 z-50 bg-(--primary-bg-color) transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-none'}`}>
            <div className="h-20 flex items-center justify-between px-4">
                <Link href={'/'}>
                    <img className="w-50" src={logo.src} alt={logo.alt} />
                </Link>
                <button
                    type="button"
                    className="control-button md:hidden"
                    aria-expanded={mobileOpen}
                    aria-label="Expand menu"
                    onClick={() => setMobileOpen((value) => !value)}
                >
                    <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true">
                        <rect width="24" height="2" fill="currentColor" />
                        <rect y="8" width="24" height="2" fill="currentColor" />
                        <rect y="16" width="24" height="2" fill="currentColor" />
                    </svg>
                </button>
                {/* Same always-mounted + grid-rows approach as the submenu
                    above, for the same reason: this needs to animate closed
                    as well as open. No `inert` here (unlike the submenu) —
                    `mobileOpen` only means something on mobile; tying inert
                    to it directly would also make the always-visible desktop
                    nav inert, since the value doesn't change with viewport.
                    The mobile-closed state's zero height + overflow:hidden
                    already keeps its links out of the way in practice. */}
                <nav
                    className={`grid transition-[grid-template-rows] duration-300 absolute md:static top-20 inset-x-0 md:grid-rows-[1fr]! ${mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                    <div className="overflow-hidden md:overflow-visible">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-0 md:pr-4 bg-(--primary-bg-color) md:bg-transparent shadow-lg md:shadow-none">
                            {items.map((item: NavigationItem) => {
                                return item.button
                                    ? <Link key={item.title} href={item.url} className="button">{item.title}</Link>
                                    : <NavItem key={item.title} {...item} />
                            })}
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    )
}
