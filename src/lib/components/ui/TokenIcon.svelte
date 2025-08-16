<script lang="ts">
	type Props = {
		symbol: string;
		logoUrl?: string;
		size?: number;
		class?: string;
	};

	let { symbol, logoUrl, size = 32, class: className = '' }: Props = $props();

	let imageError = $state(false);

	const handleImageError = () => {
		imageError = true;
	};

	const showFallback = $derived(!logoUrl || imageError);
	const iconSize = $derived(`${size}px`);
	const symbolChar = $derived(symbol.charAt(0).toUpperCase());
</script>

{#if showFallback}
	<div
		class="rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-sm {className}"
		style="width: {iconSize}; height: {iconSize}; font-size: {size * 0.4}px;"
		title={symbol}
	>
		<svg
			width={size * 0.6}
			height={size * 0.6}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
			<circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.4" />
			<text
				x="12"
				y="16"
				text-anchor="middle"
				font-family="monospace"
				font-weight="bold"
				font-size="10"
				fill="currentColor"
			>
				{symbolChar}
			</text>
		</svg>
	</div>
{:else}
	<img
		src={logoUrl}
		alt={symbol}
		class="rounded-full {className}"
		style="width: {iconSize}; height: {iconSize};"
		onerror={handleImageError}
	/>
{/if}
