<script lang="ts">
	import { CreditCard, Activity, Users, Clock } from 'lucide-svelte';

	export let stats: {
		totalChannels: number;
		activeChannels: number;
		totalSessions: number;
		activeSessions: number;
	};
	export let addressType: string | undefined;
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
	<div class="bg-card border border-border rounded-lg p-4 text-center">
		<div class="flex items-center justify-center mb-1.5">
			<CreditCard class="w-5 h-5 text-text" />
		</div>
		<div class="text-xl font-bold text-text mb-0.5">{stats.totalChannels}</div>
		<div class="text-xs text-text">Total Channels</div>
	</div>
	<div class="bg-card border border-border rounded-lg p-4 text-center">
		<div class="flex items-center justify-center mb-1.5">
			<Activity class="w-5 h-5 text-text" />
		</div>
		<div class="text-xl font-bold text-emerald-600 mb-0.5">{stats.activeChannels}</div>
		<div class="text-xs text-text">Active Channels</div>
	</div>
	{#if addressType !== 'node'}
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="flex items-center justify-center mb-1.5">
				<Users class="w-5 h-5 text-text" />
			</div>
			<div class="text-xl font-bold text-text mb-0.5">{stats.totalSessions}</div>
			<div class="text-xs text-text">Total Sessions</div>
		</div>
		<div class="bg-card border border-border rounded-lg p-4 text-center">
			<div class="flex items-center justify-center mb-1.5">
				<Clock class="w-5 h-5 text-text" />
			</div>
			<div class="text-xl font-bold text-emerald-600 mb-0.5">{stats.activeSessions}</div>
			<div class="text-xs text-text">Active Sessions</div>
		</div>
	{/if}
</div>
