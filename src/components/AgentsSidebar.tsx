import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DEFAULT_TENANT_ID } from "../lib/tenant";

type AgentsSidebarProps = {
	isOpen?: boolean;
	onClose?: () => void;
	onAddTask?: (preselectedAgentId?: string) => void;
	onAddAgent?: () => void;
	onSelectAgent?: (agentId: string) => void;
};

const AgentsSidebar: React.FC<AgentsSidebarProps> = ({
	isOpen = false,
	onClose,
	onAddTask,
	onAddAgent,
	onSelectAgent,
}) => {
	const agents = useQuery(api.queries.listAgents, { tenantId: DEFAULT_TENANT_ID });
	const updateStatus = useMutation(api.agents.updateStatus);
	const deleteAgent = useMutation(api.agents.deleteAgent);

	if (agents === undefined) {
		return (
			<aside
				className={`[grid-area:left-sidebar] sidebar-drawer sidebar-drawer--left bg-card border-r border-border flex flex-col overflow-hidden ${isOpen ? "is-open" : ""}`}
				aria-label="Agents"
			>
				<div className="px-4 py-3 border-b border-border h-[44px]" />
				<div className="flex-1 space-y-3 p-4 animate-pulse">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="flex gap-2.5 items-center">
							<div className="w-8 h-8 bg-muted rounded-full" />
							<div className="flex-1 space-y-1.5">
								<div className="h-2.5 bg-muted rounded w-20" />
								<div className="h-2 bg-muted rounded w-14" />
							</div>
						</div>
					))}
				</div>
			</aside>
		);
	}

	return (
		<aside
			className={`[grid-area:left-sidebar] sidebar-drawer sidebar-drawer--left bg-card border-r border-border flex flex-col overflow-hidden ${isOpen ? "is-open" : ""}`}
			aria-label="Agents"
		>
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
				<div className="flex items-center gap-2">
					<span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
						Agents
					</span>
					<span className="text-[10px] text-muted-foreground/50 tabular-nums">
						{agents.length}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					{onAddAgent && (
						<button
							type="button"
							onClick={onAddAgent}
							className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label="Add agent"
							title="Add agent"
						>
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
								<path d="M7 3v8M3 7h8" />
							</svg>
						</button>
					)}
					<button
						type="button"
						className="md:hidden inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						onClick={onClose}
						aria-label="Close"
					>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
							<path d="M3 3l8 8M11 3l-8 8" />
						</svg>
					</button>
				</div>
			</div>

			{/* Add Task button */}
			{onAddTask && (
				<div className="px-3 py-2 border-b border-border">
					<button
						type="button"
						onClick={() => onAddTask?.()}
						className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-foreground bg-foreground rounded-md hover:bg-foreground/90 transition-colors"
					>
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
							<path d="M6 2v8M2 6h8" />
						</svg>
						Add Task
					</button>
				</div>
			)}

			{/* Agent List */}
			<div className="flex-1 overflow-y-auto py-1">
				{agents.map((agent) => (
					<div
						key={agent._id}
						className="relative flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors group"
						onClick={() => onSelectAgent?.(agent._id)}
					>
						{/* Delete button */}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								if (confirm(`Delete ${agent.name}?`)) {
									deleteAgent({ id: agent._id, tenantId: DEFAULT_TENANT_ID });
								}
							}}
							className="absolute left-0.5 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity inline-flex h-5 w-5 items-center justify-center rounded text-destructive/60 hover:text-destructive hover:bg-destructive/10 z-10"
							aria-label={`Delete ${agent.name}`}
						>
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
								<path d="M2 2l6 6M8 2l-6 6" />
							</svg>
						</button>

						{/* Avatar */}
						<div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm border border-border/50 shrink-0">
							{agent.avatar}
						</div>

						{/* Info */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5">
								<span className="text-[13px] font-medium text-foreground truncate">
									{agent.name}
								</span>
								<span
									className={`text-[8px] font-bold px-1 py-0.5 rounded text-white/90 ${agent.level === "LEAD"
											? "bg-[var(--accent-orange)]/80"
											: agent.level === "INT"
												? "bg-[var(--accent-blue)]/80"
												: "bg-muted-foreground/60"
										}`}
								>
									{agent.level}
								</span>
							</div>
							<div className="text-[11px] text-muted-foreground truncate">{agent.role}</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-1.5 shrink-0">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									updateStatus({
										id: agent._id,
										status: agent.status === "active" ? "idle" : "active",
										tenantId: DEFAULT_TENANT_ID,
									});
								}}
								className={`flex items-center gap-1 text-[9px] font-medium tracking-wider uppercase cursor-pointer hover:opacity-70 transition-opacity ${agent.status === "active"
										? "text-[var(--accent-green)]"
										: agent.status === "blocked"
											? "text-destructive"
											: "text-muted-foreground/60"
									}`}
								title={agent.status === "active" ? "Set idle" : "Set active"}
							>
								<span
									className={`w-1.5 h-1.5 rounded-full ${agent.status === "active"
											? "bg-[var(--accent-green)]"
											: agent.status === "blocked"
												? "bg-destructive"
												: "bg-muted-foreground/40"
										}`}
								/>
							</button>
							{onAddTask && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onAddTask(agent._id);
									}}
									disabled={agent.status !== "active"}
									className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs transition-colors ${agent.status !== "active"
											? "text-muted-foreground/30 cursor-not-allowed"
											: "text-muted-foreground hover:text-[var(--accent-blue)] hover:bg-muted"
										}`}
									aria-label={`Add task for ${agent.name}`}
									title={agent.status !== "active" ? `${agent.name} is idle` : `Add task for ${agent.name}`}
								>
									<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
										<path d="M5 1.5v7M1.5 5h7" />
									</svg>
								</button>
							)}
						</div>
					</div>
				))}
			</div>
		</aside>
	);
};

export default AgentsSidebar;
