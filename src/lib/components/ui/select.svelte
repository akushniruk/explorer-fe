<script lang="ts">
	import { cn } from '$lib/utils';

	export let value: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;

	$: classes = cn(
		'flex h-10 w-full items-center justify-between rounded-md border border-border bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		$$props.class
	);
</script>

<select bind:value {disabled} class={classes} {...$$restProps} on:blur on:change on:focus>
	{#if placeholder}
		<option value="" disabled>{placeholder}</option>
	{/if}
	<slot />
</select>
