<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SessionsTable from '$lib/components/SessionsTable.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import type { AppSession } from '$lib/types';
	import { createSessionsListSEO } from '$lib/utils/seo';
	import { PUBLIC_API_BASE } from '$env/static/public';

	export let data: {
		sessions: AppSession[];
		total: number;
		page: number;
		limit: number;
	};

	// Simple reactive state
	let sessions: AppSession[] = data.sessions;
	let total = data.total;
	let currentPage = data.page;
	let limit = data.limit;
	let loading = false;

	$: totalPages = Math.max(1, Math.ceil(total / limit));
	$: seoData = createSessionsListSEO(total, currentPage);

	// Read filters from URL
	$: q = $page.url.searchParams.get('q') ?? '';
	$: status = $page.url.searchParams.get('status') ?? 'all';
	$: sortBy = $page.url.searchParams.get('sort') ?? 'updated_at';
	$: sortOrder = ($page.url.searchParams.get('order') ?? 'desc') as 'asc' | 'desc';

	async function fetchSessions() {
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
				`${PUBLIC_API_BASE}/api/v1/app-session/list?${params.toString()}`
			);
			const result = await response.json();

			if (result.success) {
				sessions = result.data.items;
				total = result.meta.pagination.total;
			}
		} catch (error) {
			console.error('Failed to fetch sessions:', error);
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
		await fetchSessions();
	}

	async function onPageSizeChange(size: number) {
		const currentRecord = (currentPage - 1) * limit + 1;
		const newPage = Math.max(1, Math.ceil(currentRecord / size));

		currentPage = newPage;
		limit = size;

		const url = new URL($page.url);
		url.searchParams.set('limit', size.toString());
		url.searchParams.set('page', newPage.toString());
		history.replaceState(null, '', url);

		await fetchSessions();
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

	<link rel="canonical" href={seoData.canonical} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">App Sessions</h1>
	</div>

	<!-- Sessions Table -->
	<SessionsTable
		{sessions}
		sortKey={sortBy}
		sortDirection={sortOrder}
		{onSort}
		emptyMessage="No sessions found matching your filters."
		pageSize={limit}
		{loading}
	/>

	<!-- Pagination -->
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
