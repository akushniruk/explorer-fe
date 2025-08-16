<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';

	export let currentPage = 1;
	export let totalPages = 1;
	export let totalRecords = 0;
	export let recordsPerPage = 25;
	export let onPageChange: (page: number) => void = () => {};
	export let onPageSizeChange: (size: number) => void = () => {};
	export let showPageSizeSelector = true;
	export let pageSizeOptions = [10, 25, 50, 100];
	export let loading = false;

	$: startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
	$: endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
	$: calculatedTotalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));

	function getVisiblePages() {
		const actualTotalPages = calculatedTotalPages;

		if (actualTotalPages <= 7) {
			return Array.from({ length: actualTotalPages }, (_, i) => i + 1);
		}

		const pages: Array<number | '...'> = [];

		if (currentPage <= 3) {
			// Show: 1 2 3 ... totalPages
			for (let i = 1; i <= 3; i++) {
				pages.push(i);
			}
			if (actualTotalPages > 4) {
				pages.push('...');
			}
			pages.push(actualTotalPages);
		} else if (currentPage >= actualTotalPages - 2) {
			// Show: 1 ... (totalPages-2) (totalPages-1) totalPages
			pages.push(1);
			if (actualTotalPages > 4) {
				pages.push('...');
			}
			for (let i = actualTotalPages - 2; i <= actualTotalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show: 1 ... (current-1) current (current+1) ... totalPages
			pages.push(1);
			pages.push('...');
			for (let i = currentPage - 1; i <= currentPage + 1; i++) {
				pages.push(i);
			}
			pages.push('...');
			pages.push(actualTotalPages);
		}

		return pages;
	}

	$: visiblePages = getVisiblePages();

	function safeChange(page: number) {
		if (page < 1 || page > calculatedTotalPages || page === currentPage || loading) return;
		onPageChange(page);
	}
</script>

<div
	class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border"
>
	<div class="text-sm text-muted-foreground">
		{#if totalRecords > 0}
			Showing {startRecord.toLocaleString()} to {endRecord.toLocaleString()} of {totalRecords.toLocaleString()}
			entries
		{:else}
			No entries found
		{/if}
	</div>

	<div class="flex items-center gap-2">
		{#if showPageSizeSelector}
			<div class="flex items-center gap-2 mr-4">
				<span class="text-sm text-muted-foreground">Show</span>
				<select
					class="px-2 py-1.5 text-sm border border-border rounded-md bg-background hover:border-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring w-20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
					value={recordsPerPage}
					disabled={loading}
					on:change={(e) => {
						if (loading) return;
						const newSize = parseInt(e.currentTarget.value);
						onPageSizeChange(newSize);
					}}
				>
					{#each pageSizeOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === 1 || loading}
				onclick={() => safeChange(1)}
				class="cursor-pointer disabled:cursor-not-allowed"
			>
				<ChevronsLeft class="h-4 w-4" />
				<span class="sr-only">Go to first page</span>
			</Button>

			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === 1 || loading}
				onclick={() => safeChange(currentPage - 1)}
				class="cursor-pointer disabled:cursor-not-allowed"
			>
				<ChevronLeft class="h-4 w-4" />
			</Button>

			{#each visiblePages as p}
				{#if p === '...'}
					<span class="px-3 py-2 text-sm text-muted-foreground">…</span>
				{:else}
					<Button
						variant={p === currentPage ? 'default' : 'outline'}
						size="sm"
						disabled={loading}
						onclick={() => safeChange(p)}
						class="cursor-pointer disabled:cursor-not-allowed"
					>
						{p}
					</Button>
				{/if}
			{/each}

			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === calculatedTotalPages || loading}
				onclick={() => safeChange(currentPage + 1)}
				class="cursor-pointer disabled:cursor-not-allowed"
			>
				<ChevronRight class="h-4 w-4" />
			</Button>

			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === calculatedTotalPages || loading}
				onclick={() => safeChange(calculatedTotalPages)}
				class="cursor-pointer disabled:cursor-not-allowed"
			>
				<ChevronsRight class="h-4 w-4" />
				<span class="sr-only">Go to last page</span>
			</Button>
		</div>
	</div>
</div>
