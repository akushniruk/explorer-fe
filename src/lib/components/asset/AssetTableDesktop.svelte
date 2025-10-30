<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { ChevronRight } from 'lucide-svelte';
	import Chain from '../Chain.svelte';
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
		columnsCount?: number;
	};

	let {
		assets,
		groupedAssets,
		groupedView,
		expandedTokens,
		toggleExpand,
		loading = false,
		emptyMessage = 'No assets found',
		columnsCount = 4
	}: Props = $props();

	function getBlockExplorerUrl(address: string, chainId: number) {
		const chain = getChainById(chainId);
		if (!chain?.blockExplorers?.default.url) return null;
		return `${chain.blockExplorers.default.url}/address/${address}`;
	}
</script>

{#if loading}
	{#each Array(10) as _}
		<Table.Row>
			{#each Array(columnsCount) as _}
				<Table.Cell>
					<div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
				</Table.Cell>
			{/each}
		</Table.Row>
	{/each}
{:else if assets.length === 0}
	<Table.Row>
		<Table.Cell colspan={columnsCount} class="h-24 text-center text-muted-foreground">
			{emptyMessage}
		</Table.Cell>
	</Table.Row>
{:else if groupedView}
	{#each groupedAssets as asset}
		{@const isExpanded = expandedTokens.has(asset.symbol)}
		<!-- Main grouped row -->
		<Table.Row class="hover:bg-muted/50">
			<!-- Asset -->
			<Table.Cell>
				<AssetIcon symbol={asset.symbol} name={asset.name} logoUrl={asset.logo_url} />
			</Table.Cell>

			<!-- Contract Details -->
			<Table.Cell>
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
			</Table.Cell>

			<!-- Chains -->
			<Table.Cell>
				{#if asset.chains.length > 1}
					<button
						onclick={() => toggleExpand(asset.symbol)}
						class="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded p-1 -m-1 transition-colors cursor-pointer"
						title={isExpanded ? 'Collapse details' : 'Expand details'}
					>
						<div class="flex flex-wrap gap-1">
							{#each asset.chains.slice(0, 3) as chain}
								<Chain chainId={Number(chain.chain_id)} />
							{/each}
						</div>
						{#if asset.totalChains > 3}
							<span class="text-xs text-muted-foreground">+{asset.totalChains - 3} more</span>
						{/if}
						<ChevronRight
							class="h-4 w-4 transition-transform duration-200 text-muted-foreground {isExpanded
								? 'rotate-90'
								: ''}"
						/>
					</button>
				{:else}
					<div class="flex flex-wrap gap-1">
						{#each asset.chains as chain}
							<Chain chainId={Number(chain.chain_id)} />
						{/each}
					</div>
				{/if}
			</Table.Cell>

			<!-- Decimals -->
			<Table.Cell>
				{#if asset.chains.length === 1}
					<span class="text-sm font-sans">{asset.chains[0].decimals}</span>
				{:else}
					<span class="text-sm text-muted-foreground">-</span>
				{/if}
			</Table.Cell>
		</Table.Row>

		<!-- Expanded rows -->
		{#if isExpanded && asset.chains.length > 1}
			{#each asset.chains as chain}
				{@const blockExplorerUrl = getBlockExplorerUrl(
					chain.contract_address,
					Number(chain.chain_id)
				)}
				<Table.Row class="bg-muted/25">
					<Table.Cell class="pl-12">
						<!-- Empty for indentation -->
					</Table.Cell>
					<Table.Cell>
						<AssetContractAddress contractAddress={chain.contract_address} {blockExplorerUrl} />
					</Table.Cell>
					<Table.Cell>
						<Chain chainId={Number(chain.chain_id)} />
					</Table.Cell>
					<Table.Cell>
						<span class="text-sm font-sans">{chain.decimals}</span>
					</Table.Cell>
				</Table.Row>
			{/each}
		{/if}
	{/each}
{:else}
	{#each assets as asset}
		{@const blockExplorerUrl = getBlockExplorerUrl(
			asset.contract_address,
			Number(asset.chain_id)
		)}
		<Table.Row class="hover:bg-muted/50">
			<!-- Asset -->
			<Table.Cell>
				<AssetIcon symbol={asset.symbol} name={asset.name} logoUrl={asset.logo_url} />
			</Table.Cell>

			<!-- Contract Address -->
			<Table.Cell class="font-sans">
				<AssetContractAddress contractAddress={asset.contract_address} {blockExplorerUrl} />
			</Table.Cell>

			<!-- Chain -->
			<Table.Cell>
				<Chain chainId={Number(asset.chain_id)} />
			</Table.Cell>

			<!-- Decimals -->
			<Table.Cell>
				<span class="text-sm font-sans">{asset.decimals}</span>
			</Table.Cell>
		</Table.Row>
	{/each}
{/if}
