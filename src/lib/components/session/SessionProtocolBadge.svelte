<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	type Props = {
		protocol: string | null;
		class?: string;
	};

	let { protocol, class: className = '' }: Props = $props();
</script>

<Badge class="bg-secondary text-text-secondary-alt {className}">
	{protocol || 'unknown'}
</Badge>
