<script lang="ts">
	import type { NetworkCounts } from '$lib/types';
	import type { ComponentType } from 'svelte';
	import { Link2, Workflow, Coins, Network, CheckCircle2, Server } from 'lucide-svelte';

	export let counts: NetworkCounts;

	const fmt = (n: number) => n.toLocaleString();

	interface StatItem {
		icon: ComponentType;
		label: string;
		value: string | number;
		suffix?: string;
		href?: string;
	}

	const stats: StatItem[] = [
		{
			icon: Link2,
			label: 'Channels',
			value: fmt(counts.channels),
			suffix: 'active',
			href: '/channels'
		},
		{
			icon: Workflow,
			label: 'App Sessions',
			value: fmt(counts.sessions),
			href: '/sessions'
		},
		{
			icon: Coins,
			label: 'Assets',
			value: fmt(counts.assets),
			suffix: 'tracked',
			href: '/assets'
		},
		{
			icon: Network,
			label: 'Networks',
			value: fmt(counts.networks),
			suffix: 'connected',
			href: '/assets'
		},
		{
			icon: CheckCircle2,
			label: 'Network Status',
			value: 'Operational'
		},
		{
			icon: Server,
			label: 'Active Nodes',
			value: fmt(counts.nodes)
		}
	];
</script>

<section class="relative -mt-16 mb-8">
	<div class="rounded-2xl border border-border bg-card shadow-lg">
		<div class="grid grid-cols-2 gap-3 p-3 sm:gap-4 sm:p-5 lg:grid-cols-3 lg:gap-6 lg:p-6">
			{#each stats as stat, i}
				<div class="flex items-start gap-2 sm:gap-3">
					<div
						class="grid shrink-0 place-items-center border-b-2 border-secondary bg-secondary/10 p-2.5 sm:p-3.5"
					>
						<svelte:component this={stat.icon} class="h-5 w-5 text-text sm:h-6 sm:w-6" aria-hidden="true" />
					</div>
					<div class="min-w-0 flex-1">
						<div class="mb-0.5 text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
							{stat.label}
						</div>
						{#if stat.href}
							<a href={stat.href} class="text-base font-semibold hover:underline sm:text-lg">
								{stat.value}
							</a>
						{:else}
							<span class="inline-flex items-center text-sm">{stat.value}</span>
						{/if}
						{#if stat.suffix}
							<span class="ml-1.5 text-xs text-muted-foreground sm:text-sm">{stat.suffix}</span>
						{/if}
					</div>
				</div>

				{#if i < stats.length - 1 && (i + 1) % 2 === 0}
					<div class="col-span-2 lg:hidden">
						<hr class="border-border/60" />
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>
