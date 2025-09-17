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
	quorum?: number;
	challenge?: number;
	weight?: number[];
	session_data?: string | null;
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

export type WalletChannelData = {
	items: Channel[];
	participants: string[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasMore: boolean;
};

export type ParticipantChannelData = {
	items: Channel[];
	wallet: string;
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasMore: boolean;
};

export type AddressChannelData = {
	items: Channel[];
	lookupType: 'wallet' | 'participant';
	participants?: string[];
	wallet?: string;
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasMore: boolean;
};

export type Node = {
	slug: string;
	name: string;
	ws_url: string;
	address: string | null;
	website_host: string | null;
	icon_key: string | null;
	description: string | null;
	country_code: string;
	region: string;
	latitude: number;
	longitude: number;
	status: string;
	available: boolean;
	featured: boolean;
	latency_ms: number | null;
	last_seen_at: string | null;
	updated_at: string;
};
