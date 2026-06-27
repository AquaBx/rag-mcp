import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MemoryController } from '$lib/controllers/MemoryController';
import { z } from "zod"

export const load: PageServerLoad = async ({ url }) => {
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
		const data = Object.fromEntries((await request.formData()).entries());

		const res = z.object({
			title: z.string(),
			content: z.string(),
		}).safeParse(data)

		if (!res.success) {
			return fail(400, res.error);
		}

		try {
			await MemoryController.create(res.data.title, res.data.content)
			return { success: true };
		} catch (err: any) {
			console.error('Error adding memory:', err);
			return fail(500, {
				error: `Erreur lors de la sauvegarde: ${err.message}`
			});
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
			await MemoryController.delete(res.data.id)
			return { success: true };
		} catch (err: any) {
			console.error('Error deleting memory:', err);
			return fail(500, { error: `Erreur lors de la suppression: ${err.message}` });
		}
	}
};
