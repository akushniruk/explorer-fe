<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import Chain from '../Chain.svelte';
	import type { Channel, NodeConfig } from '$lib/types';
	import {
		ChannelIdLink,
		ChannelAmount,
		ChannelStatusBadge,
		ChannelParticipants
	} from './index';

	type Props = {
		channels: Channel[];
		nodeConfig: NodeConfig | null;
		loading?: boolean;
		emptyMessage?: string;
		pageSize?: number;
		columnsCount?: number;
	};

	let {
		channels,
		nodeConfig,
		loading = false,
		emptyMessage = 'No channels found',
		pageSize = 25,
		columnsCount = 6
	}: Props = $props();
</script>

{#if loading}
	{#each Array(pageSize) as _}
		<Table.Row class="hover:bg-muted/50 h-[76px]">
			<Table.Cell class="font-sans">
				<div class="flex items-center gap-2">
					<div class="h-4 w-40 animate-pulse rounded bg-muted"></div>
					<div class="h-4 w-4 animate-pulse rounded bg-muted"></div>
				</div>
			</Table.Cell>

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

			<Table.Cell class="text-right">
				<div class="h-4 w-24 animate-pulse rounded bg-muted ml-auto"></div>
			</Table.Cell>

			<Table.Cell>
				<div class="h-6 w-16 animate-pulse rounded-full bg-muted"></div>
			</Table.Cell>

			<Table.Cell>
				<div class="h-6 w-20 animate-pulse rounded bg-muted"></div>
			</Table.Cell>

			<Table.Cell>
				<div class="h-4 w-32 animate-pulse rounded bg-muted"></div>
			</Table.Cell>
		</Table.Row>
	{/each}
{:else if channels.length === 0}
	<Table.Row>
		<Table.Cell colspan={columnsCount} class="h-24 text-center text-muted-foreground">
			{emptyMessage}
		</Table.Cell>
	</Table.Row>
{:else}
	{#each channels as channel}
		<Table.Row class="hover:bg-muted/50">
			<Table.Cell class="font-sans">
				<ChannelIdLink channelId={channel.channel_id} />
			</Table.Cell>

			<Table.Cell>
				<ChannelParticipants {channel} {nodeConfig} />
			</Table.Cell>

			<Table.Cell class="text-right">
				<ChannelAmount {channel} />
			</Table.Cell>

			<Table.Cell>
				<ChannelStatusBadge status={channel.status} />
			</Table.Cell>

			<Table.Cell>
				<Chain chainId={Number(channel.chain_id)} />
			</Table.Cell>

			<Table.Cell>
				<div class="text-sm text-muted-foreground" title={channel.updated_at}>
					{channel.updated_at ? `${new Date(channel.updated_at).toLocaleString()}` : '—'}
				</div>
			</Table.Cell>
		</Table.Row>
	{/each}
{/if}
