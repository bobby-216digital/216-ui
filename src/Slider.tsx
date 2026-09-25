/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from "react"
import { cx } from "./cx.ts"

type SliderItem = {
    src: string
    alt: string
}

type SliderProps = {
    heading?: string
    items: Array<SliderItem>
}

/**
 * Continuous logo scroller. Uses a plain CSS animation (paused via
 * animation-play-state, disabled entirely under prefers-reduced-motion —
 * see .logo-scroll-track in styles/components.css) rather than autoplay-only JS, so
 * there's always a way to stop the motion (WCAG 2.2.2).
 */
export function Slider({ heading, items }: Readonly<SliderProps>) {
    const [paused, setPaused] = useState(false)
    const track = [...items, ...items]

    return (
        <section className="card py-8 px-6 text-center">
            {heading &&
            <h2 className="subheading">{heading}</h2>
            }
            <div className="overflow-hidden">
                <div className={cx('logo-scroll-track flex w-max gap-12 items-center', paused && 'paused')}>
                    {track.map((item, index) => (
                        <img
                            key={`${item.src}-${index}`}
                            src={item.src}
                            alt={index < items.length ? item.alt : ''}
                            aria-hidden={index >= items.length}
                            className="h-12 w-auto shrink-0"
                            loading="lazy"
                        />
                    ))}
                </div>
            </div>
            <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-pressed={paused}
                className="control-button logo-scroll-pause text-sm underline"
            >
                {paused ? 'Play' : 'Pause'} logo scroll
            </button>
        </section>
    )
}
