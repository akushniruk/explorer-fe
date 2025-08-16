import { chains } from '$lib/ctypto/chains';
import type { Chain } from 'viem';

export function getChainById(chainId: number): Chain | undefined {
	return Object.values(chains).find((chain) => chain.id === chainId);
}
