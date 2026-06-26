import { fail, type Actions } from '@sveltejs/kit';
import { TokenController } from '$lib/controllers/TokenController';
import type { PageServerLoad } from './$types';
import { AuthController } from '$lib/controllers/AuthController';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await AuthController.getSession(locals)

	try {
		const tokens = await TokenController.getFromOwner(session.user.id)

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
		const session = await AuthController.getSession(locals)

		const data = await request.formData();
		const name = data.get('name') as string;

		if (!name || !name.trim()) {
			return fail(400, { error: 'Le nom du jeton est requis.' });
		}

		try {
			const createdToken = await TokenController.create(name, session.user.id)
			return { success: true, createdToken };
		} catch (err: any) {
			console.error('Error creating API token:', err);
			return fail(500, { error: `Erreur lors de la création : ${err.message}` });
		}
	},

	delete: async ({ request, locals }) => {
		const session = await AuthController.getSession(locals)

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requis.' });
		}

		try {
			// Verify ownership before deleting
			if (await TokenController.isOwner(id, session.user.id)) {
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
