<script lang="ts">
	import type { NetworkCounts } from '$lib/types';
	import { Link2, Workflow, Coins, Network, CheckCircle2, Server, BarChart2 } from 'lucide-svelte';

	export let counts: NetworkCounts;

	const fmt = (n: number) => n.toLocaleString();
</script>

<!-- Etherscan-like stats strip (neutral grey/white/dark only) -->
<section class="relative -mt-16 mb-8">
	<div class="rounded-2xl border border-border bg-card shadow-lg">
		<div class="grid gap-8 p-6 lg:grid-cols-3 lg:gap-10 lg:divide-x lg:divide-border/60">
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
						<a href="/channel/list" class="text-base font-semibold hover:underline"
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
						<a href="/app-session/list" class="text-base font-semibold hover:underline"
							>{fmt(counts.sessions)}</a
						>
					</div>
				</div>
			</div>

			<!-- Center column -->
			<div class="space-y-6 lg:pr-8">
				<!-- Assets | Networks -->
				<div class="flex items-start justify-between gap-6">
					<div class="flex items-start gap-3 flex-1 min-w-0">
						<div
							class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
						>
							<Coins class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
						</div>
						<div class="min-w-0">
							<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
								Assets
							</div>
							<a href="/asset/list" class="text-base font-semibold hover:underline"
								>{fmt(counts.assets)}</a
							>
							<span class="text-[11px] text-muted-foreground ml-2">tracked</span>
						</div>
					</div>

					<div class="text-right">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Networks
						</div>
						<a href="/network/list" class="text-base font-semibold hover:underline"
							>{fmt(counts.networks)}</a
						>
						<span class="text-[11px] text-muted-foreground ml-2">connected</span>
					</div>
				</div>

				<hr class="border-border/60" />

				<!-- Network Status | Nodes -->
				<div class="flex items-start justify-between gap-6">
					<div class="flex items-start gap-3 flex-1 min-w-0">
						<div
							class="shrink-0 grid place-items-center h-8 w-8 rounded-md border border-border/60 bg-muted/30"
						>
							<CheckCircle2 class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
						</div>
						<div class="min-w-0">
							<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
								Network Status
							</div>
							<!-- neutral badge, no green -->
							<span
								class="inline-flex items-center rounded-md border border-border/60 bg-muted/20 px-2 py-[2px] text-[11px]"
							>
								Operational
							</span>
						</div>
					</div>

					<div class="text-right">
						<div class="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Nodes Online
						</div>
						<span class="text-base font-semibold">{fmt(counts.nodes)}</span>
					</div>
				</div>
			</div>

			<!-- Right column -->
			<div class="space-y-3 lg:pl-0">
				<div class="flex items-center gap-2">
					<BarChart2 class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					<div class="text-[11px] uppercase tracking-wider text-muted-foreground">
						App Sessions (14 days)
					</div>
				</div>

				<div
					class="h-[110px] w-full rounded-md border border-border/60 bg-muted/10 grid place-items-center"
				>
					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<Server class="h-4 w-4" aria-hidden="true" />
						<span>Coming soon</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
