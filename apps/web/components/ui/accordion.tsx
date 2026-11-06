"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { CaretDown } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

/**
 * Accordion primitives, in the shadcn idiom.
 *
 * shadcn's accordion is a thin wrapper over Radix, which is what this is: the
 * same composable parts (Root, Item, Header, Trigger, Content) styled with this
 * project's own tokens rather than shadcn's `muted-foreground` and `ring`
 * variables, which do not exist here.
 *
 * Radix is used rather than a hand-rolled disclosure because it brings the
 * parts that are easy to get wrong: roving arrow-key focus between headers,
 * Home and End, `aria-expanded` and `aria-controls` wired to a real region, and
 * the WAI-ARIA disclosure pattern done once instead of per component.
 *
 * The height animation is CSS, keyed off Radix's `data-state`, so it collapses
 * automatically under prefers-reduced-motion: see the @media block in
 * globals.css.
 */

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-line last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "press group flex flex-1 items-start justify-between gap-6 rounded-md py-5 text-left",
          "text-ink transition-colors hover:text-accent",
          "[&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <CaretDown
          size={16}
          weight="bold"
          aria-hidden="true"
          className="pointer-events-none mt-1.5 shrink-0 text-ink2 transition-transform duration-200 group-hover:text-accent motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
      {...props}
    >
      <div className={cn("pb-5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
