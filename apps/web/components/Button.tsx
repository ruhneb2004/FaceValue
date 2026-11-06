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
    "press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold transition-[box-shadow,transform,background-color,border-color] duration-200 motion-reduce:transition-none",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-accentink/85 bg-accent text-accentink shadow-[0_0_0_1px_rgba(204,255,0,0.25),0_2px_0_0_#7a9900,0_6px_20px_-6px_rgba(204,255,0,0.55)] hover:brightness-[1.04] hover:shadow-[0_0_0_1px_rgba(204,255,0,0.45),0_2px_0_0_#7a9900,0_8px_28px_-4px_rgba(204,255,0,0.75)] active:translate-y-px active:shadow-[0_0_0_1px_rgba(204,255,0,0.35),0_1px_0_0_#7a9900,0_3px_10px_-6px_rgba(204,255,0,0.5)]",
        secondary:
          "border-linestrong bg-surface3 text-ink shadow-[0_2px_0_0_rgba(0,0,0,0.6)] hover:bg-surface4 hover:border-ink3",
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
