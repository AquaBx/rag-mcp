// See https://svelte.dev/docs/kit/types#app.d.ts

import type { DefinedSession } from "$lib/controllers/AuthController";

declare global {
    namespace App {
        interface Locals {
            session: DefinedSession
        }
    }
}

export { };
