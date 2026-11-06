import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * B9: every button ships hover, active, focus and disabled.
 * B7: press scales to 0.98 on the base curve, gated for reduced motion.
 * B2: 8px vertical and 12px horizontal padding.
 *
 * Spacing uses only declared steps. `py-3` is 8px, `px-3` is 12px.
 */
const button = cva(
  [
    "press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary: "border-transparent bg-accent text-accentink hover:bg-[#8db8ff]",
        secondary: "border-linestrong bg-surface3 text-ink hover:bg-surface4",
        ghost: "border-transparent bg-transparent text-ink2 hover:bg-surface3 hover:text-ink",
        quiet: "border-transparent bg-transparent text-ink3 hover:text-ink",
      },
      size: {
        // Heights land on 36 / 44 / 48. py-2 with 20px line-height gives 36,
        // py-2.5 gives 44, and the hero CTA stays under the 56px that reads as
        // a banner rather than a button.
        sm: "button-sm py-2 px-3",
        md: "button-md py-2.5 px-4",
        lg: "button-md py-3 px-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = VariantProps<typeof button> & {
  href?: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ href, variant, size, className, children, ...rest }: Props) {
  const cls = cn(button({ variant, size }), className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
