<script lang="ts">
	import { onMount } from 'svelte';
	import { shortHex, formatAmount, timeAgo} from '$lib/format';
	import type { Channel } from '$lib/types';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import { getChainById } from '$lib/ctypto/utils';
	import Chain from '$lib/components/Chain.svelte';
	import { CreditCard, Users, Activity, Clock, Coins, Box } from 'lucide-svelte';
	import { createChannelSEO } from '$lib/utils/seo';
	import { trackChannelView } from '$lib/analytics';

	import type { NodeConfig } from '$lib/types';

	export let data: {
		channel: Channel | null;
		nodeConfig: NodeConfig | null;
		notFound?: boolean;
	};

	$: seoData = data.channel ? createChannelSEO(data.channel) : null;

	// Compute participants based on business logic
	$: participants = data.channel && data.nodeConfig ? {
		broker: data.nodeConfig.broker_address,
		counterparty: data.channel.wallet ?? data.channel.participant,
	} : null;

	onMount(() => {
		if (data.channel) {
			trackChannelView(data.channel.channel_id);
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
		
		<!-- Twitter meta tags -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={seoData.twitterTitle} />
		<meta name="twitter:description" content={seoData.twitterDescription} />
		<meta name="twitter:site" content="@ynscan" />
		<meta property="twitter:image" content={seoData.ogImage} />
		<meta name="twitter:image:alt" content="Visit ynscan" />
		
		<link rel="canonical" href={seoData.canonical} />
	{:else}
		<title>Channel Not Found | ynscan</title>
		<meta name="description" content="The requested channel could not be found on Yellow Network Explorer." />
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
			<a href="/channels" class="text-brand hover:text-brand/80">← Back to Channels</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-start justify-between mb-4">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<span class="text-text">Channel ID:</span>
						<code class="font-sans text-lg py-1 rounded text-text">
							{data.channel.channel_id}
						</code>
						<CopyButton value={data.channel.channel_id} />
					</div>
				</div>
			</div>
		</div>

		<!-- Channel Overview Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<Coins class="w-6 h-6 text-text" />
				</div>
				<div class="text-2xl font-bold text-text mb-1">
					{formatAmount(
						data.channel.amount,
						data.channel.asset?.decimals ? parseInt(data.channel.asset.decimals) : 18,
						4
					)}
				</div>
				<div class="text-sm text-text">
					{data.channel.asset?.symbol?.toUpperCase() ?? ''} Amount
				</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<Box class="w-6 h-6 text-text" />
				</div>
				<div class="text-lg font-medium text-text mb-1 flex justify-center">
					<Chain chainId={Number(data.channel.chain_id)} />
				</div>
				<div class="text-sm text-text">Network</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<Activity class="w-6 h-6 text-text" />
				</div>
				<div
					class="text-lg font-medium {data.channel.status === 'open'
						? 'text-emerald-600'
						: 'text-text'} mb-1"
				>
					{data.channel.status === 'open' ? 'Active' : 'Inactive'}
				</div>
				<div class="text-sm text-text">Channel State</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<Clock class="w-6 h-6 text-text" />
				</div>
				<div class="text-lg font-medium text-text mb-1">
					{timeAgo(data.channel.updated_at)}
				</div>
				<div class="text-sm text-text">Last Updated</div>
			</div>
		</div>

		<!-- Channel Details -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{#if data.channel}
				{@const chain = getChainById(Number(data.channel.chain_id))}
				<!-- Participants -->
				<div class="bg-card border border-border rounded-lg">
					<div class="p-4 border-b border-border">
						<h2 class="text-lg font-semibold flex items-center gap-2">
							<Users class="w-5 h-5 text-text" />
							Addresses
						</h2>
					</div>
					<div class="p-6 space-y-6">
						{#if participants}
							<!-- Broker (from NodeConfig) -->
							<div>
								<div class="text-xs text-text uppercase tracking-wider mb-3">Node</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={participants.broker} size={40} />
									<div class="flex-1 min-w-0">
										<a
											href={`/address/${participants.broker}?type=node`}
											class="font-sans text-brand hover:text-brand/80 block truncate"
										>
											{shortHex(participants.broker)}
										</a>
										<div class="flex items-center gap-2 mt-1">
											<CopyButton value={participants.broker} />
											{#if chain}
												<a
													href={`${chain.blockExplorers?.default.url}/address/${participants.broker}`}
													target="_blank"
													rel="noopener noreferrer"
													class="text-xs text-text hover:text-foreground"
													title={`View ${participants.broker} on ${chain.blockExplorers?.default.name}`}
												>
													View on Explorer
												</a>
											{/if}
										</div>
									</div>
								</div>
							</div>

							<!-- Participant/Wallet -->
							<div>
								<div class="text-xs text-text uppercase tracking-wider mb-3">
									Participant
								</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={participants.counterparty} size={40} />
									<div class="flex-1 min-w-0">
										<a
											href={`/address/${participants.counterparty}`}
											class="font-sans text-brand hover:text-brand/80 block truncate"
										>
											{shortHex(participants.counterparty)}
										</a>
										<div class="text-xs text-text mt-1">
											Participant address'
										</div>
										<div class="flex items-center gap-2 mt-1">
											<CopyButton value={participants.counterparty} />
											{#if chain}
												<a
													href={`${chain.blockExplorers?.default.url}/address/${participants.counterparty}`}
													target="_blank"
													rel="noopener noreferrer"
													class="text-xs text-text hover:text-foreground"
													title={`View ${participants.counterparty} on ${chain.blockExplorers?.default.name}`}
												>
													View on Explorer
												</a>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{:else}
							<!-- Fallback when NodeConfig is not available -->
							<div>
								<div class="text-xs text-text uppercase tracking-wider mb-3">Wallet</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={data.channel.wallet} size={40} />
									<div class="flex-1 min-w-0">
										<a
											href={`/address/${data.channel.wallet}`}
											class="font-sans text-brand hover:text-brand/80 block truncate"
										>
											{shortHex(data.channel.wallet)}
										</a>
										<div class="text-xs text-text mt-1">Wallet address</div>
										<div class="flex items-center gap-2 mt-1">
											<CopyButton value={data.channel.wallet} />
											{#if chain}
												<a
													href={`${chain.blockExplorers?.default.url}/address/${data.channel.wallet}`}
													target="_blank"
													rel="noopener noreferrer"
													class="text-xs text-text hover:text-foreground"
													title={`View ${data.channel.wallet} on ${chain.blockExplorers?.default.name}`}
												>
													View on Explorer
												</a>
											{/if}
										</div>
									</div>
								</div>
							</div>

							<div>
								<div class="text-xs text-text uppercase tracking-wider mb-3">Participant</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={data.channel.participant} size={40} />
									<div class="flex-1 min-w-0">
										<a
											href={`/address/${data.channel.participant}`}
											class="font-sans text-brand hover:text-brand/80 block truncate"
										>
											{shortHex(data.channel.participant)}
										</a>
										<div class="text-xs text-text mt-1">Participant address</div>
										<div class="flex items-center gap-2 mt-1">
											<CopyButton value={data.channel.participant} />
											{#if chain}
												<a
													href={`${chain.blockExplorers?.default.url}/address/${data.channel.participant}`}
													target="_blank"
													rel="noopener noreferrer"
													class="text-xs text-text hover:text-foreground"
													title={`View ${data.channel.participant} on ${chain.blockExplorers?.default.name}`}
												>
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
				<div class="bg-card border border-border rounded-lg">
					<div class="p-4 border-b border-border">
						<h2 class="text-lg font-semibold flex items-center gap-2">
							<CreditCard class="w-5 h-5 text-text" />
							Technical Details
						</h2>
					</div>
					<div class="p-6 space-y-4">
						<div>
							<div class="text-xs text-text uppercase tracking-wider">Channel ID</div>
							<div class="font-sans text-sm mt-1 break-all">{data.channel.channel_id}</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">
								Token Contract
							</div>
							<div class="font-sans text-sm mt-1">
								<div class="flex items-center gap-2">
									<a href={`/asset/${data.channel.token}`} class="text-brand hover:text-brand/80">
										{shortHex(data.channel.token, 12, 8)}
									</a>
									{#if chain}
										<a
											href={`${chain.blockExplorers?.default.url}/token/${data.channel.token}`}
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs text-text hover:text-foreground"
											title={`View ${data.channel.token} on ${chain.blockExplorers?.default.name}`}
										>
											View Token
										</a>
									{/if}
								</div>
							</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Chain ID</div>
							<div class="text-sm font-medium mt-1">{data.channel.chain_id}</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Amount (Wei)</div>
							<div class="font-sans text-sm mt-1">{data.channel.amount}</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Status</div>
							<div class="text-sm mt-1 capitalize font-medium">{data.channel.status}</div>
						</div>

						<div>
							<div class="text-xs text-text uppercase tracking-wider">Last Updated</div>
							<div class="text-sm mt-1">{new Date(data.channel.updated_at).toLocaleString()}</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

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
