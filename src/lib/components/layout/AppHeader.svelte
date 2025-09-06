<script lang="ts">
	import ThemeSelector from './ThemeSelector.svelte';
	import Navigation from './Navigation.svelte';
</script>

<header class="bg-background border-b border-border">
	<div class="max-w-7xl mx-auto px-4">
		<Navigation>
			<ThemeSelector />
		</Navigation>
	</div>
</header>