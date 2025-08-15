<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { theme, applyTheme } from '$lib/theme';
	import { FileText, ChevronDown, Heart } from 'lucide-svelte';

	let showThemeDropdown = false;

	function setTheme(newTheme: 'light' | 'dark') {
		theme.set(newTheme);
		showThemeDropdown = false;
	}

	function getThemeDisplay(t: 'light' | 'dark') {
		return t === 'light' ? 'Light' : 'Dark';
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('[data-theme-dropdown]')) showThemeDropdown = false;
	}

	onMount(() => {
		// apply the initial theme and keep in sync
		applyTheme(get(theme));
		const unsubscribe = theme.subscribe(applyTheme);
		document.addEventListener('click', handleClickOutside);
		return () => {
			unsubscribe();
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<svelte:head>
	<title>YNScan - The Yellow Network Explorer</title>
	<meta
		name="description"
		content="Explore and monitor The Yellow Network's payment channels, app sessions, and blockchain assets. Real-time network statistics and comprehensive blockchain data analysis."
	/>
	<meta
		name="keywords"
		content="Yellow Network, blockchain explorer, payment channels, app sessions, cryptocurrency, DeFi, blockchain scanner"
	/>
	<meta name="author" content="YNScan" />
	<meta property="og:title" content="YNScan - The Yellow Network Explorer" />
	<meta
		property="og:description"
		content="Explore and monitor The Yellow Network's payment channels, app sessions, and blockchain assets."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ynscan.xyz" />
	<meta property="og:site_name" content="YNScan" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="YNScan - The Yellow Network Explorer" />
	<meta
		name="twitter:description"
		content="Explore and monitor The Yellow Network's payment channels, app sessions, and blockchain assets."
	/>
	<link rel="canonical" href="https://ynscan.xyz" />
</svelte:head>

<div class="min-h-dvh bg-background text-foreground flex flex-col">
	<!-- Header -->
	<header class="bg-background border-b border-border">
		<div class="max-w-7xl mx-auto px-4">
			<!-- Top bar -->
			<div class="flex items-center justify-between py-2 text-xs sm:text-sm">
				<div class="flex items-center gap-3">
					<span class="text-muted-foreground">The Yellow Network Explorer</span>
					<div class="hidden sm:flex items-center gap-2">
						<span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
						<span class="text-muted-foreground">Online</span>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<a
						href="https://erc7824.org/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:underline inline-flex items-center gap-1"
						title="ERC-7824 Documentation"
					>
						<FileText class="w-4 h-4" aria-hidden="true" />
						<span>Docs</span>
					</a>

					<!-- Theme dropdown -->
					<div class="relative" data-theme-dropdown>
						<button
							type="button"
							on:click={() => (showThemeDropdown = !showThemeDropdown)}
							class="text-muted-foreground hover:text-foreground text-xs inline-flex items-center gap-1"
							aria-haspopup="menu"
							aria-expanded={showThemeDropdown}
						>
							{getThemeDisplay($theme)}
							<ChevronDown
								class={`w-3 h-3 transition-transform ${showThemeDropdown ? 'rotate-180' : ''}`}
								aria-hidden="true"
							/>
						</button>

						{#if showThemeDropdown}
							<div
								class="absolute top-full right-0 mt-1 rounded-lg border border-border bg-background shadow-lg z-50 min-w-[8rem]"
								role="menu"
							>
								<button
									type="button"
									on:click={() => setTheme('light')}
									class="w-full px-3 py-2 text-xs text-left hover:bg-accent rounded-t-lg transition-colors {$theme ===
									'light'
										? 'bg-accent'
										: ''}"
									role="menuitem"
								>
									Light
								</button>
								<button
									type="button"
									on:click={() => setTheme('dark')}
									class="w-full px-3 py-2 text-xs text-left hover:bg-accent rounded-b-lg transition-colors {$theme ===
									'dark'
										? 'bg-accent'
										: ''}"
									role="menuitem"
								>
									Dark
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Main header -->
			<div class="py-3">
				<div class="flex items-center justify-between gap-8">
					<a href="/" class="flex items-center gap-3 flex-shrink-0">
						<span class="text-lg font-semibold tracking-tight">ynscan</span>
					</a>

					<!-- Navigation on right -->
					<nav class="flex items-center gap-8">
						<a
							href="/"
							class="text-sm text-foreground hover:text-muted-foreground transition-colors">Home</a
						>
						<a
							href="/channels"
							class="text-sm text-foreground hover:text-muted-foreground transition-colors"
							>Channels</a
						>
						<a
							href="/sessions"
							class="text-sm text-foreground hover:text-muted-foreground transition-colors"
							>Sessions</a
						>
						<a
							href="/assets"
							class="text-sm text-foreground hover:text-muted-foreground transition-colors"
							>Assets</a
						>
						<a
							href="/nodes"
							class="text-sm text-foreground hover:text-muted-foreground transition-colors">Nodes</a
						>
						<a
							href="/search"
							class="text-sm text-foreground hover:text-muted-foreground transition-colors"
							>Search</a
						>
					</nav>
				</div>
			</div>
		</div>
	</header>

	<main class="flex-1">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="border-t border-border py-3 mt-auto">
		<div class="max-w-7xl mx-auto px-4">
			<div
				class="flex flex-col md:flex-row justify-between items-center gap-2 text-[11px] text-muted-foreground"
			>
				<p class="m-0">ynscan © 2025</p>
				<!-- <p class="m-0 text-center md:text-right">
					Donations:
					<a href="/participant/0x71c7656ec7ab88b098defb751b7401b5f6d8976f" class="underline">
						0x71c765...d8976f
					</a>
					<Heart class="w-3 h-3 inline" aria-hidden="true" />
				</p> -->
			</div>
		</div>
	</footer>
</div>
