<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";

	// Svelte 5 props
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Rage Memex — Base de Connaissance Sémantique</title>
</svelte:head>

{#if data.memories.length === 0}
	<div class="text-center py-12">
		<h3 class="text-lg font-semibold text-muted-foreground">
			No memories found
		</h3>
		<p class="text-sm text-muted-foreground/60 mt-1">
			Use the "Add Memory" button in the navigation bar to save your first
			memory.
		</p>
	</div>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each data.memories as memory (memory.id)}
			<Card.Root
				class="flex flex-col justify-between min-h-48 border hover:shadow-md transition-shadow"
			>
				<Card.Header>
					<div class="flex items-start justify-between gap-4">
						<Card.Title class="text-lg font-bold line-clamp-1"
							>{memory.title}</Card.Title
						>
						<span
							class="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border"
						>
							#{memory.id}
						</span>
					</div>

					{#if memory.distance !== undefined && memory.distance !== null}
						<Card.Description>
							Pertinence : {Math.ceil(
								(1 - memory.distance) * 100,
							)} %
						</Card.Description>
					{/if}

					<Card.Action class="flex items-center gap-2 mt-2">
						<form
							method="POST"
							action="?/delete"
							use:enhance
							class="inline"
						>
							<input type="hidden" name="id" value={memory.id} />
							<Button
								type="submit"
								variant="link"
								class="text-destructive h-auto p-0 hover:underline"
							>
								Delete
							</Button>
						</form>
						<span class="text-muted-foreground text-xs select-none"
							>|</span
						>
						<Button
							variant="link"
							class="h-auto p-0 hover:underline"
							disabled
						>
							Modify
						</Button>
					</Card.Action>
				</Card.Header>

				<Card.Content
					class="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed wrap-break-word font-mono line-clamp-4 mt-auto"
				>
					{memory.content}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
{/if}
