<script lang="ts">
	import { onMount } from 'svelte';
	import { shortHex, timeAgo } from '$lib/format';
	import type { AppSession } from '$lib/types';
	import { FileText, Users, Clock, ExternalLink, Activity } from 'lucide-svelte';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { createSessionSEO } from '$lib/utils/seo';
	import { trackSessionView } from '$lib/analytics';

	function getStatusVariant(status: string): 'default' | 'destructive' {
		return status.toLowerCase() === 'open' ? 'default' : 'destructive';
	}

	function getStatusClass(status: string) {
		return status.toLowerCase() === 'open' ? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize' : 'capitalize';
	}

	export let data: {
		session: AppSession | null;
		notFound?: boolean;
	};

	$: seoData = data.session ? createSessionSEO(data.session) : null;

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
		<title>Session Not Found | ynscan</title>
		<meta name="description" content="The requested session could not be found on Yellow Network Explorer." />
		<meta name="keywords" content="Yellow Network, explorer, session, not found" />
		<meta name="author" content="ynscan" />
		<link rel="canonical" href="https://ynscan.xyz/session/" />
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
			<a href="/sessions" class="text-brand hover:text-brand/80">← Back to Sessions</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-start justify-between mb-4">
				<div>
					<h1 class="text-3xl font-bold mb-2">Session Details</h1>
					<div class="flex items-center gap-2 mb-2">
						<span class="text-muted-foreground">Session ID:</span>
						<code class="font-sans text-lg bg-accent/50 px-3 py-1 rounded text-accent-foreground">
							{data.session.session_id}
						</code>
						<CopyButton value={data.session.session_id} />
					</div>
				</div>
				<Badge variant={getStatusVariant(data.session.status)} class={getStatusClass(data.session.status)}>
					{data.session.status}
				</Badge>
			</div>
		</div>

		<!-- Session Overview Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<Users class="w-6 h-6 text-muted-foreground" />
				</div>
				<div class="text-2xl font-bold text-brand mb-1">
					{data.session.participants?.length || 0}
				</div>
				<div class="text-sm text-muted-foreground">Addresses</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<FileText class="w-6 h-6 text-muted-foreground" />
				</div>
				<div class="text-lg font-medium text-foreground mb-1">
					{data.session.protocol || 'Unknown'}
				</div>
				<div class="text-sm text-muted-foreground">Protocol</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<Activity class="w-6 h-6 text-muted-foreground" />
				</div>
				<div class="mb-1 flex justify-center">
					<Badge variant={getStatusVariant(data.session.status)} class="{getStatusClass(data.session.status)} text-sm">
						{data.session.status}
					</Badge>
				</div>
				<div class="text-sm text-muted-foreground">Status</div>
			</div>
			<div class="bg-card border border-border rounded-lg p-6 text-center">
				<div class="flex items-center justify-center mb-2">
					<Clock class="w-6 h-6 text-muted-foreground" />
				</div>
				<div class="text-lg font-medium text-muted-foreground mb-1">
					{timeAgo(data.session.updated_at)}
				</div>
				<div class="text-sm text-muted-foreground">Last Activity</div>
			</div>
		</div>

		<!-- Session Details -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Participants -->
			<div class="bg-card border border-border rounded-lg">
				<div class="p-4 border-b border-border">
					<h2 class="text-lg font-semibold flex items-center gap-2">
						<Users class="w-5 h-5" />
						Addresses
					</h2>
				</div>
				<div class="p-6 space-y-4">
					{#if data.session.participants && data.session.participants.length > 0}
						{#each data.session.participants as participant, index}
							<div class="flex items-center gap-3">
								<AddressAvatar address={participant} size={40} />
								<div class="flex-1 min-w-0">
									<div class="text-xs text-muted-foreground mb-1">Address {index + 1}</div>
									<a
										href={`/address/${participant}`}
										class="font-sans text-sm text-brand hover:text-brand/80 block truncate"
									>
										{participant}
									</a>
									<CopyButton value={participant} />
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
			<div class="bg-card border border-border rounded-lg">
				<div class="p-4 border-b border-border">
					<h2 class="text-lg font-semibold flex items-center gap-2">
						<FileText class="w-5 h-5" />
						Technical Details
					</h2>
				</div>
				<div class="p-6 space-y-4">
					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Session ID</div>
						<div class="font-sans text-sm mt-1 break-all">{data.session.session_id}</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Channel ID</div>
						<div class="font-sans text-sm mt-1">
							<a
								href={`/channel/${data.session.channel_id}`}
								class="text-brand hover:text-brand/80"
							>
								{shortHex(data.session.channel_id, 12, 8)}
							</a>
						</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Protocol</div>
						<div class="text-sm font-medium mt-1">{data.session.protocol || 'Not specified'}</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Status</div>
						<div class="mt-1">
							<Badge variant={getStatusVariant(data.session.status)} class={getStatusClass(data.session.status)}>
								{data.session.status}
							</Badge>
						</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Last Updated</div>
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
