<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ChannelsTable from '$lib/components/ChannelsTable.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import type { PageData } from './$types';
	import type { Channel } from '$lib/types';
	import { createChannelsListSEO } from '$lib/utils/seo';
	import { PUBLIC_API_BASE } from '$env/static/public';

	export let data: PageData;

	// Simple reactive state
	let channels: Channel[] = data.channels;
	let total = data.total;
	let currentPage = data.page;
	let limit = data.limit;
	let loading = false;

	$: seoData = createChannelsListSEO(total, currentPage);

	// Read filters from URL
	$: q = $page.url.searchParams.get('q') ?? '';
	$: status = $page.url.searchParams.get('status') ?? 'all';
	$: sortBy = $page.url.searchParams.get('sort') ?? 'updated_at';
	$: sortOrder = ($page.url.searchParams.get('order') ?? 'desc') as 'asc' | 'desc';

	async function fetchChannels() {
		loading = true;
		try {
			const params = new URLSearchParams();
			params.set('page', currentPage.toString());
			params.set('limit', limit.toString());
			if (q) params.set('q', q);
			if (status && status !== 'all') params.set('status', status);
			if (sortBy) params.set('sort', sortBy);
			if (sortOrder) params.set('order', sortOrder);

			const response = await fetch(
				`${PUBLIC_API_BASE}/api/v1/channel/list?${params.toString()}`
			);
			const result = await response.json();

			if (result.success) {
				channels = result.data.items;
				total = result.meta.pagination.total;
			}
		} catch (error) {
			console.error('Failed to fetch channels:', error);
		} finally {
			loading = false;
		}
	}

	function updateUrl() {
		const url = new URL($page.url);
		url.searchParams.set('page', currentPage.toString());
		url.searchParams.set('limit', limit.toString());
		history.replaceState(null, '', url);
	}

	async function onPageChange(p: number) {
		currentPage = p;
		updateUrl();
		await fetchChannels();
	}

	async function onPageSizeChange(size: number) {
		limit = size;
		currentPage = 1;
		updateUrl();
		await fetchChannels();
	}

	function onSort(key: string) {
		const next = sortBy === key ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc';
		const url = new URL($page.url);
		url.searchParams.set('sort', key);
		url.searchParams.set('order', next);
		url.searchParams.set('page', '1');
		goto(url, { keepFocus: true, replaceState: true });
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
	<meta name="twitter:site" content="@ynscan" />
	<meta property="twitter:image" content={seoData.ogImage} />
	<meta name="twitter:image:alt" content="Visit ynscan" />
	
	<link rel="canonical" href={seoData.canonical} />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-6">
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold">Channels</h1>
	</div>

	<!-- Table -->
	<ChannelsTable
		{channels}
		nodeConfig={data.nodeConfig}
		sortKey={sortBy}
		sortDirection={sortOrder}
		{onSort}
		emptyMessage="No channels found for your filters."
		{loading}
		pageSize={limit}
	/>

	<!-- Bottom pagination -->
	{#key `${currentPage}-${limit}-${total}`}
		<ChannelsPagination
			{currentPage}
			totalRecords={total}
			recordsPerPage={limit}
			{onPageChange}
			{onPageSizeChange}
			{loading}
		/>
	{/key}
</div>
