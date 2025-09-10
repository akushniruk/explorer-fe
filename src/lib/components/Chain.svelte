<script lang="ts">
	import { getChainById } from '$lib/ctypto/utils';

	export let chainId: number;

	const chain = getChainById(chainId);

	const chainIconMap: Record<number, string> = {
		1: 'ethereum',
		137: 'polygon',
		30: 'rootstock', // Rootstock Mainnet
		747: 'flow', // Flow EVM Mainnet
		480: 'World Chain',
		59144: 'linea', // Linea Mainnet
	};

	const iconSlug = chain
		? (chainIconMap[chain.id] ?? chain.name.toLowerCase().replace(/\s+/g, ''))
		: null;
</script>

{#if chain}
	<div class="flex items-center gap-2">
		{#if iconSlug}
			<img
				src={`https://icons.llamao.fi/icons/chains/rsz_${iconSlug}.jpg`}
				alt={chain.name}
				class="h-4 w-4 rounded-full"
			/>
		{/if}
		<span>{chain.name}</span>
	</div>
{:else}
	<span>-</span>
{/if}
