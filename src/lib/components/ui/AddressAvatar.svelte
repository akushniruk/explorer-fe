<script lang="ts">
	import { onMount } from 'svelte';
	import * as jdenticon from 'jdenticon';

	export let address: string;
	export let size: number = 40;
	export let className: string = '';

	let canvasRef: HTMLCanvasElement;

	function generateAvatar() {
		if (canvasRef && address) {
			const ctx = canvasRef.getContext('2d');
			if (ctx) {
				// Clear the canvas first
				ctx.clearRect(0, 0, size, size);
				// Generate the identicon
				jdenticon.drawIcon(ctx, address, size);
			}
		}
	}

	onMount(() => {
		generateAvatar();
	});

	// Update the identicon when address changes
	$: if (canvasRef && address) {
		generateAvatar();
	}
</script>

<div class="relative inline-block {className}">
	<!-- Jdenticon canvas with hexagonal clipping -->
	<div
		class="relative bg-white rounded-lg shadow-sm border border-gray-200"
		style="width: {size}px; height: {size}px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"
	>
		<canvas
			bind:this={canvasRef}
			width={size}
			height={size}
			class="block"
			style="width: {size}px; height: {size}px;"
		></canvas>
	</div>
</div>
