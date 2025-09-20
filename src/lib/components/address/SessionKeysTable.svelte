<script lang="ts">
	import { shortHex } from '$lib/format';
	import type { Channel } from '$lib/types';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import Chain from '$lib/components/Chain.svelte';

	export let participants: string[];
	export let channels: Channel[];
</script>

<div class="bg-card border border-border rounded-lg">
	<div class="p-4 border-b border-border">
		<h3 class="font-semibold">Session Keys Associated with this Wallet</h3>
		<p class="text-sm text-muted-foreground mt-1">
			All session keys (participants) that belong to this main wallet address.
		</p>
	</div>
	<Table.Root>
		<Table.Header>
			<Table.Row class="hover:bg-transparent border-b border-border">
				<Table.Head class="font-medium text-muted-foreground text-sm">Session Key</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Channels</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Chains</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Status</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each participants as participant (participant)}
				{@const participantChannels = channels.filter((c) => c.participant === participant)}
				{@const activeParticipantChannels = participantChannels.filter((c) => c.status === 'open')}
				{@const uniqueChains = [...new Set(participantChannels.map((c) => c.chain_id))]}
				<Table.Row class="hover:bg-muted/50">
					<Table.Cell class="font-sans">
						<div class="flex items-center gap-2">
							<AddressAvatar address={participant} size={32} />
							<div>
								<a
									href={`/address/${participant}`}
									class="text-foreground underline hover:text-foreground text-sm cursor-pointer font-semibold"
									title={participant}
								>
									{shortHex(participant, 10, 8)}
								</a>
								<div class="text-xs text-muted-foreground">Session Key</div>
							</div>
							<CopyButton value={participant} />
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="text-sm space-y-1">
							{#if participantChannels.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each participantChannels.slice(0, 3) as channel}
										<a
											href={`/channel/${channel.channel_id}`}
											class="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80 font-sans"
											title={channel.channel_id}
										>
											{shortHex(channel.channel_id, 4, 4)}
										</a>
									{/each}
									{#if participantChannels.length > 3}
										<span class="text-xs text-muted-foreground"
											>+{participantChannels.length - 3}</span
										>
									{/if}
								</div>
								<div class="text-muted-foreground text-xs">
									{activeParticipantChannels.length} active of {participantChannels.length} total
								</div>
							{:else}
								<div class="text-muted-foreground text-xs">No channels</div>
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex flex-wrap gap-1">
							{#each uniqueChains.slice(0, 3) as chainId}
								<Chain chainId={Number(chainId)} />
							{/each}
							{#if uniqueChains.length > 3}
								<span class="text-xs text-muted-foreground">+{uniqueChains.length - 3}</span>
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell>
						<Badge
							variant={activeParticipantChannels.length > 0 ? 'default' : 'destructive'}
							class={activeParticipantChannels.length > 0
								? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
								: 'capitalize'}
						>
							{activeParticipantChannels.length > 0 ? 'Active' : 'Inactive'}
						</Badge>
					</Table.Cell>
					<Table.Cell>
						<a
							href={`/address/${participant}`}
							class="text-brand hover:text-brand/80 text-sm underline"
						>
							View Details
						</a>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={5} class="h-24 text-center text-muted-foreground">
						No session keys found for this wallet.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
