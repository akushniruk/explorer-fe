export type Channel = {
	channel_id: string;
	chain_id: string;
	token: string;
	wallet: string;
	participant: string;
	amount: string;
	status: string;
	updated_at: string;
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
