import React, { useState } from "react";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { IconArchive } from "@tabler/icons-react";
import { DEFAULT_TENANT_ID } from "../lib/tenant";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragEndEvent,
} from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import KanbanColumn from "./KanbanColumn";

type TaskStatus = "inbox" | "assigned" | "in_progress" | "review" | "done" | "archived";

interface Task {
	_id: Id<"tasks">;
	title: string;
	description: string;
	status: string;
	assigneeIds: Id<"agents">[];
	tags: string[];
	borderColor?: string;
	lastMessageTime?: number;
}

function formatRelativeTime(timestamp: number | null): string {
	if (!timestamp) return "";

	const now = Date.now();
	const diff = now - timestamp;

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "now";
	if (minutes < 60) return `${minutes}m`;
	if (hours < 24) return `${hours}h`;
	if (days < 7) return `${days}d`;

	return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const columns = [
	{ id: "inbox", label: "INBOX", color: "var(--muted-foreground)" },
	{ id: "assigned", label: "ASSIGNED", color: "var(--accent-orange)" },
	{ id: "in_progress", label: "IN PROGRESS", color: "var(--accent-blue)" },
	{ id: "review", label: "REVIEW", color: "var(--foreground)" },
	{ id: "done", label: "DONE", color: "var(--accent-green)" },
];

const archivedColumn = { id: "archived", label: "ARCHIVED", color: "var(--muted-foreground)" };

interface MissionQueueProps {
	selectedTaskId: Id<"tasks"> | null;
	onSelectTask: (id: Id<"tasks">) => void;
}

const MissionQueue: React.FC<MissionQueueProps> = ({ selectedTaskId, onSelectTask }) => {
	const tasks = useQuery(api.queries.listTasks, { tenantId: DEFAULT_TENANT_ID });
	const agents = useQuery(api.queries.listAgents, { tenantId: DEFAULT_TENANT_ID });
	const archiveTask = useMutation(api.tasks.archiveTask);
	const updateStatus = useMutation(api.tasks.updateStatus);
	const linkRun = useMutation(api.tasks.linkRun);
	const [showArchived, setShowArchived] = useState(false);
	const convex = useConvex();
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const currentUserAgent = agents?.find(a => a.name === "Manish");

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		})
	);

	if (tasks === undefined || agents === undefined) {
		return (
			<main className="[grid-area:main] bg-background flex flex-col overflow-hidden">
				<div className="h-[44px] bg-card border-b border-border" />
				<div className="flex-1 grid grid-cols-5 gap-px bg-border animate-pulse">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="bg-background" />
					))}
				</div>
			</main>
		);
	}

	const getAgentName = (id: string) => {
		return agents.find((a) => a._id === id)?.name || "Unknown";
	};

	const handleDragStart = (event: DragStartEvent) => {
		const task = tasks.find((t) => t._id === event.active.id);
		if (task) setActiveTask(task as Task);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTask(null);

		if (!over || !currentUserAgent) return;

		const taskId = active.id as Id<"tasks">;
		const newStatus = over.id as TaskStatus;
		const task = tasks.find((t) => t._id === taskId);

		if (task && task.status !== newStatus) {
			await updateStatus({
				taskId,
				status: newStatus,
				agentId: currentUserAgent._id,
				tenantId: DEFAULT_TENANT_ID,
			});
		}
	};

	const handleArchive = (taskId: Id<"tasks">) => {
		if (currentUserAgent) {
			archiveTask({
				taskId,
				agentId: currentUserAgent._id,
				tenantId: DEFAULT_TENANT_ID,
			});
		}
	};

	const buildAgentPreamble = (task: Task) => {
		const assignee = task.assigneeIds.length > 0
			? agents.find(a => a._id === task.assigneeIds[0])
			: null;
		if (!assignee) return "";

		const parts: string[] = [];
		if (assignee.systemPrompt) parts.push(`System Prompt:\n${assignee.systemPrompt}`);
		if (assignee.character) parts.push(`Character:\n${assignee.character}`);
		if (assignee.lore) parts.push(`Lore:\n${assignee.lore}`);

		return parts.length > 0 ? parts.join("\n\n") + "\n\n---\n\n" : "";
	};

	const buildPrompt = async (task: Task) => {
		let prompt = buildAgentPreamble(task);

		prompt += task.description && task.description !== task.title
			? `${task.title}\n\n${task.description}`
			: task.title;

		const messages = await convex.query(api.queries.listMessages, {
			taskId: task._id,
			tenantId: DEFAULT_TENANT_ID,
		});
		if (messages && messages.length > 0) {
			const sorted = [...messages].sort((a, b) => a._creationTime - b._creationTime);
			const thread = sorted.map(m => `[${m.agentName}]: ${m.content}`).join("\n\n");
			prompt += `\n\n---\nConversation:\n${thread}\n---\nContinue working on this task based on the conversation above.`;
		}

		return prompt;
	};

	const triggerAgent = async (taskId: Id<"tasks">, message: string) => {
		try {
			const res = await fetch("/hooks/agent", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${import.meta.env.VITE_OPENCLAW_HOOK_TOKEN || ""}`,
				},
				body: JSON.stringify({
					message,
					sessionKey: `mission:${taskId}`,
					name: "MissionControl",
					wakeMode: "now",
				}),
			});

			if (res.ok) {
				const data = await res.json();
				if (data.runId) {
					await linkRun({
						taskId,
						openclawRunId: data.runId,
						tenantId: DEFAULT_TENANT_ID,
					});
				}
			}
		} catch (err) {
			console.error("[MissionQueue] Failed to trigger openclaw agent:", err);
		}
	};

	const handlePlay = async (taskId: Id<"tasks">) => {
		if (!currentUserAgent) return;

		await updateStatus({
			taskId,
			status: "in_progress",
			agentId: currentUserAgent._id,
			tenantId: DEFAULT_TENANT_ID,
		});

		const task = tasks.find((t) => t._id === taskId);
		if (!task) return;

		const message = await buildPrompt(task as Task);
		await triggerAgent(taskId, message);
	};

	const displayColumns = showArchived ? [...columns, archivedColumn] : columns;
	const activeCount = tasks.filter((t) => t.status !== "done" && t.status !== "archived").length;
	const archivedCount = tasks.filter((t) => t.status === "archived").length;

	return (
		<main className="[grid-area:main] bg-background flex min-h-0 flex-col overflow-hidden">
			{/* Toolbar */}
			<div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-card border-b border-border">
				<div className="flex items-center gap-3">
					<span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
						Queue
					</span>
					<span className="text-[10px] text-muted-foreground/50 tabular-nums">
						{activeCount} active
					</span>
				</div>
				<button
					onClick={() => setShowArchived(!showArchived)}
					className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded transition-colors ${showArchived
							? "bg-accent text-foreground"
							: "text-muted-foreground hover:text-foreground hover:bg-muted"
						}`}
				>
					<IconArchive size={12} />
					{archivedCount > 0 && (
						<span className="tabular-nums">{archivedCount}</span>
					)}
				</button>
			</div>

			{/* Kanban */}
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className={`flex-1 min-h-0 grid gap-px bg-border overflow-x-auto overflow-y-hidden ${showArchived ? "grid-cols-6" : "grid-cols-5"
					}`}>
					{displayColumns.map((col) => (
						<KanbanColumn
							key={col.id}
							column={col}
							taskCount={tasks.filter((t) => t.status === col.id).length}
						>
							{tasks
								.filter((t) => t.status === col.id)
								.map((task) => (
									<TaskCard
										key={task._id}
										task={task as Task}
										isSelected={selectedTaskId === task._id}
										onClick={() => onSelectTask(task._id)}
										getAgentName={getAgentName}
										formatRelativeTime={formatRelativeTime}
										columnId={col.id}
										currentUserAgentId={currentUserAgent?._id}
										onArchive={handleArchive}
										onPlay={handlePlay}
									/>
								))}
						</KanbanColumn>
					))}
				</div>

				<DragOverlay>
					{activeTask ? (
						<TaskCard
							task={activeTask}
							isSelected={false}
							onClick={() => { }}
							getAgentName={getAgentName}
							formatRelativeTime={formatRelativeTime}
							columnId={activeTask.status}
							isOverlay={true}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</main>
	);
};

export default MissionQueue;
