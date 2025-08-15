<script lang="ts">
	import { cn } from '$lib/utils';

	export let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

	const variants = {
		default: 'border-transparent bg-brand text-brand-foreground shadow-sm',
		secondary: 'border-transparent bg-accent text-accent-foreground hover:bg-accent/80',
		destructive:
			'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
		outline: 'text-brand border-brand/30 bg-brand/5 hover:bg-brand/10'
	};

	$: classes = cn(
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants[variant],
		$$props.class
	);
</script>

<div class={classes} {...$$restProps}>
	<slot />
</div>
