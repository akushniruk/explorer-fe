export interface Asset {
	id: string;
	symbol: string;
	name: string;
	contract_address: string;
	chain_id: string;
	decimals: number;
	total_supply?: string;
	logo_url?: string;
}

export interface GroupedAsset {
	symbol: string;
	name: string;
	logo_url?: string;
	chains: {
		chain_id: string;
		contract_address: string;
		decimals: number;
		total_supply?: string;
	}[];
	totalChains: number;
}

export function groupAssetsBySymbol(assets: Asset[]): GroupedAsset[] {
	const grouped = new Map<string, GroupedAsset>();

	for (const asset of assets) {
		const key = asset.symbol.toLowerCase();

		if (grouped.has(key)) {
			const existingGroup = grouped.get(key)!;
			existingGroup.chains.push({
				chain_id: asset.chain_id,
				contract_address: asset.contract_address,
				decimals: asset.decimals,
				total_supply: asset.total_supply
			});
			existingGroup.totalChains = existingGroup.chains.length;
		} else {
			grouped.set(key, {
				symbol: asset.symbol,
				name: asset.name,
				logo_url: asset.logo_url,
				chains: [
					{
						chain_id: asset.chain_id,
						contract_address: asset.contract_address,
						decimals: asset.decimals,
						total_supply: asset.total_supply
					}
				],
				totalChains: 1
			});
		}
	}

	return Array.from(grouped.values()).sort(
		(a, b) => b.totalChains - a.totalChains || a.symbol.localeCompare(b.symbol)
	);
}
