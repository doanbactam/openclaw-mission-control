import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface Column {
	id: string;
	label: string;
	color: string;
}

interface KanbanColumnProps {
	column: Column;
	taskCount: number;
	children: React.ReactNode;
	isOver?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
	column,
	taskCount,
	children,
}) => {
	const { isOver, setNodeRef } = useDroppable({
		id: column.id,
	});

	return (
		<div
			ref={setNodeRef}
			className={`bg-background flex flex-col min-w-[220px] min-h-0 ${isOver ? "drop-zone-active" : ""}`}
			style={{ transition: "background-color var(--transition-fast)" }}
		>
			<div className="flex shrink-0 items-center gap-2 px-3 py-2.5 border-b border-border">
				<span
					className="w-1.5 h-1.5 rounded-full shrink-0"
					style={{ backgroundColor: column.color }}
				/>
				<span
					className="text-[10px] font-semibold text-muted-foreground flex-1 uppercase"
					style={{ letterSpacing: "0.08em" }}
				>
					{column.label}
				</span>
				<span className="text-[10px] text-muted-foreground/60 tabular-nums font-mono">
					{taskCount}
				</span>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain p-2">
				<div className="flex flex-col gap-2">
					{children}
				</div>
			</div>
		</div>
	);
};

export default KanbanColumn;
