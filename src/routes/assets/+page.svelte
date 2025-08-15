<script lang="ts">
	import { shortHex, formatAmount } from '$lib/format';
	import AssetsTable from '$lib/components/AssetsTable.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';

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
	<meta
		name="description"
		content="Explore blockchain assets on The Yellow Network. View token contracts, decimals, supply information, and asset statistics across supported networks."
	/>
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
					class="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
				/>
			</div>

			<!-- Chain Filter -->
			<div>
				<label for="chain" class="block text-sm font-medium mb-2">Chain</label>
				<select
					id="chain"
					bind:value={chainFilter}
					class="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
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
					class="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted/50"
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
	<AssetsTable assets={filteredAssets} emptyMessage="No assets found matching your filters." />

	<!-- Pagination -->
	{#if data.page && data.limit}
		<ChannelsPagination
			currentPage={data.page}
			totalPages={Math.ceil(data.total / data.limit)}
			totalRecords={data.total}
			recordsPerPage={data.limit}
			onPageChange={handlePageChange}
			onPageSizeChange={handlePageSizeChange}
		/>
	{/if}
</div>
