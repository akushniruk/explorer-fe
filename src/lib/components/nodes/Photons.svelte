<script lang="ts">
	import { line as d3line } from 'd3';
	import type { GeoProjection } from 'd3';
	import type { TNodeData } from './types';

	export let projection: GeoProjection;
	export let highlightPinNumber: number | null = null;
	export let peers: TNodeData[] = [];

	const lineGen = d3line<number[]>().defined((d: any) => d != null);

	type PhotonPath = {
		key: string;
		d: string;
		highlighted: boolean;
		visible: boolean;
	};

	function groupByRegion() {
		const g: Record<string, { lat: number; long: number; index: number }[]> = {};
		peers.forEach((p, index) => {
			const region = (p?.region ?? '').toLowerCase();
			g[region] ??= [];
			g[region].push({
				lat: p.latitude,
				long: p.longitude,
				index
			});
		});
		return g;
	}

	function makePath(sp: number[] | null, ep: number[] | null) {
		if (!sp || !ep) return '';
		return lineGen([sp, ep]) ?? '';
	}

	$: paths = (() => {
		if (!projection || !peers.length) return [] as PhotonPath[];
		const groups = groupByRegion();
		const regionKeys = Object.keys(groups);
		const out: PhotonPath[] = [];

		regionKeys.forEach((region, regionIndex) => {
			const pinsInRegion = groups[region];

			pinsInRegion.forEach((s) => {
				pinsInRegion.forEach((e) => {
					if (s.index === e.index) return;
					const sp = projection([s.long, s.lat]) || null;
					const ep = projection([e.long, e.lat]) || null;
					const d = makePath(sp, ep);
					if (!d) return;
					const highlighted =
						highlightPinNumber === s.index + 1 || highlightPinNumber === e.index + 1;
					const visible = highlighted || highlightPinNumber === null;
					out.push({
						key: `photon-${s.index}-${e.index}`,
						d,
						highlighted,
						visible
					});
				});
			});

			// connect to next region
			const nextRegion = regionKeys[(regionIndex + 1) % regionKeys.length];
			const s = pinsInRegion[0];
			const e = groups[nextRegion]?.[0];
			if (s && e) {
				const sp = projection([s.long, s.lat]) || null;
				const ep = projection([e.long, e.lat]) || null;
				const d = makePath(sp, ep);
				if (d) {
					const highlighted =
						highlightPinNumber === s.index + 1 || highlightPinNumber === e.index + 1;
					const visible = highlighted || highlightPinNumber === null;
					out.push({
						key: `photon-${s.index}-${e.index}`,
						d,
						highlighted,
						visible
					});
				}
			}
		});

		return out;
	})();
</script>

<g>
	<!-- gradients (optional) -->
	<defs>
		<linearGradient id="photon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:black;stop-opacity:1" />
			<stop offset="100%" style="stop-color:black;stop-opacity:0" />
		</linearGradient>
		<linearGradient id="highlighted-photon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:yellow;stop-opacity:1" />
			<stop offset="100%" style="stop-color:yellow;stop-opacity:0" />
		</linearGradient>
	</defs>

	{#each paths as p (p.key)}
		<path d={p.d} fill="none" stroke="transparent" />
		<circle
			r={p.visible ? 2 : 0}
			fill={p.highlighted ? 'rgb(255, 143, 16)' : 'rgba(255, 143, 16, 0.36)'}
		>
			<!-- Svelte passes attribute verbatim to SVG -->
			<animateMotion dur={`${Math.random() + 2}s`} repeatCount="indefinite" path={p.d} />
		</circle>
	{/each}
</g>
