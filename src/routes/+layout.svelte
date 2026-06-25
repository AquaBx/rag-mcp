<script lang="ts">
	// 1. Svelte, SvelteKit & Runes
	import { enhance } from "$app/forms";
	import { ModeWatcher } from "mode-watcher";

	let { children, data } = $props();

	// 2. Assets & Styles
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";

	// 3. Composants UI (Shadcn)
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as NavigationMenu from "$lib/components/ui/navigation-menu";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	// 4. Icônes (Lucide)
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";
	import KeyIcon from "@lucide/svelte/icons/key";
	import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";

	const links = [{ text: "Home", url: "/" }];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<nav
	class="sticky flex flex-between p-4 top-0 z-50 w-dvw border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
>
	<NavigationMenu.Root>
		<NavigationMenu.List class="flex-wrap">
			{#each links as { text, url }}
				<NavigationMenu.Item>
					<NavigationMenu.Link>
						{#snippet child()}
							<a href={url} class={navigationMenuTriggerStyle()}>
								{text}
							</a>
						{/snippet}
					</NavigationMenu.Link>
				</NavigationMenu.Item>
			{/each}
		</NavigationMenu.List>
	</NavigationMenu.Root>

	<div class="flex-1 max-w-md mx-auto hidden sm:block">
		<form method="GET" action="/" class="relative w-full">
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
	</div>

	<div class="flex items-center gap-3">
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
					action="/?/add"
					class="grid gap-4 py-4"
				>
					<div class="grid gap-2">
						<Label for="title">Title</Label>
						<Input
							id="title"
							name="title"
							placeholder="Memory title..."
						/>
					</div>
					<div class="grid gap-2">
						<Label for="content">Content</Label>
						<Textarea
							id="content"
							name="content"
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

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						variant="ghost"
						class="h-9 w-9 p-0 sm:w-auto sm:px-2 sm:gap-2 border hover:bg-muted"
						{...props}
					>
						<Avatar.Root class="size-6 rounded-md">
							<Avatar.Fallback class="rounded-md text-[10px]">
								{data.user
									? data.user.name
											.substring(0, 2)
											.toUpperCase()
									: "CN"}
							</Avatar.Fallback>
						</Avatar.Root>
						<span
							class="truncate font-medium text-xs hidden sm:inline"
						>
							{data.user ? data.user.name : "User Name"}
						</span>
						<ChevronsUpDownIcon
							class="size-3 text-muted-foreground hidden sm:block"
						/>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				side="bottom"
				align="end"
				sideOffset={8}
				class="w-48"
			>
				<DropdownMenu.Item
					class="cursor-pointer"
					onclick={() => {
						window.location.href = "/tokens";
					}}
				>
					<KeyIcon class="mr-2 size-4" />
					API Tokens
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					class="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
					onclick={() => {
						window.location.href = "/auth/logout";
					}}
				>
					<LogOutIcon class="mr-2 size-4" />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</nav>

<main class="w-dvw max-w-7xl mx-auto p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
	{@render children()}
</main>
