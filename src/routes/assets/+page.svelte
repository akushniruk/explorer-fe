<script lang="ts">
	import { shortHex, formatAmount } from '$lib/format';
	import EtherscanTable from '$lib/components/EtherscanTable.svelte';
	import EtherscanPagination from '$lib/components/EtherscanPagination.svelte';

	export let data: {
		assets: Array<{
			id: string;
			symbol: string;
			name: string;
			contract_address: string;
			chain_id: string;
			decimals: number;
			total_supply?: string;
			logo_url?: string;
		}>;
		total: number;
		page: number;
		limit: number;
	};

	let searchQuery = '';
	let chainFilter = 'all';

	// Extract unique chains
	$: chains = [...new Set(data.assets.map((a) => a.chain_id))];

	// Client-side filtering
	$: filteredAssets = data.assets.filter((asset) => {
		const matchesSearch =
			searchQuery === '' ||
			asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
			asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			asset.contract_address.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesChain = chainFilter === 'all' || asset.chain_id === chainFilter;

		return matchesSearch && matchesChain;
	});

	const columns = [
		{ key: 'symbol', label: 'Asset', sortable: false },
		{ key: 'contract_address', label: 'Contract Address', sortable: false },
		{ key: 'chain_id', label: 'Chain', sortable: false },
		{ key: 'decimals', label: 'Decimals', sortable: false },
		{ key: 'total_supply', label: 'Total Supply', sortable: false }
	];

	function handlePageChange(page: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', page.toString());
		window.location.href = url.toString();
	}

	function handlePageSizeChange(size: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('limit', size.toString());
		url.searchParams.set('page', '1');
		window.location.href = url.toString();
	}
</script>

<svelte:head>
	<title>Blockchain Assets | YNScan - The Yellow Network Scanner</title>
	<meta name="description" content="Explore blockchain assets on The Yellow Network. View token contracts, decimals, supply information, and asset statistics across supported networks." />
	<link rel="canonical" href="https://ynscan.xyz/assets" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Blockchain Assets</h1>
		<p class="text-muted-foreground">
			Explore all assets tracked across the Yellow Network. Monitor token flows, contract addresses,
			and cross-chain activity.
		</p>
	</div>

	<!-- Filters and Search -->
	<div class="bg-card border border-border rounded-lg p-6 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Search -->
			<div>
				<label for="search" class="block text-sm font-medium mb-2">Search</label>
				<input
					id="search"
					type="text"
					placeholder="Symbol, name, or contract address..."
					bind:value={searchQuery}
					class="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
				/>
			</div>

			<!-- Chain Filter -->
			<div>
				<label for="chain" class="block text-sm font-medium mb-2">Chain</label>
				<select
					id="chain"
					bind:value={chainFilter}
					class="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
				>
					<option value="all">All Chains</option>
					{#each chains as chain}
						<option value={chain}>Chain {chain}</option>
					{/each}
				</select>
			</div>

			<!-- Clear Filters -->
			<div class="flex items-end">
				<button
					on:click={() => {
						searchQuery = '';
						chainFilter = 'all';
					}}
					class="px-4 py-2 text-sm text-brand border border-brand rounded-lg hover:bg-brand/10"
				>
					Clear Filters
				</button>
			</div>
		</div>

		<div class="mt-4">
			<p class="text-sm text-muted-foreground">
				Showing {filteredAssets.length} of {data.total} assets
			</p>
		</div>
	</div>

	<!-- Assets Table -->
	<EtherscanTable 
		{columns} 
		data={filteredAssets} 
		emptyMessage="No assets found matching your filters."
	>
		<svelte:fragment slot="default" let:row={asset}>
			<td class="px-4 py-3 whitespace-nowrap">
				<div class="flex items-center gap-3">
					{#if asset.logo_url}
						<img src={asset.logo_url} alt={asset.symbol} class="w-8 h-8 rounded-full" />
					{:else}
						<div class="w-8 h-8 bg-brand/20 rounded-full flex items-center justify-center">
							<span class="text-xs font-bold text-brand">{asset.symbol.charAt(0)}</span>
						</div>
					{/if}
					<div>
						<div class="font-semibold text-sm">{asset.symbol}</div>
						<div class="text-xs text-muted-foreground">{asset.name}</div>
					</div>
				</div>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<a
					href={`/asset/${asset.contract_address}`}
					class="font-mono text-sm text-brand hover:text-brand/80 transition-colors"
				>
					{shortHex(asset.contract_address, 12, 8)}
				</a>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<div class="text-sm font-medium">Chain {asset.chain_id}</div>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<div class="text-sm font-mono">{asset.decimals}</div>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				{#if asset.total_supply}
					<div class="text-sm font-mono">
						{formatAmount(asset.total_supply, asset.decimals, 2)}
					</div>
				{:else}
					<div class="text-sm text-muted-foreground">—</div>
				{/if}
			</td>
		</svelte:fragment>
	</EtherscanTable>

	<!-- Pagination -->
	{#if data.page && data.limit}
		<EtherscanPagination 
			currentPage={data.page}
			totalPages={Math.ceil(data.total / data.limit)}
			totalRecords={data.total}
			recordsPerPage={data.limit}
			onPageChange={handlePageChange}
			onPageSizeChange={handlePageSizeChange}
		/>
	{/if}
</div>
