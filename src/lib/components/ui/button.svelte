<script lang="ts">
	import { cn } from '$lib/utils';

	export let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' =
		'default';
	export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
	export let href: string | undefined = undefined;
	export let disabled: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const variants = {
		default: 'bg-brand text-brand-foreground hover:opacity-90 border border-brand/20 shadow-sm',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline:
			'border border-brand bg-transparent text-brand hover:bg-brand hover:text-brand-foreground',
		secondary: 'bg-accent text-accent-foreground hover:bg-accent/80',
		ghost: 'text-brand hover:bg-brand/10 hover:text-brand',
		link: 'text-brand underline-offset-4 hover:underline hover:opacity-80'
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};

	const baseClasses =
		'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	$: classes = cn(baseClasses, variants[variant], sizes[size], $$props.class);
</script>

{#if href}
	<a {href} class={classes} {...$$restProps}>
		<slot />
	</a>
{:else}
	<button {type} {disabled} class={classes} {...$$restProps} on:click>
		<slot />
	</button>
{/if}
