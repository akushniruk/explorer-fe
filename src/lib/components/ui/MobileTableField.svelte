<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		value?: Snippet;
		class?: string;
	};

	let { label, value, class: className = '' }: Props = $props();
</script>

<div class="flex flex-col {className}">
	{#if value}
		{@render value()}
	{/if}
	<span class="text-xs text-muted-foreground">{label}</span>
</div>
