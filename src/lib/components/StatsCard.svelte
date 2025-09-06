<script lang="ts">
	import type { NetworkCounts } from '$lib/types';
	import { Link2, Workflow, Coins, Network, CheckCircle2, Server, BarChart2 } from 'lucide-svelte';

	export let counts: NetworkCounts;

	const fmt = (n: number) => n.toLocaleString();
</script>

<!-- Etherscan-like stats strip (neutral grey/white/dark only) -->
<section class="relative -mt-16 mb-8">
	<div class="rounded-2xl border border-border bg-card shadow-lg">
		<div
			class="grid gap-6 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-10 lg:divide-x lg:divide-border/60"
		>
			<!-- Left column -->
			<div class="space-y-6">
				<!-- Channels -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
					>
						<Link2 class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Channels
						</div>
						<a href="/channels" class="text-base font-semibold hover:underline"
							>{fmt(counts.channels)}</a
						>
						<span class="text-[11px] text-muted-foreground ml-2">active</span>
					</div>
				</div>

				<hr class="border-border/60" />

				<!-- App Sessions -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
					>
						<Workflow class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							App Sessions
						</div>
						<a href="/sessions" class="text-base font-semibold hover:underline"
							>{fmt(counts.sessions)}</a
						>
					</div>
				</div>
			</div>

			<!-- Center column -->
			<div class="space-y-6 lg:pr-8">
				<!-- Assets -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
					>
						<Coins class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Assets
						</div>
						<a href="/assets" class="text-base font-semibold hover:underline"
							>{fmt(counts.assets)}</a
						>
						<span class="text-[11px] text-muted-foreground ml-2">tracked</span>
					</div>
				</div>

				<hr class="border-border/60" />

				<!-- Networks -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
					>
						<Network class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Networks
						</div>
						<a href="/assets" class="text-base font-semibold hover:underline"
							>{fmt(counts.networks)}</a
						>
						<span class="text-[11px] text-muted-foreground ml-2">connected</span>
					</div>
				</div>
			</div>

			<!-- Right column -->
			<div class="space-y-6 lg:pl-0 md:col-span-2 lg:col-span-1">
				<!-- Network Status -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
					>
						<CheckCircle2 class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Network Status
						</div>
						<span
							class="inline-flex items-center rounded-md border border-border/60 bg-muted/20 px-2 py-[2px] text-[11px]"
						>
							Operational
						</span>
					</div>
				</div>

				<hr class="border-border/60" />

				<!-- Active Nodes -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
					>
						<Server class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Active Nodes
						</div>
						<span class="text-base font-semibold">{fmt(counts.nodes)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
