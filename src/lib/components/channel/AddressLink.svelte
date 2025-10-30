<script lang="ts">
	import { shortHex } from '$lib/format';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';

	type Props = {
		address: string;
		label?: string;
		isNode?: boolean;
		class?: string;
	};

	let { address, label, isNode = false, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-1 {className}">
	{#if label}
		<span class="text-muted-foreground text-xs">{label}</span>
	{/if}
	<a
		href={`/address/${address}${isNode ? '?type=node' : ''}`}
		class="font-sans text-sm underline text-foreground hover:text-foreground cursor-pointer"
		title={address}
	>
		{shortHex(address, 6, 4)}
	</a>
	<CopyButton value={address} />
</div>
