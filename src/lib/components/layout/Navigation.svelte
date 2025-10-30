<script lang="ts">
	import { onMount } from 'svelte';
	import { Menu, X } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let showMobileMenu = false;
	let isMainnet = true;

	$: if (browser) {
		isMainnet = window.location.hostname === 'yellowscan.io' || window.location.hostname === 'localhost';
	}

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/channels', label: 'Channels' },
		{ href: '/sessions', label: 'Sessions' },
		{ href: '/assets', label: 'Assets' }
		// { href: '/nodes', label: 'Nodes' }
	];

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('[data-mobile-menu]')) showMobileMenu = false;
	}

	function toggleMobileMenu(event: MouseEvent) {
		event.stopPropagation();
		showMobileMenu = !showMobileMenu;
	}

	function closeMobileMenu() {
		showMobileMenu = false;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="py-3">
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<a href="/" class="flex items-center gap-3 flex-shrink-0 h-[32px]">
				<span class="text-3xl font-semibold tracking-tight leading-none border-r pr-4 border-border flex items-center h-full">yellowscan</span>
			</a>

			<div class="flex items-center rounded shrink-0 h-[32px]">
				<a
					class="relative flex items-center gap-2 px-1.5 py-1 text-xs font-medium -outline-offset-1 transition-colors first:rounded-l-md first:border first:border-r-0 last:rounded-r-md last:border last:border-l-0 sm:h-[32px] sm:px-3 sm:text-sm {isMainnet ? 'cursor-default border-[#fcd000] bg-[#fcd000] text-black' : 'border-border-light text-text-light border-border hover:bg-background-dark/5 hover:dark:bg-background-light/5'}"
					data-state="closed"
					href="https://yellowscan.io"
				>
					Mainnet
				</a>
				<a
					class="relative flex items-center gap-2 px-1.5 py-1 text-xs font-medium -outline-offset-1 transition-colors first:rounded-l-md first:border first:border-r-0 last:rounded-r-md last:border last:border-l-0 sm:h-[32px] sm:px-3 sm:text-sm {!isMainnet ? 'cursor-default border-[#fcd000] bg-[#fcd000] text-black' : 'border-border-light text-text-light border-border hover:bg-background-dark/5 hover:dark:bg-background-light/5'}"
					href="https://sandbox.yellowscan.io">Sandbox</a
				>
			</div>

			<!-- Desktop Navigation -->
			<nav class="hidden md:flex items-center gap-6">
				{#each navItems as item}
					<a
						href={item.href}
						class="text-sm text-foreground hover:text-muted-foreground transition-colors leading-none"
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-4">
			<!-- Theme selector on desktop -->
			<div class="hidden md:block h-6 w-6">
				<slot />
			</div>

			<!-- Mobile menu button -->
			<button
				type="button"
				class="md:hidden p-1 text-foreground hover:text-muted-foreground"
				on:click={toggleMobileMenu}
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
	</div>

	<!-- Mobile Navigation -->
	{#if showMobileMenu}
		<div class="md:hidden absolute top-14 left-0 z-50 h-full w-full py-4 px-4 border-t bg-background border-border" data-mobile-menu>
			<nav class="flex flex-col gap-3">
				{#each navItems as item}
					<a
						href={item.href}
						class="text-lg text-foreground hover:text-muted-foreground transition-colors py-2"
						on:click={closeMobileMenu}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
</div>
