import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const base = locals.apiBase ?? '';

	try {
		const response = await fetch(`${base}/api/v1/asset/list`);
		const data = response.ok ? await response.json() : null;

		// Mock some sample assets if API doesn't return them
		const mockAssets = [
			{
				id: '1',
				symbol: 'ETH',
				name: 'Ethereum',
				contract_address: '0x0000000000000000000000000000000000000000',
				chain_id: '1',
				decimals: 18,
				total_supply: '120,000,000'
			},
			{
				id: '2',
				symbol: 'USDC',
				name: 'USD Coin',
				contract_address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
				chain_id: '137',
				decimals: 6,
				total_supply: '52,000,000,000'
			},
			{
				id: '3',
				symbol: 'MATIC',
				name: 'Polygon',
				contract_address: '0x0000000000000000000000000000000000001010',
				chain_id: '137',
				decimals: 18,
				total_supply: '10,000,000,000'
			},
			{
				id: '4',
				symbol: 'WETH',
				name: 'Wrapped Ethereum',
				contract_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
				chain_id: '137',
				decimals: 18
			},
			{
				id: '5',
				symbol: 'USDT',
				name: 'Tether USD',
				contract_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
				chain_id: '137',
				decimals: 6,
				total_supply: '83,000,000,000'
			}
		];

		return {
			assets: data?.data ?? mockAssets,
			total: data?.data?.length ?? mockAssets.length
		};
	} catch (error) {
		console.error('Failed to load assets:', error);
		return {
			assets: [],
			total: 0
		};
	}
};
