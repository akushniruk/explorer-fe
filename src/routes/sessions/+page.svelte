<script lang="ts">
	import SessionsTable from '$lib/components/SessionsTable.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import type { AppSession } from '$lib/types';

	export let data: {
		sessions: AppSession[];
		total: number;
		page: number;
		limit: number;
	};

	let searchQuery = '';
	let statusFilter = 'all';
	let protocolFilter = 'all';
	let sortBy = 'updated_at';
	let sortOrder: 'asc' | 'desc' = 'desc';

	// Extract unique protocols for filter
	$: protocols = [...new Set(data.sessions.map((s) => s.protocol || 'unknown'))];

	// Client-side filtering
	$: filteredSessions = data.sessions.filter((session) => {
		const matchesSearch =
			searchQuery === '' ||
			session.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			session.channel_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			session.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
		const matchesProtocol =
			protocolFilter === 'all' || (session.protocol || 'unknown') === protocolFilter;

		return matchesSearch && matchesStatus && matchesProtocol;
	});

	function handleSort(key: string) {
		if (sortBy === key) {
			sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
		} else {
			sortBy = key;
			sortOrder = 'desc';
		}
	}

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
	<title>App Sessions | ynscan</title>
	<meta name="description" content="Browse all application sessions on The Yellow Network." />
	<link rel="canonical" href="https://ynscan.xyz/sessions" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">App Sessions</h1>
	</div>

	<!-- Sessions Table -->
	<SessionsTable
		sessions={filteredSessions}
		sortKey={sortBy}
		sortDirection={sortOrder}
		onSort={handleSort}
		emptyMessage="No sessions found matching your filters."
	/>

	<!-- Pagination -->
	<ChannelsPagination
		currentPage={data.page}
		totalPages={Math.ceil(data.total / data.limit)}
		totalRecords={data.total}
		recordsPerPage={data.limit}
		onPageChange={handlePageChange}
		onPageSizeChange={handlePageSizeChange}
	/>
</div>
