<script lang="ts">
	import { shortHex, formatAmount, formatSignificantWithSeparators } from '$lib/format';
	import * as Table from '$lib/components/ui/table';
	import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-svelte';
	import Chain from './Chain.svelte';
	import { getChainById } from '$lib/ctypto/utils';
	import CopyButton from './ui/CopyButton.svelte';
	import TokenIcon from './ui/TokenIcon.svelte';
	import { groupAssetsBySymbol, type GroupedAsset } from '$lib/utils/token-grouping';

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

	export let assets: Asset[] = [];
	export let sortKey = '';
	export let sortDirection: 'asc' | 'desc' = 'desc';
	export let onSort: ((key: string) => void) | null = null;
	export let loading = false;
	export let emptyMessage = 'No assets found for your filters.';
	export let groupedView = true;

	let expandedTokens = new Set<string>();

	$: groupedAssets = groupedView ? groupAssetsBySymbol(assets) : [];

	function toggleExpand(symbol: string) {
		const newExpanded = new Set(expandedTokens);
		if (newExpanded.has(symbol)) {
			newExpanded.delete(symbol);
		} else {
			newExpanded.add(symbol);
		}
		expandedTokens = newExpanded;
	}

	type Column = {
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
	};

	const columns: Column[] = [
		{ key: 'symbol', label: 'Asset', sortable: false },
		{
			key: 'contract_address',
			label: groupedView ? 'Contract Details' : 'Contract Address',
			sortable: false
		},
		{ key: 'chain_id', label: groupedView ? 'Chains' : 'Chain', sortable: false },
		{ key: 'decimals', label: 'Decimals', sortable: false }
	];

	function triggerSort(col: Column) {
		if (!col?.sortable || !onSort) return;
		onSort(col.key);
	}

	function getSortIcon(column: Column) {
		if (!column.sortable) return null;
		if (sortKey !== column.key) return ChevronsUpDown;
		return sortDirection === 'asc' ? ChevronUp : ChevronDown;
	}

	function getBlockExplorerUrl(address: string, chainId: number) {
		const chain = getChainById(chainId);
		if (!chain?.blockExplorers?.default.url) return null;
		return `${chain.blockExplorers.default.url}/address/${address}`;
	}
</script>

<div class="bg-card border border-border rounded-lg">
	<div class="overflow-x-auto">
		<Table.Root class="min-w-[600px]">
			<Table.Header>
				<Table.Row class="hover:bg-transparent border-b border-border">
					{#each columns as column}
						<Table.Head
							class="h-12 {column.align === 'right' ? 'text-right' : 'text-left'} {column.sortable
								? 'cursor-pointer select-none'
								: ''}"
							onclick={() => triggerSort(column)}
						>
							<div class="flex items-center gap-2 {column.align === 'right' ? 'justify-end' : ''}">
								<span class="font-medium text-muted-foreground text-sm">{column.label}</span>
								{#if column.sortable}
									{@const IconComponent = getSortIcon(column)}
									{#if IconComponent}
										<IconComponent class="h-4 w-4 text-muted-foreground" />
									{/if}
								{/if}
							</div>
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					{#each Array(10) as _}
						<Table.Row>
							{#each columns as _}
								<Table.Cell>
									<div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{:else if assets.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
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
								<div class="flex items-center gap-3">
									<TokenIcon symbol={asset.symbol} logoUrl={asset.logo_url} size={24} />
									<div class="flex items-baseline gap-1">
										<div class="text-xs text-muted-foreground">{asset.name}</div>
										<div class="font-semibold text-sm uppercase">({asset.symbol})</div>
									</div>
								</div>
							</Table.Cell>

							<!-- Contract Details -->
							<Table.Cell>
								{#if asset.chains.length === 1}
									{@const chain = asset.chains[0]}
									{@const blockExplorerUrl = getBlockExplorerUrl(
										chain.contract_address,
										Number(chain.chain_id)
									)}
									<div class="flex items-center gap-2">
										<a
											href={blockExplorerUrl}
											class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
											title={chain.contract_address}
											target="_blank"
										>
											{shortHex(chain.contract_address, 12, 8)}
										</a>
										<CopyButton value={chain.contract_address} />
									</div>
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
											<span class="text-xs text-muted-foreground"
												>+{asset.totalChains - 3} more</span
											>
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
										<div class="flex items-center gap-2">
											<a
												href={blockExplorerUrl}
												class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
												title={chain.contract_address}
												target="_blank"
											>
												{shortHex(chain.contract_address, 12, 8)}
											</a>
											<CopyButton value={chain.contract_address} />
										</div>
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
								<div class="flex items-center gap-3">
									<TokenIcon symbol={asset.symbol} logoUrl={asset.logo_url} size={24} />
									<div class="flex items-baseline gap-1">
										<div class="text-xs text-muted-foreground">{asset.name}</div>
										<div class="font-semibold text-sm uppercase">({asset.symbol})</div>
									</div>
								</div>
							</Table.Cell>

							<!-- Contract Address -->
							<Table.Cell class="font-sans">
								<div class="flex items-center gap-2">
									<a
										href={blockExplorerUrl}
										class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
										title={asset.contract_address}
										target="_blank"
									>
										{shortHex(asset.contract_address, 12, 8)}
									</a>
									<CopyButton value={asset.contract_address} />
								</div>
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
			</Table.Body>
		</Table.Root>
	</div>
</div>
