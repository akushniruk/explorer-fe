<script lang="ts">
	export let title: string | undefined = undefined;
	export let withHeader: boolean = false;
	export let className = '';
</script>

<section class={`rounded-xl border border-border/60 bg-card shadow-sm ${className}`}>
	{#if withHeader}
		<header class="flex items-center justify-between px-4 py-3 border-b border-border/60">
			<h3 class="text-sm font-medium text-muted-foreground">{title}</h3>
			<slot name="actions" />
		</header>
	{/if}
	<div class="p-4">
		<slot />
	</div>
</section>
