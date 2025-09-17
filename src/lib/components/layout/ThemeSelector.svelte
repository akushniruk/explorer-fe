<script lang="ts">
	import { theme } from '$lib/theme';
	import { Sun, Moon } from 'lucide-svelte';

	function toggleTheme() {
		theme.set($theme === 'light' ? 'dark' : 'light');
	}
</script>

<button
	type="button"
	on:click={toggleTheme}
	class="text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
	aria-label="Toggle theme"
>
	{#if $theme === 'light'}
		<Sun class="w-6 h-6" aria-hidden="true" />
	{:else}
		<Moon class="w-6 h-6" aria-hidden="true" />
	{/if}
</button>
