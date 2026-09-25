/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ButtonLink } from "./ButtonLink.tsx";

type FooterColumn = {
    heading: string;
    links: Array<{ label: string; url: string }>;
};

type FooterProps = {
    ctaHeading: string;
    ctaImage: string;
    ctaImageAlt?: string;
    ctaButtonLabel: string;
    ctaButtonHref: string;
    tagline: string;
    address: string;
    phone: string;
    phoneHref: string;
    email: string;
    columns: Array<FooterColumn>;
    copyrightHolder: string;
    /** The brand mark above the tagline. Not a link, so `alt` is the brand's name (216-mono: "216digital"). */
    logo: { src: string; alt: string };
    /**
     * An accreditation seal linked to its verification page, under the
     * tagline. 216-mono passes its BBB seal, deliberately hotlinked from
     * bbb.org (the seal is BBB's to serve). Omitted, nothing renders.
     */
    trustSeal?: { href: string; src: string; alt: string; title?: string };
};

export function Footer({
    ctaHeading,
    ctaImage,
    ctaImageAlt,
    ctaButtonLabel,
    ctaButtonHref,
    tagline,
    address,
    phone,
    phoneHref,
    email,
    columns,
    copyrightHolder,
    logo,
    trustSeal
}: Readonly<FooterProps>) {
    return (
        /* id/tabIndex are the destination for a consumer's "Skip to footer"
           link (216-mono renders its skip links in app/layout.tsx, and keeps
           the #site-footer focus/scroll-margin rules alongside them). */
        <footer id="site-footer" tabIndex={-1}>
            <div className="full-bleed bg-section-peach">
                <div className="max-w-(--gutter) mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6">
                    <img src={ctaImage} alt={ctaImageAlt ?? ''} loading="lazy" />
                    <div>
                        <h2>{ctaHeading}</h2>
                        {ctaButtonHref &&
                        <ButtonLink href={ctaButtonHref} label={ctaButtonLabel} />
                        }
                    </div>
                </div>
            </div>

            <div className="max-w-(--gutter) mx-auto grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 p-6">
                <div>
                    <img src={logo.src} alt={logo.alt} loading="lazy" />
                    <p>{tagline}</p>
                    {trustSeal &&
                    <a
                        title={trustSeal.title}
                        href={trustSeal.href}
                    >
                        <img
                            decoding="async"
                            loading="lazy"
                            src={trustSeal.src}
                            alt={trustSeal.alt}
                        />
                    </a>
                    }
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div>
                        <h2 className="has-medium-font-size">Get in Touch</h2>
                        <p className="footer-links">
                            {address.split('\n').map((line, index) => (
                                <span key={index}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                            <a href={phoneHref}>{phone}</a>
                            <br />
                            <a href={`mailto:${email}`}>{email}</a>
                        </p>
                    </div>
                    {columns.map((column) => (
                        <div key={column.heading}>
                            <h2 className="has-medium-font-size">{column.heading}</h2>
                            <p className="footer-links">
                                {column.links.map((link, index) => (
                                    <span key={link.label}>
                                        <Link href={link.url}>{link.label}</Link>
                                        {index < column.links.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center text-white p-4" style={{ backgroundColor: 'var(--dark-grey)' }}>
                Copyright © {new Date().getFullYear()} {copyrightHolder}. All Rights Reserved.
            </div>
        </footer>
    );
}
