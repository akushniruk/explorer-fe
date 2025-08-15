<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import { theme, applyTheme } from '$lib/theme';

	function toggleTheme() {
		theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
	}

	onMount(() => {
		const originalTheme = $theme;
		theme.set('dark');
		applyTheme('dark');
		
		const unsubscribe = theme.subscribe(applyTheme);
		
		return () => {
			unsubscribe();
			theme.set(originalTheme);
			applyTheme(originalTheme);
		};
	});
</script>

<div class="min-h-dvh bg-bg text-fg">
	<!-- Top Header (same as main layout but no max-width constraint) -->
	<header class="bg-bg border-b border-border">
		<div class="px-4">
			<!-- Top bar with network selector and theme toggle -->
			<div class="flex items-center justify-between py-2 text-sm">
				<div class="flex items-center gap-4">
					<span class="text-muted-foreground">The Yellow Network Explorer</span>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 bg-success rounded-full"></div>
						<span class="text-success text-xs font-medium">Online</span>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<button on:click={toggleTheme} class="text-muted-foreground hover:text-fg text-xs">
						{$theme === 'dark' ? 'Light' : 'Dark'} Theme
					</button>
				</div>
			</div>

			<!-- Main header -->
			<div class="py-4">
				<div class="flex items-center justify-between">
					<!-- Logo on left -->
					<a href="/" class="flex items-center gap-3">
						<div class="w-8 h-8 bg-brand rounded flex items-center justify-center">
							<span class="text-brand-foreground font-bold text-sm">Y</span>
						</div>
						<span class="text-xl font-bold">YNScan</span>
					</a>

					<!-- Navigation on right -->
					<nav class="flex items-center gap-8">
						<a href="/" class="text-sm hover:text-brand transition-colors">Home</a>
						<a href="/channels" class="text-sm hover:text-brand transition-colors">Channels</a>
						<a href="/sessions" class="text-sm hover:text-brand transition-colors">Sessions</a>
						<a href="/assets" class="text-sm hover:text-brand transition-colors">Assets</a>
						<a href="/networks" class="text-sm hover:text-brand transition-colors">Networks</a>
						<a href="/nodes" class="text-sm text-brand transition-colors">Nodes</a>
					</nav>
				</div>
			</div>
		</div>
	</header>

	<!-- Full width/height content -->
	<main class="h-[calc(100vh-120px)]">
		<slot />
	</main>
</div>
