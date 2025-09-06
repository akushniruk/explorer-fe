<script lang="ts">
	import type { NetworkCounts } from '$lib/types';
	import { Link2, Workflow, Coins, Network, CheckCircle2, Server } from 'lucide-svelte';

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
						class="shrink-0 grid place-items-center p-4 bg-secondary/10 border-b-2 border-secondary"
					>
						<Link2 class="h-6 w-6 text-text" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-sm uppercase tracking-wider text-muted-foreground mb-1">
							Channels
						</div>
						<a href="/channels" class="text-lg font-semibold hover:underline"
							>{fmt(counts.channels)}</a
						>
						<span class="text-sm text-muted-foreground ml-2">active</span>
					</div>
				</div>

				<hr class="border-border/60" />

				<!-- App Sessions -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center p-4 bg-secondary/10 border-b-2 border-secondary"
					>
						<Workflow class="h-6 w-6 text-text" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-sm uppercase tracking-wider text-muted-foreground mb-1">
							App Sessions
						</div>
						<a href="/sessions" class="text-lg font-semibold hover:underline"
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
						class="shrink-0 grid place-items-center p-4 bg-secondary/10 border-b-2 border-secondary"
					>
						<Coins class="h-6 w-6 text-text" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-sm uppercase tracking-wider text-muted-foreground mb-1">
							Assets
						</div>
						<a href="/assets" class="text-lg font-semibold hover:underline"
							>{fmt(counts.assets)}</a
						>
						<span class="text-sm text-muted-foreground ml-2">tracked</span>
					</div>
				</div>

				<hr class="border-border/60" />

				<!-- Networks -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center p-4 bg-secondary/10 border-b-2 border-secondary"
					>
						<Network class="h-6 w-6 text-text" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-sm uppercase tracking-wider text-muted-foreground mb-1">
							Networks
						</div>
						<a href="/assets" class="text-lg font-semibold hover:underline"
							>{fmt(counts.networks)}</a
						>
						<span class="text-sm text-muted-foreground ml-2">connected</span>
					</div>
				</div>
			</div>

			<!-- Right column -->
			<div class="space-y-6 lg:pl-0 md:col-span-2 lg:col-span-1">
				<!-- Network Status -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center p-4 bg-secondary/10 border-b-2 border-secondary"
					>
						<CheckCircle2 class="h-6 w-6 text-text" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-sm uppercase tracking-wider text-muted-foreground mb-1">
							Network Status
						</div>
						<span
							class="inline-flex items-center text-sm"
						>
							Operational
						</span>
					</div>
				</div>

				<hr class="border-border/60" />

				<!-- Active Nodes -->
				<div class="flex items-start gap-3">
					<div
						class="shrink-0 grid place-items-center p-4 bg-secondary/10 border-b-2 border-secondary"
					>
						<Server class="h-6 w-6 text-text" aria-hidden="true" />
					</div>
					<div class="min-w-0">
						<div class="text-sm uppercase tracking-wider text-muted-foreground mb-1">
							Active Nodes
						</div>
						<span class="text-lg font-semibold">{fmt(counts.nodes)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
