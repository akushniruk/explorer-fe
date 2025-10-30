<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { timeAgo } from '$lib/format';
	import type { AppSession } from '$lib/types';
	import {
		SessionIdLink,
		SessionStatusBadge,
		SessionProtocolBadge,
		SessionParticipants
	} from './index';

	type Props = {
		sessions: AppSession[];
		loading?: boolean;
		emptyMessage?: string;
		pageSize?: number;
		columnsCount?: number;
	};

	let {
		sessions,
		loading = false,
		emptyMessage = 'No sessions found',
		pageSize = 25,
		columnsCount = 5
	}: Props = $props();
</script>

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
		<Table.Cell colspan={columnsCount} class="h-24 text-center text-muted-foreground">
			{emptyMessage}
		</Table.Cell>
	</Table.Row>
{:else}
	{#each sessions as session}
		<Table.Row class="hover:bg-muted/50">
			<!-- Session ID -->
			<Table.Cell class="font-sans">
				<SessionIdLink sessionId={session.session_id} />
			</Table.Cell>

			<!-- Protocol -->
			<Table.Cell>
				<SessionProtocolBadge protocol={session.protocol} />
			</Table.Cell>

			<!-- Participants -->
			<Table.Cell>
				<SessionParticipants participants={session.participants} />
			</Table.Cell>

			<!-- Status -->
			<Table.Cell>
				<SessionStatusBadge status={session.status} />
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
