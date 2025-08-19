<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { theme, applyTheme } from '$lib/theme';
	import { FileText, ChevronDown, Heart, Menu, X } from 'lucide-svelte';

	let showThemeDropdown = false;
	let showMobileMenu = false;

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
		if (!target.closest('[data-mobile-menu]')) showMobileMenu = false;
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
	<!-- Header -->
	<header class="bg-background border-b border-border">
		<div class="max-w-7xl mx-auto px-4">
			<!-- Top bar -->
			<div class="flex items-center justify-between py-2 text-xs sm:text-sm">
				<div class="flex items-center gap-3">
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
							class="text-muted-foreground hover:text-foreground cursor-pointer inline-flex items-center gap-1"
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
								class="absolute top-full right-0 mt-1 cursor-pointer rounded-lg border border-border bg-background shadow-lg z-50 min-w-[8rem]"
								role="menu"
							>
								<button
									type="button"
									on:click={() => setTheme('light')}
									class="w-full px-3 py-2 text-xs text-left cursor-pointer hover:bg-accent rounded-t-lg transition-colors {$theme ===
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
									class="w-full px-3 py-2 text-xs text-left cursor-pointer hover:bg-accent rounded-b-lg transition-colors {$theme ===
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
				<div class="flex items-center justify-between gap-4">
					<a href="/" class="flex items-center gap-3 flex-shrink-0">
						<span class="text-lg font-semibold tracking-tight">ynscan</span>
					</a>

					<!-- Desktop Navigation -->
					<nav class="hidden md:flex items-center gap-8">
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
					</nav>

					<!-- Mobile menu button -->
					<button
						type="button"
						class="md:hidden p-1 text-foreground hover:text-muted-foreground"
						on:click={() => (showMobileMenu = !showMobileMenu)}
						aria-label="Toggle mobile menu"
						data-mobile-menu
					>
						{#if showMobileMenu}
							<X class="w-5 h-5" />
						{:else}
							<Menu class="w-5 h-5" />
						{/if}
					</button>
				</div>

				<!-- Mobile Navigation -->
				{#if showMobileMenu}
					<div class="md:hidden mt-4 pb-4 border-t border-border pt-4" data-mobile-menu>
						<nav class="flex flex-col gap-3">
							<a
								href="/"
								class="text-sm text-foreground hover:text-muted-foreground transition-colors py-2"
								on:click={() => (showMobileMenu = false)}>Home</a
							>
							<a
								href="/channels"
								class="text-sm text-foreground hover:text-muted-foreground transition-colors py-2"
								on:click={() => (showMobileMenu = false)}>Channels</a
							>
							<a
								href="/sessions"
								class="text-sm text-foreground hover:text-muted-foreground transition-colors py-2"
								on:click={() => (showMobileMenu = false)}>Sessions</a
							>
							<a
								href="/assets"
								class="text-sm text-foreground hover:text-muted-foreground transition-colors py-2"
								on:click={() => (showMobileMenu = false)}>Assets</a
							>
							<a
								href="/nodes"
								class="text-sm text-foreground hover:text-muted-foreground transition-colors py-2"
								on:click={() => (showMobileMenu = false)}>Nodes</a
							>
						</nav>
					</div>
				{/if}
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
					<a href="/address/0x71c7656ec7ab88b098defb751b7401b5f6d8976f" class="underline">
						0x71c765...d8976f
					</a>
					<Heart class="w-3 h-3 inline" aria-hidden="true" />
				</p> -->
			</div>
		</div>
	</footer>
</div>
