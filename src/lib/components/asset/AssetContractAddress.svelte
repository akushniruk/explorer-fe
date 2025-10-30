<script lang="ts">
	import { shortHex } from '$lib/format';
	import CopyButton from '../ui/CopyButton.svelte';

	type Props = {
		contractAddress: string;
		blockExplorerUrl: string | null;
		class?: string;
	};

	let { contractAddress, blockExplorerUrl, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-2 {className}">
	<a
		href={blockExplorerUrl}
		class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
		title={contractAddress}
		target="_blank"
	>
		{shortHex(contractAddress, 12, 8)}
	</a>
	<CopyButton value={contractAddress} />
</div>
