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
		date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();

	return (
		<header className="[grid-area:header] flex items-center justify-between px-4 md:px-5 bg-card border-b border-border z-10">
			{/* Left: Brand + mobile menu */}
			<div className="flex items-center gap-3 min-w-0">
				<button
					type="button"
					className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted hover:bg-accent transition-colors text-muted-foreground"
					onClick={onOpenAgents}
					aria-label="Open agents sidebar"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M2 4h12M2 8h12M2 12h12" />
					</svg>
				</button>
				<div className="flex items-center gap-2">
					<span className="text-lg text-[var(--accent-orange)]">◇</span>
					<h1 className="text-sm font-semibold tracking-[0.15em] text-foreground/90 uppercase">
						Mission Control
					</h1>
				</div>
			</div>

			{/* Center: Stats */}
			<div className="hidden md:flex items-center gap-6">
				<div className="flex items-center gap-2">
					<span className="text-xs font-medium text-muted-foreground tracking-wider">AGENTS</span>
					<span className="text-sm font-semibold text-foreground tabular-nums">{agents ? activeCount : "–"}</span>
				</div>
				<div className="w-px h-4 bg-border" />
				<div className="flex items-center gap-2">
					<span className="text-xs font-medium text-muted-foreground tracking-wider">QUEUE</span>
					<span className="text-sm font-semibold text-foreground tabular-nums">{tasks ? queueCount : "–"}</span>
				</div>
			</div>

			{/* Right: Clock + Status */}
			<div className="flex items-center gap-3 md:gap-4">
				<button
					type="button"
					className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted hover:bg-accent transition-colors text-muted-foreground"
					onClick={onOpenLiveFeed}
					aria-label="Open live feed sidebar"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
						<circle cx="8" cy="8" r="2" />
						<path d="M4.5 4.5a5 5 0 0 1 7 0M3 3a7.5 7.5 0 0 1 10 0" />
					</svg>
				</button>
				<div className="text-right hidden sm:block">
					<div className="text-sm font-medium text-foreground/80 tabular-nums font-mono">
						{formatTime(time)}
					</div>
					<div className="text-[9px] font-medium text-muted-foreground tracking-wider">
						{formatDate(time)}
					</div>
				</div>
				<div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[var(--accent-green)]">
					<span className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full animate-pulse" />
					ONLINE
				</div>
				<SignOutButton />
			</div>
		</header>
	);
};

export default Header;
