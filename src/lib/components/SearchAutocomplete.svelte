<script lang="ts">
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import { debounce } from 'lodash-es';

	interface SearchSuggestion {
		id: string;
		text: string;
		type: 'channel' | 'session' | 'address';
		description?: string;
	}

	export let value = '';
	export let placeholder = 'Search channels, sessions, or addresses...';
	export let className = '';

	const dispatch = createEventDispatcher<{
		search: { query: string };
		select: { suggestion: SearchSuggestion };
	}>();

	let suggestions: SearchSuggestion[] = [];
	let showSuggestions = false;
	let selectedIndex = -1;
	let inputElement: HTMLInputElement;
	let inputRect: DOMRect | null = null;
	let portalContainer: HTMLDivElement;

	// Debounced search function
	const debouncedSearch = debounce(async (query: string) => {
		if (query.length < 2) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		try {
			const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
			const data = await response.json();
			suggestions = data.suggestions || [];
			showSuggestions = suggestions.length > 0;
			selectedIndex = -1;
			if (showSuggestions) {
				await updateDropdownPosition();
			}
		} catch (error) {
			console.error('Search suggestions failed:', error);
			suggestions = [];
			showSuggestions = false;
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

	async function handleFocus() {
		if (suggestions.length > 0 && value.length >= 2) {
			showSuggestions = true;
			await updateDropdownPosition();
		}
	}

	async function updateDropdownPosition() {
		if (inputElement) {
			inputRect = inputElement.getBoundingClientRect();
			await tick();
		}
	}

	onMount(() => {
		// Create portal container
		portalContainer = document.createElement('div');
		document.body.appendChild(portalContainer);

		const handleScroll = () => {
			if (showSuggestions && inputElement) {
				updateDropdownPosition();
			}
		};

		const handleResize = () => {
			if (showSuggestions && inputElement) {
				updateDropdownPosition();
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });

		return () => {
			debouncedSearch.cancel();
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
			if (portalContainer && document.body.contains(portalContainer)) {
				document.body.removeChild(portalContainer);
			}
		};
	});

	function getIconSvg(type: string) {
		switch (type) {
			case 'channel':
				return `<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>`;
			case 'session':
				return `<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
			case 'address':
				return `<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
			default:
				return `<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>`;
		}
	}

	// Reactive statement to manage portal content
	$: if (portalContainer) {
		if (showSuggestions && suggestions.length > 0 && inputRect) {
			// Create dropdown content
			portalContainer.innerHTML = `
				<div class="fixed z-50 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
					 style="left: ${inputRect.left}px; top: ${inputRect.bottom + 4}px; width: ${inputRect.width}px;">
					${suggestions
						.map(
							(suggestion, index) => `
						<button type="button" 
								class="w-full cursor-pointer px-4 py-3 text-left text-popover-foreground hover:bg-accent focus:bg-accent focus:outline-none border-b border-border last:border-b-0 ${index === selectedIndex ? 'bg-accent' : ''}"
								data-suggestion-index="${index}">
							<div class="flex items-center gap-3">
								${getIconSvg(suggestion.type)}
								<div class="flex-1 min-w-0">
									<div class="font-mono text-sm text-popover-foreground truncate">${suggestion.text}</div>
									${suggestion.description ? `<div class="text-xs text-muted-foreground mt-1">${suggestion.description}</div>` : ''}
								</div>
							</div>
						</button>
					`
						)
						.join('')}
				</div>
			`;

			// Add click handlers
			const buttons = portalContainer.querySelectorAll('[data-suggestion-index]');
			buttons.forEach((button, index) => {
				button.addEventListener('click', () => selectSuggestion(suggestions[index]));
			});
		} else {
			portalContainer.innerHTML = '';
		}
	}
</script>

<div class="relative w-full">
	<div class="relative">
		<input
			bind:this={inputElement}
			bind:value
			{placeholder}
			type="text"
			class="w-full px-4 py-2 pr-12 border border-border rounded-lg bg-background text-sm focus:outline-none {className}"
			on:input={handleInput}
			on:keydown={handleKeydown}
			on:blur={handleBlur}
			on:focus={handleFocus}
			autocomplete="off"
		/>
	</div>
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
