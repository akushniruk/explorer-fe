<script lang="ts">
	export let columns: Array<{
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
	}> = [];
	export let data: any[] = [];
	export let sortKey = '';
	export let sortDirection: 'asc' | 'desc' = 'desc';
	export let onSort: ((key: string) => void) | null = null;
	export let loading = false;
	export let emptyMessage = 'No data available';

	function handleSort(key: string, sortable: boolean) {
		if (!sortable || !onSort) return;
		onSort(key);
	}

	function getSortIcon(key: string, sortable: boolean) {
		if (!sortable) return '';
		if (sortKey !== key) return '↕️';
		return sortDirection === 'asc' ? '↑' : '↓';
	}
</script>

<div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-muted/20 border-b border-border/50">
					<tr>
						{#each columns as column}
							<th 
								class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider {column.class || ''} {column.sortable ? 'cursor-pointer hover:bg-muted/30' : ''}"
								on:click={() => handleSort(column.key, column.sortable || false)}
								role={column.sortable ? 'button' : 'columnheader'}
								tabindex={column.sortable ? 0 : -1}
							>
								<div class="flex items-center gap-2">
									<span>{column.label}</span>
									{#if column.sortable}
										<span class="text-[10px] opacity-60">
											{getSortIcon(column.key, column.sortable)}
										</span>
									{/if}
								</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border/30">
					{#each data as row, i}
						<tr class="hover:bg-muted/5 transition-colors group">
							<slot {row} {i} />
						</tr>
					{:else}
						<tr>
							<td colspan={columns.length} class="px-4 py-12 text-center text-muted-foreground">
								<div class="flex flex-col items-center gap-2">
									<svg class="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v8"></path>
									</svg>
									<span>{emptyMessage}</span>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>