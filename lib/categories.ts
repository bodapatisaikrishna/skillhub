import {
  Braces,
  FlaskConical,
  Server,
  BarChart3,
  Palette,
  FileText,
  BrainCircuit,
  ShieldCheck,
  Smartphone,
  Briefcase,
  Network,
  Gamepad2,
  ListTodo,
  Blocks,
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
  "AI/ML": {
    icon: BrainCircuit,
    tile: "bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400",
    chip: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  },
  Security: {
    icon: ShieldCheck,
    tile: "bg-red-500/12 text-red-600 dark:text-red-400",
    chip: "bg-red-500/10 text-red-700 dark:text-red-300",
  },
  Mobile: {
    icon: Smartphone,
    tile: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-400",
    chip: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  Business: {
    icon: Briefcase,
    tile: "bg-orange-500/12 text-orange-600 dark:text-orange-400",
    chip: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  "Backend/API": {
    icon: Network,
    tile: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",
    chip: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
  "Game Dev": {
    icon: Gamepad2,
    tile: "bg-lime-500/12 text-lime-600 dark:text-lime-400",
    chip: "bg-lime-500/10 text-lime-700 dark:text-lime-300",
  },
  Productivity: {
    icon: ListTodo,
    tile: "bg-pink-500/12 text-pink-600 dark:text-pink-400",
    chip: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
  "Blockchain/Web3": {
    icon: Blocks,
    tile: "bg-yellow-500/12 text-yellow-600 dark:text-yellow-400",
    chip: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  },
};
