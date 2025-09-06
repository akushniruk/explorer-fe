<script lang="ts">
	import { shortHex, formatAmount, formatSignificantWithSeparators } from '$lib/format';
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
	<title>Assets | ynscan</title>
	<meta name="description" content="Explore assets on The Yellow Network." />
	<link rel="canonical" href="https://ynscan.xyz/assets" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Assets</h1>
	</div>

	<!-- Assets Table -->
	<AssetsTable assets={filteredAssets} emptyMessage="No assets found matching your filters." />

	<!-- Pagination -->
	{#if data.page && data.limit}
		<ChannelsPagination
			currentPage={data.page}
			totalRecords={data.total}
			recordsPerPage={data.limit}
			onPageChange={handlePageChange}
			onPageSizeChange={handlePageSizeChange}
		/>
	{/if}
</div>
