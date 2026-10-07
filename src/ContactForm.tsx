'use client'

import { useEffect, useRef, useState, type FormEvent } from "react"

type ContactFormProps = {
    heading?: string
    /**
     * Where the form POSTs its JSON. A prop because a package can't read the
     * consumer's env: 216-mono passes its build-time
     * NEXT_PUBLIC_CONTACT_API_URL (with its production fallback) from the
     * Puck config, since a statically exported site has no server of its own
     * and submits to its separate editor service.
     */
    endpoint: string
    /** The fallback address the error message tells people to write to. */
    contactEmail: string
    /** The fallback phone line in the error message. Omitted, the message offers email only. */
    contactPhone?: { label: string, href: string }
    /** Who the consent line says will follow up. */
    organizationName: string
    /**
     * A file the endpoint emails back to the visitor on submit, for a
     * "fill this in and we'll send you the guide" form. Opaque here: it is
     * posted as the `asset` field and the endpoint decides what it names.
     * Omitted, this is an ordinary contact form.
     */
    asset?: string
    /**
     * Makes every field required, not just Name, Email and Website. Its
     * label gets the same asterisk. For a form where the lead is the point,
     * like a download traded for contact details.
     */
    requireAll?: boolean
    /**
     * A closing line on the thank-you message, e.g. an invitation to book a
     * call: `lead` text, then a link. Omitted, the thank-you is just the
     * thanks.
     */
    followUp?: { lead: string, label: string, href: string }
    /**
     * Where to send the visitor once the endpoint accepts the submission,
     * e.g. "/thank-you/". The page the form was on is left behind, so it
     * can't keep inviting a submission that already happened, and analytics
     * can count the thank-you page. Omitted, the form swaps itself for the
     * inline thank-you below. An error still shows inline either way.
     */
    successHref?: string
}

type SubmitState = "idle" | "submitting" | "success" | "sent" | "error"

/**
 * The live site's old Contact Form 7 field set
 * (Name/Company/Email/Phone/Website URL/Comments) plus Title, now wired to a real
 * backend (services/editor/app/api/contact/route.ts) instead of the
 * earlier stub. Labels are visible text, not placeholder-only, unlike the
 * live site's CF7 markup — a placeholder that disappears once you start
 * typing leaves the field with no accessible name, which would be an odd
 * thing to ship on an accessibility company's own contact form.
 */
export function ContactForm({ heading, endpoint, contactEmail, contactPhone, organizationName, asset, requireAll = false, followUp, successHref }: Readonly<ContactFormProps>) {
    const [state, setState] = useState<SubmitState>("idle")
    const websiteRef = useRef<HTMLInputElement>(null)

    /**
     * Prefill from `?website=`, which is what ScanCta's address field sends
     * when someone types their site into one of the mid-page "put your
     * website to the test" bands — otherwise they'd type it once, land here,
     * and be asked for it again.
     *
     * Read from `window.location` in an effect rather than through
     * `useSearchParams`: this page is statically exported, so there are no
     * request-time search params to read at build time, and useSearchParams
     * would force the whole form into a Suspense boundary to say so. An
     * effect runs only in the browser, where the query string is real.
     *
     * Written to the DOM node through a ref rather than held in state. Every
     * other field here is uncontrolled — submission reads the form with
     * FormData, not from React — so state would make this the one controlled
     * field for no gain, and setting it in an effect means a second render
     * pass on every mount whether there is a query string or not.
     *
     * Copied as typed: the field is `type="text"`, like the band's, so it
     * takes "example.com" or "our Shopify store" as readily as a full URL.
     */
    useEffect(() => {
        const raw = new URLSearchParams(window.location.search).get("website")?.trim()
        if (!raw || !websiteRef.current) return
        websiteRef.current.value = raw
    }, [])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setState("submitting")

        const data = Object.fromEntries(new FormData(event.currentTarget))

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                setState("error")
                return
            }
            // `assetSent` is only true once the endpoint has actually mailed
            // the file, so the thank-you never claims a delivery that failed
            // (the endpoint tells the team to send it by hand instead).
            if (successHref) {
                // Stays "submitting" (button disabled) until the browser
                // leaves, so a second click can't send it twice.
                window.location.assign(successHref)
                return
            }
            const body: unknown = await response.json().catch(() => null)
            const sent = asset && typeof body === "object" && body !== null && (body as { assetSent?: unknown }).assetSent === true
            setState(sent ? "sent" : "success")
        } catch {
            setState("error")
        }
    }

    const followUpLine = followUp && (
        <p>
            {`${followUp.lead} `}
            <a href={followUp.href}>{followUp.label}</a>.
        </p>
    )

    if (state === "sent") {
        return (
            <div className="card p-6 max-w-lg" role="status">
                <p>Thanks! It&apos;s on its way to your inbox. If you don&apos;t see it in a few minutes, check your spam folder.</p>
                {followUpLine}
            </div>
        )
    }

    if (state === "success") {
        return (
            <div className="card p-6 max-w-lg" role="status">
                <p>
                    {asset
                        ? "Thanks! We’ll email it to you shortly."
                        : "Thanks for reaching out! We’ll get back to you shortly."}
                </p>
                {followUpLine}
            </div>
        )
    }

    if (state === "error") {
        return (
            <div className="card p-6 max-w-lg">
                <p>
                    Something went wrong sending your message — please email{" "}
                    <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                    {contactPhone && <> or call <a href={contactPhone.href}>{contactPhone.label}</a></>}
                    {" "}and we&apos;ll get back to you directly.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-lg">
            {heading &&
            <h2>{heading}</h2>
            }
            <label>
                Name*
                <input type="text" name="name" required />
            </label>
            <label>
                {requireAll ? "Title*" : "Title"}
                <input type="text" name="title" autoComplete="organization-title" required={requireAll} />
            </label>
            <label>
                {requireAll ? "Company*" : "Company"}
                <input type="text" name="company" autoComplete="organization" required={requireAll} />
            </label>
            <label>
                Email Address*
                <input type="email" name="email" required />
            </label>
            <label>
                {requireAll ? "Phone Number*" : "Phone Number"}
                <input type="tel" name="phone" required={requireAll} />
            </label>
            <label>
                Website URL*
                <input type="text" name="website" required ref={websiteRef} autoComplete="url" />
            </label>
            <label>
                {requireAll ? "Comments*" : "Comments"}
                <textarea name="comments" rows={4} required={requireAll} />
            </label>
            {asset && <input type="hidden" name="asset" value={asset} />}
            {/* Honeypot: styled off-screen (not `display:none`, which some
                bots skip) rather than removed from the DOM, so a bot that
                blindly fills every input still trips it. Real visitors
                never see or tab to it (tabIndex={-1}, aria-hidden). Matched
                server-side in services/editor/app/api/contact/route.ts. */}
            <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                <label>
                    Leave this field blank
                    <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
                </label>
            </div>
            {/* One template string, not text around an {organizationName}
                expression: adjacent JSX text nodes server-render with a
                <!-- --> separator between them, which would change the
                markup this line has always had. */}
            <p className="secondary">
                {`By submitting this form, you consent to follow-up from ${organizationName} by call, email, or text regarding your inquiry. Msg & data rates may apply. Reply STOP to opt out or HELP for help.`}
            </p>
            <button type="submit" disabled={state === "submitting"}>
                {state === "submitting" ? "Sending…" : "Submit"}
            </button>
        </form>
    )
}
