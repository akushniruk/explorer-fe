<script lang="ts">
	import TokenIcon from '../ui/TokenIcon.svelte';

	type Props = {
		symbol: string;
		name: string;
		logoUrl?: string;
		size?: number;
		class?: string;
	};

	let { symbol, name, logoUrl, size = 24, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-3 {className}">
	<TokenIcon {symbol} {logoUrl} {size} />
	<div class="flex items-baseline gap-1">
		<div class="text-xs text-muted-foreground">{name}</div>
		<div class="font-semibold text-sm uppercase">({symbol})</div>
	</div>
</div>
