<script lang="ts">
	import LatestItemsList from './LatestItemsList.svelte';
	import type { AppSession } from '$lib/types';

	export let sessions: AppSession[];
	console.log('sessions:', sessions);
</script>

<LatestItemsList
	items={sessions}
	title="Latest Sessions"
	viewAllHref="/sessions"
	viewAllText="View All Sessions"
	itemType="session"
/>
