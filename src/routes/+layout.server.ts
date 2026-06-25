import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q') || '';

	return {
		q: q,
		user: locals.user
	};
};
