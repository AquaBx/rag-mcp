import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MemoryController } from '$lib/controllers/MemoryController';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') || '';

	try {
		let memories
		if (q.trim()) {
			const retrieved_memories = await MemoryController.search(q, 20);

			memories = retrieved_memories.map(m => {
				const similarity = 1 - (m.distance ?? 1);
				const score = Math.max(0, Math.min(100, Math.round(similarity * 100)));
				return {
					...m,
					score
				};
			});
		} else {
			const retrieved_memories = await MemoryController.getAll();
			memories = retrieved_memories.map(m => ({ ...m, score: null }))
		}
		return { memories };
	} catch (err: any) {
		console.error('Error during loading memories:', err);
		return {
			memories: [],
			error: `Impossible de charger les données: ${err.message}`
		};
	}
};

export const actions: Actions = {
	add: async ({ request }) => {
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

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'L\'ID du contenu à supprimer est manquant.' });
		}

		try {
			await MemoryController.delete(id)
			return { success: true };
		} catch (err: any) {
			console.error('Error deleting memory:', err);
			return fail(500, { error: `Erreur lors de la suppression: ${err.message}` });
		}
	}
};
