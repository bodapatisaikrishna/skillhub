import {
  Braces,
  FlaskConical,
  Server,
  BarChart3,
  Palette,
  FileText,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/lib/data/types";

/**
 * Per-category visual accent: an icon plus a tasteful, distinct colour used for
 * icon tiles (category cards) and category chips (skill cards). Colours are
 * fixed Tailwind palette tints (not the brand token) so each category reads as
 * its own thing while staying calm in both light and dark mode.
 */
export interface CategoryAccent {
  icon: LucideIcon;
  /** Icon-tile background + foreground. */
  tile: string;
  /** Subtle chip background + text for inline category labels. */
  chip: string;
}

export const CATEGORY_ACCENT: Record<Category, CategoryAccent> = {
  Coding: {
    icon: Braces,
    tile: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  "Testing/QA": {
    icon: FlaskConical,
    tile: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  DevOps: {
    icon: Server,
    tile: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
    chip: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  "Data/Analytics": {
    icon: BarChart3,
    tile: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    chip: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  "Design/Frontend": {
    icon: Palette,
    tile: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    chip: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  "Writing/Docs": {
    icon: FileText,
    tile: "bg-teal-500/12 text-teal-600 dark:text-teal-400",
    chip: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  },
};
