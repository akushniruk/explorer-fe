<script lang="ts">
	import type { Node } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import { shortHex } from '$lib/format';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { Globe, MapPin, Navigation, Plug, Hash } from 'lucide-svelte';

	export let node: Node;

	function getStatusVariant(status: string): 'default' | 'destructive' | 'secondary' {
		switch (status.toLowerCase()) {
			case 'active':
				return 'default';
			case 'inactive':
			case 'offline':
				return 'destructive';
			default:
				return 'secondary';
		}
	}

	function getStatusClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'active':
				return 'bg-emerald-600 hover:bg-emerald-600/90 text-white';
			case 'inactive':
			case 'offline':
				return 'bg-red-600 hover:bg-red-600/90 text-white';
			default:
				return 'bg-gray-500 hover:bg-gray-500/90 text-white';
		}
	}
</script>

<div class="bg-gradient-to-br from-card to-muted/30 border border-border rounded-xl p-6 mb-6">
	<div class="flex items-start gap-4">
		<!-- Node Icon -->
		<div class="flex-shrink-0">
			{#if node.icon_key}
				<div
					class="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border"
				>
					<img
						src={node.icon_key}
						alt={`${node.name} icon`}
						class="w-full h-full object-cover"
						on:error={(e) => {
							(e.currentTarget as HTMLElement).style.display = 'none';
							const fallback = e.currentTarget.nextElementSibling as HTMLElement;
							if (fallback) fallback.style.display = 'flex';
						}}
					/>
					<div
						class="w-full h-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center text-lg font-bold text-brand"
						style="display: none;"
					>
						{node.name.charAt(0).toUpperCase()}
					</div>
				</div>
			{:else}
				<div
					class="w-16 h-16 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center text-lg font-bold text-brand border-2 border-border"
				>
					{node.name.charAt(0).toUpperCase()}
				</div>
			{/if}
		</div>

		<!-- Node Info -->
		<div class="flex-1 min-w-0">
			<!-- Node Name -->
			<h1 class="text-2xl font-bold text-foreground mb-1 break-words flex items-center">
				{node.name}
				<Badge
					variant={getStatusVariant(node.status)}
					class={`${getStatusClass(node.status)} capitalize ml-3 font-medium text-xs`}
				>
					{node.status}
				</Badge>
			</h1>

			<!-- Description -->
			{#if node.description && node.description.trim()}
				<p class="text-sm text-muted-foreground leading-relaxed">
					{node.description}
				</p>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Left Column: Identity -->
		<div class="space-y-4">
			<!-- Node Address -->
			<div class="flex items-start gap-3">
				<Hash class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
				<div class="flex-1 min-w-0">
					<div class="text-sm text-muted-foreground mb-1">Node Address</div>
					<div class="flex items-center gap-2">
						<code class="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
							{node.address || shortHex(node.slug, 16, 8)}
						</code>
						<CopyButton value={node.address || node.slug} />
					</div>
				</div>
			</div>
		</div>

		<!-- Right Column: Meta -->
		<div class="space-y-4">
			<!-- Location -->
			<div class="flex items-start gap-3">
				<MapPin class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
				<div>
					<div class="text-sm text-muted-foreground mb-1">Location</div>
					<div class="font-medium capitalize">
						{node.region.replace('_', ' ')}, {node.country_code.toUpperCase()}
					</div>
				</div>
			</div>

			<!-- Website -->
			{#if node.website_host}
				<div class="flex items-start gap-3">
					<Globe class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
					<div>
						<div class="text-sm text-muted-foreground mb-2">Website</div>
						<a
							href={`https://${node.website_host}`}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 px-3 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium text-sm transition-colors shadow-sm hover:shadow-md"
						>
							<Globe class="w-4 h-4" />
							{node.website_host}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="w-3 h-3"
							>
								<path d="M7 7h10v10" />
								<path d="M7 17 17 7" />
							</svg>
						</a>
					</div>
				</div>
			{/if}

			<!-- WebSocket URL -->
			<div class="flex items-start gap-3">
				<Plug class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
				<div class="flex-1 min-w-0">
					<div class="text-sm text-muted-foreground mb-2">WebSocket URL</div>
					<div class="bg-muted/50 border border-border rounded p-3">
						<div class="flex items-center gap-2">
							<code class="font-mono text-xs text-foreground break-all flex-1 leading-relaxed">
								{node.ws_url}
							</code>
							<CopyButton value={node.ws_url} />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
