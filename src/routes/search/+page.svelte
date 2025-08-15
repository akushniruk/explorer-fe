<script lang="ts">
	import { page } from '$app/stores';
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel, AppSession } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Link, FileText, User, Search, ChevronRight } from 'lucide-svelte';
	import SearchTable from '$lib/components/SearchTable.svelte';
	import SearchAutocomplete from '$lib/components/SearchAutocomplete.svelte';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';

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

	function handleAutocompleteSearch(event: CustomEvent<{ query: string }>) {
		searchInput = event.detail.query;
		handleSearch();
	}

	function handleSuggestionSelect(event: CustomEvent<{ suggestion: any }>) {
		// Handle suggestion selection - could redirect to specific pages
		const { suggestion } = event.detail;
		if (suggestion.type === 'channel') {
			window.location.href = `/channel/${suggestion.id}`;
		} else if (suggestion.type === 'session') {
			// Could add session detail page later
			searchInput = suggestion.text;
			handleSearch();
		} else {
			searchInput = suggestion.text;
			handleSearch();
		}
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
	<meta
		name="description"
		content="Search results for {data.query} on The Yellow Network. Find channels, sessions, participants, and assets quickly."
	/>
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
	<Card.Root class="p-6 mb-8">
		<form on:submit|preventDefault={handleSearch} class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<!-- Search Input -->
				<div class="md:col-span-2">
					<label for="search" class="block text-sm font-medium mb-2">Search Term</label>
					<SearchAutocomplete
						bind:value={searchInput}
						placeholder="Channel ID, Session ID, or Participant Address..."
						on:search={handleAutocompleteSearch}
						on:select={handleSuggestionSelect}
					/>
				</div>

				<!-- Scope Filter -->
				<div>
					<label for="scope" class="block text-sm font-medium mb-2">Search In</label>
					<select
						id="scope"
						bind:value={scope}
						class="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
					>
						<option value="all">All</option>
						<option value="channels">Channels</option>
						<option value="sessions">Sessions</option>
						<option value="participants">Participants</option>
					</select>
				</div>

				<!-- Search Button -->
				<div class="flex items-end">
					<Button type="submit" class="w-full">Search</Button>
				</div>
			</div>
		</form>
	</Card.Root>

	{#if data.query}
		<!-- Results Statistics -->
		{#if data.total > 0}
			<div class="bg-card border border-border rounded-lg p-4 mb-6">
				<div class="flex flex-wrap items-center gap-6">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">Total Results:</span>
						<Badge class="bg-primary text-primary-foreground">{data.total}</Badge>
					</div>
					{#if data.results.channels.length > 0}
						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Channels:</span>
							<Badge class="bg-secondary text-secondary-foreground"
								>{data.results.channels.length}</Badge
							>
						</div>
					{/if}
					{#if data.results.sessions.length > 0}
						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Sessions:</span>
							<Badge class="bg-secondary text-secondary-foreground"
								>{data.results.sessions.length}</Badge
							>
						</div>
					{/if}
					{#if data.results.participants.length > 0}
						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Participants:</span>
							<Badge class="bg-secondary text-secondary-foreground"
								>{data.results.participants.length}</Badge
							>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Results Sections -->
		<div class="space-y-8">
			<!-- Channels Results -->
			{#if data.results.channels.length > 0}
				<section>
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-semibold flex items-center gap-2">
							<Link class="w-5 h-5 text-muted-foreground" />
							Channels ({data.results.channels.length})
						</h2>
					</div>
					<SearchTable
						columns={channelColumns}
						data={data.results.channels}
						tableType="channels"
						emptyMessage="No channels found."
					/>
				</section>
			{/if}

			<!-- Sessions Results -->
			{#if data.results.sessions.length > 0}
				<section>
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-semibold flex items-center gap-2">
							<FileText class="w-5 h-5 text-muted-foreground" />
							Sessions ({data.results.sessions.length})
						</h2>
					</div>
					<SearchTable
						columns={sessionColumns}
						data={data.results.sessions}
						tableType="sessions"
						emptyMessage="No sessions found."
					/>
				</section>
			{/if}

			<!-- Participants Results -->
			{#if data.results.participants.length > 0}
				<section>
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-xl font-semibold flex items-center gap-2">
							<User class="w-5 h-5 text-muted-foreground" />
							Participants ({data.results.participants.length})
						</h2>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each data.results.participants as participant}
							<div
								class="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all hover:border-muted-foreground"
							>
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
										<span class="text-secondary-foreground font-bold text-sm">
											{participant.slice(2, 4).toUpperCase()}
										</span>
									</div>
									<div class="flex-1 min-w-0">
										<a
											href={`/participant/${participant}`}
											class="block font-mono text-sm text-foreground hover:text-foreground truncate font-medium"
										>
											{participant}
										</a>
										<div class="text-xs text-muted-foreground">View participant activity</div>
									</div>
									<div class="flex-shrink-0">
										<svg
											class="w-4 h-4 text-muted-foreground"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- No Results -->
			{#if data.total === 0}
				<div class="text-center py-16">
					<div class="text-muted-foreground mb-6">
						<svg
							class="w-20 h-20 mx-auto text-muted"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-3 text-foreground">No results found</h3>
					<p class="text-muted-foreground mb-6 max-w-md mx-auto">
						We couldn't find anything matching "<strong>{data.query}</strong>" in {data.scope ===
						'all'
							? 'any category'
							: data.scope}.
					</p>
					<div class="bg-muted rounded-lg p-6 max-w-md mx-auto">
						<h4 class="text-sm font-semibold text-foreground mb-3">Search Tips:</h4>
						<ul class="text-sm text-muted-foreground space-y-2 text-left">
							<li class="flex items-start gap-2">
								<span class="text-muted-foreground">•</span>
								<span>Use full or partial channel/session IDs</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-muted-foreground">•</span>
								<span>Search by participant wallet addresses</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-muted-foreground">•</span>
								<span>Try expanding your search scope to "All"</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-muted-foreground">•</span>
								<span>Check for typos in addresses or IDs</span>
							</li>
						</ul>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
