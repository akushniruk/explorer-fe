<script lang="ts">
	import type { Channel, AppSession } from '$lib/types';
	import SessionKeysTable from './SessionKeysTable.svelte';
	import ChannelsTable from './ChannelsTable.svelte';
	import SessionsTable from './SessionsTable.svelte';

	export let address: string;
	export let addressType: string | undefined;
	export let lookupType: string | undefined;
	export let participants: string[];
	export let channels: Channel[];
	export let sessions: AppSession[];
	export let pagination: any = null;
	export let onPageChange: (page: number) => void = () => {};
	export let onPageSizeChange: (size: number) => void = () => {};

	let activeTab = lookupType === 'wallet' && participants.length > 0 ? 'sessionkeys' : 'channels';

	// For node types, always default to channels tab
	if (addressType === 'node') {
		activeTab = 'channels';
	}
</script>

<!-- Tab Navigation -->
<div class="border-b border-border mb-6">
	<nav class="flex space-x-8">
		<!-- Session Keys Tab (for wallets) -->
		{#if lookupType === 'wallet' && participants.length > 0}
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
				class:border-brand={activeTab === 'sessionkeys'}
				class:text-brand={activeTab === 'sessionkeys'}
				class:border-transparent={activeTab !== 'sessionkeys'}
				class:text-muted-foreground={activeTab !== 'sessionkeys'}
				on:click={() => (activeTab = 'sessionkeys')}
			>
				Session Keys ({participants.length})
			</button>
		{/if}

		<button
			class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
			class:border-brand={activeTab === 'channels'}
			class:text-brand={activeTab === 'channels'}
			class:border-transparent={activeTab !== 'channels'}
			class:text-muted-foreground={activeTab !== 'channels'}
			on:click={() => (activeTab = 'channels')}
		>
			Channels
		</button>
		<!-- Hide sessions tab for node types -->
		{#if addressType !== 'node'}
			<button
				class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
				class:border-brand={activeTab === 'sessions'}
				class:text-brand={activeTab === 'sessions'}
				class:border-transparent={activeTab !== 'sessions'}
				class:text-muted-foreground={activeTab !== 'sessions'}
				on:click={() => (activeTab = 'sessions')}
			>
				Sessions
			</button>
		{/if}
	</nav>
</div>

<!-- Tab Content -->
{#if activeTab === 'sessionkeys'}
	<SessionKeysTable {participants} {channels} />
{:else if activeTab === 'channels'}
	<ChannelsTable
		{channels}
		{address}
		{addressType}
		{pagination}
		{onPageChange}
		{onPageSizeChange}
	/>
{:else if activeTab === 'sessions'}
	<SessionsTable {sessions} {address} {addressType} />
{/if}
