<script lang="ts">
	import { cn } from '$lib/utils';

	export let type: 'text' | 'email' | 'password' | 'search' | 'number' = 'text';
	export let value: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let readonly: boolean = false;

	$: classes = cn(
		'flex h-10 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm ring-offset-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		$$props.class
	);
</script>

<input
	{type}
	{placeholder}
	{disabled}
	{readonly}
	bind:value
	class={classes}
	{...$$restProps}
	on:blur
	on:change
	on:click
	on:focus
	on:input
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
/>
