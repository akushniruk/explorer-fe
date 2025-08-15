<script lang="ts">
	export let currentPage = 1;
	export let totalPages = 1;
	export let totalRecords = 0;
	export let recordsPerPage = 25;
	export let onPageChange: (page: number) => void = () => {};
	export let onPageSizeChange: (size: number) => void = () => {};
	export let showPageSizeSelector = true;
	export let pageSizeOptions = [10, 25, 50, 100];

	$: startRecord = (currentPage - 1) * recordsPerPage + 1;
	$: endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

	function getVisiblePages() {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else {
			if (totalPages > 1) rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	}

	$: visiblePages = getVisiblePages();
</script>

<div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
	<!-- Records info -->
	<div class="text-sm text-muted-foreground">
		{#if totalRecords > 0}
			Showing {startRecord.toLocaleString()} to {endRecord.toLocaleString()} of {totalRecords.toLocaleString()} entries
		{:else}
			No entries found
		{/if}
	</div>

	<!-- Pagination controls -->
	{#if totalPages > 1}
		<div class="flex items-center gap-2">
			<!-- Page size selector -->
			{#if showPageSizeSelector}
				<div class="flex items-center gap-2 mr-4">
					<label for="page-size" class="text-sm text-muted-foreground">Show:</label>
					<select 
						id="page-size"
						class="px-2 py-1 text-sm border border-border rounded bg-card focus:outline-none focus:ring-2 focus:ring-brand/20"
						value={recordsPerPage}
						on:change={(e) => onPageSizeChange(parseInt(e.currentTarget.value))}
					>
						{#each pageSizeOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- First page -->
			<button
				class="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				disabled={currentPage === 1}
				on:click={() => onPageChange(1)}
			>
				First
			</button>

			<!-- Previous page -->
			<button
				class="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				disabled={currentPage === 1}
				on:click={() => onPageChange(currentPage - 1)}
			>
				‹ Prev
			</button>

			<!-- Page numbers -->
			{#each visiblePages as page}
				{#if page === '...'}
					<span class="px-3 py-2 text-sm text-muted-foreground">…</span>
				{:else}
					<button
						class="px-3 py-2 text-sm border border-border rounded-lg transition-colors {page === currentPage ? 'bg-brand text-brand-foreground font-medium' : 'hover:bg-muted/20'}"
						on:click={() => onPageChange(page)}
					>
						{page}
					</button>
				{/if}
			{/each}

			<!-- Next page -->
			<button
				class="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				disabled={currentPage === totalPages}
				on:click={() => onPageChange(currentPage + 1)}
			>
				Next ›
			</button>

			<!-- Last page -->
			<button
				class="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				disabled={currentPage === totalPages}
				on:click={() => onPageChange(totalPages)}
			>
				Last
			</button>
		</div>
	{/if}
</div>