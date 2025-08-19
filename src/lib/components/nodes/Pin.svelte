<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import type { TNodeData } from './types';

	export let cx = 0;
	export let cy = 0;
	export let node: TNodeData;

	const dispatch = createEventDispatcher();

	let isHovered = false;
	let isMobile = false;
	const MQ = 655;

	function handleResize() {
		isMobile = typeof window !== 'undefined' && window.innerWidth <= MQ;
	}

	function isNodeActive(node: TNodeData): boolean {
		// Consider node active if:
		// 1. available is true AND status is online/degraded/active
		// 2. OR if status is 'active' (even if available is false, for backward compatibility)
		const isActive =
			(node.available &&
				(node.status === 'online' || node.status === 'degraded' || node.status === 'active')) ||
			node.status === 'active';

		console.log('Node active check:', {
			name: node.name,
			available: node.available,
			status: node.status,
			isActive: isActive
		});

		return isActive;
	}

	function getNodeColors(node: TNodeData, isHovered: boolean) {
		const isActive = isNodeActive(node);

		if (!isActive) {
			// Grey for inactive nodes
			return {
				stroke: '#6b7280',
				fill: '#6b7280',
				background: `rgba(107, 116, 128, ${isHovered ? 0.8 : 0.2})`
			};
		}

		// Yellow for active nodes (original color)
		return {
			stroke: '#fcd000',
			fill: '#fcd000',
			background: `rgba(255, 234, 43, ${isHovered ? 1 : 0.2})`
		};
	}

	$: colors = getNodeColors(node, isHovered);

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
	});
	onDestroy(() => window.removeEventListener('resize', handleResize));
</script>

<g
	transform={`translate(${cx}, ${cy})`}
	on:click|stopPropagation={(e) => dispatch('click', e)}
	on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch('click', e)}
	on:mouseenter={() => (isHovered = true)}
	on:mouseleave={() => (isHovered = false)}
	role="button"
	tabindex="0"
	style="cursor: pointer; outline: none;"
>
	<circle
		r={isMobile ? 4 : 9}
		fill="transparent"
		stroke={colors.stroke}
		stroke-width={isMobile ? 1 : 1.5}
		class="z-50"
	/>

	<foreignObject
		x={isMobile ? -4 : -9}
		y={isMobile ? -4 : -9}
		width={isMobile ? 8 : 18}
		height={isMobile ? 8 : 18}
		class="rounded-full"
	>
		<div class="flex items-center justify-center">
			<div
				class="max-[655px]:w-[8px] max-[655px]:h-[8px] min-[655px]:w-[18px] min-[655px]:h-[18px] backdrop-blur-[2px] rounded-full"
				style={`background: ${colors.background};`}
			></div>
		</div>
	</foreignObject>

	<circle r={isMobile ? 1 : 3} fill={colors.fill} />
</g>
