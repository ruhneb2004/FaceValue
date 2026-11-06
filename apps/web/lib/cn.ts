import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes so a later class actually wins over the base. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
