<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	type Props = {
		status: string;
		class?: string;
	};

	let { status, class: className = '' }: Props = $props();

	const variant = $derived<'default' | 'destructive'>(
		status.toLowerCase() === 'open' ? 'default' : 'destructive'
	);

	const badgeClass = $derived(
		status.toLowerCase() === 'open'
			? 'bg-emerald-600 hover:bg-emerald-600/90 capitalize'
			: 'capitalize'
	);
</script>

<Badge {variant} class="{badgeClass} {className}">
	{status}
</Badge>
