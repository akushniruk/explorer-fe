<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { theme, applyTheme } from '$lib/theme';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import AppFooter from '$lib/components/layout/AppFooter.svelte';

	onMount(() => {
		applyTheme(get(theme));
		const unsubscribe = theme.subscribe(applyTheme);
		return unsubscribe;
	});
</script>

<svelte:head>
	<title>ynscan - The Yellow Network Explorer</title>
	<meta
		name="description"
		content="Explore and monitor The Yellow Network's channels, app sessions, and assets. Real-time network statistics and comprehensive data analysis."
	/>
	<meta
		name="keywords"
		content="Yellow Network, explorer, channels, app sessions, cryptocurrency, DeFi, network scanner"
	/>
	<meta name="author" content="ynscan" />
	<meta property="og:title" content="ynscan - The Yellow Network Explorer" />
	<meta
		property="og:description"
		content="Explore and monitor The Yellow Network's channels, app sessions, and network assets."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ynscan.xyz" />
	<meta property="og:site_name" content="ynsacn" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="ynsacn - The Yellow Network Explorer" />
	<meta
		name="twitter:description"
		content="Explore and monitor The Yellow Network's channels, app sessions, and network assets."
	/>
	<link rel="canonical" href="https://ynscan.xyz" />
</svelte:head>

<div class="min-h-dvh bg-background text-foreground flex flex-col">
	<AppHeader />

	<main class="flex-1">
		<slot />
	</main>

	<AppFooter />
</div>
