import { handle as authHandle, type DefinedSession } from "$lib/controllers/AuthController";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { env } from "$env/dynamic/private";

const authorizationHandle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/app")) {
		const shouldLog = env.LOG === "true";
		if (shouldLog) console.log("[hooks.server.ts] Intercepting /app request");
		try {
			const session = await event.locals.auth();
			if (shouldLog) console.log("[hooks.server.ts] Session returned:", JSON.stringify(session, null, 2));
			if (!session || !session.user || !session.user.id || !session.user.name) {
				if (shouldLog) console.log("[hooks.server.ts] Session validation failed. Redirecting to /");
				throw redirect(303, '/');
			}
			event.locals.session = session as DefinedSession;
		} catch (err: any) {
			if (shouldLog) console.error("[hooks.server.ts] Error during session resolution:", err);
			throw err;
		}
	}

	return resolve(event);
};

export const handle = sequence(authHandle, authorizationHandle);

export const handleError: import("@sveltejs/kit").HandleServerError = ({ error, event }) => {
	const shouldLog = env.LOG === "true";
	if (shouldLog) {
		console.error("[hooks.server.ts] handleError caught an error:");
		console.error(error);
		if (error && typeof error === 'object') {
			console.error("Error message:", (error as any).message);
			console.error("Error stack:", (error as any).stack);
		}
	}
	return {
		message: error instanceof Error ? error.message : "Internal Error"
	};
};