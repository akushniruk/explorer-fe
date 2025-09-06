<script lang="ts">
	import { shortHex, formatAmount, timeAgo } from '$lib/format';
	import type { Channel } from '$lib/types';

	export let channels: Channel[];
</script>

<!-- Latest Channels -->
<div class="bg-card border border-border rounded-lg">
	<div class="p-4 border-b border-border">
		<h2 class="text-lg font-semibold">Latest Channels</h2>
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
								class="font-mono text-sm text-brand hover:text-brand/80 cursor-pointer"
							>
								{shortHex(ch.channel_id, 8, 6)}
							</a>
							<span
								class="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-foreground"
							>
								{ch.status}
							</span>
						</div>
						<div class="text-xs text-muted-foreground mt-1">
							From <a
								href={`/address/${ch.wallet}`}
								class="font-mono text-brand hover:text-brand/80 cursor-pointer"
								>{shortHex(ch.wallet, 6, 4)}</a
							>
							to
							<a
								href={`/address/${ch.participant}`}
								class="font-mono text-brand hover:text-brand/80 cursor-pointer"
								>{shortHex(ch.participant, 6, 4)}</a
							>
						</div>
					</div>
				</div>
				<div class="text-right">
					<div class="font-medium uppercase">
						{formatAmount(ch.amount, ch.asset?.decimals ? parseInt(ch.asset.decimals) : 18, 4)}
						{ch.asset?.symbol || ''}
					</div>
					<div class="text-xs text-muted-foreground">{timeAgo(ch.updated_at)}</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="p-4 border-t border-border">
		<a
			href="/channels"
			class="button-yellow-hover inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-foreground bg-transparent border border-border rounded-lg transition-colors"
		>
			View All Channels
		</a>
	</div>
</div>
