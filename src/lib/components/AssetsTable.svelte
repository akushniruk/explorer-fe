<script lang="ts">
	import { shortHex, formatAmount } from '$lib/format';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';

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

	type Column = {
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
	};

	const columns: Column[] = [
		{ key: 'symbol', label: 'Asset', sortable: false },
		{ key: 'contract_address', label: 'Contract Address', sortable: false },
		{ key: 'chain_id', label: 'Chain', sortable: false },
		{ key: 'decimals', label: 'Decimals', sortable: false },
		{ key: 'total_supply', label: 'Total Supply', sortable: false }
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

<div class="bg-card border border-border rounded-lg">
	<Table.Root>
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
			{#if loading}
				{#each Array(10) as _}
					<Table.Row>
						{#each columns as _}
							<Table.Cell>
								<div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			{:else if assets.length === 0}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
						{emptyMessage}
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each assets as asset}
					<Table.Row class="hover:bg-muted/50">
						<!-- Asset -->
						<Table.Cell>
							<div class="flex items-center gap-3">
								{#if asset.logo_url}
									<img src={asset.logo_url} alt={asset.symbol} class="w-8 h-8 rounded-full" />
								{:else}
									<div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
										<span class="text-xs font-bold text-gray-700">{asset.symbol.charAt(0)}</span>
									</div>
								{/if}
								<div>
									<div class="font-semibold text-sm">{asset.symbol}</div>
									<div class="text-xs text-muted-foreground">{asset.name}</div>
								</div>
							</div>
						</Table.Cell>

						<!-- Contract Address -->
						<Table.Cell class="font-mono">
							<a
								href={`/asset/${asset.contract_address}`}
								class="text-foreground hover:text-foreground text-sm cursor-pointer"
								title={asset.contract_address}
							>
								{shortHex(asset.contract_address, 12, 8)}
							</a>
						</Table.Cell>

						<!-- Chain -->
						<Table.Cell>
							<Badge class="bg-secondary text-secondary-foreground hover:bg-secondary">
								Chain {asset.chain_id}
							</Badge>
						</Table.Cell>

						<!-- Decimals -->
						<Table.Cell>
							<span class="text-sm font-mono">{asset.decimals}</span>
						</Table.Cell>

						<!-- Total Supply -->
						<Table.Cell>
							{#if asset.total_supply}
								<div class="text-sm font-mono">
									{formatAmount(asset.total_supply, asset.decimals, 2)}
								</div>
							{:else}
								<span class="text-muted-foreground text-sm">—</span>
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
