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

	$: startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
	$: endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

	function getVisiblePages() {
		const delta = 2;
		const pages: Array<number | '...'> = [];
		const add = (p: number | '...') => pages.push(p);
		const left = Math.max(2, currentPage - delta);
		const right = Math.min(totalPages - 1, currentPage + delta);

		add(1);
		if (left > 2) add('...');
		for (let i = left; i <= right; i++) add(i);
		if (right < totalPages - 1) add('...');
		if (totalPages > 1) add(totalPages);

		return pages;
	}

	$: visiblePages = getVisiblePages();

	function safeChange(page: number) {
		if (page < 1 || page > totalPages || page === currentPage) return;
		onPageChange(page);
	}

	function handlePageSizeChange(value: string | undefined) {
		if (value) {
			onPageSizeChange(parseInt(value));
		}
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
					class="px-2 py-1.5 text-sm border border-border rounded-md bg-background hover:border-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring w-20"
					value={recordsPerPage}
					on:change={(e) => handlePageSizeChange(e.currentTarget.value)}
				>
					{#each pageSizeOptions as option}
						<option value={option.toString()}>{option}</option>
					{/each}
				</select>
				<span class="text-sm text-muted-foreground">records</span>
			</div>
		{/if}

		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === 1}
				onclick={() => safeChange(1)}
			>
				<ChevronsLeft class="h-4 w-4" />
				<span class="sr-only">Go to first page</span>
			</Button>

			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === 1}
				onclick={() => safeChange(currentPage - 1)}
			>
				<ChevronLeft class="h-4 w-4" />
				Previous
			</Button>

			<div class="mx-2 text-sm text-muted-foreground hidden sm:block">
				Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
			</div>

			{#each visiblePages as p}
				{#if p === '...'}
					<span class="px-3 py-2 text-sm text-muted-foreground">…</span>
				{:else}
					<Button
						variant={p === currentPage ? 'default' : 'outline'}
						size="sm"
						onclick={() => safeChange(p)}
						class={p === currentPage ? '' : ''}
					>
						{p}
					</Button>
				{/if}
			{/each}

			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === totalPages}
				onclick={() => safeChange(currentPage + 1)}
			>
				Next
				<ChevronRight class="h-4 w-4" />
			</Button>

			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === totalPages}
				onclick={() => safeChange(totalPages)}
			>
				<ChevronsRight class="h-4 w-4" />
				<span class="sr-only">Go to last page</span>
			</Button>
		</div>
	</div>
</div>
