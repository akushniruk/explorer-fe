<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel, AppSession } from '$lib/types';

	export let data: {
		participantId: string;
		channels: Channel[];
		sessions: AppSession[];
		stats: {
			totalChannels: number;
			activeChannels: number;
			totalSessions: number;
			activeSessions: number;
		};
	};

	let activeTab = 'overview';
</script>

<svelte:head>
	<title>Participant {shortHex(data.participantId, 8, 6)} | YNScan</title>
	<meta
		name="description"
		content="View participant details and activity on The Yellow Network. Channel participation, session history, and network statistics."
	/>
	<link rel="canonical" href="https://ynscan.xyz/participant/{data.participantId}" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-start gap-4 mb-4">
			<div class="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center">
				<span class="text-brand font-bold text-xl">
					{data.participantId.slice(2, 4).toUpperCase()}
				</span>
			</div>
			<div class="flex-1">
				<h1 class="text-3xl font-bold mb-2">Participant Details</h1>
				<div class="flex items-center gap-2 mb-2">
					<span class="text-muted-foreground">Address:</span>
					<code class="font-mono text-lg bg-accent/50 px-3 py-1 rounded text-accent-foreground">
						{data.participantId}
					</code>
					<button
						class="text-sm text-brand hover:text-brand/80"
						on:click={() => navigator.clipboard.writeText(data.participantId)}
					>
						Copy
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-brand mb-1">{data.stats.totalChannels}</div>
			<div class="text-sm text-muted-foreground">Total Channels</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-foreground mb-1">{data.stats.activeChannels}</div>
			<div class="text-sm text-muted-foreground">Active Channels</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-brand mb-1">{data.stats.totalSessions}</div>
			<div class="text-sm text-muted-foreground">Total Sessions</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-muted-foreground mb-1">{data.stats.activeSessions}</div>
			<div class="text-sm text-muted-foreground">Active Sessions</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-border mb-6">
		<nav class="flex space-x-8">
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
				class:border-brand={activeTab === 'overview'}
				class:text-brand={activeTab === 'overview'}
				class:border-transparent={activeTab !== 'overview'}
				class:text-muted-foreground={activeTab !== 'overview'}
				on:click={() => (activeTab = 'overview')}
			>
				Overview
			</button>
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
				class:border-brand={activeTab === 'channels'}
				class:text-brand={activeTab === 'channels'}
				class:border-transparent={activeTab !== 'channels'}
				class:text-muted-foreground={activeTab !== 'channels'}
				on:click={() => (activeTab = 'channels')}
			>
				Channels ({data.channels.length})
			</button>
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
				class:border-brand={activeTab === 'sessions'}
				class:text-brand={activeTab === 'sessions'}
				class:border-transparent={activeTab !== 'sessions'}
				class:text-muted-foreground={activeTab !== 'sessions'}
				on:click={() => (activeTab = 'sessions')}
			>
				Sessions ({data.sessions.length})
			</button>
		</nav>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'overview'}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Recent Channels -->
			<div class="bg-card border border-border rounded-lg">
				<div class="p-4 border-b border-border">
					<h3 class="font-semibold">Recent Channels</h3>
				</div>
				<div class="p-0">
					{#each data.channels.slice(0, 5) as channel (channel.channel_id)}
						<div
							class="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0"
						>
							<div>
								<a
									href={`/channel/${channel.channel_id}`}
									class="font-mono text-sm text-brand hover:text-brand/80"
								>
									{shortHex(channel.channel_id, 8, 6)}
								</a>
								<div class="text-xs text-muted-foreground mt-1">
									{formatAmount(channel.amount, 18, 4)} ETH
								</div>
							</div>
							<div class="text-right">
								<span
									class="inline-flex px-2 py-1 rounded text-xs font-medium"
									class:bg-gray-100={channel.status === 'open'}
									class:text-foreground={channel.status === 'open'}
									class:bg-gray-200={channel.status === 'closed'}
									class:text-muted-foreground={channel.status === 'closed'}
								>
									{channel.status}
								</span>
								<div class="text-xs text-muted-foreground mt-1">
									{timeAgo(channel.updated_at)}
								</div>
							</div>
						</div>
					{:else}
						<div class="p-8 text-center text-muted-foreground">No channels found</div>
					{/each}
				</div>
			</div>

			<!-- Recent Sessions -->
			<div class="bg-card border border-border rounded-lg">
				<div class="p-4 border-b border-border">
					<h3 class="font-semibold">Recent Sessions</h3>
				</div>
				<div class="p-0">
					{#each data.sessions.slice(0, 5) as session (session.session_id)}
						<div
							class="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0"
						>
							<div>
								<a
									href={`/session/${session.session_id}`}
									class="font-mono text-sm text-brand hover:text-brand/80"
								>
									{shortHex(session.session_id, 8, 6)}
								</a>
								<div class="text-xs text-muted-foreground mt-1">
									{session.participants.length} participants
								</div>
							</div>
							<div class="text-right">
								<span
									class="inline-flex px-2 py-1 rounded text-xs font-medium"
									class:bg-gray-100={session.status === 'active'}
									class:text-foreground={session.status === 'active'}
									class:bg-gray-200={session.status === 'closed'}
									class:text-muted-foreground={session.status === 'closed'}
								>
									{session.status}
								</span>
								<div class="text-xs text-muted-foreground mt-1">
									{timeAgo(session.updated_at)}
								</div>
							</div>
						</div>
					{:else}
						<div class="p-8 text-center text-muted-foreground">No sessions found</div>
					{/each}
				</div>
			</div>
		</div>
	{:else if activeTab === 'channels'}
		<!-- Channels Tab -->
		<div class="bg-card border border-border rounded-lg overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-muted/30">
						<tr class="text-left">
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Channel ID
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Counterparty
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Amount
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Status
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Updated
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/60">
						{#each data.channels as channel (channel.channel_id)}
							{@const counterparty =
								channel.wallet === data.participantId ? channel.participant : channel.wallet}
							<tr class="hover:bg-muted/10 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href={`/channel/${channel.channel_id}`}
										class="font-mono text-sm text-brand hover:text-brand/80"
									>
										{shortHex(channel.channel_id, 12, 8)}
									</a>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href={`/participant/${counterparty}`}
										class="font-mono text-sm text-brand hover:text-brand/80"
									>
										{shortHex(counterparty, 6, 4)}
									</a>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium">
										{formatAmount(channel.amount, 18, 4)} ETH
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex px-2 py-1 rounded text-xs font-medium"
										class:bg-gray-100={channel.status === 'open'}
										class:text-foreground={channel.status === 'open'}
										class:bg-gray-200={channel.status === 'closed'}
										class:text-muted-foreground={channel.status === 'closed'}
									>
										{channel.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-muted-foreground">
										{timeAgo(channel.updated_at)}
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-muted-foreground">
									No channels found for this participant.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if activeTab === 'sessions'}
		<!-- Sessions Tab -->
		<div class="bg-card border border-border rounded-lg overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-muted/30">
						<tr class="text-left">
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Session ID
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Protocol
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Other Participants
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Status
							</th>
							<th
								class="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
							>
								Updated
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/60">
						{#each data.sessions as session (session.session_id)}
							{@const otherParticipants = session.participants.filter(
								(p) => p !== data.participantId
							)}
							<tr class="hover:bg-muted/10 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href={`/session/${session.session_id}`}
										class="font-mono text-sm text-brand hover:text-brand/80"
									>
										{shortHex(session.session_id, 12, 8)}
									</a>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-sm bg-accent/50 px-2 py-1 rounded text-accent-foreground">
										{session.protocol || 'unknown'}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm space-y-1">
										{#each otherParticipants.slice(0, 2) as participant}
											<a
												href={`/participant/${participant}`}
												class="block font-mono text-brand hover:text-brand/80"
											>
												{shortHex(participant, 6, 4)}
											</a>
										{/each}
										{#if otherParticipants.length > 2}
											<div class="text-xs text-muted-foreground">
												+{otherParticipants.length - 2} more
											</div>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex px-2 py-1 rounded text-xs font-medium"
										class:bg-gray-100={session.status === 'active'}
										class:text-foreground={session.status === 'active'}
										class:bg-gray-200={session.status === 'closed'}
										class:text-muted-foreground={session.status === 'closed'}
									>
										{session.status}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-muted-foreground">
										{timeAgo(session.updated_at)}
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-muted-foreground">
									No sessions found for this participant.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
