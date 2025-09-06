<script lang="ts">
	import { shortHex, timeAgo } from '$lib/format';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';
	import type { AppSession } from '$lib/types';
	import CopyButton from './ui/CopyButton.svelte';

	export let sessions: AppSession[] = [];
	export let sortKey = '';
	export let sortDirection: 'asc' | 'desc' = 'desc';
	export let onSort: ((key: string) => void) | null = null;
	export let loading = false;
	export let emptyMessage = 'No sessions found for your filters.';
	export let pageSize = 25;

	type Column = {
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
	};

	const columns: Column[] = [
		{ key: 'session_id', label: 'Session ID', sortable: false },
		{ key: 'protocol', label: 'Protocol', sortable: false },
		{ key: 'participants', label: 'Addresses', sortable: false },
		// { key: 'channel_id', label: 'Channel', sortable: false },
		{ key: 'status', label: 'Status', sortable: false },
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
		<Table.Root class="min-w-[700px]">
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
							<!-- Session ID -->
							<Table.Cell class="font-sans">
								<div class="h-4 w-40 animate-pulse rounded bg-muted"></div>
							</Table.Cell>

							<!-- Protocol -->
							<Table.Cell>
								<div class="h-6 w-20 animate-pulse rounded-full bg-muted"></div>
							</Table.Cell>

							<!-- Participants -->
							<Table.Cell>
								<div class="text-sm space-y-1">
									<div class="flex items-center gap-2">
										<div class="h-3 w-6 animate-pulse rounded bg-muted"></div>
										<div class="h-4 w-16 animate-pulse rounded bg-muted"></div>
									</div>
									<div class="flex items-center gap-2">
										<div class="h-3 w-6 animate-pulse rounded bg-muted"></div>
										<div class="h-4 w-16 animate-pulse rounded bg-muted"></div>
									</div>
									<div class="flex items-center gap-2">
										<div class="h-3 w-6 animate-pulse rounded bg-muted"></div>
										<div class="h-4 w-16 animate-pulse rounded bg-muted"></div>
									</div>
								</div>
							</Table.Cell>

							<!-- Channel
						<Table.Cell class="font-sans">
							<div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
						</Table.Cell> -->

							<!-- Status -->
							<Table.Cell>
								<div class="h-6 w-16 animate-pulse rounded-full bg-muted"></div>
							</Table.Cell>

							<!-- Updated -->
							<Table.Cell>
								<div class="h-4 w-20 animate-pulse rounded bg-muted"></div>
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else if sessions.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
							{emptyMessage}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each sessions as session, i}
						<Table.Row class="hover:bg-muted/50">
							<!-- Session ID -->
							<Table.Cell class="font-sans">
								<a
									href={`/session/${session.session_id}`}
									class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
									title={session.session_id}
								>
									{shortHex(session.session_id, 12, 8)}
								</a>
								<CopyButton value={session.session_id} />
							</Table.Cell>

							<!-- Protocol -->
							<Table.Cell>
								<Badge class="bg-secondary text-text-secondary-alt">
									{session.protocol || 'unknown'}
								</Badge>
							</Table.Cell>

							<!-- Participants -->
							<Table.Cell>
								<div class="text-sm space-y-1">
									{#each session.participants.slice(0, 3) as participant, i}
										<div class="flex items-center gap-2">
											<span class="text-muted-foreground text-xs">#{i + 1}:</span>
											<a
												href={`/address/${participant}`}
												class="font-sans underline text-foreground hover:text-foreground cursor-pointer"
												title={participant}
											>
												{shortHex(participant, 6, 4)}
											</a>
											<CopyButton value={participant} />
										</div>
									{/each}
									{#if session.participants.length > 3}
										<div class="text-xs text-muted-foreground">
											+{session.participants.length - 3} more
										</div>
									{/if}
								</div>
							</Table.Cell>

							<!-- Channel -->
							<!-- <Table.Cell class="font-sans">
							{#if session.channel_id}
								<a
									href={`/channel/${session.channel_id}`}
									class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
									title={session.channel_id}
								>
									{shortHex(session.channel_id, 6, 4)}
								</a>
							{:else}
								<span class="text-muted-foreground text-sm">—</span>
							{/if}
						</Table.Cell> -->

							<!-- Status -->
							<Table.Cell>
								<Badge class={getStatusColor(session.status)}>
									{session.status}
								</Badge>
							</Table.Cell>

							<!-- Updated -->
							<Table.Cell>
								<div class="text-sm text-muted-foreground" title={session.updated_at}>
									{timeAgo(session.updated_at)}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
