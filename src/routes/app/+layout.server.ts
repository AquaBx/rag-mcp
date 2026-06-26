import { AuthController } from '$lib/controllers/AuthController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await AuthController.getSession(locals)

	return { session };
};