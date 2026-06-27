import { handle as authHandle, type DefinedSession } from "$lib/controllers/AuthController";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const authorizationHandle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/app")) {
		const session = await event.locals.auth();
		if (!session || !session.user || !session.user.id || !session.user.name) {
			throw redirect(303, '/');
		}
		event.locals.session = session as DefinedSession
	}

	return resolve(event);
};

export const handle = sequence(authHandle, authorizationHandle);