<script lang="ts">
	import MobileTableCard from '$lib/components/ui/MobileTableCard.svelte';
	import MobileTableField from '$lib/components/ui/MobileTableField.svelte';
	import Chain from '../Chain.svelte';
	import { ChevronRight } from 'lucide-svelte';
	import { getChainById } from '$lib/ctypto/utils';
	import type { GroupedAsset } from '$lib/utils/token-grouping';
	import { AssetIcon, AssetContractAddress } from './index';

	type Asset = {
		id: string;
		symbol: string;
		name: string;
		contract_address: string;
		chain_id: string;
		decimals: number;
		total_supply?: string;
		logo_url?: string;
	};

	type Props = {
		assets: Asset[];
		groupedAssets: GroupedAsset[];
		groupedView: boolean;
		expandedTokens: Set<string>;
		toggleExpand: (symbol: string) => void;
		loading?: boolean;
		emptyMessage?: string;
		pageSize?: number;
	};

	let {
		assets,
		groupedAssets,
		groupedView,
		expandedTokens,
		toggleExpand,
		loading = false,
		emptyMessage = 'No assets found',
		pageSize = 10
	}: Props = $props();

	function getBlockExplorerUrl(address: string, chainId: number) {
		const chain = getChainById(chainId);
		if (!chain?.blockExplorers?.default.url) return null;
		return `${chain.blockExplorers.default.url}/address/${address}`;
	}
</script>

{#if loading}
	{#each Array(pageSize) as _}
		<MobileTableCard>
			{#snippet header()}
				<div class="flex flex-row items-center gap-2">
					<div class="h-6 w-6 animate-pulse rounded-full bg-muted"></div>
					<div class="h-4 w-32 animate-pulse rounded bg-muted"></div>
				</div>
			{/snippet}
			{#snippet fields()}
				<div class="h-16 w-full animate-pulse rounded bg-muted col-span-2"></div>
			{/snippet}
		</MobileTableCard>
	{/each}
{:else if assets.length === 0}
	<div class="p-8 text-center text-muted-foreground">{emptyMessage}</div>
{:else if groupedView}
	{#each groupedAssets as asset}
		{@const isExpanded = expandedTokens.has(asset.symbol)}
		<MobileTableCard
			class={asset.chains.length > 1 ? 'cursor-pointer' : ''}
			onclick={asset.chains.length > 1 ? () => toggleExpand(asset.symbol) : undefined}
		>
			{#snippet header()}
				<div class="flex flex-row items-center justify-between w-full">
					<AssetIcon symbol={asset.symbol} name={asset.name} logoUrl={asset.logo_url} size={24} />
					{#if asset.chains.length > 1}
						<ChevronRight
							class="h-5 w-5 transition-transform duration-200 text-muted-foreground {isExpanded
								? 'rotate-90'
								: ''}"
						/>
					{/if}
				</div>
			{/snippet}
			{#snippet fields()}
				<MobileTableField label="Contract">
					{#snippet value()}
						{#if asset.chains.length === 1}
							{@const chain = asset.chains[0]}
							{@const blockExplorerUrl = getBlockExplorerUrl(
								chain.contract_address,
								Number(chain.chain_id)
							)}
							<AssetContractAddress contractAddress={chain.contract_address} {blockExplorerUrl} />
						{:else}
							<span class="text-sm text-muted-foreground">
								{asset.chains.length} contracts
							</span>
						{/if}
					{/snippet}
				</MobileTableField>

				<MobileTableField label="Chains">
					{#snippet value()}
						<div class="flex flex-wrap gap-1">
							{#each asset.chains.slice(0, 2) as chain}
								<Chain chainId={Number(chain.chain_id)} />
							{/each}
							{#if asset.totalChains > 2}
								<span class="text-xs text-muted-foreground">+{asset.totalChains - 2}</span>
							{/if}
						</div>
					{/snippet}
				</MobileTableField>

				{#if asset.chains.length === 1}
					<div class="col-span-2 flex items-center gap-2 pt-2 mt-2">
						<span
							class="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg"
						>
							Decimals: {asset.chains[0].decimals}
						</span>
						<div class="flex-1 border-t border-border"></div>
					</div>
				{:else}
					<div class="col-span-2 pt-2 mt-2">
						<div class="flex-1 border-t border-border"></div>
					</div>
				{/if}
			{/snippet}
		</MobileTableCard>

		<!-- Expanded contract details -->
		{#if isExpanded && asset.chains.length > 1}
			{#each asset.chains as chain}
				{@const blockExplorerUrl = getBlockExplorerUrl(
					chain.contract_address,
					Number(chain.chain_id)
				)}
				<div class="bg-muted/25 py-2 grid grid-cols-2 gap-2">
					<MobileTableField label="Contract">
						{#snippet value()}
							<AssetContractAddress contractAddress={chain.contract_address} {blockExplorerUrl} />
						{/snippet}
					</MobileTableField>

					<MobileTableField label="Chain">
						{#snippet value()}
							<Chain chainId={Number(chain.chain_id)} />
						{/snippet}
					</MobileTableField>

					<div class="col-span-2 flex items-center gap-2 pt-2 mt-2">
						<span
							class="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg"
						>
							Decimals: {chain.decimals}
						</span>
						<div class="flex-1 border-t border-border"></div>
					</div>
				</div>
			{/each}
		{/if}
	{/each}
{:else}
	{#each assets as asset}
		{@const blockExplorerUrl = getBlockExplorerUrl(
			asset.contract_address,
			Number(asset.chain_id)
		)}
		<MobileTableCard>
			{#snippet header()}
				<div class="flex flex-row items-center w-full">
					<AssetIcon symbol={asset.symbol} name={asset.name} logoUrl={asset.logo_url} size={24} />
				</div>
			{/snippet}
			{#snippet fields()}
				<MobileTableField label="Contract">
					{#snippet value()}
						<AssetContractAddress contractAddress={asset.contract_address} {blockExplorerUrl} />
					{/snippet}
				</MobileTableField>

				<MobileTableField label="Chain">
					{#snippet value()}
						<Chain chainId={Number(asset.chain_id)} />
					{/snippet}
				</MobileTableField>

				<div class="col-span-2 flex items-center gap-2 pt-2 mt-2">
					<span class="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg">
						Decimals: {asset.decimals}
					</span>
					<div class="flex-1 border-t border-border"></div>
				</div>
			{/snippet}
		</MobileTableCard>
	{/each}
{/if}
