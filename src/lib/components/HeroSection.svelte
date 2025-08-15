<script lang="ts">
	import { Search } from 'lucide-svelte';
	export let initialQuery = '';
</script>

<section class="hero-pattern relative z-0 border-b border-border/60 pt-12 pb-16">
	<div class="relative z-10 max-w-7xl mx-auto px-4">
		<div class="flex items-center justify-between gap-6">
			<div class="flex-1 max-w-2xl">
				<h1 class="text-2xl lg:text-3xl font-semibold text-fg mb-3 tracking-tight">
					The Yellow Network Explorer
				</h1>

				<form action="/search" method="GET" class="mb-3" aria-label="Global search">
					<div
						class="rounded-xl border border-border/60 bg-bg p-1.5 flex items-stretch gap-2 shadow-sm
                   focus-within:ring-2 focus-within:ring-muted/60"
					>
						<div class="flex-1">
							<label for="q" class="sr-only">Search</label>
							<input
								id="q"
								name="q"
								type="search"
								value={initialQuery}
								placeholder="Search by Channel ID / Session ID / Participant Address..."
								class="w-full px-4 py-2.5 bg-bg text-sm outline-none placeholder:text-muted-foreground"
							/>
						</div>

						<button
							type="submit"
							class="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border/60
                     bg-muted/20 hover:bg-muted/30 text-sm font-medium
                     focus:outline-none focus:ring-2 focus:ring-muted/60"
						>
							<Search class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
							<span>Search</span>
						</button>
					</div>
				</form>
			</div>

			<div class="hidden lg:block w-80"></div>
		</div>
	</div>
</section>
