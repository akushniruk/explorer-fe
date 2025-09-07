export type Asset = {
	symbol: string;
	decimals: string;
};

export type Channel = {
	channel_id: string;
	chain_id: string;
	token: string;
	wallet: string;
	participant: string;
	amount: string;
	status: string;
	updated_at: string;
	asset?: Asset | null;
};

export type AppSession = {
	session_id: string;
	channel_id: string;
	participants: string[];
	status: string;
	updated_at: string;
	protocol?: string;
};

export type NetworkCounts = {
	channels: number;
	sessions: number;
	networks: number;
	assets: number;
	nodes: number;
};

export type NodeConfig = {
	id: string;
	broker_address: string;
	updated_at: string;
};
