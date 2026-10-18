import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";
import { applyCachePolicy } from "./utils/edge-cache";

export { PluginBridge };

export default {
	...handler,
	async fetch(request, env, ctx) {
		const response = await handler.fetch!(request, env, ctx);
		return applyCachePolicy(request, response);
	},
	scheduled: createScheduledHandler(),
} satisfies ExportedHandler;
