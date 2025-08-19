<script lang="ts">
	import type { TNodeData } from './types';
	import { browser } from '$app/environment';

	export let pin: TNodeData;

	let isMobile = false;
	let isCopied = false;
	const MQ = 655;

	function handleResize() {
		if (browser) {
			isMobile = window.innerWidth <= MQ;
		}
	}

	async function copyToClipboard(text: string) {
		if (browser && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(text);
				isCopied = true;
				// Reset the copied state after 2 seconds
				setTimeout(() => {
					isCopied = false;
				}, 2000);
			} catch (err) {
				// Fallback for older browsers
				const textArea = document.createElement('textarea');
				textArea.value = text;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);

				isCopied = true;
				setTimeout(() => {
					isCopied = false;
				}, 2000);
			}
		}
	}

	function getStatusColor(status: string, available: boolean) {
		if (!available) return 'var(--color-destructive)';
		switch (status) {
			case 'online':
				return 'var(--color-success)';
			case 'degraded':
				return 'var(--color-warning)';
			case 'offline':
				return 'var(--color-destructive)';
			default:
				return 'var(--color-muted-foreground)';
		}
	}

	function getCountryName(code: string) {
		const countries: Record<string, string> = {
			US: 'United States',
			GB: 'United Kingdom',
			DE: 'Germany',
			FR: 'France',
			CA: 'Canada',
			JP: 'Japan',
			AU: 'Australia',
			NL: 'Netherlands',
			SG: 'Singapore',
			BR: 'Brazil'
		};
		return countries[code.toUpperCase()] || code.toUpperCase();
	}

	$: if (browser) {
		handleResize();
		window.addEventListener('resize', handleResize);
	}
</script>

<foreignObject
	width={isMobile ? 300 : 370}
	height={isMobile ? 280 : 340}
	x={isMobile ? -150 : -185}
	y={isMobile ? -220 : -380}
	role="dialog"
	aria-label="Node information popup"
	tabindex="0"
	on:click|stopPropagation
	on:keydown|stopPropagation
	class="outline:none focus:outline-none"
>
	<div
		xmlns="http://www.w3.org/1999/xhtml"
		class="bg-card shadow-md rounded-lg pt-2 min-[655px]:pt-4 pb-1.5 min-[655px]:pb-3 w-full"
	>
		<div class="px-2 min-[655px]:px-4">
			<div
				class="flex items-center justify-between bg-secondary py-1 min-[655px]:py-[7px] px-1.5 min-[655px]:px-3 w-full rounded-xl min-[655px]:rounded-2xl"
			>
				<div
					class="text-[10px] leading-3 min-[655px]:leading-4 min-[655px]:text-xs text-muted-foreground truncate flex-1 mr-2"
				>
					{pin.ws_url}
				</div>
				<button
					class="flex-shrink-0 transition-all duration-200 transform hover:opacity-80"
					class:text-success={isCopied}
					class:text-primary={!isCopied}
					class:scale-110={isCopied}
					aria-label={isCopied ? 'Copied!' : 'Copy WebSocket URL'}
					on:click={() => copyToClipboard(pin.ws_url)}
				>
					{#if isCopied}
						<!-- Checkmark icon -->
						<svg
							class="w-2.5 h-2.5 min-[655px]:w-4 min-[655px]:h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					{:else}
						<!-- Copy icon -->
						<svg
							class="w-2.5 h-2.5 min-[655px]:w-4 min-[655px]:h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
							<path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<div class="mt-1.5 min-[655px]:mt-3 px-2.5 min-[655px]:px-4 space-y-1 min-[655px]:space-y-1.5">
			<div class="text-xs min-[655px]:text-sm text-muted-foreground">
				Status: <span
					class="text-foreground capitalize"
					style:color={getStatusColor(pin.status, pin.available)}>{pin.status}</span
				>
			</div>
			<div class="text-xs min-[655px]:text-sm text-muted-foreground">
				Region: <span class="text-foreground capitalize">{pin.region.replace('_', ' ')}</span>
			</div>
			{#if pin.description}
				<div class="text-xs min-[655px]:text-sm text-muted-foreground">
					Description: <span class="text-foreground break-words">{pin.description}</span>
				</div>
			{/if}
		</div>

		<div
			class="flex items-center flex-row mt-1.5 min-[655px]:mt-3 justify-between pb-[9px] min-[655px]:pb-[18px] border-b border-border"
		>
			<div class="flex items-center flex-col px-2 min-[655px]:px-4 flex-1">
				<div
					class="text-[10px] leading-3 min-[655px]:text-xs min-[655px]:leading-4 font-medium text-muted-foreground mb-1"
				>
					Node Name
				</div>
				<div
					class="text-xs min-[655px]:text-sm bg-secondary py-1 min-[655px]:py-[7px] px-1.5 min-[655px]:px-3 rounded-xl min-[655px]:rounded-2xl min-[655px]:min-h-[30px] flex items-center justify-center w-full"
				>
					<span class="text-xs min-[655px]:text-sm text-foreground font-medium">
						{pin.name}
					</span>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-between mt-1.5 min-[655px]:mt-3 px-2 min-[655px]:px-4">
			<div class="flex items-center gap-1">
				<svg
					class="w-3 h-3 min-[655px]:w-5 min-[655px]:h-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
					<circle cx="12" cy="10" r="3" />
				</svg>

				<div
					class="flex flex-row items-center gap-1 rounded-xl min-[655px]:rounded-2xl py-1 min-[655px]:py-1.5 px-1.5 min-[655px]:px-2 bg-secondary"
				>
					<img
						src={`https://hatscripts.github.io/circle-flags/flags/${pin.country_code.toLowerCase()}.svg`}
						alt="Country flag"
						class="w-2.5 h-2.5 min-[655px]:w-4 min-[655px]:h-4 flex-shrink-0"
					/>
					<span
						class="text-foreground font-medium text-xs leading-4 min-[655px]:text-sm min-[655px]:leading-[22px]"
					>
						{getCountryName(pin.country_code)}
					</span>
				</div>
			</div>

			<div class="flex items-center gap-1">
				<svg
					class="w-3 h-3 min-[655px]:w-5 min-[655px]:h-5 flex-shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="3" />
					<path d="M12 1v6m0 6v6" />
					<path d="m9 9 3 3 3-3" />
				</svg>
				<span
					class="font-medium text-xs leading-4 min-[655px]:text-sm min-[655px]:leading-[22px]"
					style:color={getStatusColor(pin.status, pin.available)}
				>
					{pin.available ? 'Available' : 'Unavailable'}
				</span>
			</div>

			{#if pin.latency_ms !== null}
				<div class="flex flex-row items-center gap-1">
					<svg
						class="w-3 h-3 min-[655px]:w-5 min-[655px]:h-5 flex-shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M3 3v18h18" />
						<path d="M7 12l3-3 3 3 5-5" />
					</svg>
					<span
						class="text-muted-foreground font-medium text-xs leading-4 min-[655px]:text-sm min-[655px]:leading-[22px]"
					>
						{pin.latency_ms} ms
					</span>
				</div>
			{/if}
		</div>
	</div>
</foreignObject>
