<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';
	import type { Channel } from '$lib/types';

	export let channels: Channel[] = [];
	export let sortKey = '';
	export let sortDirection: 'asc' | 'desc' = 'desc';
	export let onSort: ((key: string) => void) | null = null;
	export let loading = false;
	export let emptyMessage = 'No channels found for your filters.';

	type Column = {
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
	};

	const columns: Column[] = [
		{ key: 'channel_id', label: 'Channel ID', sortable: true },
		{ key: 'participants', label: 'Participants', sortable: false },
		{ key: 'amount', label: 'Amount', sortable: true, align: 'right' },
		{ key: 'status', label: 'Status', sortable: true },
		{ key: 'chain_id', label: 'Chain', sortable: false },
		{ key: 'updated_at', label: 'Updated', sortable: true }
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
				return 'bg-secondary text-secondary-foreground hover:bg-secondary';
			case 'closed':
				return 'bg-secondary text-secondary-foreground hover:bg-secondary';
			case 'pending':
				return 'bg-muted text-foreground hover:bg-muted';
			default:
				return 'bg-secondary text-secondary-foreground hover:bg-secondary';
		}
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
								<div class="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
							</Table.Cell>
						{/each}
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
						<Table.Cell class="font-mono">
							<div class="flex items-center gap-2">
								<a
									href={`/channel/${channel.channel_id}`}
									class="text-foreground hover:text-foreground text-sm cursor-pointer"
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
									<span class="text-muted-foreground text-xs">From:</span>
									<a
										href={`/participant/${channel.wallet}`}
										class="font-mono text-foreground hover:text-foreground cursor-pointer"
										title={channel.wallet}
									>
										{shortHex(channel.wallet, 6, 4)}
									</a>
									<CopyButton value={channel.wallet} />
								</div>
								<div class="flex items-center gap-2">
									<span class="text-muted-foreground text-xs">To:</span>
									<a
										href={`/participant/${channel.participant}`}
										class="font-mono text-foreground hover:text-foreground cursor-pointer"
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
							<span class="font-mono text-sm">{formatAmount(channel.amount, 18, 4)} ETH</span>
						</Table.Cell>

						<!-- Status -->
						<Table.Cell>
							<Badge class={getStatusColor(channel.status)}>
								{channel.status}
							</Badge>
						</Table.Cell>

						<!-- Chain -->
						<Table.Cell>
							<span class="text-sm text-muted-foreground">Chain {channel.chain_id}</span>
						</Table.Cell>

						<!-- Updated -->
						<Table.Cell>
							<div class="text-sm text-muted-foreground" title={channel.updated_at}>
								{channel.updated_at
									? `${new Date(channel.updated_at).toLocaleString()} · ${timeAgo(channel.updated_at)}`
									: '—'}
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
