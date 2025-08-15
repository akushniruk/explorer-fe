<script lang="ts">
	import Kpi from '$lib/ui/Kpi.svelte';
	import type { NetworkCounts } from '$lib/types';

	export let counts: NetworkCounts;
</script>

<!-- KPI Cards Grid -->
<section class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
	<Kpi title="Total Channels">
		{counts.channels.toLocaleString()}
	</Kpi>

	<Kpi title="Active Sessions">
		{counts.sessions.toLocaleString()}
	</Kpi>

	<Kpi title="Networks">
		{counts.networks.toLocaleString()}
	</Kpi>

	<Kpi title="Assets">
		{counts.assets.toLocaleString()}
	</Kpi>

	<Kpi title="Nodes Online">
		{counts.nodes.toLocaleString()}
	</Kpi>
</section>
