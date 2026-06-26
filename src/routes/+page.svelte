<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import { signIn, signOut } from "@auth/sveltekit/client";
</script>

<main class="grid place-items-center w-dvw h-dvh">
	<Button onclick={() => signIn("keycloak", { redirectTo: "/app" })}>
		Sign In
	</Button>
</main>
