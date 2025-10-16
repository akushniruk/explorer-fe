<script lang="ts">
	import type { Channel, AppSession, Node } from '$lib/types';
	import { createAddressSEO } from '$lib/utils/seo';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Import components
	import AddressHeader from '$lib/components/address/AddressHeader.svelte';
	import AddressStatsCards from '$lib/components/address/AddressStatsCards.svelte';
	import AddressTabs from '$lib/components/address/AddressTabs.svelte';

	// Import enhanced node components
	import NodeHeroProfile from '$lib/components/node/NodeHeroProfile.svelte';

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

	$: seoData = createAddressSEO(data.address, data.stats);

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

	<!-- Twitter meta tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@yellowscan" />
	<meta property="twitter:image" content={seoData.ogImage} />
	<meta name="twitter:image:alt" content="Visit yellowscan" />

	<link rel="canonical" href={seoData.canonical} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6">
	{#if data.addressType === 'node' && data.node}
		<!-- Enhanced Node Profile Layout -->
		<!-- Hero/Profile Block -->
		<NodeHeroProfile
			node={data.node}
			stats={{
				totalChannels: data.stats.totalChannels,
				activeChannels: data.stats.activeChannels
			}}
		/>

		<!-- Channels Table (simplified for nodes) -->
		<div class="mt-8">
			<AddressTabs
				address={data.address}
				addressType={data.addressType}
				lookupType={data.lookupType}
				participants={data.participants}
				channels={data.channels}
				sessions={data.sessions}
				pagination={data.pagination}
				{onPageChange}
				{onPageSizeChange}
			/>
		</div>
	{:else}
		<!-- Standard Address Layout -->
		<!-- Header -->
		<div class="mb-8">
			<AddressHeader
				address={data.address}
				addressType={data.addressType}
				lookupType={data.lookupType}
				wallet={data.wallet}
				participants={data.participants}
				node={data.node}
			/>
		</div>

		<!-- Stats Cards -->
		<AddressStatsCards stats={data.stats} addressType={data.addressType} />

		<!-- Tabs and Content -->
		<AddressTabs
			address={data.address}
			addressType={data.addressType}
			lookupType={data.lookupType}
			participants={data.participants}
			channels={data.channels}
			sessions={data.sessions}
			pagination={data.pagination}
			{onPageChange}
			{onPageSizeChange}
		/>
	{/if}
</div>
