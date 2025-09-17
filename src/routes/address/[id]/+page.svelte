<script lang="ts">
	import { shortHex, formatAmount, timeAgo, formatSignificantWithSeparators } from '$lib/format';
	import type { Channel, AppSession, Node } from '$lib/types';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { getChainById } from '$lib/ctypto/utils';
	import Chain from '$lib/components/Chain.svelte';
	import {
		ExternalLink,
		Users,
		CreditCard,
		Activity,
		Clock,
		Cpu,
		Globe,
		MapPin,
		Network,
		Zap
	} from 'lucide-svelte';
	import { createAddressSEO } from '$lib/utils/seo';
	import ChannelsPagination from '$lib/components/ChannelsPagination.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let data: {
		address: string;
		lookupType?: 'wallet' | 'participant';
		addressType?: string;
		wallet?: string;
		participants: string[];
		channels: Channel[];
		sessions: AppSession[];
		node: Node | null;
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		} | null;
		stats: {
			totalChannels: number;
			activeChannels: number;
			totalSessions: number;
			activeSessions: number;
		};
	};

	let activeTab =
		data.lookupType === 'wallet' && data.participants.length > 0 ? 'sessionkeys' : 'channels';

	// For node types, always default to channels tab
	if (data.addressType === 'node') {
		activeTab = 'channels';
	}
	$: seoData = createAddressSEO(data.address, data.stats);
	$: addressType =
		data.addressType === 'node'
			? 'Node'
			: data.lookupType === 'wallet'
				? 'Wallet'
				: data.lookupType === 'participant'
					? 'Session Key'
					: 'Address';

	function getStatusVariant(status: string): 'default' | 'destructive' {
		return status.toLowerCase() === 'open' || status.toLowerCase() === 'active'
			? 'default'
			: 'destructive';
	}

	function getStatusClass(status: string) {
		return status.toLowerCase() === 'open' || status.toLowerCase() === 'active'
			? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
			: 'capitalize';
	}

	// Pagination handlers for node addresses
	function onPageChange(newPage: number) {
		if (data.addressType === 'node') {
			const url = new URL($page.url);
			url.searchParams.set('page', newPage.toString());
			goto(url, { keepFocus: true });
		}
	}

	function onPageSizeChange(newSize: number) {
		if (data.addressType === 'node') {
			const url = new URL($page.url);
			url.searchParams.set('limit', newSize.toString());
			url.searchParams.set('page', '1'); // Reset to first page
			goto(url, { keepFocus: true });
		}
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
		<div class="flex items-start justify-between mb-4">
			<div class="flex items-start gap-4">
				<AddressAvatar address={data.address} size={64} />
				<div class="flex-1">
					<h1 class="text-3xl font-bold mb-2">
						{#if data.addressType === 'node' && data.node}
							Node Details
						{:else}
							{addressType} Details
						{/if}
					</h1>
					<div class="flex items-center gap-2 mb-2">
						{#if data.addressType === 'node' && data.node}
							<span class="text-text">Node ID:</span>
							<code class="font-sans text-lg py-1 rounded text-text" title={data.address}>
								{shortHex(data.address, 10, 8)}
							</code>
							<CopyButton value={data.address} />
							{#if data.node.website_host}
								<a
									href={`https://${data.node.website_host}`}
									target="_blank"
									rel="noopener noreferrer"
									class="ml-2 text-brand hover:text-brand/80"
									title="Visit node website"
								>
									<ExternalLink class="w-4 h-4" />
								</a>
							{/if}
						{:else}
							<span class="text-text">{addressType}:</span>
							<code class="font-sans text-lg py-1 rounded text-text" title={data.address}>
								{shortHex(data.address, 8, 8)}
							</code>
							<CopyButton value={data.address} />
						{/if}
					</div>

					<!-- Relationship Information -->
					{#if data.lookupType === 'wallet' && data.participants.length > 0}
						<div class="flex items-center gap-2 mb-2">
							<span class="text-text">Session Keys ({data.participants.length}):</span>
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
									<span class="text-sm text-text">+{data.participants.length - 3} more</span>
								{/if}
							</div>
						</div>
					{:else if data.lookupType === 'participant' && data.wallet}
						<div class="flex items-center gap-2 mb-2">
							<span class="text-text">Main Wallet:</span>
							<a
								href={`/address/${data.wallet}`}
								class="font-sans text-brand hover:text-brand/80"
								title={data.wallet}
							>
								{shortHex(data.wallet, 8, 8)}
							</a>
							<CopyButton value={data.wallet} />
						</div>
					{/if}

					<!-- Node Information -->
					{#if data.addressType === 'node' && data.node}
						<div class="bg-card border border-border rounded-lg p-6 mt-4">
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<!-- Left Column: Identity & Status -->
								<div class="space-y-4">
									<div>
										<h3 class="text-xl font-bold text-foreground mb-1">{data.node.name}</h3>
										<div class="flex items-center gap-2 mb-3">
											<Badge
												variant={data.node.status === 'active' ? 'default' : 'destructive'}
												class={data.node.status === 'active'
													? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
													: 'capitalize'}
											>
												{data.node.status}
											</Badge>
											<Badge
												variant="outline"
												class={data.node.available
													? 'border-emerald-600 text-emerald-600'
													: 'border-red-600 text-red-600'}
											>
												{data.node.available ? 'Available' : 'Unavailable'}
											</Badge>
										</div>
									</div>

									{#if data.node.latency_ms}
										<div class="flex items-center gap-2">
											<Activity class="w-4 h-4 text-muted-foreground" />
											<span class="text-sm text-muted-foreground">Latency:</span>
											<span class="font-sans font-medium">{data.node.latency_ms}ms</span>
										</div>
									{/if}

									{#if data.node.description}
										<div class="pt-2">
											<p class="text-sm text-muted-foreground leading-relaxed">
												{data.node.description}
											</p>
										</div>
									{/if}
								</div>

								<!-- Right Column: Metadata -->
								<div class="space-y-4">
									<div class="flex items-center gap-2">
										<MapPin class="w-4 h-4 text-muted-foreground" />
										<span class="text-sm text-muted-foreground">Location:</span>
										<span class="font-medium"
											>{data.node.region}, {data.node.country_code.toUpperCase()}</span
										>
									</div>

									{#if data.node.website_host}
										<div class="flex items-center gap-2">
											<Globe class="w-4 h-4 text-muted-foreground" />
											<span class="text-sm text-muted-foreground">Website:</span>
											<a
												href={`https://${data.node.website_host}`}
												target="_blank"
												rel="noopener noreferrer"
												class="text-brand hover:text-brand/80 underline font-medium"
											>
												{data.node.website_host}
											</a>
										</div>
									{/if}

									{#if data.node.last_seen_at}
										<div class="flex items-center gap-2">
											<Clock class="w-4 h-4 text-muted-foreground" />
											<span class="text-sm text-muted-foreground">Last Seen:</span>
											<span class="font-medium">{timeAgo(data.node.last_seen_at)}</span>
										</div>
									{/if}

									<!-- WebSocket URL - Collapsible Technical Details -->
									<details class="group">
										<summary
											class="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
										>
											<Cpu class="w-4 h-4" />
											<span>WebSocket URL</span>
											<svg
												class="w-4 h-4 transition-transform group-open:rotate-180"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</summary>
										<div class="mt-2 p-3 bg-muted rounded border">
											<div class="flex items-center gap-2">
												<code class="font-sans text-xs break-all text-muted-foreground flex-1">
													{data.node.ws_url}
												</code>
												<CopyButton value={data.node.ws_url} />
											</div>
										</div>
									</details>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="flex items-center justify-center mb-1.5">
				<CreditCard class="w-5 h-5 text-text" />
			</div>
			<div class="text-xl font-bold text-text mb-0.5">{data.stats.totalChannels}</div>
			<div class="text-xs text-text">Total Channels</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="flex items-center justify-center mb-1.5">
				<Activity class="w-5 h-5 text-text" />
			</div>
			<div class="text-xl font-bold text-emerald-600 mb-0.5">{data.stats.activeChannels}</div>
			<div class="text-xs text-text">Active Channels</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="flex items-center justify-center mb-1.5">
				<Users class="w-5 h-5 text-text" />
			</div>
			<div class="text-xl font-bold text-text mb-0.5">{data.stats.totalSessions}</div>
			<div class="text-xs text-text">Total Sessions</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="flex items-center justify-center mb-1.5">
				<Clock class="w-5 h-5 text-text" />
			</div>
			<div class="text-xl font-bold text-emerald-600 mb-0.5">{data.stats.activeSessions}</div>
			<div class="text-xs text-text">Active Sessions</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-border mb-6">
		<nav class="flex space-x-8">
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
			<!-- Hide sessions tab for node types -->
			{#if data.addressType !== 'node'}
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
			{/if}
		</nav>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'sessionkeys'}
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
						<Table.Head class="font-medium text-muted-foreground text-sm">Chains</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Status</Table.Head>
						<Table.Head class="font-medium text-muted-foreground text-sm">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.participants as participant (participant)}
						{@const participantChannels = data.channels.filter(
							(c) => c.participant === participant
						)}
						{@const activeParticipantChannels = participantChannels.filter(
							(c) => c.status === 'open'
						)}
						{@const uniqueChains = [...new Set(participantChannels.map((c) => c.chain_id))]}
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
								<div class="text-sm space-y-1">
									{#if participantChannels.length > 0}
										<div class="flex flex-wrap gap-1">
											{#each participantChannels.slice(0, 3) as channel}
												<a
													href={`/channel/${channel.channel_id}`}
													class="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80 font-sans"
													title={channel.channel_id}
												>
													{shortHex(channel.channel_id, 4, 4)}
												</a>
											{/each}
											{#if participantChannels.length > 3}
												<span class="text-xs text-muted-foreground"
													>+{participantChannels.length - 3}</span
												>
											{/if}
										</div>
										<div class="text-muted-foreground text-xs">
											{activeParticipantChannels.length} active of {participantChannels.length} total
										</div>
									{:else}
										<div class="text-muted-foreground text-xs">No channels</div>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each uniqueChains.slice(0, 3) as chainId}
										<Chain chainId={Number(chainId)} />
									{/each}
									{#if uniqueChains.length > 3}
										<span class="text-xs text-muted-foreground">+{uniqueChains.length - 3}</span>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge
									variant={activeParticipantChannels.length > 0 ? 'default' : 'destructive'}
									class={activeParticipantChannels.length > 0
										? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
										: 'capitalize'}
								>
									{activeParticipantChannels.length > 0 ? 'Active' : 'Inactive'}
								</Badge>
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
							<Table.Cell colspan={5} class="h-24 text-center text-muted-foreground">
								No session keys found for this wallet.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
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
						<!-- Hide Action column for node types -->
						{#if data.addressType !== 'node'}
							<Table.Head class="font-medium text-muted-foreground text-sm">Action</Table.Head>
						{/if}
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
									variant={getStatusVariant(channel.status)}
									class={getStatusClass(channel.status)}
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
							<!-- Hide Action cell for node types -->
							{#if data.addressType !== 'node'}
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
							{/if}
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={data.addressType === 'node' ? 6 : 7} class="h-32 text-center">
								<div class="flex flex-col items-center gap-3">
									{#if data.addressType === 'node'}
										<Network class="w-8 h-8 text-muted-foreground" />
										<div class="text-muted-foreground">
											<div class="font-medium">No channels found</div>
											<div class="text-sm">This node has no active payment channels.</div>
										</div>
									{:else}
										<CreditCard class="w-8 h-8 text-muted-foreground" />
										<div class="text-muted-foreground">
											<div class="font-medium">No channels found</div>
											<div class="text-sm">This address has no payment channels.</div>
										</div>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<!-- Pagination for node addresses -->
		{#if data.addressType === 'node' && data.pagination && data.pagination.total > 0}
			<div class="mt-6">
				<ChannelsPagination
					currentPage={data.pagination.page}
					totalRecords={data.pagination.total}
					recordsPerPage={data.pagination.limit}
					{onPageChange}
					{onPageSizeChange}
				/>
			</div>
		{/if}
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
						{@const otherParticipants = session.participants.filter((p) => p !== data.address)}
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
									variant={getStatusVariant(session.status)}
									class={getStatusClass(session.status)}
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
							<Table.Cell colspan={5} class="h-32 text-center">
								<div class="flex flex-col items-center gap-3">
									{#if data.addressType === 'node'}
										<Zap class="w-8 h-8 text-muted-foreground" />
										<div class="text-muted-foreground">
											<div class="font-medium">No sessions found</div>
											<div class="text-sm">This node has no active application sessions.</div>
										</div>
									{:else}
										<Users class="w-8 h-8 text-muted-foreground" />
										<div class="text-muted-foreground">
											<div class="font-medium">No sessions found</div>
											<div class="text-sm">This address has no application sessions.</div>
										</div>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
