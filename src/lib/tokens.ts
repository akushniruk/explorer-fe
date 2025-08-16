interface TokenInfo {
	symbol: string;
	name: string;
	logoURI?: string;
	chainId: number;
	address: string;
	decimals: number;
}

interface TokenList {
	tokens: TokenInfo[];
}

let tokenCache: Map<string, TokenInfo> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function fetchUniswapTokenList(): Promise<TokenList> {
	const response = await fetch('https://tokens.uniswap.org/');
	if (!response.ok) {
		throw new Error(`Failed to fetch token list: ${response.status}`);
	}
	return response.json();
}

async function getTokenCache(): Promise<Map<string, TokenInfo>> {
	const now = Date.now();

	if (tokenCache && now - cacheTimestamp < CACHE_DURATION) {
		return tokenCache;
	}

	try {
		const tokenList = await fetchUniswapTokenList();
		tokenCache = new Map();

		for (const token of tokenList.tokens) {
			const key = `${token.chainId}:${token.address.toLowerCase()}`;
			tokenCache.set(key, token);
		}

		cacheTimestamp = now;
		return tokenCache;
	} catch (error) {
		console.error('Failed to fetch Uniswap token list:', error);
		if (tokenCache) {
			return tokenCache;
		}
		return new Map();
	}
}

export async function getTokenInfo(
	chainId: number,
	address: string,
	symbol?: string
): Promise<{ name: string; logoUrl?: string } | null> {
	try {
		const cache = await getTokenCache();
		const key = `${chainId}:${address.toLowerCase()}`;
		const token = cache.get(key);

		if (token) {
			return {
				name: token.name,
				logoUrl: token.logoURI
			};
		}

		// Fallback: search by symbol across all chains
		if (symbol) {
			for (const [, tokenInfo] of cache) {
				if (tokenInfo.symbol.toLowerCase() === symbol.toLowerCase()) {
					return {
						name: tokenInfo.name,
						logoUrl: tokenInfo.logoURI
					};
				}
			}
		}

		return null;
	} catch (error) {
		console.error('Error getting token info:', error);
		return null;
	}
}
