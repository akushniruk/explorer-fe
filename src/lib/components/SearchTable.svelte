<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { Channel, AppSession } from '$lib/types';

	type TableData = Channel | AppSession | any;

	export let columns: Array<{
		key: string;
		label: string;
		sortable?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
	}> = [];
	export let data: TableData[] = [];
	export let loading = false;
	export let emptyMessage = 'No results found for your filters.';
	export let tableType: 'channels' | 'sessions' | 'assets' = 'channels';

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'open':
			case 'active':
				return 'bg-secondary text-secondary-foreground hover:bg-secondary';
			case 'closed':
				return 'bg-secondary text-secondary-foreground hover:bg-secondary';
			case 'pending':
				return 'bg-muted text-muted-foreground hover:bg-muted';
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
					<Table.Head class="h-12 {column.align === 'right' ? 'text-right' : 'text-left'}">
						<span class="font-medium text-muted-foreground text-sm">{column.label}</span>
					</Table.Head>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if loading}
				{#each Array(5) as _}
					<Table.Row>
						{#each columns as _}
							<Table.Cell>
								<div class="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			{:else if data.length === 0}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
						{emptyMessage}
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each data as row}
					<Table.Row class="hover:bg-muted/50">
						{#if tableType === 'channels'}
							<!-- Channel ID -->
							<Table.Cell class="font-mono">
								<a
									href={`/channel/${row.channel_id}`}
									class="text-foreground hover:text-foreground text-sm cursor-pointer"
									title={row.channel_id}
								>
									{shortHex(row.channel_id, 12, 8)}
								</a>
							</Table.Cell>

							<!-- Participants -->
							<Table.Cell>
								<div class="text-sm space-y-1">
									<div class="flex items-center gap-2">
										<span class="text-muted-foreground text-xs">From:</span>
										<a
											href={`/participant/${row.wallet}`}
											class="font-mono text-foreground hover:text-foreground cursor-pointer"
											title={row.wallet}
										>
											{shortHex(row.wallet, 6, 4)}
										</a>
									</div>
									<div class="flex items-center gap-2">
										<span class="text-muted-foreground text-xs">To:</span>
										<a
											href={`/participant/${row.participant}`}
											class="font-mono text-foreground hover:text-foreground cursor-pointer"
											title={row.participant}
										>
											{shortHex(row.participant, 6, 4)}
										</a>
									</div>
								</div>
							</Table.Cell>

							<!-- Amount -->
							<Table.Cell>
								<div class="text-sm font-mono">
									{formatAmount(row.amount, 18, 4)} ETH
								</div>
							</Table.Cell>

							<!-- Status -->
							<Table.Cell>
								<Badge class={getStatusColor(row.status)}>
									{row.status}
								</Badge>
							</Table.Cell>

							<!-- Updated -->
							<Table.Cell>
								<div class="text-sm text-muted-foreground" title={row.updated_at}>
									{timeAgo(row.updated_at)}
								</div>
							</Table.Cell>
						{:else if tableType === 'sessions'}
							<!-- Session ID -->
							<Table.Cell class="font-mono">
								<a
									href={`/session/${row.session_id}`}
									class="text-foreground hover:text-foreground text-sm cursor-pointer"
									title={row.session_id}
								>
									{shortHex(row.session_id, 12, 8)}
								</a>
							</Table.Cell>

							<!-- Protocol -->
							<Table.Cell>
								<Badge class="bg-secondary text-secondary-foreground hover:bg-secondary">
									{row.protocol || 'unknown'}
								</Badge>
							</Table.Cell>

							<!-- Participants -->
							<Table.Cell>
								<div class="text-sm space-y-1">
									{#each row.participants.slice(0, 3) as participant, i}
										<div class="flex items-center gap-2">
											<span class="text-muted-foreground text-xs">#{i + 1}:</span>
											<a
												href={`/participant/${participant}`}
												class="font-mono text-foreground hover:text-foreground cursor-pointer"
												title={participant}
											>
												{shortHex(participant, 6, 4)}
											</a>
										</div>
									{/each}
									{#if row.participants.length > 3}
										<div class="text-xs text-muted-foreground">
											+{row.participants.length - 3} more
										</div>
									{/if}
								</div>
							</Table.Cell>

							<!-- Status -->
							<Table.Cell>
								<Badge class={getStatusColor(row.status)}>
									{row.status}
								</Badge>
							</Table.Cell>

							<!-- Updated -->
							<Table.Cell>
								<div class="text-sm text-muted-foreground" title={row.updated_at}>
									{timeAgo(row.updated_at)}
								</div>
							</Table.Cell>
						{/if}
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
