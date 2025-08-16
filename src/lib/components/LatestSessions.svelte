<script lang="ts">
	import { shortHex, timeAgo } from '$lib/format';
	import type { AppSession } from '$lib/types';

	export let sessions: AppSession[];
	console.log('sessions:', sessions);
</script>

<!-- Latest App Sessions -->
<div class="bg-card border border-border rounded-lg">
	<div class="flex items-center justify-between p-4 border-b border-border">
		<h2 class="text-lg font-semibold">Latest Sessions</h2>
		<a href="/sessions" class="text-sm text-brand hover:text-brand/80 cursor-pointer"
			>View All Sessions →</a
		>
	</div>
	<div class="p-0">
		{#each sessions as s (s.session_id)}
			<div
				class="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/10"
			>
				<div class="flex items-center gap-3">
					<div>
						<div class="flex items-center gap-2">
							<a
								href={`/session/${s.session_id}`}
								class="font-mono text-sm text-brand hover:text-brand/80 cursor-pointer"
							>
								{shortHex(s.session_id, 8, 6)}
							</a>
							<span
								class="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-foreground"
							>
								{s.status}
							</span>
						</div>
						<div class="text-xs text-muted-foreground mt-1">
							{#if s.participants && s.participants.length > 0}
								<a
									href={`/address/${s.participants[0]}`}
									class="font-mono text-brand hover:text-brand/80 cursor-pointer"
									>{shortHex(s.participants[0], 6, 4)}</a
								>
								{#if s.participants.length > 1}
									& <a
										href={`/address/${s.participants[1]}`}
										class="font-mono text-brand hover:text-brand/80 cursor-pointer"
										>{shortHex(s.participants[1], 6, 4)}</a
									>
								{/if}
							{/if}
						</div>
					</div>
				</div>
				<div class="text-right">
					<!-- <div class="font-mono text-sm">Ch: {shortHex(s.channel_id, 6, 4)}</div> -->
					<div class="text-xs text-muted-foreground">{timeAgo(s.updated_at)}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
