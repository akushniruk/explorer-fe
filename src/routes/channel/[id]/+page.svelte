<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel } from '$lib/types';

	export let data: {
		channel: Channel | null;
		notFound?: boolean;
	};
</script>

<svelte:head>
	<title
		>Channel {data.channel ? shortHex(data.channel.channel_id, 8, 6) : 'Not Found'} | ynscan</title
	>
	<meta
		name="description"
		content="View detailed information for this payment channel on The Yellow Network. Channel participants, amounts, status, and transaction history."
	/>
	<link rel="canonical" href="https://ynscan.xyz/channel/{data.channel?.channel_id || ''}" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4">
	{#if data.notFound || !data.channel}
		<div class="text-center py-12">
			<div class="text-muted-foreground mb-4">
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
			<p class="text-muted-foreground mb-4">
				The channel you're looking for doesn't exist or has been removed.
			</p>
			<a href="/channels" class="text-brand hover:text-brand/80">← Back to Channels</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-start justify-between mb-4">
				<div>
					<h1 class="text-3xl font-bold mb-2">Channel Details</h1>
					<div class="flex items-center gap-2 mb-2">
						<span class="text-muted-foreground">Channel ID:</span>
						<code class="font-mono text-lg bg-accent/50 px-3 py-1 rounded text-accent-foreground">
							{data.channel.channel_id}
						</code>
						<button
							class="text-sm text-brand hover:text-brand/80"
							on:click={() => navigator.clipboard.writeText(data.channel.channel_id)}
						>
							Copy
						</button>
					</div>
				</div>
				<span
					class="inline-flex px-3 py-1 rounded text-sm font-medium"
					class:bg-emerald-100={data.channel.status === 'open'}
					class:text-emerald-800={data.channel.status === 'open'}
					class:bg-muted={data.channel.status === 'closed'}
					class:text-muted-foreground={data.channel.status === 'closed'}
					class:bg-yellow-100={data.channel.status === 'pending'}
					class:text-yellow-800={data.channel.status === 'pending'}
				>
					{data.channel.status.toUpperCase()}
				</span>
			</div>
		</div>

		<!-- Channel Overview Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="text-2xl font-bold text-brand mb-1">
					{formatAmount(
						data.channel.amount,
						data.channel.asset?.decimals ? parseInt(data.channel.asset.decimals) : 18,
						4
					)}
				</div>
				<div class="text-sm text-muted-foreground">
					{data.channel.asset?.symbol || 'ETH'} Amount
				</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="text-2xl font-bold text-muted-foreground mb-1">
					Chain {data.channel.chain_id}
				</div>
				<div class="text-sm text-muted-foreground">Network</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="text-2xl font-bold text-foreground mb-1">
					{data.channel.status === 'open' ? 'Active' : 'Inactive'}
				</div>
				<div class="text-sm text-muted-foreground">Channel State</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="text-2xl font-bold text-muted-foreground mb-1">
					{timeAgo(data.channel.updated_at)}
				</div>
				<div class="text-sm text-muted-foreground">Last Updated</div>
			</div>
		</div>

		<!-- Channel Details -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Participants -->
			<div class="bg-card border border-border rounded-lg">
				<div class="p-4 border-b border-border">
					<h2 class="text-lg font-semibold">Participants</h2>
				</div>
				<div class="p-6 space-y-6">
					<div>
						<h3 class="text-sm font-medium text-muted-foreground mb-2">From (Wallet)</h3>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center">
								<span class="text-brand font-bold text-sm">
									{data.channel.wallet.slice(2, 4).toUpperCase()}
								</span>
							</div>
							<div>
								<a
									href={`/address/${data.channel.wallet}`}
									class="font-mono text-brand hover:text-brand/80"
								>
									{data.channel.wallet}
								</a>
								<div class="text-xs text-muted-foreground">
									<button
										class="hover:text-fg"
										on:click={() => navigator.clipboard.writeText(data.channel.wallet)}
									>
										Copy Address
									</button>
								</div>
							</div>
						</div>
					</div>

					<div>
						<h3 class="text-sm font-medium text-muted-foreground mb-2">To (Participant)</h3>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
								<span class="text-muted-foreground font-bold text-sm">
									{data.channel.participant.slice(2, 4).toUpperCase()}
								</span>
							</div>
							<div>
								<a
									href={`/address/${data.channel.participant}`}
									class="font-mono text-brand hover:text-brand/80"
								>
									{data.channel.participant}
								</a>
								<div class="text-xs text-muted-foreground">
									<button
										class="hover:text-fg"
										on:click={() => navigator.clipboard.writeText(data.channel.participant)}
									>
										Copy Address
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Technical Details -->
			<div class="bg-card border border-border rounded-lg">
				<div class="p-4 border-b border-border">
					<h2 class="text-lg font-semibold">Technical Details</h2>
				</div>
				<div class="p-6 space-y-4">
					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Token Contract</div>
						<div class="font-mono text-sm mt-1">
							<a href={`/asset/${data.channel.token}`} class="text-brand hover:text-brand/80">
								{shortHex(data.channel.token, 12, 8)}
							</a>
						</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Chain ID</div>
						<div class="text-sm font-medium mt-1">{data.channel.chain_id}</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Amount (Wei)</div>
						<div class="font-mono text-sm mt-1">{data.channel.amount}</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Created</div>
						<div class="text-sm mt-1">{new Date(data.channel.updated_at).toLocaleString()}</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Last Updated</div>
						<div class="text-sm mt-1">{new Date(data.channel.updated_at).toLocaleString()}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="mt-8 flex gap-4">
			<a
				href="/channels"
				class="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors"
			>
				← Back to Channels
			</a>
			<button
				class="px-4 py-2 bg-brand text-brand-foreground rounded-lg hover:brightness-95 transition-all"
			>
				View on Block Explorer
			</button>
		</div>
	{/if}
</div>
