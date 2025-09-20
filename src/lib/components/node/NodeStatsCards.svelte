<script lang="ts">
	import { CreditCard, Activity } from 'lucide-svelte';

	export let stats: {
		totalChannels: number;
		activeChannels: number;
	};
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
	<!-- Total Channels -->
	<div class="bg-card border border-border rounded-lg p-6 text-center">
		<div class="flex items-center justify-center mb-3">
			<div class="p-3 bg-muted/50 rounded-full">
				<CreditCard class="w-6 h-6 text-text" />
			</div>
		</div>
		<div class="text-2xl font-bold text-foreground mb-1">{stats.totalChannels}</div>
		<div class="text-sm text-muted-foreground">Total Channels</div>
	</div>

	<!-- Active Channels -->
	<div class="bg-card border border-border rounded-lg p-6 text-center">
		<div class="flex items-center justify-center mb-3">
			<div class="p-3 bg-emerald-100 dark:bg-emerald-950/30 rounded-full">
				<Activity class="w-6 h-6 text-emerald-600" />
			</div>
		</div>
		<div class="text-2xl font-bold text-emerald-600 mb-1">{stats.activeChannels}</div>
		<div class="text-sm text-muted-foreground">Active Channels</div>
	</div>
</div>
