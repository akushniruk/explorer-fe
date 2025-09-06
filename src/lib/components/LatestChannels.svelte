<script lang="ts">
	import LatestItemsList from './LatestItemsList.svelte';
	import type { Channel } from '$lib/types';

	export let channels: Channel[];
</script>

<LatestItemsList
	items={channels}
	title="Latest Channels"
	viewAllHref="/channels"
	viewAllText="View All Channels"
	itemType="channel"
/>
