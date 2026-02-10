import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Id } from "../../convex/_generated/dataModel";
import { Archive, Play, Loader2 } from "lucide-react";

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

interface TaskCardProps {
	task: Task;
	isSelected: boolean;
	onClick: () => void;
	getAgentName: (id: string) => string;
	formatRelativeTime: (timestamp: number | null) => string;
	columnId: string;
	currentUserAgentId?: Id<"agents">;
	onArchive?: (taskId: Id<"tasks">) => void;
	onPlay?: (taskId: Id<"tasks">) => void;
	isOverlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
	task,
	isSelected,
	onClick,
	getAgentName,
	formatRelativeTime,
	columnId,
	currentUserAgentId,
	onArchive,
	onPlay,
	isOverlay = false,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		isDragging,
	} = useDraggable({
		id: task._id,
		data: { task },
	});

	const style = transform
		? { transform: CSS.Translate.toString(transform) }
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={{
				...style,
				borderLeftColor:
					isSelected || isOverlay
						? undefined
						: task.borderColor || "transparent",
				borderLeftWidth: isSelected || isOverlay ? undefined : "3px",
				transition: "var(--transition-fast)",
			}}
			className={`min-w-0 bg-card rounded-xl p-4 flex flex-col gap-2 border border-border cursor-pointer select-none transition-all duration-200 group ${isDragging ? "dragging-card rotate-2 scale-[1.02] shadow-xl" : "hover:bg-accent/50 hover:border-accent hover:shadow-lg hover:-translate-y-0.5"
				} ${isSelected
					? "ring-2 ring-[var(--accent-blue)] border-[var(--accent-blue)]"
					: ""
				} ${columnId === "archived" ? "opacity-50 grayscale" : ""} ${columnId === "in_progress" ? "card-running" : ""
				} ${isOverlay ? "drag-overlay" : ""}`}
			onClick={onClick}
			{...listeners}
			{...attributes}
		>
			{/* Header row */}
			<div className="flex justify-between items-start gap-2">
				<h3 className="text-[13px] font-medium text-foreground leading-snug break-words flex-1">
					{task.title}
				</h3>
				<div className="flex items-center gap-0.5 shrink-0">
					{(columnId === "inbox" || columnId === "assigned") && currentUserAgentId && onPlay && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onPlay(task._id);
							}}
							className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-[var(--accent-blue)]"
							style={{ transition: "var(--transition-fast)" }}
							title="Start task"
						>
							<Play size={12} />
						</button>
					)}
					{columnId === "in_progress" && (
						<span className="p-1 text-[var(--accent-blue)]" title="Running">
							<Loader2 size={12} className="animate-spin" />
						</span>
					)}
					{columnId === "done" && currentUserAgentId && onArchive && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onArchive(task._id);
							}}
							className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground"
							style={{ transition: "var(--transition-fast)" }}
							title="Archive"
						>
							<Archive size={12} />
						</button>
					)}
				</div>
			</div>

			{/* Description */}
			{task.description && task.description !== task.title && (
				<p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 break-words">
					{task.description}
				</p>
			)}

			{/* Footer */}
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-3">
					{task.assigneeIds && task.assigneeIds.length > 0 && (
						<span className="text-[10px] font-medium text-muted-foreground">
							{getAgentName(task.assigneeIds[0] as string)}
						</span>
					)}
				</div>
				{task.lastMessageTime && (
					<span className="text-[10px] text-muted-foreground/60 tabular-nums font-mono">
						{formatRelativeTime(task.lastMessageTime)}
					</span>
				)}
			</div>

			{/* Tags */}
			{task.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{task.tags.map((tag) => (
						<span
							key={tag}
							className="text-[9px] px-1.5 py-0.5 bg-secondary rounded font-medium text-muted-foreground"
						>
							{tag}
						</span>
					))}
				</div>
			)}
		</div>
	);
};

export default TaskCard;
