import type { Session, User } from "@auth/sveltekit";
import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { AUTH_SECRET, KC_CLIENT_ID, KC_CLIENT_SECRET, KC_ISSUER } from "$env/static/private"

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [
        Keycloak({
            clientId: KC_CLIENT_ID,
            clientSecret: KC_CLIENT_SECRET,
            issuer: KC_ISSUER
        }),
    ],
    secret: AUTH_SECRET,
    callbacks: {
        async jwt({ token, account, profile }) {
            if (profile) {
                token.id = profile.sub;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
})


export interface DefinedUser extends User {
    id: string
    name: string
}

export interface DefinedSession extends Session {
    user: DefinedUser
}