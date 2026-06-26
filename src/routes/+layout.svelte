<script lang="ts">
	import { ModeWatcher } from "mode-watcher";

	let { children, data } = $props();

	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

{@render children()}
