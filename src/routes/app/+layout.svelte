<script lang="ts">
	// 1. Svelte, SvelteKit & Runes
	import { enhance } from "$app/forms";

	let { children, data } = $props();

	// 2. Assets & Styles
	import favicon from "$lib/assets/favicon.svg";

	// 3. Composants UI (Shadcn)
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import * as NavigationMenu from "$lib/components/ui/navigation-menu";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	// 4. Icônes (Lucide)
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import KeyIcon from "@lucide/svelte/icons/key";
	import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
	import { signOut } from "@auth/sveltekit/client";
	import { goto } from "$app/navigation";

	const links = [{ text: "Home", url: "/app" }];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

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

	<div class="flex items-center gap-3">

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
								{data.session.user.name[0]}
							</Avatar.Fallback>
						</Avatar.Root>
						<span
							class="truncate font-medium text-xs hidden sm:inline"
						>
							{data.session.user.name}
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
					onclick={() => goto("/app/tokens")}
				>
					<KeyIcon class="mr-2 size-4" />
					API Tokens
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					class="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
					onclick={() => signOut()}
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
