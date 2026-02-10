import React, { useEffect, useState } from "react";
import SignOutButton from "./Signout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DEFAULT_TENANT_ID } from "../lib/tenant";

type HeaderProps = {
	onOpenAgents?: () => void;
	onOpenLiveFeed?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onOpenAgents, onOpenLiveFeed }) => {
	const [time, setTime] = useState(new Date());

	const agents = useQuery(api.queries.listAgents, { tenantId: DEFAULT_TENANT_ID });
	const tasks = useQuery(api.queries.listTasks, { tenantId: DEFAULT_TENANT_ID });

	const activeCount = agents ? agents.filter(a => a.status === "active").length : 0;
	const queueCount = tasks ? tasks.filter(t => t.status !== "done" && t.status !== "archived").length : 0;

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (date: Date) =>
		date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();

	return (
		<header
			className="[grid-area:header] flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60"
			style={{ zIndex: 10 }}
		>
			{/* Left: Brand + mobile menu */}
			<div className="flex items-center gap-3 min-w-0">
				<button
					type="button"
					className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary hover:bg-accent text-muted-foreground"
					onClick={onOpenAgents}
					aria-label="Open agents sidebar"
					style={{ transition: "var(--transition-fast)" }}
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M2 4h12M2 8h12M2 12h12" />
					</svg>
				</button>
				<div className="flex items-center gap-2">
					<span className="text-base text-[var(--accent-blue)]">◇</span>
					<h1
						className="text-xs font-semibold text-foreground/90 uppercase"
						style={{ letterSpacing: "0.12em" }}
					>
						Mission Control
					</h1>
				</div>
			</div>

			{/* Center: Stats — Codex-style command center stats */}
			<div className="hidden md:flex items-center gap-5">
				<div className="flex items-center gap-2">
					<span
						className="text-[10px] font-medium text-muted-foreground uppercase"
						style={{ letterSpacing: "0.08em" }}
					>
						Agents
					</span>
					<span className="text-xs font-semibold text-foreground tabular-nums">
						{agents ? activeCount : "–"}
					</span>
				</div>
				<div className="w-px h-3.5 bg-border" />
				<div className="flex items-center gap-2">
					<span
						className="text-[10px] font-medium text-muted-foreground uppercase"
						style={{ letterSpacing: "0.08em" }}
					>
						Queue
					</span>
					<span className="text-xs font-semibold text-foreground tabular-nums">
						{tasks ? queueCount : "–"}
					</span>
				</div>
			</div>

			{/* Right: Clock + Status */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary hover:bg-accent text-muted-foreground"
					onClick={onOpenLiveFeed}
					aria-label="Open live feed sidebar"
					style={{ transition: "var(--transition-fast)" }}
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
						<circle cx="8" cy="8" r="2" />
						<path d="M4.5 4.5a5 5 0 0 1 7 0M3 3a7.5 7.5 0 0 1 10 0" />
					</svg>
				</button>
				<div className="text-right hidden sm:block">
					<div className="text-xs text-foreground/80 tabular-nums font-mono">
						{formatTime(time)}
					</div>
					<div
						className="text-[9px] font-medium text-muted-foreground"
						style={{ letterSpacing: "0.06em" }}
					>
						{formatDate(time)}
					</div>
				</div>
				<div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--accent-green)]"
					style={{ letterSpacing: "0.06em" }}
				>
					<span className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full status-pulse" />
					LIVE
				</div>
				<SignOutButton />
			</div>
		</header>
	);
};

export default Header;
