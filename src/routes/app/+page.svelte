<script lang="ts">
	import type { ColumnDef } from "@tanstack/table-core";
	import type { Memory } from "$lib/controllers/MemoryController.js";

	import Datatable from "./DataTable.svelte";
	import DataTableActions from "./DataTableActions.svelte";
	import { renderComponent } from "$lib/components/ui/data-table/index.js";

	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import { enhance } from "$app/forms";

	let { data } = $props();

	export const columns: ColumnDef<Memory>[] = [
		{
			accessorKey: "id",
			header: "ID",
		},
		{
			accessorKey: "title",
			header: "Title",
		},
		{
			accessorKey: "distance",
			header: "Distance",
		},
		{
			id: "actions",
			cell: ({ row }) => {
				// You can pass whatever you need from `row.original` to the component
				return renderComponent(DataTableActions, {
					id: row.original.id,
				});
			},
		},
	];
</script>

<svelte:head>
	<title>Memorag</title>
</svelte:head>
<div class="flex gap-8 mx-auto mb-8">
	<form method="GET" action="/app" class="relative w-full">
		<SearchIcon
			class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
		/>
		<Input
			type="search"
			name="q"
			value={data.q}
			placeholder="Semantic search..."
			class="w-full pl-8 h-9 bg-muted/50 focus-visible:bg-background transition-colors"
		/>
	</form>
	<Dialog.Root>
		<Dialog.Trigger
			type="button"
			class={buttonVariants({
				variant: "ghost",
				size: "sm",
				class: "h-9",
			})}
		>
			<PlusIcon class="size-4 sm:mr-2" />
			<span class="hidden sm:inline">Add Memory</span>
		</Dialog.Trigger>

		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Add new memory</Dialog.Title>
				<Dialog.Description>
					Add memory to the RAG that can be retrieved later.
				</Dialog.Description>
			</Dialog.Header>

			<form
				method="POST"
				use:enhance
				action="?/add"
				class="grid gap-4 py-4"
			>
				<div class="grid gap-2">
					<Label for="title">Title</Label>
					<Input
						id="title"
						name="title"
						required
						placeholder="Memory title..."
					/>
				</div>
				<div class="grid gap-2">
					<Label for="content">Content</Label>
					<Textarea
						id="content"
						name="content"
						required
						placeholder="Type your context here..."
						class="min-h-25"
					/>
				</div>

				<Dialog.Footer class="flex gap-2">
					<Dialog.Close
						type="button"
						class={buttonVariants({ variant: "ghost" })}
					>
						Cancel
					</Dialog.Close>
					<Dialog.Close
						type="submit"
						class={buttonVariants({ variant: "default" })}
					>
						Create
					</Dialog.Close>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
<Datatable {columns} data={data.memories}></Datatable>
