<script lang="ts">
	import { CheckIcon, CopyIcon } from "lucide-svelte";
	import { Button } from "./components/ui/button";

	let copied = $state(false);

	async function copyText(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error("Failed to copy configuration: ", err);
		}
	}

	const { content } = $props();
</script>

<div class="relative group">
	<pre class="bg-zinc-950 p-4 rounded-xl border border-zinc-850 font-mono text-[11px] text-zinc-300 overflow-x-auto shadow-inner select-all">{content}</pre>
	<Button
		variant="outline"
		size="sm"
		onclick={() => copyText(content)}
		class="absolute top-3 right-3 opacity-80 group-hover:opacity-100 transition-opacity size-8 p-0"
		title="Copier le fichier JSON"
	>
		{#if copied}
			<CheckIcon class="size-3.5 text-emerald-500" />
		{:else}
			<CopyIcon class="size-3.5" />
		{/if}
	</Button>
</div>
