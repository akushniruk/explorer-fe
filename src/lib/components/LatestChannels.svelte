<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel } from '$lib/types';

	export let channels: Channel[];
</script>

<!-- Latest Channels -->
<div class="bg-card border border-border rounded-lg">
	<div class="flex items-center justify-between p-4 border-b border-border">
		<h2 class="text-lg font-semibold">Latest Channels</h2>
		<a href="/channels" class="text-sm text-brand hover:text-brand/80">View All Channels →</a>
	</div>
	<div class="p-0">
		{#each channels as ch (ch.channel_id)}
			<div
				class="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/10"
			>
				<div class="flex items-center gap-3">
					<div>
						<div class="flex items-center gap-2">
							<a
								href={`/channel/${ch.channel_id}`}
								class="font-mono text-sm text-brand hover:text-brand/80"
							>
								{shortHex(ch.channel_id, 8, 6)}
							</a>
							<span
								class="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
							>
								{ch.status}
							</span>
						</div>
						<div class="text-xs text-muted-foreground mt-1">
							From <a
								href={`/participant/${ch.wallet}`}
								class="font-mono text-brand hover:text-brand/80">{shortHex(ch.wallet, 6, 4)}</a
							>
							to
							<a
								href={`/participant/${ch.participant}`}
								class="font-mono text-brand hover:text-brand/80">{shortHex(ch.participant, 6, 4)}</a
							>
						</div>
					</div>
				</div>
				<div class="text-right">
					<div class="font-medium">{formatAmount(ch.amount, 18, 4)} ETH</div>
					<div class="text-xs text-muted-foreground">{timeAgo(ch.updated_at)}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
