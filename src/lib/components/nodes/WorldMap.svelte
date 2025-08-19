<script lang="ts">
	import { onMount } from 'svelte';
	import { geoPath, select } from 'd3';
	import type { GeoProjection } from 'd3';
	import worldData from './constants/map.geo.json';

	export let projection: GeoProjection | null = null;

	let gEl: SVGGElement;

	function render() {
		if (!projection || !gEl) return;
		const pathGen = geoPath().projection(projection);

		select(gEl)
			.selectAll('path')
			.data((worldData as any).features)
			.join(
				(enter) =>
					enter
						.append('path')
						.attr('d', (d) => pathGen(d as any)!)
						.attr('fill', 'var(--color-card)')
						.attr('stroke', 'var(--color-border)')
						.attr('stroke-width', '0.5'),
				(update) =>
					update
						.attr('d', (d) => pathGen(d as any)!)
						.attr('fill', 'var(--color-card)')
						.attr('stroke', 'var(--color-border)'),
				(exit) => exit.remove()
			);
	}

	onMount(render);
	$: render(); // re-render when projection changes
</script>

<g bind:this={gEl} />
