<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ChannelsTable from '$lib/components/ChannelsTable.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// read from URL (single source of truth)
	function qp(name: string, fallback = '') {
		return $page.url.searchParams.get(name) ?? fallback;
	}
	$: q = qp('q', '');
	$: status = qp('status', 'all');
	$: sortBy = qp('sortBy', qp('sort', 'updated_at'));
	$: sortOrder = qp('sortOrder', qp('order', 'desc')) as 'asc' | 'desc';

	function setQuery(updates: Record<string, string | number | null>) {
		const url = new URL($page.url);
		for (const [k, v] of Object.entries(updates)) {
			if (v === null || v === '' || v === undefined) url.searchParams.delete(k);
			else url.searchParams.set(k, String(v));
		}
		// reset page on filter/sort change unless explicitly set
		if (!('page' in updates)) url.searchParams.set('page', '1');
		goto(url, { keepFocus: true, replaceState: true });
	}

	// debounced search
	let t: ReturnType<typeof setTimeout> | null = null;
	function onSearchInput(val: string) {
		if (t) clearTimeout(t);
		t = setTimeout(() => setQuery({ q: val }), 250);
	}

	function onSort(key: string) {
		const next = sortBy === key ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc';
		// prefer canonical backend params: sort + order
		setQuery({ sort: key, order: next, sortBy: null, sortOrder: null });
	}

	function onPageChange(p: number) {
		setQuery({ page: p });
	}
	function onPageSizeChange(size: number) {
		setQuery({ limit: size, page: 1 });
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
		channels={data.channels}
		sortKey={sortBy}
		sortDirection={sortOrder}
		{onSort}
		emptyMessage="No channels found for your filters."
	/>

	<!-- Bottom pagination -->
	<ChannelsPagination
		currentPage={data.page}
		totalPages={Math.max(1, Math.ceil(data.total / data.limit))}
		totalRecords={data.total}
		recordsPerPage={data.limit}
		{onPageChange}
		{onPageSizeChange}
	/>
</div>
