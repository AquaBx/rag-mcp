import { error, redirect, isRedirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const savedState = cookies.get('oauth_state');

	if (!code || !state || state !== savedState) {
		error(400, 'Requête invalide ou session OAuth expirée (state mismatch).');
	}

	// Clear the state cookie
	cookies.delete('oauth_state', { path: '/' });

	try {
		// Exchange code for token at Keycloak
		const tokenResponse = await fetch('http://localhost:8080/realms/rage-realm/protocol/openid-connect/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: 'http://localhost:5173/auth/callback',
				client_id: 'rage-app',
				client_secret: 'rage-app-secret'
			})
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			console.error('Keycloak token exchange error:', errorText);
			error(500, 'Impossible de récupérer le jeton de connexion de Keycloak.');
		}

		const tokens = await tokenResponse.json();
		const idToken = tokens.id_token;

		if (!idToken) {
			error(500, "Le jeton d'identité (id_token) est manquant dans la réponse de Keycloak.");
		}

		// Decode JWT payload (middle part of the JWT)
		const payloadPart = idToken.split('.')[1];
		const decodedPayload = Buffer.from(payloadPart, 'base64').toString('utf-8');
		const userProfile = JSON.parse(decodedPayload);

		// Format user details
		const user = {
			name: userProfile.name || userProfile.preferred_username || 'Utilisateur',
			email: userProfile.email,
			username: userProfile.preferred_username || 'user'
		};

		// Save user session as a base64 encoded JSON in cookie
		cookies.set('session', Buffer.from(JSON.stringify(user)).toString('base64'), {
			path: '/',
			httpOnly: true,
			secure: false, // set to true in production
			maxAge: tokens.expires_in || 60 * 60 * 24 // 24 hours default
		});

		redirect(302, '/');
	} catch (err: any) {
		if (isRedirect(err)) {
			throw err;
		}
		console.error('Authentication callback error:', err);
		error(500, `Erreur lors de l'échange de jeton: ${err.message}`);
	}
};
