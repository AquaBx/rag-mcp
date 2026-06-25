import { fail, redirect, type Actions } from '@sveltejs/kit';
import { TokenController } from '$lib/controllers/AuthController';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(307, '/login');
	}

	try {
		const tokens = await TokenController.getFromOwner(locals.user.username)

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
		if (!locals.user) {
			return fail(401, { error: 'Non autorisé' });
		}

		const data = await request.formData();
		const name = data.get('name') as string;

		if (!name || !name.trim()) {
			return fail(400, { error: 'Le nom du jeton est requis.' });
		}

		try {
			const createdToken = await TokenController.create(name, locals.user.username)
			return { success: true, createdToken };
		} catch (err: any) {
			console.error('Error creating API token:', err);
			return fail(500, { error: `Erreur lors de la création : ${err.message}` });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Non autorisé' });
		}

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requis.' });
		}

		try {
			// Verify ownership before deleting
			if (await TokenController.isOwner(id, locals.user.username)) {
				return fail(403, { error: 'Action interdite.' });
			}

			await TokenController.delete(id)

			return { success: true };
		} catch (err: any) {
			console.error('Error deleting API token:', err);
			return fail(500, { error: `Erreur lors de la suppression : ${err.message}` });
		}
	}
};
