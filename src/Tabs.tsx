'use client'

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { cx } from "./cx.ts"

type TabItem = {
    title: string
    content: ReactNode
}

type TabsProps = {
    items: Array<TabItem>
    /**
     * Where the tab strip sits. The comps use both: /radar/ and
     * /ada-title-ii-and-section-508/ open their strip at the left gutter,
     * while the homepage's services block and /demand-letter-response/
     * centre it under a centred heading. Left stays the default so the
     * existing pages are untouched.
     */
    align?: 'left' | 'center'
}

export function Tabs({ items, align = 'left' }: Readonly<TabsProps>) {
    const baseId = useId()
    const [activeIndex, setActiveIndex] = useState(0)
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
    // Measured, not just CSS — a real sliding indicator needs each tab's
    // actual rendered position, which only JS can know. Falls back to
    // "no indicator yet" only for the one frame before layout effects run;
    // useLayoutEffect (not useEffect) means that frame never actually paints.
    const [indicator, setIndicator] = useState<{ left: number; width: number; top: number } | null>(null)

    /* `top` is measured as well as left/width because the strip wraps. The
       indicator used to be pinned to the container's bottom edge, which is
       the same thing as the selected tab's bottom edge only while every tab
       shares one row — once the strip wrapped (four tabs at phone width) the
       marker stayed on the last row and underlined whichever tab happened to
       sit at that offset, rather than the selected one.

       Re-measured on resize too, since wrapping is what changes and a resize
       is the only way it changes without activeIndex changing with it. */
    useLayoutEffect(() => {
        function measure() {
            const el = tabRefs.current[activeIndex]
            if (!el) return
            setIndicator({
                left: el.offsetLeft,
                width: el.offsetWidth,
                top: el.offsetTop + el.offsetHeight,
            })
        }

        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [activeIndex, items.length])

    function activate(index: number) {
        setActiveIndex(index)
        tabRefs.current[index]?.focus()
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        if (event.key === 'ArrowRight') {
            event.preventDefault()
            activate((index + 1) % items.length)
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            activate((index - 1 + items.length) % items.length)
        } else if (event.key === 'Home') {
            event.preventDefault()
            activate(0)
        } else if (event.key === 'End') {
            event.preventDefault()
            activate(items.length - 1)
        }
    }

    return (
        <section>
            <div
                role="tablist"
                aria-label="Content tabs"
                /* w-fit so the underline is the width of the tabs rather than
                   of the page — `border-b` on a block-level flex container
                   spans the whole row, which drew a rule across the full
                   gutter with four tabs sitting on the left of it.
                   fit-content still yields to the available width, so a strip
                   too wide for the viewport wraps instead of overflowing.

                   Centring is therefore mx-auto, not justify-center: once the
                   container is only as wide as its content there is no free
                   space inside it left to distribute. */
                className={cx(
                    'relative flex flex-wrap gap-2 border-b w-fit',
                    align === 'center' && 'mx-auto'
                )}
            >
                {items.map((item, index) => {
                    const selected = index === activeIndex
                    return (
                        <button
                            key={item.title}
                            ref={(el) => { tabRefs.current[index] = el }}
                            role="tab"
                            type="button"
                            id={`${baseId}-tab-${index}`}
                            aria-selected={selected}
                            aria-controls={`${baseId}-panel-${index}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setActiveIndex(index)}
                            onKeyDown={(event) => handleKeyDown(event, index)}
                            // .tab-button's selected look (styles/components.css) keys off
                            // aria-selected directly — nothing else to keep in sync.
                            className="control-button tab-button"
                        >
                            {item.title}
                        </button>
                    )
                })}
                {indicator &&
                <span
                    aria-hidden="true"
                    className="tab-indicator"
                    style={{ left: indicator.left, width: indicator.width, top: indicator.top }}
                />
                }
            </div>
            {items.map((item, index) => (
                <div
                    key={item.title}
                    role="tabpanel"
                    id={`${baseId}-panel-${index}`}
                    aria-labelledby={`${baseId}-tab-${index}`}
                    hidden={index !== activeIndex}
                    className="py-4"
                >
                    {item.content}
                </div>
            ))}
        </section>
    )
}
