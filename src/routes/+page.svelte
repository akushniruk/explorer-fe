<script lang="ts">
	import { onMount } from 'svelte';
	import StatsCard from '$lib/components/StatsCard.svelte';
	import LatestChannels from '$lib/components/LatestChannels.svelte';
	import LatestSessions from '$lib/components/LatestSessions.svelte';
	import type { Channel, AppSession, NetworkCounts } from '$lib/types';
	import HeroSection from '$lib/components/HeroSection.svelte';

	export let data: {
		counts: NetworkCounts;
		latest: { channels: Channel[]; sessions: AppSession[] };
	};

	let timer: ReturnType<typeof setInterval>;
	async function refreshLists() {
		try {
			const q = new URLSearchParams({ limit: '6', sortBy: 'updated_at', order: 'desc' });
			const [ch, ss] = await Promise.all([
				fetch(`/api/v1/channel/list?${q}`).then((r) => (r.ok ? r.json() : null)),
				fetch(`/api/v1/app-session/list?${q}`).then((r) => (r.ok ? r.json() : null))
			]);
			if (ch?.data) data.latest.channels = ch.data;
			if (ss?.data) data.latest.sessions = ss.data;
		} catch {}
	}
	onMount(() => {
		timer = setInterval(refreshLists, 20000);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>YNScan - The Yellow Network Explorer</title>
	<meta
		name="description"
		content="Explore The Yellow Network in real-time. Track channels, app sessions, network nodes, assets."
	/>
	<link rel="canonical" href="https://ynscan.xyz" />
</svelte:head>

<HeroSection />

<div class="max-w-7xl mx-auto px-4 py-6">
	<StatsCard counts={data.counts} />

	<section class="grid gap-6 lg:grid-cols-2">
		<LatestChannels channels={data.latest.channels} />
		<LatestSessions sessions={data.latest.sessions} />
	</section>
</div>
