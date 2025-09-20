<script lang="ts">
	import { shortHex, timeAgo } from '$lib/format';
	import type { AppSession } from '$lib/types';
	import AddressAvatar from '$lib/components/ui/AddressAvatar.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { Users, Zap } from 'lucide-svelte';

	export let sessions: AppSession[];
	export let address: string;
	export let addressType: string | undefined;

	function getStatusVariant(status: string): 'default' | 'destructive' {
		return status.toLowerCase() === 'open' || status.toLowerCase() === 'active'
			? 'default'
			: 'destructive';
	}

	function getStatusClass(status: string) {
		return status.toLowerCase() === 'open' || status.toLowerCase() === 'active'
			? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
			: 'capitalize';
	}
</script>

<div class="bg-card border border-border rounded-lg">
	<Table.Root>
		<Table.Header>
			<Table.Row class="hover:bg-transparent border-b border-border">
				<Table.Head class="font-medium text-muted-foreground text-sm">Session ID</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Protocol</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Other Addresses</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Status</Table.Head>
				<Table.Head class="font-medium text-muted-foreground text-sm">Updated</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each sessions as session (session.session_id)}
				{@const otherParticipants = session.participants.filter((p) => p !== address)}
				<Table.Row class="hover:bg-muted/50">
					<Table.Cell class="font-sans">
						<div class="flex items-center gap-2">
							<a
								href={`/session/${session.session_id}`}
								class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
								title={session.session_id}
							>
								{shortHex(session.session_id, 12, 8)}
							</a>
							<CopyButton value={session.session_id} />
						</div>
					</Table.Cell>
					<Table.Cell>
						<Badge class="bg-secondary text-secondary-foreground hover:bg-secondary">
							{session.protocol || 'unknown'}
						</Badge>
					</Table.Cell>
					<Table.Cell>
						<div class="text-sm space-y-1">
							{#each otherParticipants.slice(0, 2) as participant}
								<div class="flex items-center gap-2">
									<AddressAvatar address={participant} size={20} />
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
							{#if otherParticipants.length > 2}
								<div class="text-xs text-muted-foreground">
									+{otherParticipants.length - 2} more
								</div>
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell>
						<Badge
							variant={getStatusVariant(session.status)}
							class={getStatusClass(session.status)}
						>
							{session.status}
						</Badge>
					</Table.Cell>
					<Table.Cell>
						<div class="text-sm text-muted-foreground">
							{timeAgo(session.updated_at)}
						</div>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={5} class="h-32 text-center">
						<div class="flex flex-col items-center gap-3">
							{#if addressType === 'node'}
								<Zap class="w-8 h-8 text-muted-foreground" />
								<div class="text-muted-foreground">
									<div class="font-medium">No sessions found</div>
									<div class="text-sm">This node has no active application sessions.</div>
								</div>
							{:else}
								<Users class="w-8 h-8 text-muted-foreground" />
								<div class="text-muted-foreground">
									<div class="font-medium">No sessions found</div>
									<div class="text-sm">This address has no application sessions.</div>
								</div>
							{/if}
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
