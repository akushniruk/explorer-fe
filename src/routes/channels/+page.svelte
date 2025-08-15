<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel } from '$lib/types';
	import EtherscanTable from '$lib/components/EtherscanTable.svelte';
	import EtherscanPagination from '$lib/components/EtherscanPagination.svelte';

	export let data: {
		channels: Channel[];
		total: number;
		page: number;
		limit: number;
	};

	let searchQuery = '';
	let statusFilter = 'all';
	let sortBy = 'updated_at';
	let sortOrder: 'asc' | 'desc' = 'desc';

	// Client-side filtering
	$: filteredChannels = data.channels.filter((channel) => {
		const matchesSearch =
			searchQuery === '' ||
			channel.channel_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			channel.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
			channel.participant.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === 'all' || channel.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const columns = [
		{ key: 'channel_id', label: 'Channel ID', sortable: true },
		{ key: 'participants', label: 'Participants', sortable: false },
		{ key: 'amount', label: 'Amount', sortable: true },
		{ key: 'status', label: 'Status', sortable: true },
		{ key: 'chain_id', label: 'Chain', sortable: false },
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
	<title>Payment Channels | YNScan - The Yellow Network Explorer</title>
	<meta name="description" content="Browse all payment channels on The Yellow Network. View channel details, participants, amounts, and real-time status of active blockchain payment channels." />
	<link rel="canonical" href="https://ynscan.xyz/channels" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Payment Channels</h1>
		<p class="text-muted-foreground">
			Explore all state channels across the Yellow Network. Track channel states, participants, and
			asset flows.
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
					placeholder="Channel ID, wallet, or participant..."
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
					<option value="open">Open</option>
					<option value="closed">Closed</option>
					<option value="pending">Pending</option>
				</select>
			</div>

			<!-- Sort By -->
			<div>
				<label for="sortBy" class="block text-sm font-medium mb-2">Sort By</label>
				<select
					id="sortBy"
					bind:value={sortBy}
					class="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
				>
					<option value="updated_at">Last Updated</option>
					<option value="created_at">Created Date</option>
					<option value="amount">Amount</option>
				</select>
			</div>

			<!-- Sort Order -->
			<div>
				<label for="sortOrder" class="block text-sm font-medium mb-2">Order</label>
				<select
					id="sortOrder"
					bind:value={sortOrder}
					class="w-full px-3 py-2 border border-border rounded-lg bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
				>
					<option value="desc">Newest First</option>
					<option value="asc">Oldest First</option>
				</select>
			</div>
		</div>

		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {filteredChannels.length} of {data.total} channels
			</p>
			<button
				on:click={() => {
					searchQuery = '';
					statusFilter = 'all';
					sortBy = 'updated_at';
					sortOrder = 'desc';
				}}
				class="text-sm text-brand hover:text-brand/80"
			>
				Clear Filters
			</button>
		</div>
	</div>

	<!-- Channels Table -->
	<EtherscanTable 
		{columns} 
		data={filteredChannels} 
		sortKey={sortBy} 
		sortDirection={sortOrder}
		onSort={handleSort}
		emptyMessage="No channels found matching your filters."
	>
		<svelte:fragment slot="default" let:row={channel}>
			<td class="px-4 py-3 whitespace-nowrap">
				<a
					href={`/channel/${channel.channel_id}`}
					class="font-mono text-sm text-brand hover:text-brand/80 transition-colors"
				>
					{shortHex(channel.channel_id, 12, 8)}
				</a>
			</td>
			<td class="px-4 py-3">
				<div class="text-sm space-y-1">
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground text-xs">From:</span>
						<a
							href={`/participant/${channel.wallet}`}
							class="font-mono text-brand hover:text-brand/80 transition-colors text-sm"
						>
							{shortHex(channel.wallet, 6, 4)}
						</a>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground text-xs">To:</span>
						<a
							href={`/participant/${channel.participant}`}
							class="font-mono text-brand hover:text-brand/80 transition-colors text-sm"
						>
							{shortHex(channel.participant, 6, 4)}
						</a>
					</div>
				</div>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<div class="text-sm font-mono">
					{formatAmount(channel.amount, 18, 4)} ETH
				</div>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<span
					class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border"
					class:bg-green-50={channel.status === 'open'}
					class:text-green-700={channel.status === 'open'}
					class:border-green-200={channel.status === 'open'}
					class:bg-gray-50={channel.status === 'closed'}
					class:text-gray-600={channel.status === 'closed'}
					class:border-gray-200={channel.status === 'closed'}
					class:bg-yellow-50={channel.status === 'pending'}
					class:text-yellow-700={channel.status === 'pending'}
					class:border-yellow-200={channel.status === 'pending'}
				>
					{channel.status}
				</span>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<div class="text-sm text-muted-foreground">
					Chain {channel.chain_id}
				</div>
			</td>
			<td class="px-4 py-3 whitespace-nowrap">
				<div class="text-sm text-muted-foreground">
					{timeAgo(channel.updated_at)}
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
