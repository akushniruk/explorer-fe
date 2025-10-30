<script lang="ts">
	import { shortHex } from '$lib/format';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';

	type Props = {
		channelId: string;
		class?: string;
	};

	let { channelId, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-2 {className}">
	<a
		href={`/channel/${channelId}`}
		class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
		title={channelId}
	>
		{shortHex(channelId, 12, 8)}
	</a>
	<CopyButton value={channelId} />
</div>
