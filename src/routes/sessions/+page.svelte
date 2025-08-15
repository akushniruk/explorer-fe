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
	<title>App Sessions | YNScan - The Yellow Network Explorer</title>
	<meta
		name="description"
		content="Browse all application sessions on The Yellow Network. Monitor session activity, participants, protocols, and real-time session statistics."
	/>
	<link rel="canonical" href="https://ynscan.xyz/sessions" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">App Sessions</h1>
		<p class="text-muted-foreground">
			Monitor active sessions within state channels. View participant interactions, session states,
			and network activity.
		</p>
	</div>

	<!-- Filters and Search -->
	<div class="bg-card border border-border rounded-lg p-6 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Search -->
			<div>
				<label for="search" class="block text-sm font-medium mb-2">Search</label>
				<input
					id="search"
					type="text"
					placeholder="Session ID, channel, or participant..."
					bind:value={searchQuery}
					class="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
				/>
			</div>

			<!-- Status Filter -->
			<div>
				<label for="status" class="block text-sm font-medium mb-2">Status</label>
				<select
					id="status"
					bind:value={statusFilter}
					class="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
				>
					<option value="all">All Statuses</option>
					<option value="active">Active</option>
					<option value="closed">Closed</option>
					<option value="pending">Pending</option>
				</select>
			</div>

			<!-- Protocol Filter -->
			<div>
				<label for="protocol" class="block text-sm font-medium mb-2">Protocol</label>
				<select
					id="protocol"
					bind:value={protocolFilter}
					class="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
				>
					<option value="all">All Protocols</option>
					{#each protocols as protocol}
						<option value={protocol}>{protocol}</option>
					{/each}
				</select>
			</div>

			<!-- Clear Filters -->
			<div class="flex items-end">
				<button
					on:click={() => {
						searchQuery = '';
						statusFilter = 'all';
						protocolFilter = 'all';
					}}
					class="px-4 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-muted/50"
				>
					Clear Filters
				</button>
			</div>
		</div>

		<div class="mt-4">
			<p class="text-sm text-muted-foreground">
				Showing {filteredSessions.length} of {data.total} sessions
			</p>
		</div>
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
