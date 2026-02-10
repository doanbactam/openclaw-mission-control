import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// OpenClaw webhook endpoint
http.route({
	path: "/openclaw/event",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const body = await request.json();
		await ctx.runMutation(api.openclaw.receiveAgentEvent, body);
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}),
});

// OpenClaw agent sync endpoint
http.route({
	path: "/openclaw/sync-agents",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const body = await request.json();
		const result = await ctx.runMutation(api.openclaw.syncAgents, body);
		return new Response(JSON.stringify({ ok: true, ...result }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}),
});

export default http;
