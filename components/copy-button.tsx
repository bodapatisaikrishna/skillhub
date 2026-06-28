"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Copy text to the clipboard, preferring the async Clipboard API and falling
 * back to a hidden-textarea + execCommand for insecure contexts. Returns
 * whether the copy succeeded.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  /** Text copied to the clipboard. */
  value: string;
  /** Accessible label describing what is copied. */
  label?: string;
}

/**
 * Copy-to-clipboard button with a transient "Copied!" confirmation. Falls back
 * silently if the Clipboard API is unavailable (e.g. non-secure context).
 */
export function CopyButton({
  value,
  label = "Copy to clipboard",
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function onCopy() {
    const ok = await copyToClipboard(value);
    if (!ok) return; // couldn't copy — don't show a false "Copied!".
    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCopy}
      aria-label={copied ? "Copied" : label}
      className={cn(className)}
      {...props}
    >
      {copied ? (
        <Check className="size-4 text-primary" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {size !== "icon" && <span>{copied ? "Copied!" : "Copy"}</span>}
    </Button>
  );
}
