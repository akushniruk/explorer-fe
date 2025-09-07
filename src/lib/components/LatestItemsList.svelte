<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel, AppSession, NodeConfig } from '$lib/types';

	type Item = Channel | AppSession;
	
	export let items: Item[] = [];
	export let nodeConfig: NodeConfig | null = null;
	export let title: string;
	export let viewAllHref: string;
	export let viewAllText: string;
	export let itemType: 'channel' | 'session';

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

	function getItemId(item: Item): string {
		return itemType === 'channel' 
			? (item as Channel).channel_id 
			: (item as AppSession).session_id;
	}

	function getItemHref(item: Item): string {
		const id = getItemId(item);
		return itemType === 'channel' ? `/channel/${id}` : `/session/${id}`;
	}
</script>

<div class="bg-card border border-border rounded-lg">
	<div class="p-4 border-b border-border">
		<h2 class="text-lg font-semibold">{title}</h2>
	</div>
	<div class="p-0">
		{#each items as item (getItemId(item))}
			<div
				class="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/10"
			>
				<div class="flex items-center gap-3">
					<div>
						<div class="flex items-center gap-2">
							<a
								href={getItemHref(item)}
								class="font-sans text-sm text-brand hover:text-brand/80 cursor-pointer"
							>
								{shortHex(getItemId(item), 8, 6)}
							</a>
							<span
								class="inline-flex px-2 py-1 rounded text-xs font-medium {getStatusColor(item.status)}"
							>
								{item.status}
							</span>
						</div>
						<div class="text-xs text-muted-foreground mt-1">
							{#if itemType === 'channel'}
								{@const channel = item as Channel}
								{#if nodeConfig}
									{@const brokerAddress = nodeConfig.broker_address}
									{@const counterparty = channel.wallet ?? channel.participant}
									Node: <a
										href={`/address/${brokerAddress}`}
										class="font-sans text-brand hover:text-brand/80 cursor-pointer"
										>{shortHex(brokerAddress, 6, 4)}</a
									>
									• Address: <a
										href={`/address/${counterparty}`}
										class="font-sans text-brand hover:text-brand/80 cursor-pointer"
										>{shortHex(counterparty, 6, 4)}</a
									>
								{:else}
									Address 1: <a
										href={`/address/${channel.wallet}`}
										class="font-sans text-brand hover:text-brand/80 cursor-pointer"
										>{shortHex(channel.wallet, 6, 4)}</a
									>
									• Address 2: <a
										href={`/address/${channel.participant}`}
										class="font-sans text-brand hover:text-brand/80 cursor-pointer"
										>{shortHex(channel.participant, 6, 4)}</a
									>
								{/if}
							{:else}
								{@const session = item as AppSession}
								{#if session.participants && session.participants.length > 0}
									<a
										href={`/address/${session.participants[0]}`}
										class="font-sans text-brand hover:text-brand/80 cursor-pointer"
										>{shortHex(session.participants[0], 6, 4)}</a
									>
									{#if session.participants.length > 1}
										& <a
											href={`/address/${session.participants[1]}`}
											class="font-sans text-brand hover:text-brand/80 cursor-pointer"
											>{shortHex(session.participants[1], 6, 4)}</a
										>
									{/if}
								{/if}
							{/if}
						</div>
					</div>
				</div>
				<div class="text-right">
					{#if itemType === 'channel'}
						{@const channel = item as Channel}
						<div class="font-medium uppercase">
							{formatAmount(channel.amount, channel.asset?.decimals ? parseInt(channel.asset.decimals) : 18, 4)}
							{channel.asset?.symbol || ''}
						</div>
					{/if}
					<div class="text-xs text-muted-foreground">{timeAgo(item.updated_at)}</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="p-4 border-t border-border">
		<a
			href={viewAllHref}
			class="button-yellow-hover inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-foreground bg-transparent border border-border rounded-lg transition-colors"
		>
			{viewAllText}
		</a>
	</div>
</div>