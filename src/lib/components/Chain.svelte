<script lang="ts">
	import { getChainById } from '$lib/ctypto/utils';

	export let chainId: number;

	const chain = getChainById(chainId);
</script>

{#if chain}
	<div class="flex items-center gap-2">
		<img
			src="https://icons.llamao.fi/icons/chains/rsz_{chain.name.toLowerCase()}.jpg"
			alt={chain.name}
			class="h-4 w-4 rounded-full"
		/>
		<span>{chain.name}</span>
	</div>
{:else}
	<span>-</span>
{/if}
