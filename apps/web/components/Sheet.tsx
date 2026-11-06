"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

/**
 * Sheet: a panel that slides in from the edge of the screen over a blurred
 * backdrop. This is the shadcn/ui Sheet, rebuilt on this project's tokens
 * instead of copying shadcn's default slate palette, which would put a second
 * colour system next to ours.
 *
 * Built on Radix Dialog, which brings the behaviour that is easy to get wrong:
 * body scroll locking with scrollbar-width compensation, a focus trap, Escape to
 * close, a click on the backdrop to close, and returning focus to the trigger on
 * close. Those are the parts worth not rewriting.
 *
 * The scroll rule that matters here: the panel is a fixed height flex column, the
 * header and footer do not shrink, and only the body scrolls. That is what makes
 * the content "scroll on its own" rather than dragging the page or the header
 * with it.
 */

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SIDE = {
  right: "inset-y-0 right-0 h-full w-[88%] border-l sm:w-full sm:max-w-md",
  left: "inset-y-0 left-0 h-full w-full border-r sm:max-w-md",
  top: "inset-x-0 top-0 h-auto max-h-[85dvh] w-full border-b",
  bottom: "inset-x-0 bottom-0 h-auto max-h-[85dvh] w-full border-t",
} as const;

const SLIDE = {
  right: "translate-x-full",
  left: "-translate-x-full",
  top: "-translate-y-full",
  bottom: "translate-y-full",
} as const;

export function SheetContent({
  side = "right",
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: keyof typeof SIDE;
  title: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      {/*
        Backdrop. The blur is the whole point of the request: the page behind
        stays visible but recedes, so the panel reads as layered above it rather
        than replacing it. Flat colour plus backdrop-blur, no gradient.
      */}
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-surface0/60 backdrop-blur-sm",
          "transition-opacity duration-200",
          "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          "motion-reduce:transition-none",
        )}
      />
      <DialogPrimitive.Content
        {...props}
        className={cn(
          // Fixed, full-height flex column. min-h-0 on the body is what allows
          // the middle to shrink and scroll; without it the body grows past the
          // panel and the page scrolls instead.
          "fixed z-50 flex flex-col border-line bg-surface2 shadow-[0_16px_64px_rgba(0,0,0,0.6)]",
          "transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",
          SIDE[side],
          "data-[state=closed]:" + SLIDE[side],
          "data-[state=open]:translate-x-0 data-[state=open]:translate-y-0",
          className,
        )}
      >
        {/* Header: fixed. Never scrolls, so the title and close control stay put. */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="title-3 text-ink">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="caption-4 mt-1 text-ink3">
                {description}
              </DialogPrimitive.Description>
            ) : (
              // Radix warns when a dialog has a title but no description. The
              // description is optional visually, so supply one for screen
              // readers rather than leaving the relationship undefined.
              <DialogPrimitive.Description className="sr-only">
                {title}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className="press -mr-2 grid size-9 shrink-0 place-items-center rounded-md text-ink3 hover:bg-surface4 hover:text-ink"
            aria-label="Close panel"
          >
            <X size={18} aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>

        {/* Body: the only scrolling region. tabIndex 0 so a keyboard user can
            scroll it without first tabbing to something focusable inside. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5" tabIndex={0}>
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose };
