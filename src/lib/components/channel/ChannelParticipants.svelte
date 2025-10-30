<script lang="ts">
	import AddressLink from './AddressLink.svelte';
	import MobileTableField from '$lib/components/ui/MobileTableField.svelte';
	import type { Channel, NodeConfig } from '$lib/types';

	type Props = {
		channel: Channel;
		nodeConfig: NodeConfig | null;
		mobile?: boolean;
	};

	let { channel, nodeConfig, mobile = false }: Props = $props();

	const brokerAddress = $derived(nodeConfig?.broker_address);
	const counterparty = $derived(channel.wallet ?? channel.participant);
</script>

{#if mobile}
	{#if nodeConfig && brokerAddress}
		<MobileTableField label="Node Address">
			{#snippet value()}
				<AddressLink address={brokerAddress} isNode />
			{/snippet}
		</MobileTableField>

		<MobileTableField label="Counterparty">
			{#snippet value()}
				<AddressLink address={counterparty} />
			{/snippet}
		</MobileTableField>
	{:else}
		<MobileTableField label="Address 1">
			{#snippet value()}
				<AddressLink address={channel.wallet} />
			{/snippet}
		</MobileTableField>

		<MobileTableField label="Address 2">
			{#snippet value()}
				<AddressLink address={channel.participant} />
			{/snippet}
		</MobileTableField>
	{/if}
{:else}
	{#if nodeConfig && brokerAddress}
		<div class="space-y-1 text-sm">
			<AddressLink address={brokerAddress} label="Node" isNode />
			<AddressLink address={counterparty} label="Address" />
		</div>
	{:else}
		<div class="space-y-1 text-sm">
			<AddressLink address={channel.wallet} label="Address 1" />
			<AddressLink address={channel.participant} label="Address 2" />
		</div>
	{/if}
{/if}
