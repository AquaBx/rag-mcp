<script lang="ts">
	import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { applyAction, deserialize, enhance } from "$app/forms";
	import type { ActionResult } from "@sveltejs/kit";
	import { invalidateAll } from "$app/navigation";

	let { id }: { id: number } = $props();

	async function handleDelete() {
		const data = new FormData();
		data.set("id", id.toString());
		const response = await fetch("?/delete", {
			method: "POST",
			body: data,
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === "success") {
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon"
				class="relative size-8 p-0"
			>
				<span class="sr-only">Open menu</span>
				<EllipsisIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Actions</DropdownMenu.Label>
		<DropdownMenu.Item onclick={handleDelete}>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
