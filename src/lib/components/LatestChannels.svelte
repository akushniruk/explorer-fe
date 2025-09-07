<script lang="ts">
	import LatestItemsList from './LatestItemsList.svelte';
	import type { Channel, NodeConfig } from '$lib/types';

	export let channels: Channel[];
	export let nodeConfig: NodeConfig | null;
</script>

<LatestItemsList
	items={channels}
	{nodeConfig}
	title="Latest Channels"
	viewAllHref="/channels"
	viewAllText="View All Channels"
	itemType="channel"
/>
