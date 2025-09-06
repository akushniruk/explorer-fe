<script lang="ts">
	import { shortHex, formatAmount, formatSignificantWithSeparators } from '$lib/format';
	import AssetsTable from '$lib/components/AssetsTable.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import { createAssetsSEO } from '$lib/utils/seo';

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
	$: seoData = createAssetsSEO(data.total);

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
	<title>{seoData.title}</title>
	<meta name="description" content={seoData.description} />
	<meta name="keywords" content={seoData.keywords} />
	<meta name="author" content="ynscan" />
	<meta name="format-detection" content="telephone=no" />
	
	<!-- Open Graph meta tags -->
	<meta property="og:title" content={seoData.ogTitle} />
	<meta property="og:description" content={seoData.ogDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="ynscan" />
	<meta property="og:url" content={seoData.ogUrl} />
	<meta property="og:image" content={seoData.ogImage} />
	<meta property="og:image:alt" content="Visit ynscan" />
	
	<!-- Twitter meta tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seoData.twitterTitle} />
	<meta name="twitter:description" content={seoData.twitterDescription} />
	<meta name="twitter:site" content="@yellownetwork" />
	<meta property="twitter:image" content={seoData.ogImage} />
	<meta name="twitter:image:alt" content="Visit ynscan" />
	
	<link rel="canonical" href={seoData.canonical} />
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
