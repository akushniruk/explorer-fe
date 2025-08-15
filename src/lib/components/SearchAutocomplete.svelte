<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { debounce } from 'lodash-es';
	import { Link, FileText, User, Search } from 'lucide-svelte';

	interface SearchSuggestion {
		id: string;
		text: string;
		type: 'channel' | 'session' | 'participant';
		description?: string;
	}

	export let value = '';
	export let placeholder = 'Search channels, sessions, or participants...';
	export let className = '';

	const dispatch = createEventDispatcher<{
		search: { query: string };
		select: { suggestion: SearchSuggestion };
	}>();

	let suggestions: SearchSuggestion[] = [];
	let showSuggestions = false;
	let selectedIndex = -1;
	let inputElement: HTMLInputElement;
	let isLoading = false;

	// Debounced search function
	const debouncedSearch = debounce(async (query: string) => {
		if (query.length < 2) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		isLoading = true;
		try {
			const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
			const data = await response.json();
			suggestions = data.suggestions || [];
			showSuggestions = suggestions.length > 0;
			selectedIndex = -1;
		} catch (error) {
			console.error('Search suggestions failed:', error);
			suggestions = [];
			showSuggestions = false;
		} finally {
			isLoading = false;
		}
	}, 300);

	function handleInput() {
		debouncedSearch(value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showSuggestions) {
			if (event.key === 'Enter') {
				dispatch('search', { query: value });
			}
			return;
		}

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && suggestions[selectedIndex]) {
					selectSuggestion(suggestions[selectedIndex]);
				} else {
					dispatch('search', { query: value });
				}
				break;
			case 'Escape':
				showSuggestions = false;
				selectedIndex = -1;
				break;
		}
	}

	function selectSuggestion(suggestion: SearchSuggestion) {
		value = suggestion.text;
		showSuggestions = false;
		selectedIndex = -1;
		dispatch('select', { suggestion });
		dispatch('search', { query: suggestion.text });
	}

	function handleBlur() {
		// Delay hiding suggestions to allow clicks on suggestions
		setTimeout(() => {
			showSuggestions = false;
			selectedIndex = -1;
		}, 150);
	}

	function handleFocus() {
		if (suggestions.length > 0 && value.length >= 2) {
			showSuggestions = true;
		}
	}

	function getTypeIcon(type: string) {
		switch (type) {
			case 'channel':
				return Link;
			case 'session':
				return FileText;
			case 'participant':
				return User;
			default:
				return Link;
		}
	}

	onMount(() => {
		return () => {
			debouncedSearch.cancel();
		};
	});
</script>

<div class="relative w-full">
	<div class="relative">
		<input
			bind:this={inputElement}
			bind:value
			{placeholder}
			type="text"
			class="w-full px-4 py-2 pl-10 pr-12 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring {className}"
			on:input={handleInput}
			on:keydown={handleKeydown}
			on:blur={handleBlur}
			on:focus={handleFocus}
			autocomplete="off"
		/>

		<!-- Search Icon -->
		<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
			{#if isLoading}
				<div
					class="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin"
				></div>
			{:else}
				<Search class="w-4 h-4 text-muted-foreground" />
			{/if}
		</div>

		<!-- Search Button -->
		<button
			type="button"
			on:click={() => dispatch('search', { query: value })}
			class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
			aria-label="Search"
		>
			<Search class="w-4 h-4 text-muted-foreground hover:text-foreground" />
		</button>
	</div>

	<!-- Suggestions Dropdown -->
	{#if showSuggestions && suggestions.length > 0}
		<div
			class="absolute z-[9999] w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
		>
			{#each suggestions as suggestion, index}
				<button
					type="button"
					class="w-full px-4 py-3 text-left text-popover-foreground hover:bg-accent focus:bg-accent focus:outline-none border-b border-border last:border-b-0 {index ===
					selectedIndex
						? 'bg-accent'
						: ''}"
					on:click={() => selectSuggestion(suggestion)}
				>
					<div class="flex items-center gap-3">
						<svelte:component
							this={getTypeIcon(suggestion.type)}
							class="w-4 h-4 text-muted-foreground"
						/>
						<div class="flex-1 min-w-0">
							<div class="font-mono text-sm text-popover-foreground truncate">
								{suggestion.text}
							</div>
							{#if suggestion.description}
								<div class="text-xs text-muted-foreground mt-1">
									{suggestion.description}
								</div>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.animate-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
