import { Reveal } from "./Reveal.tsx";

type Step = {
    title: string;
    description: string;
};

type StepsProps = {
    subheading?: string;
    heading: string;
    steps: Array<Step>;
    /**
     * "timeline" (default) is the numbered-circle-and-connecting-line look
     * every existing usage renders as.
     *
     * "accordion" collapses each step to its title, opening the first one.
     * Same content, same two-column layout — for the runs of steps where
     * the titles alone are the point ("Audit, Remediate, Train, Monitor")
     * and the descriptions are detail you read if you want it. A seven-step
     * timeline reads as a process worth following down the page; a
     * four-step one where the four words ARE the summary reads as four
     * paragraphs. Chosen over composing Columns + Accordion in content,
     * which would duplicate this block's heading/CTA column as hand-built
     * markup on every page that wanted it.
     */
    display?: 'timeline' | 'accordion';
    cta1Label?: string;
    cta1Href?: string;
    cta2Label?: string;
    cta2Href?: string;
};

export function Steps({
    subheading,
    heading,
    steps,
    display = 'timeline',
    cta1Label,
    cta1Href,
    cta2Label,
    cta2Href
}: Readonly<StepsProps>) {
    return (
        <section className="full-bleed bg-section-peach">
            <div className="max-w-(--gutter) mx-auto px-6 grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8">
                <Reveal className="flex flex-col gap-3">
                    {subheading &&
                    <p className="eyebrow">{subheading}</p>
                    }
                    <h2>{heading}</h2>
                    {(cta1Href || cta2Href) &&
                    <div>
                        {cta1Href &&
                        <a href={cta1Href} className="button">{cta1Label}</a>
                        }
                        {cta2Href &&
                        <a href={cta2Href} className="button secondary">{cta2Label}</a>
                        }
                    </div>
                    }
                </Reveal>
                {display === 'accordion'
                    ? (
                        /* Same <details>/<summary> markup and .accordion-item
                           styling as Accordion.tsx, rather than a
                           second disclosure implementation — the difference
                           between the two blocks is the surrounding layout,
                           not the row. `open` on the first is what the comps
                           show: an accordion where every row is shut reads as
                           a list of links until you touch it. */
                        <ol className="flex flex-col gap-3 list-none">
                            {steps.map((step, index) => (
                                <li key={step.title}>
                                    <details className="group accordion-item rounded-2xl shadow-md p-5" open={index === 0}>
                                        <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold">
                                            {step.title}
                                            <span className="shrink-0 text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">
                                                +
                                            </span>
                                        </summary>
                                        <p className="pt-3">{step.description}</p>
                                    </details>
                                </li>
                            ))}
                        </ol>
                    )
                    : (
                        /* .step-line/.step-number (styles/components.css) reproduce the live site's
                           numbered-circle-and-connecting-line timeline look, keyed off
                           this component's own index instead of a CSS counter. Each
                           step reveals in sequence (increasing delay) rather than all
                           at once, for a subtle cascading-down-the-timeline effect. */
                        <ol className="relative flex flex-col gap-8">
                            <div className="step-line" aria-hidden="true" />
                            {steps.map((step, index) => (
                                <li key={step.title}>
                                    <Reveal className="relative flex gap-4" delay={index * 80}>
                                        <span className="step-number" aria-hidden="true">{index + 1}</span>
                                        <div>
                                            <strong className="block">{step.title}</strong>
                                            <p>{step.description}</p>
                                        </div>
                                    </Reveal>
                                </li>
                            ))}
                        </ol>
                    )
                }
            </div>
        </section>
    );
}
