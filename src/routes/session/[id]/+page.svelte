<script lang="ts">
	import { onMount } from 'svelte';
	import { shortHex, timeAgo } from '$lib/format';
	import type { AppSession } from '$lib/types';
	import { FileText, Users, Clock, ExternalLink, Activity, Coins, Box } from 'lucide-svelte';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { createSessionSEO } from '$lib/utils/seo';
	import { trackSessionView } from '$lib/analytics';

	function getStatusVariant(status: string): 'default' | 'destructive' {
		return status.toLowerCase() === 'open' ? 'default' : 'destructive';
	}

	function getStatusClass(status: string) {
		return status.toLowerCase() === 'open'
			? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
			: 'capitalize';
	}

	export let data: {
		session: AppSession | null;
		notFound?: boolean;
	};

	$: seoData = data.session ? createSessionSEO(data.session) : null;
	console.log(data.session);
	onMount(() => {
		if (data.session) {
			trackSessionView(data.session.session_id);
		}
	});
</script>

<svelte:head>
	{#if seoData}
		<title>{seoData.title}</title>
		<meta name="description" content={seoData.description} />
		<meta name="keywords" content={seoData.keywords} />
		<meta name="author" content="yellowscan" />
		<meta name="format-detection" content="telephone=no" />

		<!-- Open Graph meta tags -->
		<meta property="og:title" content={seoData.ogTitle} />
		<meta property="og:description" content={seoData.ogDescription} />
		<meta property="og:type" content="website" />
		<meta property="og:site_name" content="yellowscan" />
		<meta property="og:url" content={seoData.ogUrl} />
		<meta property="og:image" content={seoData.ogImage} />
		<meta property="og:image:alt" content="Visit yellowscan" />

		<link rel="canonical" href={seoData.canonical} />
	{:else}
		<title>Session Not Found | yellowscan</title>
		<meta
			name="description"
			content="The requested session could not be found on Yellow Network Explorer."
		/>
		<meta name="keywords" content="Yellow Network, explorer, session, not found" />
		<meta name="author" content="yellowscan" />
		<link rel="canonical" href="https://yellowscan.io/session/" />
	{/if}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	{#if data.notFound || !data.session}
		<div class="text-center py-12">
			<div class="text-muted-foreground mb-4">
				<FileText class="w-16 h-16 mx-auto" />
			</div>
			<h1 class="text-2xl font-bold mb-2">Session Not Found</h1>
			<p class="text-muted-foreground mb-4">
				The session you're looking for doesn't exist or has been removed.
			</p>
			<a href="/sessions" class="text-text hover:text-text/80">← Back to Sessions</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-start justify-between mb-4">
				<div>
					<h1 class="text-3xl font-bold mb-2">Session Details</h1>
					<div class="flex items-center gap-2 mb-2">
						<span class="text-text">Session ID:</span>
						<code class="font-sans text-lg py-1 rounded text-text" title={data.session.session_id}>
							{shortHex(data.session.session_id, 8, 8)}
						</code>
						<CopyButton value={data.session.session_id} />
					</div>
					{#if data.session.channel_id}
						<div class="flex items-center gap-2 mb-2">
							<span class="text-text">Channel:</span>
							<a
								href={`/channel/${data.session.channel_id}`}
								class="font-sans text-text hover:text-text/80"
								title={data.session.channel_id}
							>
								{shortHex(data.session.channel_id, 8, 8)}
							</a>
							<CopyButton value={data.session.channel_id} />
						</div>
					{/if}
				</div>
				<Badge
					variant={getStatusVariant(data.session.status)}
					class={getStatusClass(data.session.status)}
				>
					{data.session.status}
				</Badge>
			</div>
		</div>

		<!-- Session Overview Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Users class="w-5 h-5 text-text" />
				</div>
				<div class="text-xl font-bold text-text mb-0.5">
					{data.session.participants?.length || 0}
				</div>
				<div class="text-xs text-text">Participants</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Box class="w-5 h-5 text-text" />
				</div>
				<div class="text-lg font-medium text-text mb-0.5">
					{data.session.protocol || 'Unknown'}
				</div>
				<div class="text-xs text-text">Protocol</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Activity class="w-5 h-5 text-text" />
				</div>
				<div class="flex justify-center mb-0.5">
					<Badge
						variant={getStatusVariant(data.session.status)}
						class="{getStatusClass(data.session.status)} text-xs"
					>
						{data.session.status}
					</Badge>
				</div>
				<div class="text-xs text-text">Session State</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-4 text-center">
				<div class="flex items-center justify-center mb-1.5">
					<Clock class="w-5 h-5 text-text" />
				</div>
				<div class="text-lg font-medium text-text mb-0.5">
					{timeAgo(data.session.updated_at)}
				</div>
				<div class="text-xs text-text">Last Updated</div>
			</div>
		</div>

		<!-- Session Details -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
					{#if data.session.participants && data.session.participants.length > 0}
						{#each data.session.participants as participant, index}
							<div>
								<div class="text-xs text-text uppercase tracking-wider mb-3">
									Address #{index + 1}
								</div>
								<div class="flex items-center gap-3">
									<AddressAvatar address={participant} size={40} />
									<div class="flex-1 min-w-0">
										<div class="flex gap-2 items-center">
											<a
												href={`/address/${participant}`}
												class="font-sans text-text hover:text-text/80 block truncate"
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
					{:else}
						<div class="text-center py-8 text-muted-foreground">
							<Users class="w-12 h-12 mx-auto mb-4 opacity-50" />
							<p>No addresses found</p>
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
						<FileText class="w-5 h-5 text-text" />
						Technical Details
					</h2>
				</div>
				<div class="p-4 space-y-4">
					<div>
						<div class="text-xs text-text uppercase tracking-wider">Session ID</div>
						<div class="font-sans text-sm mt-1 break-all">{data.session.session_id}</div>
					</div>

					<div>
						<div class="text-xs text-text uppercase tracking-wider">Channel ID</div>
						<div class="font-sans text-sm mt-1">
							{#if data.session.channel_id}
								<a
									href={`/channel/${data.session.channel_id}`}
									class="text-text hover:text-text/80"
								>
									{shortHex(data.session.channel_id, 12, 8)}
								</a>
							{:else}
								<span class="text-text">—</span>
							{/if}
						</div>
					</div>

					<div>
						<div class="text-xs text-text uppercase tracking-wider">Protocol</div>
						<div class="text-sm font-medium mt-1">{data.session.protocol || 'Not specified'}</div>
					</div>

					{#if data.session.quorum !== undefined}
						<div>
							<div class="text-xs text-text uppercase tracking-wider">Quorum</div>
							<div class="text-sm font-medium mt-1">{data.session.quorum}</div>
						</div>
					{/if}

					{#if data.session.weight !== undefined}
						<div>
							<div class="text-xs text-text uppercase tracking-wider">Weight</div>
							<div class="text-sm font-medium mt-1">
								[{Array.isArray(data.session.weight)
									? data.session.weight.join(', ')
									: data.session.weight}]
							</div>
						</div>
					{/if}

					{#if data.session.challenge}
						<div>
							<div class="text-xs text-text uppercase tracking-wider">Challenge</div>
							<div class="font-sans text-sm mt-1 break-all">{data.session.challenge}</div>
						</div>
					{/if}

					{#if data.session.session_data}
						<div>
							<div class="text-xs text-text uppercase tracking-wider">Session Data</div>
							<div class="mt-1">
								<pre
									class="text-xs bg-muted/20 p-3 rounded border text-text overflow-x-auto max-h-48 overflow-y-auto">{JSON.stringify(
										JSON.parse(data.session.session_data),
										null,
										2
									)}</pre>
							</div>
						</div>
					{/if}

					<div>
						<div class="text-xs text-text uppercase tracking-wider">Last Updated</div>
						<div class="text-sm mt-1">{new Date(data.session.updated_at).toLocaleString()}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="mt-8 flex gap-4">
			<a
				href="/sessions"
				class="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors"
			>
				← Back to Sessions
			</a>
		</div>
	{/if}
</div>
