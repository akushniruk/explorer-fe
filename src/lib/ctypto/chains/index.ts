import {
	base,
	flowMainnet,
	linea,
	mainnet,
	polygon,
	rootstock,
	worldchain,
	xrplevmDevnet,
	xrplevmTestnet
} from 'viem/chains';
import { defineChain } from 'viem';

const xrplevm = defineChain({
	id: 1440000,
	name: 'XRPL EVM',
	nativeCurrency: {
		name: 'XRP',
		symbol: 'XRP',
		decimals: 18
	},
	rpcUrls: {
		default: {
			http: ['https://rpc.xrplevm.org/']
		},
		public: {
			http: ['https://rpc.xrplevm.org/']
		}
	},
	blockExplorers: {
		default: {
			name: 'XRPLEVM Explorer',
			url: 'https://explorer.xrplevm.org/'
		}
	},
	contracts: {},
	testnet: false
});

export const chains = {
	mainnet,
	polygon,
	worldchain,
	flowMainnet,
	base,
	rootstock,
	linea,
	xrplevmTestnet,
	xrplevmDevnet,
	xrplevm
};
