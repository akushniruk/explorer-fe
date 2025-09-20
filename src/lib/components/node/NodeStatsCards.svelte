<script lang="ts">
	import { CreditCard, Activity } from 'lucide-svelte';

	export let stats: {
		totalChannels: number;
		activeChannels: number;
	};
</script>

<div class="grid grid-cols-1 gap-4 mt-4">
	<!-- Total Channels -->
	<div class="bg-card border border-border rounded-lg p-6 text-center">
		<div class="flex items-center justify-center mb-3">
			<div class="p-3 bg-muted/50 rounded-full">
				<CreditCard class="w-6 h-6 text-text" />
			</div>
		</div>
		<div class="text-2xl font-bold text-foreground mb-1">{stats.totalChannels}</div>
		<div class="text-sm text-text">Total Channels</div>
	</div>

	<!-- Active Channels -->
	<div class="bg-card border border-border rounded-lg p-6 text-center">
		<div class="flex items-center justify-center mb-3">
			<Activity class="w-6 h-6 text-text" />
		</div>
		<div class="text-2xl font-bold text-emerald-600 mb-1">{stats.activeChannels}</div>
		<div class="text-sm text-text">Active Channels</div>
	</div>
</div>
