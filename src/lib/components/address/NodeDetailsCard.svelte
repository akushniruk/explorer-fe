<script lang="ts">
	import { timeAgo } from '$lib/format';
	import type { Node } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { Activity, Clock, Cpu, Globe, MapPin } from 'lucide-svelte';

	export let node: Node;
</script>

{#if node}
	<div class="bg-card border border-border rounded-lg p-6 mt-4">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Left Column: Identity & Status -->
			<div class="space-y-4">
				<div>
					<h3 class="text-xl font-bold text-foreground mb-1">{node.name}</h3>
					<div class="flex items-center gap-2 mb-3">
						<Badge
							variant={node.status === 'active' ? 'default' : 'destructive'}
							class={node.status === 'active'
								? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
								: 'capitalize'}
						>
							{node.status}
						</Badge>
						<Badge
							variant="outline"
							class={node.available
								? 'border-emerald-600 text-emerald-600'
								: 'border-red-600 text-red-600'}
						>
							{node.available ? 'Available' : 'Unavailable'}
						</Badge>
					</div>
				</div>

				{#if node.latency_ms}
					<div class="flex items-center gap-2">
						<Activity class="w-4 h-4 text-muted-foreground" />
						<span class="text-sm text-muted-foreground">Latency:</span>
						<span class="font-sans font-medium">{node.latency_ms}ms</span>
					</div>
				{/if}

				{#if node.description}
					<div class="pt-2">
						<p class="text-sm text-muted-foreground leading-relaxed">
							{node.description}
						</p>
					</div>
				{/if}
			</div>

			<!-- Right Column: Metadata -->
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<MapPin class="w-4 h-4 text-muted-foreground" />
					<span class="text-sm text-muted-foreground">Location:</span>
					<span class="font-medium">{node.region}, {node.country_code.toUpperCase()}</span>
				</div>

				{#if node.website_host}
					<div class="flex items-center gap-2">
						<Globe class="w-4 h-4 text-muted-foreground" />
						<span class="text-sm text-muted-foreground">Website:</span>
						<a
							href={`https://${node.website_host}`}
							target="_blank"
							rel="noopener noreferrer"
							class="text-brand hover:text-brand/80 underline font-medium"
						>
							{node.website_host}
						</a>
					</div>
				{/if}

				{#if node.last_seen_at}
					<div class="flex items-center gap-2">
						<Clock class="w-4 h-4 text-muted-foreground" />
						<span class="text-sm text-muted-foreground">Last Seen:</span>
						<span class="font-medium">{timeAgo(node.last_seen_at)}</span>
					</div>
				{/if}

				<!-- WebSocket URL - Collapsible Technical Details -->
				<details class="group">
					<summary
						class="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
					>
						<Cpu class="w-4 h-4" />
						<span>WebSocket URL</span>
						<svg
							class="w-4 h-4 transition-transform group-open:rotate-180"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>
					<div class="mt-2 p-3 bg-muted rounded border">
						<div class="flex items-center gap-2">
							<code class="font-sans text-xs break-all text-muted-foreground flex-1">
								{node.ws_url}
							</code>
							<CopyButton value={node.ws_url} />
						</div>
					</div>
				</details>
			</div>
		</div>
	</div>
{/if}
