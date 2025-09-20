<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel } from '$lib/types';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { getChainById } from '$lib/ctypto/utils';
	import Chain from '$lib/components/Chain.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import { ExternalLink, CreditCard, Network } from 'lucide-svelte';

	export let channels: Channel[];
	export let address: string;
	export let addressType: string | undefined;
	export let pagination: any = null;
	export let onPageChange: (page: number) => void = () => {};
	export let onPageSizeChange: (size: number) => void = () => {};

	function getStatusVariant(status: string): 'default' | 'destructive' {
		return status.toLowerCase() === 'open' || status.toLowerCase() === 'active'
			? 'default'
			: 'destructive';
	}

	function getStatusClass(status: string) {
		return status.toLowerCase() === 'open' || status.toLowerCase() === 'active'
			? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
			: 'capitalize';
	}
</script>

<div class="bg-card border border-border rounded-lg">
	<Table.Root>
		<Table.Header>
			<Table.Row class="hover:bg-transparent border-b border-border">
				<Table.Head class="font-medium text-muted-foreground text-sm">Channel ID</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Counterparty</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm text-right">Amount</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Status</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Chain</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Updated</Table.Head>
				<!-- Hide Action column for node types -->
				{#if addressType !== 'node'}
					<Table.Head class="font-medium text-muted-foreground text-sm">Action</Table.Head>
				{/if}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each channels as channel (channel.channel_id)}
				{@const counterparty = channel.wallet === address ? channel.participant : channel.wallet}
				{@const chain = getChainById(Number(channel.chain_id))}
				<Table.Row class="hover:bg-muted/50">
					<Table.Cell class="font-sans">
						<div class="flex items-center gap-2">
							<a
								href={`/channel/${channel.channel_id}`}
								class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
								title={channel.channel_id}
							>
								{shortHex(channel.channel_id, 12, 8)}
							</a>
							<CopyButton value={channel.channel_id} />
						</div>
					</Table.Cell>
					<Table.Cell class="font-sans">
						<div class="flex items-center gap-2">
							<AddressAvatar address={counterparty} size={24} />
							<a
								href={`/address/${counterparty}`}
								class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
								title={counterparty}
							>
								{shortHex(counterparty, 6, 4)}
							</a>
							<CopyButton value={counterparty} />
						</div>
					</Table.Cell>
					<Table.Cell class="text-right font-sans text-sm uppercase">
						{formatAmount(
							channel.amount,
							channel.asset?.decimals ? parseInt(channel.asset.decimals) : 18,
							4
						)}
						{channel.asset?.symbol || 'ETH'}
					</Table.Cell>
					<Table.Cell>
						<Badge
							variant={getStatusVariant(channel.status)}
							class={getStatusClass(channel.status)}
						>
							{channel.status}
						</Badge>
					</Table.Cell>
					<Table.Cell>
						<Chain chainId={Number(channel.chain_id)} />
					</Table.Cell>
					<Table.Cell>
						<div class="text-sm text-muted-foreground">
							{timeAgo(channel.updated_at)}
						</div>
					</Table.Cell>
					<!-- Hide Action cell for node types -->
					{#if addressType !== 'node'}
						<Table.Cell>
							{#if chain}
								<a
									href={`${chain.blockExplorers?.default.url}/address/${counterparty}`}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
									title={`View ${counterparty} on ${chain.blockExplorers?.default.name}`}
								>
									<ExternalLink class="w-3 h-3" />
									Explorer
								</a>
							{/if}
						</Table.Cell>
					{/if}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={addressType === 'node' ? 6 : 7} class="h-32 text-center">
						<div class="flex flex-col items-center gap-3">
							{#if addressType === 'node'}
								<Network class="w-8 h-8 text-muted-foreground" />
								<div class="text-muted-foreground">
									<div class="font-medium">No channels found</div>
									<div class="text-sm">This node has no active payment channels.</div>
								</div>
							{:else}
								<CreditCard class="w-8 h-8 text-muted-foreground" />
								<div class="text-muted-foreground">
									<div class="font-medium">No channels found</div>
									<div class="text-sm">This address has no payment channels.</div>
								</div>
							{/if}
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<!-- Pagination for node addresses -->
{#if addressType === 'node' && pagination && pagination.total > 0}
	<div class="mt-6">
		<ChannelsPagination
			currentPage={pagination.page}
			totalRecords={pagination.total}
			recordsPerPage={pagination.limit}
			{onPageChange}
			{onPageSizeChange}
		/>
	</div>
{/if}
