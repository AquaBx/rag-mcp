import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	// Delete SvelteKit session cookie
	cookies.delete('session', { path: '/' });

	// Redirect to Keycloak logout to invalidate Keycloak session, then redirect back to app root
	const keycloakLogoutUrl = new URL('http://localhost:8080/realms/rage-realm/protocol/openid-connect/logout');
	keycloakLogoutUrl.searchParams.set('client_id', 'rage-app');
	keycloakLogoutUrl.searchParams.set('post_logout_redirect_uri', 'http://localhost:5173/');

	redirect(302, keycloakLogoutUrl.toString());
};
