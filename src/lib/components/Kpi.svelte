<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	export let title: string;
</script>

<Card.Root>
	<Card.Header class="pb-2">
		<Card.Title class="text-sm font-medium text-muted-foreground">{title}</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="text-2xl font-bold">
			<slot />
		</div>
	</Card.Content>
</Card.Root>
