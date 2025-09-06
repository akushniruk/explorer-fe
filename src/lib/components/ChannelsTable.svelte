<script lang="ts">
	import { shortHex, formatAmount, timeAgo, formatSignificantWithSeparators } from '$lib/format';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';
	import type { Channel } from '$lib/types';
	import Chain from './Chain.svelte';

	export let channels: Channel[] = [];
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

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'open':
				return 'bg-system-green/80 text-text';
			case 'closed':
				return 'bg-muted text-text';
			case 'pending':
				return 'bg-system-yellow/80 text-text';
			default:
				return 'bg-muted text-text';
		}
	}
</script>

<div class="bg-card border border-border rounded-lg">
	<div class="overflow-x-auto">
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
				{#if loading}
					{#each Array(pageSize) as _}
						<Table.Row class="hover:bg-muted/50 h-[76px]">
							<!-- Channel ID -->
							<Table.Cell class="font-sans">
								<div class="flex items-center gap-2">
									<div class="h-4 w-40 animate-pulse rounded bg-muted"></div>
									<div class="h-4 w-4 animate-pulse rounded bg-muted"></div>
								</div>
							</Table.Cell>

							<!-- Participants -->
							<Table.Cell>
								<div class="space-y-1 text-sm">
									<div class="flex items-center gap-2">
										<div class="h-3 w-5 animate-pulse rounded bg-muted"></div>
										<div class="h-4 w-20 animate-pulse rounded bg-muted"></div>
										<div class="h-4 w-4 animate-pulse rounded bg-muted"></div>
									</div>
									<div class="flex items-center gap-2">
										<div class="h-3 w-5 animate-pulse rounded bg-muted"></div>
										<div class="h-4 w-20 animate-pulse rounded bg-muted"></div>
										<div class="h-4 w-4 animate-pulse rounded bg-muted"></div>
									</div>
								</div>
							</Table.Cell>

							<!-- Amount -->
							<Table.Cell class="text-right">
								<div class="h-4 w-24 animate-pulse rounded bg-muted ml-auto"></div>
							</Table.Cell>

							<!-- Status -->
							<Table.Cell>
								<div class="h-6 w-16 animate-pulse rounded-full bg-muted"></div>
							</Table.Cell>

							<!-- Chain -->
							<Table.Cell>
								<div class="h-6 w-20 animate-pulse rounded bg-muted"></div>
							</Table.Cell>

							<!-- Updated -->
							<Table.Cell>
								<div class="h-4 w-32 animate-pulse rounded bg-muted"></div>
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else if channels.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
							{emptyMessage}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each channels as channel, i}
						<Table.Row class="hover:bg-muted/50">
							<!-- Channel ID -->
							<Table.Cell class="font-sans">
								<div class="flex items-center gap-2">
									<a
										href={`/channel/${channel.channel_id}`}
										class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
										title={channel.channel_id}
									>
										{shortHex(channel.channel_id, 12, 8)}
									</a>
									<CopyButton value={channel.channel_id} />
								</div>
							</Table.Cell>

							<!-- Participants -->
							<Table.Cell>
								<div class="space-y-1 text-sm">
									<div class="flex items-center gap-2">
										<span class="text-muted-foreground text-xs">#1</span>
										<a
											href={`/address/${channel.wallet}`}
											class="font-sans underline text-foreground hover:text-foreground cursor-pointer"
											title={channel.wallet}
										>
											{shortHex(channel.wallet, 6, 4)}
										</a>
										<CopyButton value={channel.wallet} />
									</div>
									<div class="flex items-center gap-2">
										<span class="text-muted-foreground text-xs">#2</span>
										<a
											href={`/address/${channel.participant}`}
											class="font-sans underline text-foreground hover:text-foreground cursor-pointer"
											title={channel.participant}
										>
											{shortHex(channel.participant, 6, 4)}
										</a>
										<CopyButton value={channel.participant} />
									</div>
								</div>
							</Table.Cell>

							<!-- Amount -->
							<Table.Cell class="text-right">
								<span class="font-sans text-sm uppercase">
									{formatAmount(
										channel.amount,
										channel.asset?.decimals ? parseInt(channel.asset.decimals) : 18,
										4
									)}
									{channel.asset?.symbol || ''}
								</span>
							</Table.Cell>

							<!-- Status -->
							<Table.Cell>
								<Badge class={getStatusColor(channel.status)}>{channel.status}</Badge>
							</Table.Cell>
							<Table.Cell>
								<Chain chainId={Number(channel.chain_id)} />
							</Table.Cell>

							<!-- Updated -->
							<Table.Cell>
								<div class="text-sm text-muted-foreground" title={channel.updated_at}>
									{channel.updated_at ? `${new Date(channel.updated_at).toLocaleString()}` : '—'}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
