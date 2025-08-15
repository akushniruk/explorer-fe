<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';

	export let value = '';
	export let title = 'Copy to clipboard';
	let copied = false;

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			setTimeout(() => (copied = false), 1200);
		} catch {
			// fallback
			const ta = document.createElement('textarea');
			ta.value = value;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
			copied = true;
			setTimeout(() => (copied = false), 1200);
		}
	}
</script>

<button
	type="button"
	class="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors"
	on:click|stopPropagation={copy}
	aria-label={title}
	{title}
>
	{#if copied}
		<Check class="h-3.5 w-3.5" />
	{:else}
		<Copy class="h-3.5 w-3.5" />
	{/if}
	<span class="min-w-[3.5rem] text-xs">{copied ? 'Copied' : 'Copy'}</span>
</button>
