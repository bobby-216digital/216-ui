/* eslint-disable @next/next/no-img-element */
import { Reveal } from "./Reveal.tsx";

type LogoRowItem = {
    src: string;
    alt: string;
};

type LogoRowProps = {
    items: Array<LogoRowItem>;
};

/** A static (non-scrolling) row of partner/client logos — see Slider.tsx for the animated version. */
export function LogoRow({ items }: Readonly<LogoRowProps>) {
    return (
        <section className="card p-6">
            <Reveal className="flex flex-wrap justify-center items-center gap-8">
                {items.map((item) => (
                    <img
                        key={item.src}
                        src={item.src}
                        alt={item.alt}
                        loading="lazy"
                        className="h-16 w-auto object-contain"
                    />
                ))}
            </Reveal>
        </section>
    );
}
