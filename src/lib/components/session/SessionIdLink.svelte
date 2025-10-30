<script lang="ts">
	import { shortHex } from '$lib/format';
	import CopyButton from '../ui/CopyButton.svelte';

	type Props = {
		sessionId: string;
		class?: string;
	};

	let { sessionId, class: className = '' }: Props = $props();
</script>

<div class="flex items-center gap-2 {className}">
	<a
		href={`/session/${sessionId}`}
		class="text-foreground underline hover:text-foreground text-sm cursor-pointer"
		title={sessionId}
	>
		{shortHex(sessionId, 12, 8)}
	</a>
	<CopyButton value={sessionId} />
</div>
