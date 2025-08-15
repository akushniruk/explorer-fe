<script lang="ts">
	import { page } from '$app/stores';
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel, AppSession } from '$lib/types';
	import { Button, Input, Select, Card, Badge } from '$lib/components/ui';
	import EtherscanTable from '$lib/components/EtherscanTable.svelte';

	export let data: {
		query: string;
		scope: string;
		results: {
			channels: Channel[];
			sessions: AppSession[];
			participants: string[];
		};
		total: number;
	};

	$: query = $page.url.searchParams.get('q') || '';
	$: scope = $page.url.searchParams.get('scope') || 'all';

	let searchInput = query;

	function handleSearch() {
		const url = new URL($page.url);
		url.searchParams.set('q', searchInput);
		url.searchParams.set('scope', scope);
		window.location.href = url.toString();
	}

	const channelColumns = [
		{ key: 'channel_id', label: 'Channel ID', sortable: false },
		{ key: 'participants', label: 'Participants', sortable: false },
		{ key: 'amount', label: 'Amount', sortable: false },
		{ key: 'status', label: 'Status', sortable: false },
		{ key: 'updated_at', label: 'Updated', sortable: false }
	];

	const sessionColumns = [
		{ key: 'session_id', label: 'Session ID', sortable: false },
		{ key: 'protocol', label: 'Protocol', sortable: false },
		{ key: 'participants', label: 'Participants', sortable: false },
		{ key: 'status', label: 'Status', sortable: false },
		{ key: 'updated_at', label: 'Updated', sortable: false }
	];
</script>

<svelte:head>
	<title>Search: {data.query} | YNScan - The Yellow Network Scanner</title>
	<meta name="description" content="Search results for {data.query} on The Yellow Network. Find channels, sessions, participants, and assets quickly." />
	<link rel="canonical" href="https://ynscan.xyz/search" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Search Results</h1>
		{#if data.query}
			<p class="text-muted-foreground">
				{data.total} results found for "<strong>{data.query}</strong>"
				{#if data.scope !== 'all'}
					in {data.scope}{/if}
			</p>
		{:else}
			<p class="text-muted-foreground">
				Enter a search term to find channels, sessions, or participants
			</p>
		{/if}
	</div>

	<!-- Search Form -->
	<Card class="p-6 mb-8">
		<form on:submit|preventDefault={handleSearch} class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<!-- Search Input -->
				<div class="md:col-span-2">
					<label for="search" class="block text-sm font-medium mb-2">Search Term</label>
					<Input
						id="search"
						bind:value={searchInput}
						placeholder="Channel ID, Session ID, or Participant Address..."
					/>
				</div>

				<!-- Scope Filter -->
				<div>
					<label for="scope" class="block text-sm font-medium mb-2">Search In</label>
					<Select bind:value={scope}>
						<option value="all">All</option>
						<option value="channels">Channels</option>
						<option value="sessions">Sessions</option>
						<option value="participants">Participants</option>
					</Select>
				</div>

				<!-- Search Button -->
				<div class="flex items-end">
					<Button type="submit" class="w-full">Search</Button>
				</div>
			</div>
		</form>
	</Card>

	{#if data.query}
		<!-- Results Sections -->
		<div class="space-y-8">
			<!-- Channels Results -->
			{#if data.results.channels.length > 0}
				<section>
					<h2 class="text-xl font-semibold mb-4">
						Channels ({data.results.channels.length})
					</h2>
					<EtherscanTable 
						columns={channelColumns} 
						data={data.results.channels}
						emptyMessage="No channels found."
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
											class="font-mono text-brand hover:text-brand/80 transition-colors"
										>
											{shortHex(channel.wallet, 6, 4)}
										</a>
									</div>
									<div class="flex items-center gap-2">
										<span class="text-muted-foreground text-xs">To:</span>
										<a
											href={`/participant/${channel.participant}`}
											class="font-mono text-brand hover:text-brand/80 transition-colors"
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
								>
									{channel.status}
								</span>
							</td>
							<td class="px-4 py-3 whitespace-nowrap">
								<div class="text-sm text-muted-foreground">
									{timeAgo(channel.updated_at)}
								</div>
							</td>
						</svelte:fragment>
					</EtherscanTable>
				</section>
			{/if}

			<!-- Sessions Results -->
			{#if data.results.sessions.length > 0}
				<section>
					<h2 class="text-xl font-semibold mb-4">
						Sessions ({data.results.sessions.length})
					</h2>
					<EtherscanTable 
						columns={sessionColumns} 
						data={data.results.sessions}
						emptyMessage="No sessions found."
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
								<span
									class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border"
									class:bg-green-50={session.status === 'active'}
									class:text-green-700={session.status === 'active'}
									class:border-green-200={session.status === 'active'}
									class:bg-gray-50={session.status === 'closed'}
									class:text-gray-600={session.status === 'closed'}
									class:border-gray-200={session.status === 'closed'}
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
				</section>
			{/if}

			<!-- Participants Results -->
			{#if data.results.participants.length > 0}
				<section>
					<h2 class="text-xl font-semibold mb-4">
						Participants ({data.results.participants.length})
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each data.results.participants as participant}
							<div
								class="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
							>
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center">
										<span class="text-brand font-bold text-sm">
											{participant.slice(2, 4).toUpperCase()}
										</span>
									</div>
									<div class="flex-1 min-w-0">
										<a
											href={`/participant/${participant}`}
											class="block font-mono text-sm text-brand hover:text-brand/80 truncate"
										>
											{participant}
										</a>
										<div class="text-xs text-muted-foreground">Click to view details</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- No Results -->
			{#if data.total === 0}
				<div class="text-center py-12">
					<div class="text-muted-foreground mb-4">
						<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<h3 class="text-lg font-medium mb-2">No results found</h3>
					<p class="text-muted-foreground mb-4">Try adjusting your search terms or search scope.</p>
					<div class="text-sm text-muted-foreground">
						<p>Search tips:</p>
						<ul class="list-disc list-inside mt-2 space-y-1">
							<li>Use full or partial channel/session IDs</li>
							<li>Search by participant addresses</li>
							<li>Try different search scopes</li>
						</ul>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
