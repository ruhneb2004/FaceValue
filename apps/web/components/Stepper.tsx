import { Check } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

/**
 * Step indicator for the capture flow.
 *
 * State is carried three ways so it never depends on colour: the current step
 * is filled and enlarged, a completed step shows a tick, and every step carries
 * its status as text inside the accessible name (`aria-current="step"` plus a
 * visually hidden word). A filled circle alone would be colour-only.
 *
 * It is an `<ol>` because the order is the meaning — these are sequential steps,
 * and a bare list of divs would lose that.
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;

          return (
            <li key={label} className="flex items-center gap-3">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[0.6875rem] transition-colors duration-200 motion-reduce:transition-none",
                    done && "border-accent bg-accent text-accentink",
                    active && "border-accent bg-transparent text-accent",
                    !done && !active && "border-line bg-transparent text-ink3",
                  )}
                >
                  {done ? <Check size={12} weight="bold" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "font-mono text-[0.75rem] uppercase tracking-[0.06em]",
                    active ? "text-ink" : done ? "text-ink2" : "text-ink3",
                  )}
                >
                  {label}
                  {active && <span className="sr-only"> (current step)</span>}
                  {done && <span className="sr-only"> (completed)</span>}
                </span>
              </span>

              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px w-4",
                    done ? "bg-accent" : "bg-line",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
