<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { geoMercator, zoom, select, zoomIdentity } from 'd3';
	import type { GeoProjection, ZoomBehavior } from 'd3';
	import { browser } from '$app/environment';
	import { debounce } from 'lodash-es';
	import type { TNodeData } from './types';
	import WorldMap from './WorldMap.svelte';
	import Lines from './Lines.svelte';
	import Photons from './Photons.svelte';
	import PinPopup from './PinPopup.svelte';
	import Pin from './Pin.svelte';

	export let peers: TNodeData[] = [];

	let width = 0;
	let height = 0;
	let svgEl: SVGSVGElement;
	let gEl: SVGGElement;
	let zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> | null = null;

	let highlightedPin: number | null = null;
	let selectedPin: TNodeData | null = null;
	let currentZoomScale = 4;
	let projection: GeoProjection | null = null;
	let isDragging = false;

	function sizeFromWindow() {
		if (!browser) return;
		width = window.innerWidth;
		height = window.innerHeight;
		console.log('Window size:', width, 'x', height);
	}

	function mkProjection() {
		const baseW = width / 360;
		const baseH = height / 180;
		const scale = Math.min(baseW, baseH) * 50;
		projection = geoMercator()
			.scale(scale)
			.translate([width / 2, height / 2]);
		console.log('Projection created:', {
			width,
			height,
			scale,
			translate: [width / 2, height / 2]
		});
	}

	const onResize = debounce(() => {
		sizeFromWindow();
		mkProjection();
		if (svgEl && gEl) {
			initZoom();
		}
	}, 250);

	onMount(() => {
		if (!browser) return; // skip entirely during SSR
		console.log('NodesMap mounted with', peers.length, 'peers');
		sizeFromWindow();
		mkProjection();

		window.addEventListener('resize', onResize);
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', onResize);
			onResize.cancel();
		}
	});

	function initZoom() {
		if (!browser || !svgEl || !gEl) return;
		zoomBehavior = zoom<SVGSVGElement, unknown>()
			.scaleExtent([1, 8])
			.on('start', () => {
				isDragging = true;
			})
			.on('zoom', (event: any) => {
				if (gEl) {
					gEl.setAttribute('transform', event.transform.toString());
					currentZoomScale = event.transform.k;
				}
			})
			.on('end', () => {
				isDragging = false;
			});

		select(svgEl).call(zoomBehavior as any);
	}

	function isFiniteNumber(v: any) {
		return typeof v === 'number' && Number.isFinite(v);
	}
	function isValidCoord(lat: number, longitude: number) {
		return isFiniteNumber(lat) && isFiniteNumber(longitude);
	}

	function getPinCoordinates(latitude: number, longitude: number): [number, number] {
		if (!projection || !isValidCoord(latitude, longitude)) {
			console.log('Invalid pin coordinates:', { latitude, longitude }, 'projection:', !!projection);
			return [0, 0];
		}
		const coords = projection([longitude, latitude]);
		if (!coords) {
			console.log('Projection failed for:', { latitude, longitude });
			return [0, 0];
		}
		return coords;
	}

	// reactive filtered peers with original index preserved
	$: validPeers = peers
		.map((pin, originalIndex) => ({ pin, originalIndex }))
		.filter(({ pin }) => isValidCoord(pin.latitude, pin.longitude));

	function handlePinClick(pin: TNodeData, index: number, e: MouseEvent) {
		e.stopPropagation();
		console.log('Pin clicked:', pin.name, 'at index:', index);

		selectedPin = pin;
		highlightedPin = index + 1;

		if (svgEl && zoomBehavior && projection) {
			const [x, y] = projection([pin.longitude, pin.latitude]) || [0, 0];
			console.log('Zoom to coordinates:', x, y, 'scale:', currentZoomScale);

			if (x === 0 && y === 0) {
				console.log('Invalid coordinates, skipping zoom');
				return;
			}

			const zoomLevel = 4;
			const translateX = width / 2 - x * zoomLevel;
			const translateY = height / 2 - y * zoomLevel;
			const transform = zoomIdentity.translate(translateX, translateY).scale(zoomLevel);

			console.log('🎯 Applying zoom transform');

			select(svgEl)
				.transition()
				.duration(750)
				.call((zoomBehavior as any).transform, transform);
		} else {
			console.log('Missing zoom dependencies:', {
				svgEl: !!svgEl,
				zoomBehavior: !!zoomBehavior,
				projection: !!projection
			});
		}
	}

	function handleMapClick() {
		selectedPin = null;
		highlightedPin = null;
	}

	// reactive projection updates when width/height change
	$: if (width && height && browser) {
		mkProjection();
		if (svgEl && gEl && !zoomBehavior) {
			initZoom();
		}
	}

	// if peers change and selected/ highlighted pin no longer valid -> reset
	$: if (selectedPin) {
		const stillExists = peers.some(
			(p) => p.latitude === selectedPin!.latitude && p.longitude === selectedPin!.longitude
		);
		if (!stillExists) {
			selectedPin = null;
			highlightedPin = null;
		}
	}
</script>

{#if browser}
	<svg
		data-map
		bind:this={svgEl}
		{width}
		{height}
		aria-label="Interactive network nodes map"
		on:click={handleMapClick}
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMapClick()}
		role="button"
		class="outline-none"
		class:cursor-move={isDragging}
		tabindex="0"
	>
		<g bind:this={gEl}>
			{#if projection}
				<WorldMap {projection} />
				<Lines
					{projection}
					highlightPinNumber={highlightedPin}
					pins={validPeers.map((v) => v.pin)}
				/>
				<Photons
					{projection}
					highlightPinNumber={highlightedPin}
					peers={validPeers.map((v) => v.pin)}
				/>
			{/if}

			{#if projection}
				{#each validPeers as { pin, originalIndex }, i (originalIndex)}
					<Pin
						cx={getPinCoordinates(pin.latitude, pin.longitude)[0]}
						cy={getPinCoordinates(pin.latitude, pin.longitude)[1]}
						node={pin}
						on:click={(e) => handlePinClick(pin, i, e.detail)}
						on:mouseenter={() => (highlightedPin = i + 1)}
						on:mouseleave={() => {
							if (!selectedPin) highlightedPin = null;
						}}
					/>
				{/each}
			{/if}

			{#if selectedPin && isValidCoord(selectedPin.latitude, selectedPin.longitude) && projection}
				{@const popupCoords = projection([selectedPin.longitude, selectedPin.latitude])}
				<g
					transform={`translate(${popupCoords}) scale(${1 / currentZoomScale})`}
					class="outline:none"
				>
					<PinPopup pin={selectedPin} />
				</g>
			{/if}
		</g>
	</svg>
{/if}

<style>
	svg[data-map] {
		background: var(--color-muted);
		user-select: none;
		touch-action: none;
		display: block;
		width: 100%;
		height: 100vh;
		margin: 0 auto;
		cursor: grab;
	}

	svg[data-map].cursor-move {
		cursor: move;
	}
</style>
