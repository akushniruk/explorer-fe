<script lang="ts">
	import { shortHex, formatAmount, timeAgo, formatSignificantWithSeparators } from '$lib/format';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import type { Channel, AppSession, NodeConfig } from '$lib/types';
	import MobileTableCard from './ui/MobileTableCard.svelte';
	import MobileTableField from './ui/MobileTableField.svelte';
	import CopyButton from './ui/CopyButton.svelte';
	import Chain from './Chain.svelte';
	import {
		ChannelIdLink,
		ChannelAmount,
		ChannelStatusBadge
	} from './channel';
	import {
		SessionIdLink,
		SessionStatusBadge,
		SessionProtocolBadge
	} from './session';

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

<div class="bg-card md:border md:border-border md:rounded-lg">
	<!-- Desktop Table View -->
	<div class="hidden md:block">
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
							<Table.Cell class="font-sans">
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
											href={`/address/${row.wallet}`}
											class="font-sans text-foreground hover:text-foreground cursor-pointer"
											title={row.wallet}
										>
											{shortHex(row.wallet, 6, 4)}
										</a>
									</div>
									<div class="flex items-center gap-2">
										<span class="text-muted-foreground text-xs">To:</span>
										<a
											href={`/address/${row.participant}`}
											class="font-sans text-foreground hover:text-foreground cursor-pointer"
											title={row.participant}
										>
											{shortHex(row.participant, 6, 4)}
										</a>
									</div>
								</div>
							</Table.Cell>

							<!-- Amount -->
							<Table.Cell>
								<div class="text-sm font-sans">
									{formatAmount(
										row.amount,
										row.asset?.decimals ? parseInt(row.asset.decimals) : 18,
										4
									)}
									{row.asset?.symbol || 'ETH'}
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
							<Table.Cell class="font-sans">
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
												href={`/address/${participant}`}
												class="font-sans text-foreground hover:text-foreground cursor-pointer"
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

	<!-- Mobile Card View -->
	<div class="block md:hidden">
		{#if loading}
			{#each Array(5) as _}
				<MobileTableCard>
					{#snippet header()}
						<div class="flex flex-row items-center gap-2">
							<div class="h-4 w-32 animate-pulse rounded bg-muted"></div>
							<div class="h-4 w-4 animate-pulse rounded bg-muted"></div>
						</div>
					{/snippet}
					{#snippet fields()}
						<div class="h-16 w-full animate-pulse rounded bg-muted col-span-2"></div>
					{/snippet}
				</MobileTableCard>
			{/each}
		{:else if data.length === 0}
			<div class="p-8 text-center text-muted-foreground">{emptyMessage}</div>
		{:else}
			{#each data as row}
				{#if tableType === 'channels'}
					<MobileTableCard href={`/channel/${row.channel_id}`}>
						{#snippet header()}
							<div class="flex flex-row items-center justify-between w-full">
								<span class="text-sm font-semibold text-foreground">
									<ChannelIdLink channelId={row.channel_id} />
								</span>
								<ChannelStatusBadge status={row.status} />
							</div>
						{/snippet}
						{#snippet fields()}
							<MobileTableField label="Amount">
								{#snippet value()}
									<ChannelAmount channel={row} mobile />
								{/snippet}
							</MobileTableField>

							<MobileTableField label="Chain">
								{#snippet value()}
									<Chain chainId={Number(row.chain_id)} />
								{/snippet}
							</MobileTableField>

							<MobileTableField label="From">
								{#snippet value()}
									<div class="flex items-center gap-1">
										<a
											href={`/address/${row.wallet}`}
											class="font-sans text-sm underline text-foreground hover:text-foreground cursor-pointer"
											title={row.wallet}
										>
											{shortHex(row.wallet, 6, 4)}
										</a>
										<CopyButton value={row.wallet} />
									</div>
								{/snippet}
							</MobileTableField>

							<MobileTableField label="To">
								{#snippet value()}
									<div class="flex items-center gap-1">
										<a
											href={`/address/${row.participant}`}
											class="font-sans text-sm underline text-foreground hover:text-foreground cursor-pointer"
											title={row.participant}
										>
											{shortHex(row.participant, 6, 4)}
										</a>
										<CopyButton value={row.participant} />
									</div>
								{/snippet}
							</MobileTableField>

							<div class="col-span-2 flex items-center gap-2 pt-2 mt-2">
								<span
									class="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg"
									title={row.updated_at}
								>
									{timeAgo(row.updated_at)}
								</span>
								<div class="flex-1 border-t border-border"></div>
							</div>
						{/snippet}
					</MobileTableCard>
				{:else if tableType === 'sessions'}
					<MobileTableCard href={`/session/${row.session_id}`}>
						{#snippet header()}
							<div class="flex flex-row items-center justify-between w-full">
								<span class="text-sm font-semibold text-foreground">
									<SessionIdLink sessionId={row.session_id} />
								</span>
								<SessionStatusBadge status={row.status} />
							</div>
						{/snippet}
						{#snippet fields()}
							<MobileTableField label="Participants">
								{#snippet value()}
									<div class="space-y-1">
										{#each row.participants.slice(0, 3) as participant, i}
											<div class="flex items-center gap-2 text-sm">
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
										{#if row.participants.length > 3}
											<div class="text-xs text-muted-foreground">
												+{row.participants.length - 3} more
											</div>
										{/if}
									</div>
								{/snippet}
							</MobileTableField>

							<MobileTableField label="Protocol">
								{#snippet value()}
									<SessionProtocolBadge protocol={row.protocol} />
								{/snippet}
							</MobileTableField>

							<div class="col-span-2 flex items-center gap-2 pt-2 mt-2">
								<span
									class="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg"
									title={row.updated_at}
								>
									{timeAgo(row.updated_at)}
								</span>
								<div class="flex-1 border-t border-border"></div>
							</div>
						{/snippet}
					</MobileTableCard>
				{/if}
			{/each}
		{/if}
	</div>
</div>
