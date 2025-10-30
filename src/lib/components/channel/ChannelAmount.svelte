<script lang="ts">
	import { formatAmount, formatSignificantWithSeparators } from '$lib/format';
	import type { Channel } from '$lib/types';

	type Props = {
		channel: Channel;
		class?: string;
		mobile?: boolean;
	};

	let { channel, class: className = '', mobile = false }: Props = $props();

	const formattedAmount = $derived(
		mobile
			? formatSignificantWithSeparators(formatAmount(channel.amount, channel.asset?.decimals ?? 18, 4))
			: formatAmount(channel.amount, channel.asset?.decimals ?? 18, 4)
	);
</script>

<span class="font-sans text-sm uppercase {mobile ? 'font-semibold text-foreground' : ''} {className}">
	{formattedAmount}
	{channel.asset?.symbol || ''}
</span>
