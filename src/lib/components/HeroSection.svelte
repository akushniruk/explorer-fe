<script lang="ts">
	import SearchAutocomplete from '$lib/components/SearchAutocomplete.svelte';
	import { Search } from 'lucide-svelte';
	export let initialQuery = '';

	let searchValue = initialQuery;

	function handleSearch(event: CustomEvent<{ query: string }>) {
		const query = event.detail.query.trim();
		if (query) {
			window.location.href = `/search?q=${encodeURIComponent(query)}`;
		}
	}

	function handleSuggestionSelect(event: CustomEvent<{ suggestion: any }>) {
		const { suggestion } = event.detail;
		if (suggestion.type === 'channel') {
			window.location.href = `/channel/${suggestion.id}`;
		} else if (suggestion.type === 'session') {
			// Could add session detail page later
			searchValue = suggestion.text;
			window.location.href = `/search?q=${encodeURIComponent(suggestion.text)}`;
		} else {
			searchValue = suggestion.text;
			window.location.href = `/search?q=${encodeURIComponent(suggestion.text)}`;
		}
	}

	function handleSearchClick() {
		const query = searchValue.trim();
		if (query) {
			window.location.href = `/search?q=${encodeURIComponent(query)}`;
		}
	}
</script>

<section class="relative z-0 bg-hero-bg border-b border-border/60 pt-20 pb-24 sm:pt-12 sm:pb-16">
	<div class="relative z-10 max-w-7xl mx-auto px-4">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
			<div class="flex-1 max-w-2xl">
				<h1
					class="text-2xl sm:text-2xl lg:text-3xl font-semibold text-text-secondary mb-3 tracking-tight"
				>
					The Yellow Network Explorer
				</h1>

				<div class="mb-3">
					<div
						class="rounded-xl border border-border/60 bg-background p-1 sm:p-1.5 flex items-stretch gap-1 sm:gap-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/20"
					>
						<div class="flex-1">
							<SearchAutocomplete
								bind:value={searchValue}
								placeholder="Search Channel ID, Session ID, or Address..."
								on:search={handleSearch}
								on:select={handleSuggestionSelect}
								className="border-0 rounded-none shadow-none text-foreground placeholder:text-muted-foreground px-2 py-2 sm:px-4 sm:py-2.5 text-sm"
							/>
						</div>
						<button
							type="button"
							on:click={handleSearchClick}
							class="inline-flex cursor-pointer items-center justify-center px-2 py-2 sm:px-4 sm:py-2.5 rounded-md border border-border/60 bg-muted/20 hover:bg-muted/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
							aria-label="Search"
						>
							<Search class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
						</button>
					</div>
				</div>
			</div>

			<div class="hidden lg:block w-80"></div>
		</div>
	</div>
</section>
