import { AGENT_LABELS, type Agent } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** A small per-agent color dot, purely decorative, to aid quick scanning. */
const AGENT_DOT: Record<Agent, string> = {
  claude: "bg-orange-500",
  cursor: "bg-sky-500",
  codex: "bg-zinc-500",
  gemini: "bg-blue-500",
  copilot: "bg-emerald-500",
  windsurf: "bg-teal-500",
  aider: "bg-rose-500",
  continue: "bg-violet-500",
};

interface AgentBadgeProps {
  agent: Agent;
  className?: string;
}

/** Compact, accessible badge identifying an agent a skill supports. */
export function AgentBadge({ agent, className }: AgentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs font-medium text-secondary-foreground",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", AGENT_DOT[agent])}
        aria-hidden="true"
      />
      {AGENT_LABELS[agent]}
    </span>
  );
}
