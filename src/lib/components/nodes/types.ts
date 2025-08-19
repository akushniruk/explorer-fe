export type TNodeData = {
	slug: string;
	name: string;
	ws_url: string;
	website_host: string | null;
	icon_key: string | null;
	description: string | null;
	country_code: string;
	region: string;
	latitude: number;
	longitude: number;
	status: string;
	available: boolean;
	latency_ms: number | null;
	last_seen_at: Date | null;
	updated_at: Date;
};
