<script lang="ts">
	export let title: string;
</script>

<div class="rounded-xl border border-border/60 bg-card shadow-sm p-4">
	<div class="text-xs text-muted-foreground">{title}</div>
	<div class="mt-1 text-lg font-semibold"><slot /></div>
</div>
