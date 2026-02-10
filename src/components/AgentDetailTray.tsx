import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DEFAULT_TENANT_ID } from "../lib/tenant";

type AgentDetailTrayProps = {
	agentId: Id<"agents"> | null;
	onClose: () => void;
};

const AgentDetailTray: React.FC<AgentDetailTrayProps> = ({ agentId, onClose }) => {
	const agents = useQuery(api.queries.listAgents, { tenantId: DEFAULT_TENANT_ID });
	const updateAgent = useMutation(api.agents.updateAgent);

	const agent = agents?.find((a) => a._id === agentId) ?? null;

	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState("");
	const [editRole, setEditRole] = useState("");
	const [editLevel, setEditLevel] = useState<"LEAD" | "INT" | "SPC">("SPC");
	const [editAvatar, setEditAvatar] = useState("");
	const [editStatus, setEditStatus] = useState<"idle" | "active" | "blocked">("active");
	const [editSystemPrompt, setEditSystemPrompt] = useState("");
	const [editCharacter, setEditCharacter] = useState("");
	const [editLore, setEditLore] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (agent) {
			setEditName(agent.name);
			setEditRole(agent.role);
			setEditLevel(agent.level);
			setEditAvatar(agent.avatar);
			setEditStatus(agent.status);
			setEditSystemPrompt(agent.systemPrompt ?? "");
			setEditCharacter(agent.character ?? "");
			setEditLore(agent.lore ?? "");
		}
		setIsEditing(false);
	}, [agent?._id]);

	const handleSave = useCallback(async () => {
		if (!agentId) return;
		setSaving(true);
		try {
			await updateAgent({
				id: agentId,
				name: editName,
				role: editRole,
				level: editLevel,
				avatar: editAvatar,
				status: editStatus,
				systemPrompt: editSystemPrompt,
				character: editCharacter,
				lore: editLore,
				tenantId: DEFAULT_TENANT_ID,
			});
			setIsEditing(false);
		} finally {
			setSaving(false);
		}
	}, [agentId, editName, editRole, editLevel, editAvatar, editStatus, editSystemPrompt, editCharacter, editLore, updateAgent]);

	const handleCancel = useCallback(() => {
		if (agent) {
			setEditName(agent.name);
			setEditRole(agent.role);
			setEditLevel(agent.level);
			setEditAvatar(agent.avatar);
			setEditStatus(agent.status);
			setEditSystemPrompt(agent.systemPrompt ?? "");
			setEditCharacter(agent.character ?? "");
			setEditLore(agent.lore ?? "");
		}
		setIsEditing(false);
	}, [agent]);

	const isOpen = agentId !== null;

	/* Shared input styles — dark mode */
	const inputCls = "w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] placeholder:text-muted-foreground/40";
	const textareaCls = `${inputCls} resize-none`;
	const selectCls = "text-[10px] font-semibold px-2 py-1 rounded border border-border bg-secondary text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";

	const levelBgColor = (level: string) => {
		switch (level) {
			case "LEAD": return "oklch(0.92 0.04 250)";
			case "INT": return "oklch(0.92 0.04 155)";
			case "SPC": return "oklch(0.92 0.03 65)";
			default: return "oklch(0.93 0 0)";
		}
	};

	const levelTextColor = (level: string) => {
		switch (level) {
			case "LEAD": return "oklch(0.45 0.15 250)";
			case "INT": return "oklch(0.45 0.15 155)";
			case "SPC": return "oklch(0.5 0.12 65)";
			default: return "oklch(0.5 0 0)";
		}
	};

	return (
		<div className={`agent-tray ${isOpen ? "is-open" : ""}`}>
			{agent && (
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
						<h2
							className="text-xs font-semibold text-muted-foreground uppercase"
							style={{ letterSpacing: "0.08em" }}
						>
							Agent Details
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
							style={{ transition: "var(--transition-fast)" }}
							aria-label="Close tray"
						>
							✕
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
						{/* Avatar + Name header */}
						<div className="flex items-center gap-4">
							{isEditing ? (
								<input
									type="text"
									value={editAvatar}
									onChange={(e) => setEditAvatar(e.target.value)}
									className="w-14 h-14 text-center text-2xl border border-border rounded-full bg-secondary focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
									maxLength={4}
								/>
							) : (
								<div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-2xl border border-border">
									{agent.avatar}
								</div>
							)}
							<div className="flex-1 min-w-0">
								{isEditing ? (
									<input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										className={`${inputCls} text-base font-semibold`}
										style={{ letterSpacing: "-0.01em" }}
									/>
								) : (
									<div className="text-base font-semibold text-foreground" style={{ letterSpacing: "-0.01em" }}>
										{agent.name}
									</div>
								)}
								{isEditing ? (
									<input
										type="text"
										value={editRole}
										onChange={(e) => setEditRole(e.target.value)}
										className={`${inputCls} text-xs mt-1`}
									/>
								) : (
									<div className="text-xs text-muted-foreground mt-0.5">{agent.role}</div>
								)}
							</div>
						</div>

						{/* Level + Status row */}
						<div className="flex items-center gap-3">
							{isEditing ? (
								<select
									value={editLevel}
									onChange={(e) => setEditLevel(e.target.value as "LEAD" | "INT" | "SPC")}
									className={selectCls}
								>
									<option value="LEAD">LEAD</option>
									<option value="INT">INT</option>
									<option value="SPC">SPC</option>
								</select>
							) : (
								<span
									className="text-[10px] font-bold px-2 py-0.5 rounded"
									style={{
										backgroundColor: levelBgColor(agent.level),
										color: levelTextColor(agent.level),
										letterSpacing: "0.04em",
									}}
								>
									{agent.level}
								</span>
							)}

							{isEditing ? (
								<select
									value={editStatus}
									onChange={(e) => setEditStatus(e.target.value as "idle" | "active" | "blocked")}
									className={selectCls}
								>
									<option value="active">Active</option>
									<option value="idle">Idle</option>
									<option value="blocked">Blocked</option>
								</select>
							) : (
								<div
									className={`text-[10px] font-semibold flex items-center gap-1.5 uppercase ${agent.status === "active"
										? "text-[var(--accent-green)]"
										: agent.status === "blocked"
											? "text-[var(--accent-red)]"
											: "text-muted-foreground"
										}`}
									style={{ letterSpacing: "0.06em" }}
								>
									<span
										className={`w-1.5 h-1.5 rounded-full ${agent.status === "active"
											? "bg-[var(--accent-green)] status-pulse"
											: agent.status === "blocked"
												? "bg-[var(--accent-red)]"
												: "bg-muted-foreground"
											}`}
									/>
									{agent.status}
								</div>
							)}
						</div>

						{/* System Prompt */}
						<div>
							<label
								className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase"
								style={{ letterSpacing: "0.06em" }}
							>
								System Prompt
							</label>
							{isEditing ? (
								<textarea
									value={editSystemPrompt}
									onChange={(e) => setEditSystemPrompt(e.target.value)}
									className={textareaCls}
									rows={4}
								/>
							) : (
								<p className="text-sm text-foreground leading-relaxed bg-secondary rounded-lg px-3 py-2">
									{agent.systemPrompt || <span className="text-muted-foreground italic">Not set</span>}
								</p>
							)}
						</div>

						{/* Character */}
						<div>
							<label
								className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase"
								style={{ letterSpacing: "0.06em" }}
							>
								Character
							</label>
							{isEditing ? (
								<textarea
									value={editCharacter}
									onChange={(e) => setEditCharacter(e.target.value)}
									className={textareaCls}
									rows={4}
								/>
							) : (
								<p className="text-sm text-foreground leading-relaxed bg-secondary rounded-lg px-3 py-2">
									{agent.character || <span className="text-muted-foreground italic">Not set</span>}
								</p>
							)}
						</div>

						{/* Lore */}
						<div>
							<label
								className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase"
								style={{ letterSpacing: "0.06em" }}
							>
								Lore
							</label>
							{isEditing ? (
								<textarea
									value={editLore}
									onChange={(e) => setEditLore(e.target.value)}
									className={textareaCls}
									rows={4}
								/>
							) : (
								<p className="text-sm text-foreground leading-relaxed bg-secondary rounded-lg px-3 py-2">
									{agent.lore || <span className="text-muted-foreground italic">Not set</span>}
								</p>
							)}
						</div>
					</div>

					{/* Footer actions */}
					<div className="px-5 py-4 border-t border-border">
						{isEditing ? (
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleCancel}
									className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
									style={{ transition: "var(--transition-fast)" }}
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSave}
									disabled={saving || !editName.trim()}
									className="flex-1 px-4 py-2 text-sm font-semibold text-primary-foreground bg-[var(--accent-blue)] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
									style={{ transition: "var(--transition-fast)" }}
								>
									{saving ? "Saving..." : "Save"}
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={() => setIsEditing(true)}
								className="w-full px-4 py-2 text-sm font-semibold text-foreground bg-secondary border border-border rounded-lg hover:bg-accent"
								style={{ transition: "var(--transition-fast)" }}
							>
								Edit Agent
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AgentDetailTray;
