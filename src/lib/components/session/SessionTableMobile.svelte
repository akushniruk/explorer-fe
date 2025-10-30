<script lang="ts">
	import { timeAgo, shortHex } from '$lib/format';
	import MobileTableCard from '$lib/components/ui/MobileTableCard.svelte';
	import MobileTableField from '$lib/components/ui/MobileTableField.svelte';
	import CopyButton from '../ui/CopyButton.svelte';
	import type { AppSession } from '$lib/types';
	import {
		SessionIdLink,
		SessionStatusBadge,
		SessionProtocolBadge
	} from './index';

	type Props = {
		sessions: AppSession[];
		loading?: boolean;
		emptyMessage?: string;
		pageSize?: number;
	};

	let {
		sessions,
		loading = false,
		emptyMessage = 'No sessions found',
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
{:else if sessions.length === 0}
	<div class="p-8 text-center text-muted-foreground">{emptyMessage}</div>
{:else}
	{#each sessions as session}
		<MobileTableCard href={`/session/${session.session_id}`}>
			{#snippet header()}
				<div class="flex flex-row items-center justify-between w-full">
					<span class="text-sm font-semibold text-foreground">
						<SessionIdLink sessionId={session.session_id} />
					</span>
					<SessionStatusBadge status={session.status} />
				</div>
			{/snippet}
			{#snippet fields()}
				<MobileTableField label="Participants">
					{#snippet value()}
						<div class="space-y-1">
							{#each session.participants.slice(0, 3) as participant, i}
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
							{#if session.participants.length > 3}
								<div class="text-xs text-muted-foreground">
									+{session.participants.length - 3} more
								</div>
							{/if}
						</div>
					{/snippet}
				</MobileTableField>

				<MobileTableField label="Protocol">
					{#snippet value()}
						<SessionProtocolBadge protocol={session.protocol} />
					{/snippet}
				</MobileTableField>

				<div class="col-span-2 flex items-center gap-2 pt-2 mt-2">
					<span class="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg" title={session.updated_at}>
						{timeAgo(session.updated_at)}
					</span>
					<div class="flex-1 border-t border-border"></div>
				</div>
			{/snippet}
		</MobileTableCard>
	{/each}
{/if}
