import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session');

	if (session) {
		try {
			const decoded = Buffer.from(session, 'base64').toString('utf-8');
			event.locals.user = JSON.parse(decoded);
		} catch (e) {
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	const path = event.url.pathname;

	// Handle CORS preflight for API requests
	if (path.startsWith('/api') && event.request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Max-Age': '86400'
			}
		});
	}

	// Redirect to login if user is not authenticated and is accessing a protected page
	// We allow /login, /auth/*, /api/*, and static assets or dev files
	if (!event.locals.user) {
		const isAuthPath = path === '/login' || path.startsWith('/auth');
		const isApiPath = path.startsWith('/api');
		const isStaticAsset = path.includes('.') || path.startsWith('/@');

		if (!isAuthPath && !isApiPath && !isStaticAsset) {
			redirect(307, '/login');
		}
	}

	// Redirect to homepage if user is already authenticated and tries to visit the login page
	if (event.locals.user && path === '/login') {
		redirect(307, '/');
	}

	// Resolve the request
	const response = await resolve(event);

	// Add CORS headers to all API responses
	if (path.startsWith('/api')) {
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	}

	return response;
};
