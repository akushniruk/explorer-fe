<script lang="ts">
	import { TriangleAlert } from 'lucide-svelte';
	import ThemeSelector from './ThemeSelector.svelte';
	import Navigation from './Navigation.svelte';
</script>

<header class="bg-background border-b border-border">
	<div class="border-b border-[#d8b200] bg-[#fff5bc] px-4 py-2.5 text-black">
		<p class="mx-auto max-w-7xl text-center text-sm leading-5">
			<TriangleAlert class="mr-1 inline-block h-4 w-4 align-[-2px]" aria-hidden="true" />
			<strong>Unofficial Yellow Network explorer.</strong> Independently built to support developers
			at ETHGlobal hackathons. It covers an earlier Nitrolite protocol version; its data and
			behavior may not reflect
			<a
				class="font-semibold underline underline-offset-2 hover:no-underline"
				href="https://www.npmjs.com/package/@erc7824/nitrolite/v/0.4.0"
				target="_blank"
				rel="noopener noreferrer">Nitrolite v0.4.0</a
			> or newer. This explorer will shut down on October 16, 2026.
		</p>
	</div>
	<div class="max-w-7xl mx-auto px-4">
		<Navigation>
			<ThemeSelector />
		</Navigation>
	</div>
</header>
