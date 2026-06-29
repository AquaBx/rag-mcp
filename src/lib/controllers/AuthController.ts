import type { Session, User } from "@auth/sveltekit";
import { SvelteKitAuth } from "@auth/sveltekit"
import Keycloak from "@auth/sveltekit/providers/keycloak"
import { env } from "$env/dynamic/private"

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [
        Keycloak({
            clientId: env.KC_CLIENT_ID,
            clientSecret: env.KC_CLIENT_SECRET,
            issuer: env.KC_ISSUER
        }),
    ],
    secret: env.AUTH_SECRET,
    trustHost: env.AUTH_TRUST_HOST === "true",
    debug: env.LOG === "true",
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