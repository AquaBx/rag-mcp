import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MemoryController } from '$lib/controllers/MemoryController';
import { z } from "zod"

export const load: PageServerLoad = async ({ url, params }) => {
	try {
		const memory = await MemoryController.getById(parseInt(params.id));
		return { memory };
	} catch (err: any) {
		console.error('Error during loading memories:', err);
		return {
			memory: undefined,
			error: `Impossible de charger les données: ${err.message}`
		};
	}
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const data = Object.fromEntries((await request.formData()).entries());

		const res = z.object({
			title: z.string().nonempty(),
			content: z.string().nonempty(),
		}).safeParse(data)

		if (!res.success) {
			return fail(400, res.error);
		}

		try {
			await MemoryController.update(parseInt(params.id), res.data.title, res.data.content)
			return { success: true };
		} catch (err: any) {
			console.error('Error adding memory:', err);
			return fail(500, {
				error: `Erreur lors de la sauvegarde: ${err.message}`
			});
		}
	},

	delete: async ({ request, params }) => {
		try {
			await MemoryController.delete(parseInt(params.id))
			return { success: true };
		} catch (err: any) {
			console.error('Error deleting memory:', err);
			return fail(500, { error: `Erreur lors de la suppression: ${err.message}` });
		}
	}
};
