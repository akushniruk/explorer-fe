<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';
	import type { Channel, NodeConfig } from '$lib/types';
	import { ChannelTableDesktop, ChannelTableMobile } from './channel';

	export let channels: Channel[] = [];
	export let nodeConfig: NodeConfig | null = null;
	export let sortKey = '';
	export let sortDirection: 'asc' | 'desc' = 'desc';
	export let onSort: ((key: string) => void) | null = null;
	export let loading = false;
	export let emptyMessage = 'No channels found for your filters.';
	export let pageSize = 25;

	type Column = {
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
	};

	const columns: Column[] = [
		{ key: 'channel_id', label: 'Channel ID', sortable: false },
		{ key: 'participants', label: 'Addresses', sortable: false },
		{ key: 'amount', label: 'Amount', sortable: false, align: 'right' },
		{ key: 'status', label: 'Status', sortable: false },
		{ key: 'chain_id', label: 'Chain', sortable: false },
		{ key: 'updated_at', label: 'Updated', sortable: false }
	];

	function triggerSort(col: Column) {
		if (!col?.sortable || !onSort) return;
		onSort(col.key);
	}

	function getSortIcon(column: Column) {
		if (!column.sortable) return null;
		if (sortKey !== column.key) return ChevronsUpDown;
		return sortDirection === 'asc' ? ChevronUp : ChevronDown;
	}
</script>

<div class="bg-card md:border md:border-border md:rounded-lg">
	<!-- Desktop Table View -->
	<div class="hidden md:block overflow-x-auto">
		<Table.Root class="min-w-[800px]">
			<Table.Header>
				<Table.Row class="hover:bg-transparent border-b border-border">
					{#each columns as column}
						<Table.Head
							class="h-12 {column.align === 'right' ? 'text-right' : 'text-left'} {column.sortable
								? 'cursor-pointer select-none'
								: ''}"
							onclick={() => triggerSort(column)}
						>
							<div class="flex items-center gap-2 {column.align === 'right' ? 'justify-end' : ''}">
								<span class="font-medium text-muted-foreground text-sm">{column.label}</span>
								{#if column.sortable}
									{@const IconComponent = getSortIcon(column)}
									{#if IconComponent}
										<IconComponent class="h-4 w-4 text-muted-foreground" />
									{/if}
								{/if}
							</div>
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<ChannelTableDesktop
					{channels}
					{nodeConfig}
					{loading}
					{emptyMessage}
					{pageSize}
					columnsCount={columns.length}
				/>
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Mobile Card View -->
	<div class="block md:hidden">
		<ChannelTableMobile {channels} {nodeConfig} {loading} {emptyMessage} {pageSize} />
	</div>
</div>
