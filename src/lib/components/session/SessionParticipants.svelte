<script lang="ts">
	import { shortHex } from '$lib/format';
	import CopyButton from '../ui/CopyButton.svelte';
	import MobileTableField from '../ui/MobileTableField.svelte';

	type Props = {
		participants: string[];
		mobile?: boolean;
		class?: string;
	};

	let { participants, mobile = false, class: className = '' }: Props = $props();
</script>

{#if mobile}
	<MobileTableField label="Participants" class="col-span-2 {className}">
		{#snippet value()}
			<div class="space-y-1">
				{#each participants.slice(0, 3) as participant, i}
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
				{#if participants.length > 3}
					<div class="text-xs text-muted-foreground">
						+{participants.length - 3} more
					</div>
				{/if}
			</div>
		{/snippet}
	</MobileTableField>
{:else}
	<div class="text-sm space-y-1 {className}">
		{#each participants.slice(0, 3) as participant, i}
			<div class="flex items-center gap-2">
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
		{#if participants.length > 3}
			<div class="text-xs text-muted-foreground">
				+{participants.length - 3} more
			</div>
		{/if}
	</div>
{/if}
