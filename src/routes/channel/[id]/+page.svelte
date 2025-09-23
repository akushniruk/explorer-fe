<script lang="ts">
	import { onMount } from 'svelte';
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel } from '$lib/types';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { getChainById } from '$lib/ctypto/utils';
	import Chain from '$lib/components/Chain.svelte';
	import {
		CreditCard,
		Users,
		Activity,
		Clock,
		Coins,
		Box,
		ExternalLink,
		Info,
		Shield,
		Loader2
	} from 'lucide-svelte';
	import { createChannelSEO } from '$lib/utils/seo';
	import { trackChannelView } from '$lib/analytics';
	import { NitroliteClient, type ChannelData } from '$lib/ctypto/nitrolite/getChannelData';
	import {
		isCustodyStateSupported,
		getCustodyContractForTimestamp,
		getLatestCustodyContract
	} from '$lib/config/contracts';

	import type { NodeConfig } from '$lib/types';

	export let data: {
		channel: Channel | null;
		nodeConfig: NodeConfig | null;
		notFound?: boolean;
	};

	let custodyData: ChannelData | null = null;
	let custodyLoading = false;
	let custodyError: string | null = null;
	let nitroliteClient: NitroliteClient | null = null;

	$: seoData = data.channel ? createChannelSEO(data.channel) : null;

	// Compute participants based on business logic
	$: participants =
		data.channel && data.nodeConfig
			? {
					broker: data.nodeConfig.broker_address,
					counterparty: data.channel.wallet ?? data.channel.participant
				}
			: null;

	// Check if custody state is supported for this channel
	$: custodyStateSupported = data.channel
		? (() => {
				// Try to get contract for timestamp first, but fall back to latest if not found
				let contract = getCustodyContractForTimestamp(
					Number(data.channel.chain_id),
					new Date(data.channel.created_at || data.channel.updated_at).getTime() / 1000
				);

				// If no contract found for timestamp, try getting the latest contract for the chain
				if (!contract) {
					contract = getLatestCustodyContract(Number(data.channel.chain_id));
				}

				return contract
					? isCustodyStateSupported(Number(data.channel.chain_id), contract.comment)
					: false;
			})()
		: false;

	async function fetchCustodyData() {
		if (!data.channel) return;

		custodyLoading = true;
		custodyError = null;

		try {
			nitroliteClient = new NitroliteClient(
				Number(data.channel.chain_id),
				data.channel.created_at || data.channel.updated_at
			);
			custodyData = await nitroliteClient.getChannelData(data.channel.channel_id as `0x${string}`);
		} catch (error: any) {
			custodyError = error.message;
		} finally {
			custodyLoading = false;
		}
	}

	onMount(() => {
		if (data.channel) {
			trackChannelView(data.channel.channel_id);
			if (custodyStateSupported) {
				fetchCustodyData();
			}
		}
	});
</script>

<svelte:head>
	{#if seoData}
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
	{:else}
		<title>Channel Not Found | ynscan</title>
		<meta
			name="description"
			content="The requested channel could not be found on Yellow Network Explorer."
		/>
		<meta name="keywords" content="Yellow Network, explorer, channel, not found" />
		<meta name="author" content="ynscan" />
		<link rel="canonical" href="https://ynscan.xyz/channel/" />
	{/if}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	{#if data.notFound || !data.channel}
		<div class="text-center py-12">
			<div class="text-text mb-4">
				<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.239 0-4.236-.908-5.69-2.379A7.962 7.962 0 014 9c0-1.657.502-3.195 1.36-4.47A7.962 7.962 0 0112 3c2.239 0 4.236.908 5.69 2.379A7.962 7.962 0 0120 9c0 1.657-.502 3.195-1.36 4.47"
					/>
				</svg>
			</div>
			<h1 class="text-2xl font-bold mb-2">Channel Not Found</h1>
			<p class="text-text mb-4">
				The channel you're looking for doesn't exist or has been removed.
			</p>
			<a href="/channels" class="text-text hover:text-text/80">← Back to Channels</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-start justify-between mb-4">
				<div>
					<h1 class="text-3xl font-bold mb-2">Channel Details</h1>
					<div class="flex items-center gap-2 mb-2">
						<span class="text-text">Channel ID:</span>
						<code class="font-sans text-lg py-1 rounded text-text" title={data.channel.channel_id}>
							{shortHex(data.channel.channel_id, 8, 8)}
						</code>
						<CopyButton value={data.channel.channel_id} />
					</div>
				</div>
			</div>
		</div>

		<!-- Channel Overview Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Coins class="w-5 h-5 text-text" />
				</div>
				<div class="text-xl font-bold text-text mb-0.5">
					{formatAmount(
						data.channel.amount,
						data.channel.asset?.decimals ? parseInt(data.channel.asset.decimals) : 18,
						4
					)}
				</div>
				<div class="text-xs text-text">
					{data.channel.asset?.symbol?.toUpperCase() ?? ''} Amount
				</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Box class="w-5 h-5 text-text" />
				</div>
				<div class="text-lg font-medium text-text mb-0.5 flex justify-center">
					<Chain chainId={Number(data.channel.chain_id)} />
				</div>
				<div class="text-xs text-text">Network</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Activity class="w-5 h-5 text-text" />
				</div>
				<div class="flex justify-center mb-0.5">
					<Badge
						variant={data.channel.status === 'open' ? 'default' : 'destructive'}
						class={data.channel.status === 'open'
							? 'bg-emerald-600 hover:bg-emerald-600/90 text-xs capitalize'
							: 'text-xs capitalize'}
					>
						{data.channel.status}
					</Badge>
				</div>
				<div class="text-xs text-text">Channel State</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Clock class="w-5 h-5 text-text" />
				</div>
				<div class="text-lg font-medium text-text mb-0.5">
					{timeAgo(data.channel.created_at || data.channel.updated_at)}
				</div>
				<div class="text-xs text-text">
					{data.channel.created_at ? 'Created' : 'Last Updated'}
				</div>
			</div>
		</div>

		<!-- Channel Details -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{#if data.channel}
				{@const chain = getChainById(Number(data.channel.chain_id))}
				<!-- Participants -->
				<div
					class="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
				>
					<div class="p-4 border-b border-border bg-muted/20 rounded-t-lg">
						<h2 class="text-lg font-semibold flex items-center gap-2">
							<Users class="w-5 h-5 text-text" />
							Addresses
						</h2>
					</div>
					<div class="p-4 space-y-4">
						{#if participants}
							<!-- Broker (from NodeConfig) -->
							<div>
								<div
									class="text-xs text-text uppercase tracking-wider mb-3 flex items-center gap-1"
								>
									<span>Node</span>
									<div class="relative group">
										<Info class="w-3 h-3 text-text/60 hover:text-text cursor-help" />
										<div
											class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
										>
											Network node address
										</div>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={participants.broker} size={40} />
									<div class="flex-1 min-w-0">
										<div class="flex gap-2 items-center">
											<a
												href={`/address/${participants.broker}?type=node`}
												class="font-sans text-text hover:text-text/80 block truncate"
												title={participants.broker}
											>
												{shortHex(participants.broker)}
											</a>
											<CopyButton value={participants.broker} />
										</div>
									</div>
								</div>
							</div>

							<!-- Participant/Wallet -->
							<div>
								<div
									class="text-xs text-text uppercase tracking-wider mb-3 flex items-center gap-1"
								>
									<span>Participant</span>
									<div class="relative group">
										<Info class="w-3 h-3 text-text/60 hover:text-text cursor-help" />
										<div
											class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
										>
											Counterparty address
										</div>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={participants.counterparty} size={40} />
									<div class="flex-1 min-w-0">
										<div class="flex gap-2 items-center">
											<a
												href={`/address/${participants.counterparty}`}
												class="font-sans text-text hover:text-text/80 block truncate"
												title={participants.counterparty}
											>
												{shortHex(participants.counterparty)}
											</a>
											<CopyButton value={participants.counterparty} />
										</div>
									</div>
								</div>
							</div>
						{:else}
							<!-- Fallback when NodeConfig is not available -->
							<div>
								<div
									class="text-xs text-text uppercase tracking-wider mb-3 flex items-center gap-1"
								>
									<span>Wallet</span>
									<div class="relative group">
										<Info class="w-3 h-3 text-text/60 hover:text-text cursor-help" />
										<div
											class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
										>
											Wallet address
										</div>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={data.channel.wallet} size={40} />
									<div class="flex-1 min-w-0">
										<div class="flex gap-2 items-center">
											<a
												href={`/address/${data.channel.wallet}`}
												class="font-sans text-text hover:text-text/80 block truncate"
												title={data.channel.wallet}
											>
												{shortHex(data.channel.wallet)}
											</a>
											<CopyButton value={data.channel.wallet} />
											{#if chain}
												<a
													href={`${chain.blockExplorers?.default.url}/address/${data.channel.wallet}`}
													target="_blank"
													rel="noopener noreferrer"
													class="inline-flex items-center gap-1 px-2 py-1 text-xs text-text hover:text-foreground hover:bg-muted/20 rounded border border-border transition-colors"
													title={`View ${data.channel.wallet} on ${chain.blockExplorers?.default.name}`}
												>
													<ExternalLink class="w-3 h-3" />
													View on Explorer
												</a>
											{/if}
										</div>
									</div>
								</div>
							</div>

							<div>
								<div
									class="text-xs text-text uppercase tracking-wider mb-3 flex items-center gap-1"
								>
									<span>Participant</span>
									<div class="relative group">
										<Info class="w-3 h-3 text-text/60 hover:text-text cursor-help" />
										<div
											class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
										>
											Counterparty address
										</div>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={data.channel.participant} size={40} />
									<div class="flex-1 min-w-0">
										<div class="flex gap-2 items-center">
											<a
												href={`/address/${data.channel.participant}`}
												class="font-sans text-text hover:text-text/80 block truncate"
												title={data.channel.participant}
											>
												{shortHex(data.channel.participant)}
											</a>
											<CopyButton value={data.channel.participant} />
											{#if chain}
												<a
													href={`${chain.blockExplorers?.default.url}/address/${data.channel.participant}`}
													target="_blank"
													rel="noopener noreferrer"
													class="inline-flex items-center gap-1 px-2 py-1 text-xs text-text hover:text-foreground hover:bg-muted/20 rounded border border-border transition-colors"
													title={`View ${data.channel.participant} on ${chain.blockExplorers?.default.name}`}
												>
													<ExternalLink class="w-3 h-3" />
													View on Explorer
												</a>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Technical Details -->
				<div
					class="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
				>
					<div class="p-4 border-b border-border bg-muted/10 rounded-t-lg">
						<h2 class="text-lg font-semibold flex items-center gap-2">
							<CreditCard class="w-5 h-5 text-text" />
							Technical Details
						</h2>
					</div>
					<div class="p-4 space-y-4">
						<div>
							<div class="text-xs text-text uppercase tracking-wider">Channel ID</div>
							<div class="font-sans text-sm mt-1 break-all">{data.channel.channel_id}</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Token Contract</div>
							<div class="font-sans text-sm mt-1">
								<div class="flex items-center gap-2">
									<a href={`/asset/${data.channel.token}`} class="text-text hover:text-text/80">
										{shortHex(data.channel.token, 12, 8)}
									</a>
									<CopyButton value={data.channel.token} />
									{#if chain}
										<a
											href={`${chain.blockExplorers?.default.url}/token/${data.channel.token}`}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-1 px-2 py-1 text-xs text-text hover:text-foreground hover:bg-muted/20 rounded border border-border transition-colors"
											title={`View ${data.channel.token} on ${chain.blockExplorers?.default.name}`}
										>
											<ExternalLink class="w-3 h-3" />
											View Token
										</a>
									{/if}
								</div>
							</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Chain ID</div>
							<div class="flex items-center mt-1">
								<div class="text-sm font-medium">{data.channel.chain_id}</div>
							</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Amount</div>
							<div class="font-sans text-sm mt-1">
								<div class="font-medium">
									{formatAmount(
										data.channel.amount,
										data.channel.asset?.decimals ? parseInt(data.channel.asset.decimals) : 18,
										6
									)}
									{data.channel.asset?.symbol?.toUpperCase() ?? ''}
								</div>
								<div class="text-xs text-text mt-0.5">
									{data.channel.amount} Wei
								</div>
							</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Status</div>
							<div class="mt-1">
								<Badge
									variant={data.channel.status === 'open' ? 'default' : 'destructive'}
									class={data.channel.status === 'open'
										? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
										: 'capitalize'}
								>
									{data.channel.status}
								</Badge>
							</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">
								{data.channel.created_at ? 'Created' : 'Last Updated'}
							</div>
							<div class="text-sm mt-1">
								{new Date(data.channel.created_at || data.channel.updated_at).toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Channel State (from blockchain) - Only show if supported -->
		{#if custodyStateSupported}
			<div class="mt-8">
				<div
					class="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
				>
					<div class="p-4 border-b border-border bg-muted/10 rounded-t-lg">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold flex items-center gap-2">
								<Shield class="w-5 h-5 text-text" />
								Channel State
								<div class="relative group">
									<Info class="w-4 h-4 text-text/60 hover:text-text cursor-help" />
									<div
										class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
									>
										Channel state from custody contract
									</div>
								</div>
							</h2>
							{#if nitroliteClient}
								{@const chain = getChainById(Number(data.channel.chain_id))}
								<div class="flex items-center gap-2">
									<Badge variant="secondary" class="text-xs">
										{nitroliteClient.contractInfo.comment}
									</Badge>
									{#if chain?.blockExplorers?.default}
										<a
											href={`${chain.blockExplorers.default.url}/address/${nitroliteClient.contractInfo.deployedTo}`}
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs text-text hover:text-text/80"
											title={`View ${nitroliteClient.contractInfo.deployedTo} on ${chain.blockExplorers.default.name}`}
										>
											{nitroliteClient.contractInfo.deployedTo.slice(
												0,
												6
											)}...{nitroliteClient.contractInfo.deployedTo.slice(-4)}
										</a>
									{:else}
										<span class="text-xs text-text" title={nitroliteClient.contractInfo.deployedTo}>
											{nitroliteClient.contractInfo.deployedTo.slice(
												0,
												6
											)}...{nitroliteClient.contractInfo.deployedTo.slice(-4)}
										</span>
									{/if}
								</div>
							{/if}
						</div>
					</div>
					<div class="p-4">
						{#if custodyLoading}
							<div class="flex items-center justify-center py-8">
								<Loader2 class="w-6 h-6 animate-spin text-text" />
								<span class="ml-2 text-text">Fetching channel state...</span>
							</div>
						{:else if custodyError}
							<div class="text-center py-8">
								<div class="text-red-600 mb-2">Failed to fetch channel state</div>
								<div class="text-sm text-text">{custodyError}</div>
								<button
									class="mt-3 px-4 py-2 text-sm bg-muted/20 hover:bg-muted/30 border border-border rounded transition-colors"
									on:click={fetchCustodyData}
								>
									Retry
								</button>
							</div>
						{:else if custodyData}
							{@const chain = getChainById(Number(data.channel.chain_id))}
							<div class="space-y-6">
								<!-- Channel Status Overview -->
								<div
									class="flex flex-wrap items-center gap-3 p-3 bg-muted/5 rounded-lg border border-border/50"
								>
									<!-- Status Badge -->
									<div class="relative group">
										<Badge variant="secondary">
											{custodyData.status === 0 ? 'Open' : `Status ${custodyData.status}`}
										</Badge>
										<div
											class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
										>
											{custodyData.status === 0
												? 'Channel is open and active'
												: 'Channel status from smart contract'}
										</div>
									</div>

									<!-- Challenge Expiry Badge -->
									<div class="flex items-center gap-2">
										<Clock class="w-4 h-4 text-text/60" />
										<div class="relative group">
											<Badge variant="outline">
												{custodyData.challengeExpiry === 0n
													? 'No Challenge'
													: `Expires ${timeAgo(new Date(Number(custodyData.challengeExpiry) * 1000).toISOString())}`}
											</Badge>
											<div
												class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
											>
												{custodyData.challengeExpiry === 0n
													? 'No active dispute challenge'
													: 'Dispute challenge expiration time'}
											</div>
										</div>
									</div>

									<!-- Version Badge -->
									<div class="relative group">
										<Badge variant="secondary">
											Version {custodyData.lastValidState.version.toString()}
										</Badge>
										<div
											class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
										>
											Channel state version number
										</div>
									</div>

									<!-- Duration Badge -->
									<div class="relative group">
										<Badge variant="outline">
											{custodyData.channel.challenge.toString()}s Duration
										</Badge>
										<div
											class="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-background border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
										>
											Challenge dispute duration in seconds
										</div>
									</div>
								</div>

								<!-- Contract Details -->
								<div class="border border-border rounded-lg p-4">
									<h3 class="text-md font-semibold mb-4 flex items-center gap-2">
										<Shield class="w-4 h-4 text-text" />
										Contract Details
									</h3>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<!-- Adjudicator -->
										<div>
											<div class="text-xs text-text/60 mb-2 uppercase tracking-wider">
												Adjudicator
											</div>
											<div class="flex items-center gap-2">
												<a
													href={`/address/${custodyData.channel.adjudicator}`}
													class="font-sans text-sm text-text hover:text-text/80 truncate"
													title={custodyData.channel.adjudicator}
												>
													{shortHex(custodyData.channel.adjudicator)}
												</a>
												<CopyButton value={custodyData.channel.adjudicator} />
											</div>
										</div>

										<!-- Channel Nonce -->
										<div>
											<div class="text-xs text-text/60 mb-2 uppercase tracking-wider">Nonce</div>
											<div class="text-sm font-sans text-text font-medium">
												{custodyData.channel.nonce.toString()}
											</div>
										</div>
									</div>
								</div>

								<!-- Participants -->
								<div class="border border-border rounded-lg p-4">
									<h3 class="text-md font-semibold mb-4 flex items-center gap-2">
										<Users class="w-4 h-4 text-text" />
										Participants
									</h3>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
										{#each custodyData.channel.participants as participant, index}
											{@const isNode =
												participants &&
												participant.toLowerCase() === participants.broker.toLowerCase()}
											{@const isCounterparty =
												participants &&
												participant.toLowerCase() === participants.counterparty.toLowerCase()}
											<div class="p-3 bg-muted/5 rounded-lg border border-border/50">
												<div class="flex items-center gap-3">
													<AddressAvatar address={participant} size={32} />
													<div class="flex-1 min-w-0">
														<div class="text-xs font-medium text-text/80 mb-1">
															{#if isNode}
																Node
															{:else if isCounterparty}
																Participant
															{:else}
																Participant {index + 1}
															{/if}
														</div>
														<div class="flex gap-2 items-center">
															<a
																href={`/address/${participant}${isNode ? '?type=node' : ''}`}
																class="font-sans text-sm text-text hover:text-text/80 block truncate"
																title={participant}
															>
																{shortHex(participant)}
															</a>
															<CopyButton value={participant} />
														</div>
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>

								<!-- Token Allocations -->
								{#if custodyData.lastValidState.allocations.length > 0}
									<div class="border border-border rounded-lg p-4">
										<h3 class="text-md font-semibold mb-4 flex items-center gap-2">
											<Coins class="w-4 h-4 text-text" />
											Token Allocations
										</h3>
										<div class="overflow-x-auto">
											<table class="w-full">
												<thead>
													<tr class="border-b border-border">
														<th class="text-left text-xs font-medium text-text/60 py-2 px-3"
															>Token Contract</th
														>
														<th class="text-left text-xs font-medium text-text/60 py-2 px-3"
															>Address</th
														>
														<th class="text-right text-xs font-medium text-text/60 py-2 px-3"
															>Amount</th
														>
													</tr>
												</thead>
												<tbody>
													{#each custodyData.lastValidState.allocations as allocation, index}
														<tr
															class="border-b border-border/50 hover:bg-muted/5 transition-colors"
														>
															<td class="py-3 px-3">
																<div class="flex items-center gap-2">
																	<a
																		href={`/asset/${allocation.token}`}
																		class="font-sans text-sm text-text hover:text-text/80"
																		title={allocation.token}
																	>
																		{shortHex(allocation.token, 6, 4)}
																	</a>
																	<CopyButton value={allocation.token} />
																</div>
															</td>
															<td class="py-3 px-3">
																<div class="flex items-center gap-2">
																	<AddressAvatar address={allocation.destination} size={24} />
																	<a
																		href={`/address/${allocation.destination}`}
																		class="font-sans text-sm text-text hover:text-text/80"
																		title={allocation.destination}
																	>
																		{shortHex(allocation.destination, 6, 4)}
																	</a>
																	<CopyButton value={allocation.destination} />
																</div>
															</td>
															<td class="py-3 px-3 text-right">
																<div class="font-sans text-sm text-text font-medium">
																	{formatAmount(
																		allocation.amount.toString(),
																		allocation.token.toLowerCase() ===
																			data.channel.token.toLowerCase()
																			? data.channel.asset?.decimals
																				? parseInt(data.channel.asset.decimals)
																				: 18
																			: 18,
																		6
																	)}
																	{#if allocation.token.toLowerCase() === data.channel.token.toLowerCase()}
																		{data.channel.asset?.symbol?.toUpperCase() ?? ''}
																	{/if}
																</div>
															</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									</div>
								{/if}

								<!-- State Information -->
								<div class="border border-border rounded-lg p-4">
									<h3 class="text-md font-semibold mb-4 flex items-center gap-2">
										<Activity class="w-4 h-4 text-text" />
										State Information
									</h3>
									<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
										<!-- Intent -->
										<div>
											<div class="text-xs text-text/60 mb-2 uppercase tracking-wider">Intent</div>
											<div class="text-sm font-sans text-text font-medium">
												{custodyData.lastValidState.intent}
											</div>
										</div>

										<!-- Signatures Count -->
										<div>
											<div class="text-xs text-text/60 mb-2 uppercase tracking-wider">
												Signatures
											</div>
											<div class="text-sm text-text font-medium">
												{custodyData.lastValidState.sigs.length}
											</div>
										</div>

										<!-- State Data -->
										<div>
											<div class="text-xs text-text/60 mb-2 uppercase tracking-wider">
												State Data
											</div>
											<div class="text-sm font-sans text-text break-all">
												{custodyData.lastValidState.data || '0x'}
											</div>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="mt-8 flex gap-4">
			<a
				href="/channels"
				class="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors"
			>
				← Back to Channels
			</a>
		</div>
	{/if}
</div>
