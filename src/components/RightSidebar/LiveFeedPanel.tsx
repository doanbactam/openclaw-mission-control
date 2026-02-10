import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { DEFAULT_TENANT_ID } from "../../lib/tenant";

const filters = [
  { id: "all", label: "All" },
  { id: "tasks", label: "Tasks" },
  { id: "comments", label: "Comments" },
  { id: "decisions", label: "Decisions" },
  { id: "status", label: "Status" },
];

const LiveFeedPanel: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | undefined>(undefined);

  const activities = useQuery(api.queries.listActivities, {
    tenantId: DEFAULT_TENANT_ID,
    type: selectedType === "all" ? undefined : selectedType,
    agentId: selectedAgentId,
  });
  const agents = useQuery(api.queries.listAgents, { tenantId: DEFAULT_TENANT_ID });

  if (activities === undefined || agents === undefined) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden animate-pulse">
        <div className="flex-1 p-3 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const chipCls = (active: boolean) =>
    `text-[9px] font-medium px-2 py-1 rounded-md ${active
      ? "bg-foreground text-primary-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3 gap-3">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedType(f.id)}
              className={chipCls(selectedType === f.id)}
              style={{ transition: "var(--transition-fast)" }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setSelectedAgentId(undefined)}
            className={chipCls(selectedAgentId === undefined)}
            style={{ transition: "var(--transition-fast)" }}
          >
            All
          </button>
          {agents.slice(0, 6).map((a) => (
            <button
              key={a._id}
              type="button"
              onClick={() => setSelectedAgentId(a._id)}
              className={chipCls(selectedAgentId === a._id)}
              style={{ transition: "var(--transition-fast)" }}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Feed items */}
      <div className="flex flex-col gap-1">
        {activities.map((item) => (
          <div
            key={item._id}
            className="flex gap-2 px-2 py-2 rounded-md hover:bg-secondary/70"
            style={{ transition: "var(--transition-fast)" }}
          >
            <div className="w-1 h-1 bg-[var(--accent-blue)] rounded-full mt-1.5 shrink-0" />
            <div className="text-[11px] leading-snug text-foreground/80 min-w-0">
              <span className="font-medium text-foreground">
                {item.agentName}
              </span>{" "}
              <span className="text-muted-foreground">{item.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeedPanel;
