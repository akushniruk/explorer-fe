<script lang="ts">
	import type { Node } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';

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

<div class="bg-gradient-to-br from-card to-muted/30 border border-border rounded-xl p-8 mb-8">
	<div class="flex items-start gap-6">
		<!-- Node Icon -->
		<div class="flex-shrink-0">
			{#if node.icon_key}
				<div
					class="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center"
				>
					<img
						src={node.icon_key}
						alt={`${node.name} icon`}
						class="w-full h-full object-cover"
						on:error={(e) => {
							const img = e.target as HTMLImageElement;
							img.style.display = 'none';
							if (img.nextElementSibling) {
								(img.nextElementSibling as HTMLElement).style.display = 'flex';
							}
						}}
					/>
					<div
						class="w-full h-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center text-xl font-bold text-text"
						style="display: none;"
					>
						{node.name.charAt(0).toUpperCase()}
					</div>
				</div>
			{:else}
				<div
					class="w-16 h-16 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 flex items-center justify-center text-xl font-bold text-text"
				>
					{node.name.charAt(0).toUpperCase()}
				</div>
			{/if}
		</div>

		<!-- Node Info -->
		<div class="flex-1 min-w-0">
			<!-- Node Name -->
			<h1 class="text-3xl font-bold text-foreground mb-2 break-words">
				{node.name}
			</h1>

			<!-- Slug -->
			<div class="mb-4">
				<code class="font-mono text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
					{node.slug}
				</code>
			</div>

			<!-- Status Badges -->
			<div class="flex items-center gap-3 mb-4">
				<Badge
					variant={getStatusVariant(node.status)}
					class={`${getStatusClass(node.status)} capitalize font-medium`}
				>
					{node.status}
				</Badge>

				<Badge
					variant="outline"
					class={node.available
						? 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
						: 'border-red-600 text-red-600 bg-red-50 dark:bg-red-950/20'}
				>
					{node.available ? 'Available' : 'Unavailable'}
				</Badge>
			</div>

			<!-- Description -->
			{#if node.description}
				<p class="text-muted-foreground leading-relaxed max-w-2xl">
					{node.description}
				</p>
			{:else}
				<p class="text-muted-foreground italic">No description provided for this node.</p>
			{/if}
		</div>
	</div>
</div>
