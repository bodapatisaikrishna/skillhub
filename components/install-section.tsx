import { AGENT_LABELS, AGENTS, type Agent } from "@/lib/data/types";
import { CopyButton } from "@/components/copy-button";
import { AgentBadge } from "@/components/agent-badge";

interface InstallSectionProps {
  install: Partial<Record<Agent, string>>;
}

/**
 * Per-agent install instructions with copy-to-clipboard. Renders one block per
 * agent the skill supports, in canonical agent order. SkillHub only shows these
 * commands — it does not run them.
 */
export function InstallSection({ install }: InstallSectionProps) {
  const entries = AGENTS.filter(
    (agent): agent is Agent => typeof install[agent] === "string",
  );

  return (
    <div className="space-y-4">
      {entries.map((agent) => {
        const command = install[agent] as string;
        return (
          <div
            key={agent}
            className="rounded-lg border border-border bg-card"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <AgentBadge agent={agent} />
              <CopyButton
                value={command}
                size="sm"
                variant="outline"
                label={`Copy ${AGENT_LABELS[agent]} install command`}
              />
            </div>
            <pre className="overflow-x-auto px-4 py-3 text-sm">
              <code className="font-mono text-foreground">{command}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}
