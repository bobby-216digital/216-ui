import type { Metadata } from "next";
import { Sen, Roboto } from "next/font/google";
import "./globals.css";

// The package expects the consumer to put --font-sen / --font-roboto on
// <html>; this is the same next/font setup 216-mono uses (app/fonts.ts).
const sen = Sen({
    variable: "--font-sen",
    subsets: ["latin"],
});

const roboto = Roboto({
    variable: "--font-roboto",
    subsets: ["latin"],
    weight: ["100", "300", "400", "500", "700", "900"],
    style: ["normal", "italic"],
});

export const metadata: Metadata = {
    title: "@216digital/ui playground",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${sen.variable} ${roboto.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col">
                {/* The same <main> 216-mono wraps its pages in: .page-blocks is
                    what the vertical-rhythm rules key off. */}
                <main className="page-blocks px-4 md:px-8 max-w-(--gutter) mx-auto w-full">
                    {children}
                </main>
            </body>
        </html>
    );
}
