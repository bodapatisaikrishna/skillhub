"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

// True only after client-side hydration. Implemented with useSyncExternalStore
// (server snapshot = false, client snapshot = true) so there's no
// setState-in-effect — this keeps the hydration guard while satisfying the
// react-hooks/set-state-in-effect lint rule.
function useHydrated() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid hydration mismatch: render a stable placeholder until mounted.
  const mounted = useHydrated();

  const isDark = resolvedTheme === "dark";

  // Until mounted, render a theme-agnostic label/icon so the server-rendered
  // HTML matches the first client render (avoids a hydration mismatch — the
  // theme is only known on the client).
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted && isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
