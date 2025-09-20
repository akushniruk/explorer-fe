<script lang="ts">
	import { shortHex } from '$lib/format';
	import type { Node } from '$lib/types';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { ExternalLink } from 'lucide-svelte';

	export let address: string;
	export let addressType: string | undefined;
	export let lookupType: string | undefined;
	export let wallet: string | undefined;
	export let participants: string[];
	export let node: Node | null;

	$: displayAddressType =
		addressType === 'node'
			? 'Node'
			: lookupType === 'wallet'
				? 'Wallet'
				: lookupType === 'participant'
					? 'Session Key'
					: 'Address';
</script>

<div class="flex items-start justify-between mb-4">
	<div class="flex items-start gap-4">
		<AddressAvatar {address} size={64} />
		<div class="flex-1">
			<h1 class="text-3xl font-bold mb-2">
				{#if addressType === 'node' && node}
					{node.name}
				{:else}
					{displayAddressType} Details
				{/if}
			</h1>
			<div class="flex items-center gap-2 mb-2">
				{#if addressType === 'node' && node}
					<span class="text-text">Node ID:</span>
					<code class="font-sans text-lg py-1 rounded text-text" title={address}>
						{shortHex(address, 10, 8)}
					</code>
					<CopyButton value={address} />
					{#if node.website_host}
						<a
							href={`https://${node.website_host}`}
							target="_blank"
							rel="noopener noreferrer"
							class="ml-2 text-brand hover:text-brand/80"
							title="Visit node website"
						>
							<ExternalLink class="w-4 h-4" />
						</a>
					{/if}
				{:else}
					<span class="text-text">{displayAddressType}:</span>
					<code class="font-sans text-lg py-1 rounded text-text" title={address}>
						{shortHex(address, 8, 8)}
					</code>
					<CopyButton value={address} />
				{/if}
			</div>

			<!-- Relationship Information -->
			{#if lookupType === 'wallet' && participants.length > 0}
				<div class="flex items-center gap-2 mb-2">
					<span class="text-text">Session Keys ({participants.length}):</span>
					<div class="flex flex-wrap gap-1">
						{#each participants.slice(0, 3) as participant}
							<a
								href={`/address/${participant}`}
								class="text-sm bg-secondary px-2 py-1 rounded hover:bg-secondary/80 font-sans"
								title={participant}
							>
								{shortHex(participant, 6, 4)}
							</a>
						{/each}
						{#if participants.length > 3}
							<span class="text-sm text-text">+{participants.length - 3} more</span>
						{/if}
					</div>
				</div>
			{:else if lookupType === 'participant' && wallet}
				<div class="flex items-center gap-2 mb-2">
					<span class="text-text">Main Wallet:</span>
					<a
						href={`/address/${wallet}`}
						class="font-sans text-brand hover:text-brand/80"
						title={wallet}
					>
						{shortHex(wallet, 8, 8)}
					</a>
					<CopyButton value={wallet} />
				</div>
			{/if}
		</div>
	</div>
</div>
