import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";

type AccordionItem = {
    question: string;
    answer: ReactNode;
};

type AccordionProps = {
    subheading?: string;
    heading?: string;
    items: Array<AccordionItem>;
};

/** A list of native <details>/<summary> disclosures — FAQs, or any other Q&A/label+detail list. */
export function Accordion({ subheading, heading, items }: Readonly<AccordionProps>) {
    return (
        /* The <section> stays the block's root — .page-blocks > section is
           what spaces it (see styles/components.css) — so the Reveal sits inside it and
           takes the layout classes with it. */
        <section>
            <Reveal className="flex flex-col gap-6">
                {(subheading || heading) &&
                <div className="text-center">
                    {subheading &&
                    <p className="eyebrow">{subheading}</p>
                    }
                    {heading &&
                    <h2>{heading}</h2>
                    }
                </div>
                }
                <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
                    {items.map((item, index) => (
                        <details key={index} className="group accordion-item rounded-2xl shadow-md p-5">
                            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold">
                                {item.question}
                                <span className="shrink-0 text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">
                                    +
                                </span>
                            </summary>
                            <div className="pt-3 max-w-2xl">{item.answer}</div>
                        </details>
                    ))}
                </div>
            </Reveal>
        </section>
    );
}
