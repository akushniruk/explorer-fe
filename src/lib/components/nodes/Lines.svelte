<script lang="ts">
	import { line as d3line } from 'd3';
	import type { GeoProjection } from 'd3';
	import type { TNodeData } from './types';

	export let projection: GeoProjection;
	export let highlightPinNumber: number | null = null;
	export let pins: TNodeData[] = [];

	const lineGen = d3line<number[]>().defined((d: any) => d != null);

	type LineSeg = {
		key: string;
		d: string;
		highlighted: boolean;
		visible: boolean;
	};

	function byRegion() {
		const groups: Record<string, { lat: number; long: number; index: number }[]> = {};
		pins?.forEach((p, index) => {
			const region = (p?.region ?? '').toLowerCase();
			groups[region] ??= [];
			groups[region].push({
				lat: p.latitude,
				long: p.longitude,
				index
			});
		});
		return groups;
	}

	function addLine(
		arr: LineSeg[],
		startPt: number[] | null,
		endPt: number[] | null,
		startIndex: number,
		endIndex: number
	) {
		if (!startPt || !endPt) return;
		const isHighlighted =
			highlightPinNumber === startIndex + 1 || highlightPinNumber === endIndex + 1;
		const isVisible = isHighlighted || highlightPinNumber === null;
		const d = lineGen([startPt, endPt]) ?? '';
		if (!d) return;
		arr.push({
			key: `${startIndex}-${endIndex}`,
			d,
			highlighted: isHighlighted,
			visible: !!isVisible
		});
	}

	$: lines = (() => {
		if (!projection || !pins?.length) return [] as LineSeg[];
		const groups = byRegion();
		const segs: LineSeg[] = [];
		const regionKeys = Object.keys(groups);

		regionKeys.forEach((region, regionIndex) => {
			const pinsInRegion = groups[region];

			// intra-region
			pinsInRegion.forEach((startPin) => {
				const startPoint = projection([startPin.long, startPin.lat]) || null;
				pinsInRegion.forEach((endPin) => {
					if (startPin.index !== endPin.index) {
						const endPoint = projection([endPin.long, endPin.lat]) || null;
						addLine(segs, startPoint, endPoint, startPin.index, endPin.index);
					}
				});
			});

			// connect region to next region (circular)
			const nextRegion = regionKeys[(regionIndex + 1) % regionKeys.length];
			const nextRegionPin = groups[nextRegion]?.[0];
			const startPin = pinsInRegion?.[0];
			if (startPin && nextRegionPin) {
				const startPoint = projection([startPin.long, startPin.lat]) || null;
				const endPoint = projection([nextRegionPin.long, nextRegionPin.lat]) || null;
				addLine(segs, startPoint, endPoint, startPin.index, nextRegionPin.index);
			}
		});

		return segs;
	})();
</script>

<g>
	{#each lines as l (l.key)}
		<path
			d={l.d}
			fill="none"
			stroke={l.highlighted ? 'rgba(255, 143, 16, 0.64)' : 'rgba(200,200,200,0.24)'}
			stroke-width={l.highlighted ? 1 : 0.84}
			opacity={l.visible ? 0.64 : 0.1}
		/>
	{/each}
</g>
