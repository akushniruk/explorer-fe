<!-- nexus-fe/src/routes/nodes/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import NodesMap from '$lib/components/nodes/NodesMap.svelte';
	import type { TNodeData } from '$lib/components/nodes/types';
	import { createNodesSEO } from '$lib/utils/seo';

	export let data: PageData & {
		error?: { status: number; body: string };
		meta?: { timestamp: string };
	};

	const nodes = data.nodes ?? [];
	const activeNodes = nodes.filter((n: any) => n.available === true || n.status === 'active').length;
	$: seoData = createNodesSEO(activeNodes, nodes.length);

	function isFiniteNumber(n: any) {
		return typeof n === 'number' && Number.isFinite(n);
	}
	function toNum(v: any) {
		if (v === null || v === undefined) return undefined;
		const n = typeof v === 'string' ? parseFloat(v) : v;
		return isFiniteNumber(n) ? n : undefined;
	}

	function extractLat(n: any) {
		return toNum(
			n.latitude ?? n.lat ?? n.location_latitude ?? n.geo?.latitude ?? n.geo?.lat ?? n.coords?.lat
		);
	}
	function extractLong(n: any) {
		return toNum(
			n.longitude ??
				n.long ??
				n.lng ??
				n.lon ??
				n.location_longitude ??
				n.geo?.longitude ??
				n.geo?.long ??
				n.geo?.lng ??
				n.geo?.lon ??
				n.coords?.long ??
				n.coords?.lng ??
				n.coords?.lon
		);
	}

	// Convert to TNodeData format
	const peers: TNodeData[] = nodes
		.map((n: any) => {
			const lat = extractLat(n);
			const long = extractLong(n);

			// Skip nodes without valid coordinates
			if (lat === undefined || long === undefined) return null;

			console.log('🔍 Raw node data from backend:', {
				name: n.name,
				status: n.status,
				available: n.available,
				rawNode: n
			});

			return {
				slug: n.slug || n.id || '',
				name: n.name || '',
				ws_url: n.ws_url || n.endpoint || '',
				website_host: n.website_host || null,
				icon_key: n.icon_key || null,
				description: n.description || null,
				country_code: n.country_code || '',
				region: n.region || '',
				latitude: lat,
				longitude: long,
				status: n.status || 'unknown',
				available: n.available ?? false,
				latency_ms: n.latency_ms || null,
				last_seen_at: n.last_seen_at ? new Date(n.last_seen_at) : null,
				updated_at: n.updated_at ? new Date(n.updated_at) : new Date()
			};
		})
		.filter((p): p is TNodeData => p !== null);

	console.log('Nodes data:', {
		total: nodes.length,
		peers: peers.length,
		samplePeer: peers[0],
		sampleCoords: peers[0] ? { lat: peers[0].latitude, lng: peers[0].longitude } : null
	});

	const skippedCount = nodes.length - peers.length;

	const pagination =
		data.total != null && data.page != null && data.limit
			? {
					page: data.page,
					total: data.total,
					totalPages: Math.ceil(data.total / data.limit)
				}
			: null;

	// Coordinate extraction & sanitization already handles multiple key variants (lat/lng etc.)
</script>

<svelte:head>
	<title>{seoData.title}</title>
	<meta name="description" content={seoData.description} />
	<meta name="keywords" content={seoData.keywords} />
	<meta name="author" content="ynscan" />
	<meta name="format-detection" content="telephone=no" />
	
	<!-- Open Graph meta tags -->
	<meta property="og:title" content={seoData.ogTitle} />
	<meta property="og:description" content={seoData.ogDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="ynscan" />
	<meta property="og:url" content={seoData.ogUrl} />
	<meta property="og:image" content={seoData.ogImage} />
	<meta property="og:image:alt" content="Visit ynscan" />
	
	<!-- Twitter meta tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seoData.twitterTitle} />
	<meta name="twitter:description" content={seoData.twitterDescription} />
	<meta name="twitter:site" content="@yellownetwork" />
	<meta property="twitter:image" content={seoData.ogImage} />
	<meta name="twitter:image:alt" content="Visit ynscan" />
	
	<link rel="canonical" href={seoData.canonical} />
</svelte:head>

<!-- Map replaces table -->
<div class="">
	{#if peers.length === 0}
		<div class="p-6 text-center text-sm text-gray-500">
			No mappable nodes (missing or invalid coordinates). Parsed 0 of {nodes.length}.
			{#if skippedCount > 0}
				<br />Checked keys: latitude / longitude / lat / lng / long / lon (+ nested geo.*, coords.*)
			{/if}
		</div>
	{:else}
		{#if skippedCount > 0}
			<div class="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
				Showing {peers.length} nodes • {skippedCount} without coordinates skipped
			</div>
		{/if}
		<NodesMap {peers} />
	{/if}
</div>
