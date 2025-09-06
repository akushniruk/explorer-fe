<script lang="ts">
	import { onMount } from 'svelte';
	import StatsCard from '$lib/components/StatsCard.svelte';
	import LatestChannels from '$lib/components/LatestChannels.svelte';
	import LatestSessions from '$lib/components/LatestSessions.svelte';
	import type { Channel, AppSession, NetworkCounts } from '$lib/types';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import { createHomeSEO } from '$lib/utils/seo';
	import { trackDataRefresh } from '$lib/analytics';

	export let data: {
		counts: NetworkCounts;
		latest: { channels: Channel[]; sessions: AppSession[] };
	};

	$: seoData = createHomeSEO(data.counts);

	let timer: ReturnType<typeof setInterval>;
	async function refreshLists() {
		try {
			const q = new URLSearchParams({ limit: '6', sort: 'updated_at', order: 'desc' });
			const [ch, ss] = await Promise.all([
				fetch(`/api/latest-channels?${q}`).then((r) => (r.ok ? r.json() : { data: [] })),
				fetch(`/api/latest-sessions?${q}`).then((r) => (r.ok ? r.json() : { data: [] }))
			]);
			if (ch?.data && Array.isArray(ch.data)) data.latest.channels = ch.data;
			if (ss?.data && Array.isArray(ss.data)) data.latest.sessions = ss.data;
			trackDataRefresh('home');
		} catch (error) {
			console.error('Failed to refresh lists:', error);
		}
	}
	onMount(() => {
		timer = setInterval(refreshLists, 20000);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>{seoData.title}</title>
	<meta name="description" content={seoData.description} />
	<meta name="keywords" content={seoData.keywords} />
	<meta name="author" content="ynscan" />
	
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
	<meta name="twitter:site" content="@yellownetwork" />
	<meta property="twitter:image" content={seoData.ogImage} />
	<meta name="twitter:image:alt" content="Visit ynscan" />
	
	<link rel="canonical" href={seoData.canonical} />
	
	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(seoData.structuredData)}</script>`}
</svelte:head>

<HeroSection />

<div class="max-w-7xl mx-auto px-4 py-6">
	<StatsCard counts={data.counts} />

	<section class="grid gap-6 lg:grid-cols-2">
		<LatestChannels channels={data.latest.channels} />
		<LatestSessions sessions={data.latest.sessions} />
	</section>
</div>
