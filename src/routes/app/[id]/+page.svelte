<script lang="ts">
	import type { ColumnDef } from "@tanstack/table-core";
	import type { Memory } from "$lib/controllers/MemoryController.js";

	import { renderComponent } from "$lib/components/ui/data-table/index.js";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import { enhance } from "$app/forms";
	import Button from "$lib/components/ui/button/button.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Memorag</title>
</svelte:head>

{#if data.memory}
<form method="POST" use:enhance action="?/update" class="grid gap-4 py-4">
	<div class="grid gap-2">
		<Label for="title">Title</Label>
		<Input id="title" name="title" value={data.memory.title} required placeholder="Memory title..." />
	</div>
	<div class="grid gap-2">
		<Label for="content">Content</Label>
		<Textarea
			id="content"
			name="content"
			value={data.memory.content}
			required
			placeholder="Type your context here..."
			class="min-h-25"
		/>
	</div>

	<Button type="submit" class={buttonVariants({ variant: "default" })}>
		Update
	</Button>
</form>
{:else}
	{data.error}
{/if}

