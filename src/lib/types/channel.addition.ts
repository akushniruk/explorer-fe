export type ChannelUpdate = {
	id: string;
	channel_id: string;
	type: string; // open|deposit|withdraw|settle|close|sync
	amount?: string;
	token?: string;
	from?: string;
	to?: string;
	tx_hash?: string;
	block_number?: number;
	chain_id?: string;
	timestamp?: string; // ISO
};
