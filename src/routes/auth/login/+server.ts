import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	// Generate random state to protect against CSRF
	const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: false, // set to true in production
		maxAge: 60 * 10 // 10 minutes
	});

	const keycloakAuthUrl = new URL('http://localhost:8080/realms/rage-realm/protocol/openid-connect/auth');
	keycloakAuthUrl.searchParams.set('client_id', 'rage-app');
	keycloakAuthUrl.searchParams.set('redirect_uri', 'http://localhost:5173/auth/callback');
	keycloakAuthUrl.searchParams.set('response_type', 'code');
	keycloakAuthUrl.searchParams.set('scope', 'openid profile email');
	keycloakAuthUrl.searchParams.set('state', state);

	redirect(302, keycloakAuthUrl.toString());
};
