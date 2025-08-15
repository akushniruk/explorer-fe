<script lang="ts">
	import { shortHex, timeAgo } from '$lib/format';
	import type { AppSession } from '$lib/types';
	import EtherscanTable from '$lib/components/EtherscanTable.svelte';
	import EtherscanPagination from '$lib/components/EtherscanPagination.svelte';

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

	const columns = [
		{ key: 'session_id', label: 'Session ID', sortable: true },
		{ key: 'protocol', label: 'Protocol', sortable: false },
		{ key: 'participants', label: 'Participants', sortable: false },
		{ key: 'channel_id', label: 'Channel', sortable: false },
		{ key: 'status', label: 'Status', sortable: true },
		{ key: 'updated_at', label: 'Updated', sortable: true }
	];

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
	<meta name="description" content="Browse all application sessions on The Yellow Network. Monitor session activity, participants, protocols, and real-time session statistics." />
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
					class="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
				/>
			</div>

			<!-- Status Filter -->
			<div>
				<label for="status" class="block text-sm font-medium mb-2">Status</label>
				<select
					id="status"
					bind:value={statusFilter}
					class="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
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
					class="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
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
					class="px-4 py-2 text-sm text-brand border border-brand rounded-lg hover:bg-brand/10"
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
	<EtherscanTable 
		{columns} 
		data={filteredSessions} 
		sortKey={sortBy} 
		sortDirection={sortOrder}
		onSort={handleSort}
		emptyMessage="No sessions found matching your filters."
	>
		<svelte:fragment slot="default" let:row={session}>
			<td class="px-4 py-3 whitespace-nowrap">
				<a
					href={`/session/${session.session_id}`}
					class="font-mono text-sm text-brand hover:text-brand/80 transition-colors"
				>
					{shortHex(session.session_id, 12, 8)}
				</a>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
					{session.protocol || 'unknown'}
				</span>
			</td>
			<td class="px-4 py-3">
				<div class="text-sm space-y-1">
					{#each session.participants.slice(0, 3) as participant, i}
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground text-xs">#{i + 1}:</span>
							<a
								href={`/participant/${participant}`}
								class="font-mono text-brand hover:text-brand/80 transition-colors"
							>
								{shortHex(participant, 6, 4)}
							</a>
						</div>
					{/each}
					{#if session.participants.length > 3}
						<div class="text-xs text-muted-foreground">
							+{session.participants.length - 3} more
						</div>
					{/if}
				</div>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				{#if session.channel_id}
					<a
						href={`/channel/${session.channel_id}`}
						class="font-mono text-sm text-brand hover:text-brand/80 transition-colors"
					>
						{shortHex(session.channel_id, 6, 4)}
					</a>
				{:else}
					<span class="text-muted-foreground text-sm">—</span>
				{/if}
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<span
					class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border"
					class:bg-green-50={session.status === 'active'}
					class:text-green-700={session.status === 'active'}
					class:border-green-200={session.status === 'active'}
					class:bg-gray-50={session.status === 'closed'}
					class:text-gray-600={session.status === 'closed'}
					class:border-gray-200={session.status === 'closed'}
					class:bg-yellow-50={session.status === 'pending'}
					class:text-yellow-700={session.status === 'pending'}
					class:border-yellow-200={session.status === 'pending'}
				>
					{session.status}
				</span>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<div class="text-sm text-muted-foreground">
					{timeAgo(session.updated_at)}
				</div>
			</td>
		</svelte:fragment>
	</EtherscanTable>

	<!-- Pagination -->
	<EtherscanPagination 
		currentPage={data.page}
		totalPages={Math.ceil(data.total / data.limit)}
		totalRecords={data.total}
		recordsPerPage={data.limit}
		onPageChange={handlePageChange}
		onPageSizeChange={handlePageSizeChange}
	/>
</div>
