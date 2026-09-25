import { Header } from "../../src/Header";
import { Hero } from "../../src/Hero";
import { ButtonLink } from "../../src/ButtonLink";
import { FeatureCard } from "../../src/FeatureCard";
import { FlexSection } from "../../src/FlexSection";
import { Steps } from "../../src/Steps";
import { Tabs } from "../../src/Tabs";
import { Slider } from "../../src/Slider";

const navItems = [
    {
        title: "Web Accessibility",
        url: "/ada/",
        childLinks: [
            { title: "ADA Risk Mitigation", subtitle: "Prevent and Respond to ADA Lawsuits", url: "/ada/" },
            { title: "WCAG & Section 508", subtitle: "Comply with Federal and State Requirements", url: "/ada-title-ii-and-section-508/" },
            { title: "a11y.Radar", subtitle: "Ongoing Monitoring and Maintenance", url: "/radar/" },
            { title: "Training", url: "/216digit-training/" },
        ],
        navPromo: {
            title: "Is Your Website Vulnerable to Frivolous Lawsuits?",
            subtitle: "Get a Free Web Accessibility Audit to Learn Where You Stand",
            image: "/content/pages/home/homepage.webp",
            cta: "Find Out Today!",
            url: "/ada/",
        },
    },
    { title: "About", url: "/about/" },
    { title: "Blog", url: "/blog/" },
    { title: "Contact Us", url: "/contact/", button: true },
];

const logo = { src: "/brand/logo.png", alt: "216digital homepage" };

const sliderItems = [
    { src: "/brand/logo.png", alt: "216digital" },
    { src: "/brand/logo.png", alt: "216digital" },
    { src: "/brand/logo.png", alt: "216digital" },
];

// Ported from 216-mono's dev-only /dev/components route, which this replaces.
// The whole app is dev-only, so the route no longer 404s itself in production.
export default function ComponentsDevPage() {
    return (
        <div className="flex flex-col gap-16 pb-24">
            <section>
                <h2 className="p-4">Header</h2>
                <Header items={navItems} logo={logo} />
            </section>

            <section>
                <h2 className="p-4">Hero</h2>
                <Hero
                    heading="Web Accessibility & Beyond"
                    subheading="ADA Risk Mitigation"
                    copy="Companies across America are frivolously getting sued for violating the Americans with Disabilities Act."
                    cta1Label="Get Started"
                    cta1Href="/contact/"
                    cta2Label="Learn More"
                    cta2Href="/ada/"
                    imageSrc="/content/pages/home/homepage.webp"
                />
            </section>

            <section>
                <h2 className="p-4">Hero (flip + extra content)</h2>
                <Hero
                    heading="Dashboard Display"
                    subheading="Accessible and Actionable Insights"
                    copy="a11y.Radar includes a user-friendly dashboard, giving you instant access to your site's conformance status."
                    imageSrc="/content/pages/home/homepage.webp"
                    flip
                >
                    <ul className="list-disc pl-6">
                        <li>Track monthly report findings</li>
                        <li>Customize and manage alert settings</li>
                        <li>Review recurring issues</li>
                    </ul>
                </Hero>
            </section>

            <section>
                <h2 className="p-4">ButtonLink</h2>
                <div className="flex gap-4 p-4">
                    <ButtonLink href="/contact/" label="Contact Us" />
                    <ButtonLink href="/ada/" label="Learn More" variant="secondary" />
                </div>
            </section>

            <section>
                <h2 className="p-4">FlexSection + FeatureCard</h2>
                <FlexSection>
                    <FeatureCard
                        icon="/brand/logo.png"
                        heading="Mitigate Frivolous Lawsuits"
                        copy="Our Phase 1 Risk Mitigation process protects your business from hefty fines."
                    />
                    <FeatureCard
                        icon="/brand/logo.png"
                        heading="WCAG 2.1/2.2 AA Conformance"
                        copy="Achieving complete conformance makes your business digitally inclusive."
                    />
                    <FeatureCard
                        icon="/brand/logo.png"
                        heading="Extend Market Reach & Sales"
                        copy="Open up your business to an extended market through increased SEO."
                    />
                </FlexSection>
            </section>

            <section>
                <h2 className="p-4">Steps</h2>
                <Steps
                    subheading="Accessibility Manual Audits Made Simple"
                    heading="What is 216digital's WCAG 2.1/2.2 Professional Audit Service?"
                    cta1Label="Start a New Project"
                    cta1Href="/contact/"
                    cta2Label="Contact Us"
                    cta2Href="/contact/"
                    steps={[
                        { title: "Thorough Analysis", description: "Determine the issues and barriers through automated and manual testing." },
                        { title: "Develop the User Journey", description: "Cherry-pick a representative subsection of pages to audit." },
                        { title: "Issue Report", description: "Generate an action plan based on the barriers revealed through auditing." },
                    ]}
                />
            </section>

            <section>
                <h2 className="p-4">Tabs</h2>
                <Tabs
                    items={[
                        { title: "ADA Title II", content: <p>What State & Local Governments Must Do.</p> },
                        { title: "Section 508", content: <p>What Federal Agencies & Contractors Must Do.</p> },
                    ]}
                />
            </section>

            <section>
                <h2 className="p-4">Slider</h2>
                <Slider heading="Trusted by Small Businesses and Industry Leaders Alike" items={sliderItems} />
            </section>
        </div>
    );
}
