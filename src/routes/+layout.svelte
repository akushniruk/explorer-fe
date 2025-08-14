<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme, applyTheme } from '$lib/theme';

	function toggleTheme() {
		theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
	}

	onMount(() => {
		applyTheme($theme);
		const unsubscribe = theme.subscribe(applyTheme);
		return () => unsubscribe();
	});
</script>

<div class="min-h-dvh bg-bg text-fg">
	<header class="border-b border-border/60 px-4 py-3 flex items-center justify-between">
		<a href="/" class="font-semibold tracking-tight">Nexus</a>
		<div class="flex items-center gap-2">
			<button
				on:click={toggleTheme}
				class="inline-flex h-9 px-3 items-center rounded-md border border-border text-sm hover:bg-muted"
			>
				Toggle theme
			</button>
			<a
				href="/channel/list"
				class="inline-flex h-9 px-4 items-center rounded-md font-medium
               bg-brand text-brand-foreground hover:brightness-95
               focus:outline-none focus:ring-2 focus:ring-brand/60"
			>
				Explore Channels
			</a>
		</div>
	</header>

	<main class="px-4 py-6">
		<slot />
	</main>
</div>
