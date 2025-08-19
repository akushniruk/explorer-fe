<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ChannelsTable from '$lib/components/ChannelsTable.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import type { PageData } from './$types';
	import type { Channel } from '$lib/types';

	export let data: PageData;

	// Simple reactive state
	let channels: Channel[] = data.channels;
	let total = data.total;
	let currentPage = data.page;
	let limit = data.limit;
	let loading = false;

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
				`http://localhost:3000/api/v1/channel/list?${params.toString()}`
			);
			const result = await response.json();

			if (result.success) {
				channels = result.data;
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
	<title>Channels | ynscan</title>
	<meta
		name="description"
		content="Browse all payment channels on The Yellow Network. Track states, participants, and asset flows."
	/>
	<link rel="canonical" href="https://ynscan.xyz/channels" />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-6">
	<div class="mb-6">
		<h1 class="mb-2 text-3xl font-bold">Channels</h1>
	</div>

	<!-- Table -->
	<ChannelsTable
		{channels}
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
