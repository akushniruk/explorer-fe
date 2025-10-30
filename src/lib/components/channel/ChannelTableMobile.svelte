<script lang="ts">
	import MobileTableCard from '$lib/components/ui/MobileTableCard.svelte';
	import MobileTableField from '$lib/components/ui/MobileTableField.svelte';
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
	};

	let {
		channels,
		nodeConfig,
		loading = false,
		emptyMessage = 'No channels found',
		pageSize = 25
	}: Props = $props();
</script>

{#if loading}
	{#each Array(pageSize) as _}
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
{:else if channels.length === 0}
	<div class="p-8 text-center text-muted-foreground">{emptyMessage}</div>
{:else}
	{#each channels as channel, i}
		<MobileTableCard href={`/channel/${channel.channel_id}`} showTopBorder={i === 0}>
			{#snippet header()}
				<div class="flex flex-row items-center justify-between w-full">
					<span class="text-sm font-semibold text-foreground">
						<ChannelIdLink channelId={channel.channel_id} />
					</span>
					<ChannelStatusBadge status={channel.status} />
				</div>
			{/snippet}
			{#snippet fields()}
				<MobileTableField label="Amount">
					{#snippet value()}
						<ChannelAmount {channel} mobile />
					{/snippet}
				</MobileTableField>

				<MobileTableField label="Chain">
					{#snippet value()}
						<Chain chainId={Number(channel.chain_id)} />
					{/snippet}
				</MobileTableField>

				<ChannelParticipants {channel} {nodeConfig} mobile />

				<div class="col-span-2 flex items-center gap-2 pt-2 mt-2">
					<span class="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg" title={channel.updated_at}>
						{channel.updated_at ? `${new Date(channel.updated_at).toLocaleString()}` : '—'}
					</span>
					<div class="flex-1 border-t border-border"></div>
				</div>
			{/snippet}
		</MobileTableCard>
	{/each}
{/if}
