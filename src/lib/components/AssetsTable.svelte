<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';
	import { groupAssetsBySymbol } from '$lib/utils/token-grouping';
	import { AssetTableDesktop, AssetTableMobile } from './asset';

	type Asset = {
		id: string;
		symbol: string;
		name: string;
		contract_address: string;
		chain_id: string;
		decimals: number;
		total_supply?: string;
		logo_url?: string;
	};

	export let assets: Asset[] = [];
	export let sortKey = '';
	export let sortDirection: 'asc' | 'desc' = 'desc';
	export let onSort: ((key: string) => void) | null = null;
	export let loading = false;
	export let emptyMessage = 'No assets found for your filters.';
	export let groupedView = true;

	let expandedTokens = new Set<string>();

	$: groupedAssets = groupedView ? groupAssetsBySymbol(assets) : [];

	function toggleExpand(symbol: string) {
		const newExpanded = new Set(expandedTokens);
		if (newExpanded.has(symbol)) {
			newExpanded.delete(symbol);
		} else {
			newExpanded.add(symbol);
		}
		expandedTokens = newExpanded;
	}

	type Column = {
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
	};

	const columns: Column[] = [
		{ key: 'symbol', label: 'Asset', sortable: false },
		{
			key: 'contract_address',
			label: groupedView ? 'Contract Details' : 'Contract Address',
			sortable: false
		},
		{ key: 'chain_id', label: groupedView ? 'Chains' : 'Chain', sortable: false },
		{ key: 'decimals', label: 'Decimals', sortable: false }
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
		<Table.Root class="min-w-[600px]">
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
				<AssetTableDesktop
					{assets}
					{groupedAssets}
					{groupedView}
					{expandedTokens}
					{toggleExpand}
					{loading}
					{emptyMessage}
					columnsCount={columns.length}
				/>
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Mobile Card View -->
	<div class="block md:hidden">
		<AssetTableMobile
			{assets}
			{groupedAssets}
			{groupedView}
			{expandedTokens}
			{toggleExpand}
			{loading}
			{emptyMessage}
		/>
	</div>
</div>
