<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		header?: Snippet;
		fields?: Snippet;
		class?: string;
		href?: string;
		showTopBorder?: boolean;
		onclick?: () => void;
	};

	let {
		header,
		fields,
		class: className = '',
		href,
		showTopBorder = false,
		onclick
	}: Props = $props();

	function handleClick() {
		if (onclick) {
			onclick();
		} else if (href) {
			window.location.href = href;
		}
	}
</script>

{#if href || onclick}
	<button
		data-testid="mobile-table-card"
		class="grid grid-cols-2 grid-flow-row gap-y-2 py-2 w-full hover:bg-muted/30 transition-colors text-left {className}"
		onclick={handleClick}
		type="button"
	>
		{#if header}
			<div class="col-span-2">
				{@render header()}
			</div>
		{/if}

		{#if fields}
			{@render fields()}
		{/if}
	</button>
{:else}
	<div
		data-testid="mobile-table-card"
		class="grid grid-cols-2 grid-flow-row gap-y-2 py-2 w-full {className}"
	>
		{#if header}
			<div class="col-span-2">
				{@render header()}
			</div>
		{/if}

		{#if fields}
			{@render fields()}
		{/if}
	</div>
{/if}
