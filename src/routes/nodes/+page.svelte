<script lang="ts">
	import { onMount } from 'svelte';
	import { shortHex } from '$lib/format';

	export let data: {
		nodes: Array<{
			slug: string;
			name: string;
			latitude: number;
			longitude: number;
			status: 'online' | 'offline' | 'unknown';
			country_code: string;
			region: string;
			available: boolean;
		}>;
	};

	let mapContainer: HTMLDivElement;
	let selectedNode: any = null;
	let showNodePanel = false;

	// Mock world map SVG - in a real app, you'd use a proper mapping library
	let viewBox = '0 0 1000 500';

	// Convert lat/lng to SVG coordinates (simplified projection)
	function projectCoordinates(lat: number, lng: number) {
		const x = ((lng + 180) / 360) * 1000;
		const y = ((90 - lat) / 180) * 500;
		return { x, y };
	}

	function handleNodeClick(node: any) {
		selectedNode = node;
		showNodePanel = true;
	}

	function closeNodePanel() {
		showNodePanel = false;
		selectedNode = null;
	}

	onMount(() => {
		// In a real implementation, you'd initialize a proper map library here
		console.log('Map initialized with', data.nodes.length, 'nodes');
	});
</script>

<svelte:head>
	<title>Network Nodes | YNScan - The Yellow Network Explorer</title>
	<meta name="description" content="Interactive map showing The Yellow Network nodes worldwide. Explore global node distribution, regional coverage, and network infrastructure." />
	<link rel="canonical" href="https://ynscan.xyz/nodes" />
</svelte:head>

<div class="relative w-full h-full bg-slate-900 overflow-hidden">
	<!-- Map Container -->
	<div bind:this={mapContainer} class="absolute inset-0">
		<!-- Simplified World Map SVG -->
		<svg class="w-full h-full" {viewBox} xmlns="http://www.w3.org/2000/svg">
			<!-- Simple world map outline (simplified) -->
			<defs>
				<pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
					<path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgb(51 65 85 / 0.2)" stroke-width="1" />
				</pattern>

				<!-- Glow filter for active nodes -->
				<filter id="glow">
					<feGaussianBlur stdDeviation="3" result="coloredBlur" />
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<!-- Grid background -->
			<rect width="1000" height="500" fill="url(#grid)" />

			<!-- Simplified continents outline -->
			<g fill="rgb(51 65 85 / 0.3)" stroke="rgb(71 85 105)" stroke-width="1">
				<!-- North America (simplified) -->
				<path d="M 120 120 L 300 120 L 320 200 L 280 240 L 180 220 L 120 180 Z" />

				<!-- South America (simplified) -->
				<path d="M 220 240 L 280 240 L 290 380 L 260 420 L 220 400 L 210 320 Z" />

				<!-- Europe (simplified) -->
				<path d="M 450 100 L 550 100 L 560 180 L 520 200 L 450 180 Z" />

				<!-- Africa (simplified) -->
				<path d="M 480 200 L 580 200 L 590 360 L 520 380 L 480 340 Z" />

				<!-- Asia (simplified) -->
				<path d="M 580 80 L 850 80 L 880 240 L 820 280 L 600 260 L 580 180 Z" />

				<!-- Australia (simplified) -->
				<path d="M 750 320 L 850 320 L 860 380 L 780 390 L 750 360 Z" />
			</g>

			<!-- Network connection lines between nodes -->
			<g stroke="rgb(252 208 0 / 0.3)" stroke-width="1" fill="none">
				{#each data.nodes as node, i}
					{#if node.status === 'online'}
						{@const coords = projectCoordinates(node.latitude, node.longitude)}
						{#each data.nodes.slice(i + 1) as otherNode}
							{#if otherNode.status === 'online'}
								{@const otherCoords = projectCoordinates(otherNode.latitude, otherNode.longitude)}
								<line
									x1={coords.x}
									y1={coords.y}
									x2={otherCoords.x}
									y2={otherCoords.y}
									opacity="0.2"
								/>
							{/if}
						{/each}
					{/if}
				{/each}
			</g>

			<!-- Node markers -->
			{#each data.nodes as node}
				{@const coords = projectCoordinates(node.latitude, node.longitude)}
				<g
					class="cursor-pointer transition-all duration-200 hover:scale-110"
					on:click={() => handleNodeClick(node)}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && handleNodeClick(node)}
				>
					<!-- Node glow for online nodes -->
					{#if node.status === 'online'}
						<circle
							cx={coords.x}
							cy={coords.y}
							r="8"
							fill="rgb(252 208 0 / 0.3)"
							filter="url(#glow)"
						/>
					{/if}

					<!-- Main node circle -->
					<circle
						cx={coords.x}
						cy={coords.y}
						r="5"
						fill={node.status === 'online'
							? '#fcd000'
							: node.status === 'offline'
								? '#ef4444'
								: '#6b7280'}
						stroke="#1e293b"
						stroke-width="2"
					/>

					<!-- Node label -->
					<text
						x={coords.x}
						y={coords.y - 12}
						text-anchor="middle"
						class="text-xs fill-white font-medium"
						style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);"
					>
						{node.country_code}
					</text>
				</g>
			{/each}
		</svg>
	</div>

	<!-- Map Controls -->
	<div class="absolute top-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
		<h3 class="font-semibold mb-3">Network Status</h3>
		<div class="space-y-2 text-sm">
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 bg-brand rounded-full"></div>
				<span>Online ({data.nodes.filter((n) => n.status === 'online').length})</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 bg-gray-500 rounded-full"></div>
				<span>Offline ({data.nodes.filter((n) => n.status === 'offline').length})</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 bg-gray-500 rounded-full"></div>
				<span>Unknown ({data.nodes.filter((n) => n.status === 'unknown').length})</span>
			</div>
		</div>
	</div>

	<!-- Legend -->
	<div class="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-4 shadow-lg">
		<h4 class="font-semibold mb-2">Legend</h4>
		<div class="space-y-1 text-xs">
			<div class="flex items-center gap-2">
				<div class="w-2 h-0.5 bg-brand/30"></div>
				<span>Network Connections</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 bg-brand/30 rounded-full border border-slate-700"></div>
				<span>Network Nodes</span>
			</div>
		</div>
	</div>

	<!-- Node Details Panel -->
	{#if showNodePanel && selectedNode}
		<div
			class="absolute inset-y-0 right-0 w-80 bg-card border-l border-border shadow-2xl overflow-y-auto"
		>
			<div class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Node Details</h2>
					<button on:click={closeNodePanel} class="text-muted-foreground hover:text-fg" aria-label="Close node details">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div class="space-y-4">
					<div>
						<h3 class="font-medium text-brand text-lg">{selectedNode.name}</h3>
						<p class="text-sm text-muted-foreground">{selectedNode.slug}</p>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<div class="text-xs text-muted-foreground uppercase tracking-wider">Status</div>
							<div class="flex items-center gap-2 mt-1">
								<div
									class="w-2 h-2 rounded-full"
									class:bg-gray-800={selectedNode.status === 'online'}
									class:bg-gray-400={selectedNode.status === 'offline'}
									class:bg-gray-300={selectedNode.status === 'unknown'}
								></div>
								<span class="text-sm font-medium capitalize">{selectedNode.status}</span>
							</div>
						</div>

						<div>
							<div class="text-xs text-muted-foreground uppercase tracking-wider">Available</div
							>
							<div class="text-sm font-medium mt-1">
								<span
									class="inline-flex px-2 py-1 rounded text-xs"
									class:bg-gray-100={selectedNode.available}
									class:text-gray-800={selectedNode.available}
									class:bg-gray-200={!selectedNode.available}
									class:text-gray-600={!selectedNode.available}
								>
									{selectedNode.available ? 'Yes' : 'No'}
								</span>
							</div>
						</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider">Location</div>
						<div class="mt-1 space-y-1">
							<div class="text-sm">{selectedNode.region.replace('_', ' ').toUpperCase()}</div>
							<div class="text-xs text-muted-foreground">
								{selectedNode.latitude.toFixed(4)}°, {selectedNode.longitude.toFixed(4)}°
							</div>
						</div>
					</div>

					<div>
						<div class="text-xs text-muted-foreground uppercase tracking-wider"
							>Country Code</div
						>
						<div class="text-sm font-mono mt-1">{selectedNode.country_code}</div>
					</div>

					{#if selectedNode.latency_ms}
						<div>
							<div class="text-xs text-muted-foreground uppercase tracking-wider">Latency</div>
							<div class="text-sm font-medium mt-1">{selectedNode.latency_ms}ms</div>
						</div>
					{/if}
				</div>

				<div class="mt-6 pt-6 border-t border-border">
					<button
						class="w-full px-4 py-2 bg-brand text-brand-foreground rounded-lg hover:brightness-95 font-medium"
					>
						View Node Details
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
