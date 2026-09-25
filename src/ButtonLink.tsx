import Link from "next/link";

type ButtonLinkProps = {
    href: string;
    label: string;
    variant?: 'primary' | 'secondary';
};

export function ButtonLink({ href, label, variant = 'primary' }: Readonly<ButtonLinkProps>) {
    return (
        <Link href={href} className={variant === 'secondary' ? 'button secondary' : 'button'}>
            {label}
        </Link>
    );
}
