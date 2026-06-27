import { fail, type Actions } from '@sveltejs/kit';
import { TokenController } from '$lib/controllers/TokenController';
import type { PageServerLoad } from './$types';
import { z } from "zod"

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const tokens = await TokenController.getFromOwner(locals.session.user)

		// Mask tokens for display (security first)
		const maskedTokens = tokens.map(t => {
			const tokenStr = t.token;
			const masked = tokenStr.length > 8
				? `${tokenStr.substring(0, 8)}...${tokenStr.substring(tokenStr.length - 4)}`
				: '••••••••••••';
			return {
				...t,
				token: masked
			};
		});

		return {
			tokens: maskedTokens
		};
	} catch (err: any) {
		console.error('Error loading API tokens:', err);
		return {
			tokens: [],
			error: `Impossible de charger les jetons : ${err.message}`
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = Object.fromEntries((await request.formData()).entries());

		const res = z.object({
			name: z.string(),
		}).safeParse(data)

		if (!res.success) {
			return fail(400, res.error);
		}

		try {
			const createdToken = await TokenController.create(res.data.name, locals.session.user)
			return { success: true, createdToken };
		} catch (err: any) {
			console.error('Error creating API token:', err);
			return fail(500, { error: `Erreur lors de la création : ${err.message}` });
		}
	},

	delete: async ({ request, locals }) => {
		const data = Object.fromEntries((await request.formData()).entries());

		const res = z.object({
			id: z.coerce.number(),
		}).safeParse(data)

		if (!res.success) {
			return fail(400, res.error);
		}

		try {
			// Verify ownership before deleting
			if (!await TokenController.isOwner(res.data.id, locals.session.user)) {
				return fail(403, { error: 'Action interdite.' });
			}

			await TokenController.delete(res.data.id)

			return { success: true };
		} catch (err: any) {
			console.error('Error deleting API token:', err);
			return fail(500, { error: `Erreur lors de la suppression : ${err.message}` });
		}
	}
};
