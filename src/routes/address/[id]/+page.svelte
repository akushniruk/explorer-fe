<script lang="ts">
	import { shortHex, formatAmount, timeAgo, formatSignificantWithSeparators } from '$lib/format';
	import type { Channel, AppSession } from '$lib/types';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { getChainById } from '$lib/ctypto/utils';
	import Chain from '$lib/components/Chain.svelte';
	import { ExternalLink, Users, CreditCard, Activity, Clock } from 'lucide-svelte';
	import { createAddressSEO } from '$lib/utils/seo';

	export let data: {
		address: string;
		lookupType?: 'wallet' | 'participant';
		wallet?: string;
		participants: string[];
		channels: Channel[];
		sessions: AppSession[];
		stats: {
			totalChannels: number;
			activeChannels: number;
			totalSessions: number;
			activeSessions: number;
		};
	};

	console.log(data)

	let activeTab = 'overview';
	$: seoData = createAddressSEO(data.address, data.stats);
	$: addressType = data.lookupType === 'wallet' ? 'Wallet' : data.lookupType === 'participant' ? 'Session Key' : 'Address';
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
	
	<!-- Twitter meta tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seoData.twitterTitle} />
	<meta name="twitter:description" content={seoData.twitterDescription} />
	<meta name="twitter:site" content="@ynscan" />
	<meta property="twitter:image" content={seoData.ogImage} />
	<meta name="twitter:image:alt" content="Visit ynscan" />
	
	<link rel="canonical" href={seoData.canonical} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-start gap-4 mb-4">
			<AddressAvatar address={data.address} size={64} />
			<div class="flex-1">
				<h1 class="text-3xl font-bold mb-2">{addressType} Details</h1>
				<div class="flex items-center gap-2 mb-2">
					<span class="text-muted-foreground">{addressType}:</span>
					<code class="font-sans text-lg bg-accent/50 px-3 py-1 rounded text-accent-foreground">
						{data.address}
					</code>
					<CopyButton value={data.address} />
				</div>
				
				<!-- Relationship Information -->
				{#if data.lookupType === 'wallet' && data.participants.length > 0}
					<div class="flex items-center gap-2 mb-2">
						<span class="text-muted-foreground">Session Keys ({data.participants.length}):</span>
						<div class="flex flex-wrap gap-1">
							{#each data.participants.slice(0, 3) as participant}
								<a 
									href={`/address/${participant}`}
									class="text-sm bg-secondary px-2 py-1 rounded hover:bg-secondary/80 font-sans"
									title={participant}
								>
									{shortHex(participant, 6, 4)}
								</a>
							{/each}
							{#if data.participants.length > 3}
								<span class="text-sm text-muted-foreground">+{data.participants.length - 3} more</span>
							{/if}
						</div>
					</div>
				{:else if data.lookupType === 'participant' && data.wallet}
					<div class="flex items-center gap-2 mb-2">
						<span class="text-muted-foreground">Main Wallet:</span>
						<a 
							href={`/address/${data.wallet}`}
							class="text-sm bg-secondary px-2 py-1 rounded hover:bg-secondary/80 font-sans"
							title={data.wallet}
						>
							{shortHex(data.wallet, 8, 6)}
						</a>
						<CopyButton value={data.wallet} />
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-card border border-border rounded-lg p-6 text-center">
			<div class="flex items-center justify-center mb-2">
				<CreditCard class="w-6 h-6 text-muted-foreground" />
			</div>
			<div class="text-2xl font-bold text-brand mb-1">{data.stats.totalChannels}</div>
			<div class="text-sm text-muted-foreground">Total Channels</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-6 text-center">
			<div class="flex items-center justify-center mb-2">
				<Activity class="w-6 h-6 text-muted-foreground" />
			</div>
			<div class="text-2xl font-bold text-emerald-600 mb-1">{data.stats.activeChannels}</div>
			<div class="text-sm text-muted-foreground">Active Channels</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-6 text-center">
			<div class="flex items-center justify-center mb-2">
				<Users class="w-6 h-6 text-muted-foreground" />
			</div>
			<div class="text-2xl font-bold text-brand mb-1">{data.stats.totalSessions}</div>
			<div class="text-sm text-muted-foreground">Total Sessions</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-6 text-center">
			<div class="flex items-center justify-center mb-2">
				<Clock class="w-6 h-6 text-muted-foreground" />
			</div>
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
			
			<!-- Session Keys Tab (for wallets) -->
			{#if data.lookupType === 'wallet' && data.participants.length > 0}
				<button
					class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
					class:border-brand={activeTab === 'sessionkeys'}
					class:text-brand={activeTab === 'sessionkeys'}
					class:border-transparent={activeTab !== 'sessionkeys'}
					class:text-muted-foreground={activeTab !== 'sessionkeys'}
					on:click={() => (activeTab = 'sessionkeys')}
				>
					Session Keys ({data.participants.length})
				</button>
			{/if}

			<!-- Wallet Owner Tab (for participants) -->
			{#if data.lookupType === 'participant' && data.wallet}
				<button
					class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
					class:border-brand={activeTab === 'owner'}
					class:text-brand={activeTab === 'owner'}
					class:border-transparent={activeTab !== 'owner'}
					class:text-muted-foreground={activeTab !== 'owner'}
					on:click={() => (activeTab = 'owner')}
				>
					Owner Wallet
				</button>
			{/if}
			
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
									class="font-sans text-sm text-brand hover:text-brand/80"
								>
									{shortHex(channel.channel_id, 8, 6)}
								</a>
								<div class="text-xs text-muted-foreground mt-1">
									{formatAmount(
										channel.amount,
										channel.asset?.decimals ? parseInt(channel.asset.decimals) : 18,
										4
									)}
									{channel.asset?.symbol || 'ETH'}
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
									class="font-sans text-sm text-brand hover:text-brand/80"
								>
									{shortHex(session.session_id, 8, 6)}
								</a>
								<div class="text-xs text-muted-foreground mt-1">
									{session.participants.length} addresses
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
	{:else if activeTab === 'sessionkeys'}
		<!-- Session Keys Tab Content -->
		<div class="bg-card border border-border rounded-lg">
			<div class="p-4 border-b border-border">
				<h3 class="font-semibold">Session Keys Associated with this Wallet</h3>
				<p class="text-sm text-muted-foreground mt-1">
					All session keys (participants) that belong to this main wallet address.
				</p>
			</div>
			<Table.Root>
				<Table.Header>
					<Table.Row class="hover:bg-transparent border-b border-border">
						<Table.Head class="font-medium text-muted-foreground text-sm">Session Key</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Channels</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Status</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.participants as participant (participant)}
						{@const participantChannels = data.channels.filter(c => c.participant === participant)}
						{@const activeParticipantChannels = participantChannels.filter(c => c.status === 'open')}
						<Table.Row class="hover:bg-muted/50">
							<Table.Cell class="font-sans">
								<div class="flex items-center gap-2">
									<AddressAvatar address={participant} size={32} />
									<div>
										<a
											href={`/address/${participant}`}
											class="text-foreground underline hover:text-foreground text-sm cursor-pointer font-semibold"
											title={participant}
										>
											{shortHex(participant, 10, 8)}
										</a>
										<div class="text-xs text-muted-foreground">Session Key</div>
									</div>
									<CopyButton value={participant} />
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="text-sm">
									<div class="font-medium">{participantChannels.length} total</div>
									<div class="text-muted-foreground text-xs">
										{activeParticipantChannels.length} active
									</div>
								</div>
							</Table.Cell>
							<Table.Cell>
								<span 
									class="inline-flex px-2 py-1 rounded text-xs font-medium"
									class:bg-emerald-100={activeParticipantChannels.length > 0}
									class:text-emerald-800={activeParticipantChannels.length > 0}
									class:bg-gray-100={activeParticipantChannels.length === 0}
									class:text-gray-800={activeParticipantChannels.length === 0}
								>
									{activeParticipantChannels.length > 0 ? 'Active' : 'Inactive'}
								</span>
							</Table.Cell>
							<Table.Cell>
								<a
									href={`/address/${participant}`}
									class="text-brand hover:text-brand/80 text-sm underline"
								>
									View Details
								</a>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
								No session keys found for this wallet.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{:else if activeTab === 'owner'}
		<!-- Owner Wallet Tab Content -->
		<div class="bg-card border border-border rounded-lg">
			<div class="p-4 border-b border-border">
				<h3 class="font-semibold">Owner Wallet</h3>
				<p class="text-sm text-muted-foreground mt-1">
					The main wallet address that controls this session key.
				</p>
			</div>
			<div class="p-6">
				{#if data.wallet}
					<div class="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
						<AddressAvatar address={data.wallet} size={48} />
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-2">
								<h4 class="font-semibold text-lg">Main Wallet</h4>
							</div>
							<div class="flex items-center gap-2 mb-3">
								<code class="font-sans text-sm bg-accent/50 px-2 py-1 rounded text-accent-foreground">
									{data.wallet}
								</code>
								<CopyButton value={data.wallet} />
							</div>
							<div class="flex items-center gap-4 text-sm text-muted-foreground mb-3">
								<div class="flex items-center gap-1">
									<CreditCard class="w-4 h-4" />
									<span>{data.channels.length} channels</span>
								</div>
								<div class="flex items-center gap-1">
									<Users class="w-4 h-4" />
									<span>{data.participants.length} session keys</span>
								</div>
							</div>
							<div class="flex gap-2">
								<a
									href={`/address/${data.wallet}`}
									class="inline-flex items-center px-3 py-1.5 bg-brand text-brand-foreground rounded text-sm hover:bg-brand/90"
								>
									View Wallet Details
								</a>
							</div>
						</div>
					</div>
				{:else}
					<div class="text-center text-muted-foreground py-8">
						Owner wallet information not available.
					</div>
				{/if}
			</div>
		</div>
	{:else if activeTab === 'channels'}
		<!-- Channels Tab -->
		<div class="bg-card border border-border rounded-lg">
			<Table.Root>
				<Table.Header>
					<Table.Row class="hover:bg-transparent border-b border-border">
						<Table.Head class="font-medium text-muted-foreground text-sm">Channel ID</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Counterparty</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm text-right"
							>Amount</Table.Head
						>
						<Table.Head class="font-medium text-muted-foreground text-sm">Status</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Chain</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Updated</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Action</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.channels as channel (channel.channel_id)}
						{@const counterparty =
							channel.wallet === data.address ? channel.participant : channel.wallet}
						{@const chain = getChainById(Number(channel.chain_id))}
						<Table.Row class="hover:bg-muted/50">
							<Table.Cell class="font-sans">
								<div class="flex items-center gap-2">
									<a
										href={`/channel/${channel.channel_id}`}
										class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
										title={channel.channel_id}
									>
										{shortHex(channel.channel_id, 12, 8)}
									</a>
									<CopyButton value={channel.channel_id} />
								</div>
							</Table.Cell>
							<Table.Cell class="font-sans">
								<div class="flex items-center gap-2">
									<AddressAvatar address={counterparty} size={24} />
									<a
										href={`/address/${counterparty}`}
										class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
										title={counterparty}
									>
										{shortHex(counterparty, 6, 4)}
									</a>
									<CopyButton value={counterparty} />
								</div>
							</Table.Cell>
							<Table.Cell class="text-right font-sans text-sm uppercase">
								{formatAmount(
									channel.amount,
									channel.asset?.decimals ? parseInt(channel.asset.decimals) : 18,
									4
								)}
								{channel.asset?.symbol || 'ETH'}
							</Table.Cell>
							<Table.Cell>
								<Badge
									class={channel.status === 'open'
										? 'bg-emerald-100 text-emerald-800'
										: 'bg-gray-100 text-gray-800'}
								>
									{channel.status}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<Chain chainId={Number(channel.chain_id)} />
							</Table.Cell>
							<Table.Cell>
								<div class="text-sm text-muted-foreground">
									{timeAgo(channel.updated_at)}
								</div>
							</Table.Cell>
							<Table.Cell>
								{#if chain}
									<a
										href={`${chain.blockExplorers?.default.url}/address/${counterparty}`}
										target="_blank"
										rel="noopener noreferrer"
										class="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
										title={`View ${counterparty} on ${chain.blockExplorers?.default.name}`}
									>
										<ExternalLink class="w-3 h-3" />
										Explorer
									</a>
								{/if}
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={7} class="h-24 text-center text-muted-foreground">
								No channels found for this address.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{:else if activeTab === 'sessions'}
		<!-- Sessions Tab -->
		<div class="bg-card border border-border rounded-lg">
			<Table.Root>
				<Table.Header>
					<Table.Row class="hover:bg-transparent border-b border-border">
						<Table.Head class="font-medium text-muted-foreground text-sm">Session ID</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Protocol</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm"
							>Other Addresses</Table.Head
						>
						<Table.Head class="font-medium text-muted-foreground text-sm">Status</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Updated</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.sessions as session (session.session_id)}
						{@const otherParticipants = session.participants.filter(
							(p) => p !== data.address
						)}
						<Table.Row class="hover:bg-muted/50">
							<Table.Cell class="font-sans">
								<div class="flex items-center gap-2">
									<a
										href={`/session/${session.session_id}`}
										class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
										title={session.session_id}
									>
										{shortHex(session.session_id, 12, 8)}
									</a>
									<CopyButton value={session.session_id} />
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge class="bg-secondary text-secondary-foreground hover:bg-secondary">
									{session.protocol || 'unknown'}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<div class="text-sm space-y-1">
									{#each otherParticipants.slice(0, 2) as participant}
										<div class="flex items-center gap-2">
											<AddressAvatar address={participant} size={20} />
											<a
												href={`/address/${participant}`}
												class="font-sans underline text-foreground hover:text-foreground cursor-pointer"
												title={participant}
											>
												{shortHex(participant, 6, 4)}
											</a>
											<CopyButton value={participant} />
										</div>
									{/each}
									{#if otherParticipants.length > 2}
										<div class="text-xs text-muted-foreground">
											+{otherParticipants.length - 2} more
										</div>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge
									class={session.status === 'active'
										? 'bg-emerald-100 text-emerald-800'
										: 'bg-gray-100 text-gray-800'}
								>
									{session.status}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<div class="text-sm text-muted-foreground">
									{timeAgo(session.updated_at)}
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={5} class="h-24 text-center text-muted-foreground">
								No sessions found for this address.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
