<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';

	let mounted = false;
	let DialogRoot: Component;
	let DialogTrigger: Component;
	let DialogContent: Component;
	let DialogTitle: Component;

	export let title = 'Details';
	export let trigger = 'Open';

	onMount(async () => {
		const m = await import('bits-ui'); // ~0 JS on first load until user opens
		DialogRoot = m.Dialog.Root;
		DialogTrigger = m.Dialog.Trigger;
		DialogContent = m.Dialog.Content;
		DialogTitle = m.Dialog.Title;
		mounted = true;
	});
</script>

{#if mounted}
	<DialogRoot>
		<DialogTrigger>
			<button class="h-9 px-3 rounded-md border border-border hover:bg-muted text-sm"
				>{trigger}</button
			>
		</DialogTrigger>
		<DialogContent
			class="rounded-xl border border-border bg-bg/95 backdrop-blur p-4 max-w-lg w-[90vw]"
		>
			<DialogTitle class="text-sm font-medium text-muted-foreground">{title}</DialogTitle>
			<div class="mt-3">
				<slot />
			</div>
		</DialogContent>
	</DialogRoot>
{/if}
