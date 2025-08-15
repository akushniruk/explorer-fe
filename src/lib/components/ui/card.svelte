<script lang="ts">
	import { cn } from '$lib/utils';

	$: classes = cn(
		'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
		$$props.class
	);
</script>

<div class={classes} {...$$restProps}>
	<slot />
</div>
