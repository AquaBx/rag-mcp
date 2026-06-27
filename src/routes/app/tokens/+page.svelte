<script lang="ts">
	import { enhance } from "$app/forms";
	import { Input } from "$lib/components/ui/input/index.js";
	import TrashIcon from "@lucide/svelte/icons/trash";
	import { Button } from "$lib/components/ui/button/index.js";
	import CopyBlock from "$lib/CopyBlock.svelte";

	const sseUrl = `${window.location.origin}/mcp`;

	const claudeConfig = $derived(
		JSON.stringify(
			{
				mcpServers: {
					"rage-memex": {
						url: sseUrl,
						headers: {
							Authorization: "Bearer VOTRE_JETON_API_ICI",
						},
					},
				},
			},
			null,
			2,
		),
	);
	let { data, form } = $props();

	let creating = $state(false);
	let deletingId = $state<number | null>(null);
</script>

<svelte:head>
	<title>API Tokens — Rage Memex</title>
</svelte:head>

<main class="flex flex-col gap-4">
	<div>
		<h1 class="text-3xl font-extrabold tracking-tight">API Tokens</h1>
		<p class="text-sm text-muted-foreground mt-1">
			Générez des jetons d'accès pour interagir de manière sécurisée avec
			le RAG depuis des scripts ou clients externes.
		</p>
	</div>

	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			creating = true;
			return async ({ update }) => {
				await update();
				creating = false;
			};
		}}
		class="bg-card p-4 border rounded-2xl flex flex-col gap-4"
	>
		<div class="flex gap-4">
			<Input
				name="name"
				placeholder="Token name"
				required
				disabled={creating}
			/>

			<Button type="submit" disabled={creating}>
				{#if creating}
					Génération...
				{:else}
					Générer le jeton
				{/if}
			</Button>
		</div>
		{#if form?.error && !form.createdToken}
			<div
				class="p-2 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 text-xs"
			>
				{form.error}
			</div>
		{/if}
		{#if form?.createdToken}
			<CopyBlock content={form.createdToken}></CopyBlock>
		{/if}
	</form>

	<div class="space-y-2">
		<h2
			class="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
		>
			Jetons actifs
		</h2>

		{#if data.tokens.length === 0}
			<div
				class="p-8 border border-dashed rounded-3xl text-center text-muted-foreground/60 text-sm"
			>
				Aucun jeton d'accès généré pour le moment.
			</div>
		{:else}
			<div
				class="border rounded-2xl bg-zinc-900/10 divide-y divide-zinc-900"
			>
				{#each data.tokens as t (t.id)}
					<div class="p-4 flex items-center justify-between gap-4">
						<div class="min-w-0 space-y-1">
							<div
								class="text-sm font-bold truncate text-zinc-200"
							>
								{t.name}
							</div>
							<div
								class="font-mono text-xs text-muted-foreground break-all"
							>
								{t.token}
							</div>
							<div class="text-[10px] text-zinc-500">
								Créé le : {new Date(
									t.created_at,
								).toLocaleDateString("fr-FR", {
									day: "numeric",
									month: "short",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>

						<!-- Delete Token Form -->
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								deletingId = t.id;
								return async ({ update }) => {
									await update();
									deletingId = null;
								};
							}}
						>
							<input type="hidden" name="id" value={t.id} />
							<Button
								type="submit"
								variant="ghost"
								disabled={deletingId === t.id}
								class="size-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
								title="Supprimer ce jeton"
							>
								{#if deletingId === t.id}
									<span
										class="animate-spin size-4 border-2 border-current border-t-transparent rounded-full"
									></span>
								{:else}
									<TrashIcon class="size-4" />
								{/if}
							</Button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="space-y-2">
		<h2
			class="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
		>
			Configuration MCP
		</h2>
		<CopyBlock content={claudeConfig}></CopyBlock>
	</div>
</main>
