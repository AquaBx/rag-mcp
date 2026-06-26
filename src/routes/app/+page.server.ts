import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MemoryController } from '$lib/controllers/MemoryController';
import { AuthController } from '$lib/controllers/AuthController';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await AuthController.getSession(locals)
	const q = url.searchParams.get('q') || '';

	try {
		const memories = q.trim() ? await MemoryController.search(q, 20) : await MemoryController.getAll();
		return { memories, q };
	} catch (err: any) {
		console.error('Error during loading memories:', err);
		return {
			q,
			memories: [],
			error: `Impossible de charger les données: ${err.message}`
		};
	}
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const session = await AuthController.getSession(locals)

		const data = await request.formData();
		const title = data.get('title') as string;
		const content = data.get('content') as string;

		if (!title || !title.trim()) {
			return fail(400, { title, content, error: 'Le titre est requis.' });
		}
		if (!content || !content.trim()) {
			return fail(400, { title, content, error: 'Le contenu est requis.' });
		}

		try {
			await MemoryController.create(title, content)
			return { success: true };
		} catch (err: any) {
			console.error('Error adding memory:', err);
			return fail(500, {
				title,
				content,
				error: `Erreur lors de la sauvegarde: ${err.message}`
			});
		}
	},

	delete: async ({ request, locals }) => {
		const session = await AuthController.getSession(locals)

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'L\'ID du contenu à supprimer est manquant.' });
		}

		try {
			await MemoryController.delete(parseInt(id))
			return { success: true };
		} catch (err: any) {
			console.error('Error deleting memory:', err);
			return fail(500, { error: `Erreur lors de la suppression: ${err.message}` });
		}
	}
};
