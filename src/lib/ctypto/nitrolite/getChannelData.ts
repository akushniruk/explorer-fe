import { custodyAbi } from '../abis/generated';
import { createPublicClient, http, type Address, type PublicClient } from 'viem';
import { getChainById } from '../utils';
import {
	getLatestCustodyContract,
	getCustodyContractForTimestamp,
	type ContractDeployment
} from '$lib/config/contracts';

export type ChannelId = `0x${string}`;

export interface ChannelData {
	channel: {
		participants: readonly Address[];
		adjudicator: Address;
		challenge: bigint;
		nonce: bigint;
	};
	status: number;
	wallets: readonly Address[];
	challengeExpiry: bigint;
	lastValidState: {
		intent: number;
		version: bigint;
		data: `0x${string}`;
		allocations: readonly {
			destination: Address;
			token: Address;
			amount: bigint;
		}[];
		sigs: readonly `0x${string}`[];
	};
}

export class NitroliteClient {
	private publicClient: PublicClient;
	private custodyAddress: Address;
	public contractInfo: ContractDeployment;

	constructor(chainId: number, channelCreatedAt?: string) {
		const chain = getChainById(chainId);
		if (!chain) {
			throw new Error(`Unsupported chain ID: ${chainId}`);
		}

		let contractDeployment: ContractDeployment | null = null;

		if (channelCreatedAt) {
			// Use the contract that was active when the channel was created
			const channelTimestamp = Math.floor(new Date(channelCreatedAt).getTime() / 1000);
			contractDeployment = getCustodyContractForTimestamp(chainId, channelTimestamp);
		}

		// Fallback to latest contract if no channel creation date or no contract found
		if (!contractDeployment) {
			contractDeployment = getLatestCustodyContract(chainId);
		}

		if (!contractDeployment) {
			throw new Error(`No custody contract found for chain ID: ${chainId}`);
		}

		this.publicClient = createPublicClient({
			chain,
			transport: http()
		});

		this.custodyAddress = contractDeployment.deployedTo;
		this.contractInfo = contractDeployment;
	}

	/**
	 * Get channel data for a specific channel ID.
	 * @param channelId ID of the channel to retrieve data for.
	 * @returns ChannelData object containing participants and adjudicator address.
	 */
	async getChannelData(channelId: ChannelId): Promise<ChannelData> {
		const functionName = 'getChannelData';

		try {
			const result = await this.publicClient.readContract({
				address: this.custodyAddress,
				abi: custodyAbi,
				functionName: functionName,
				args: [channelId]
			});

			const [channel, status, wallets, challengeExpiry, lastValidState] = result as readonly [
				{
					participants: readonly Address[];
					adjudicator: Address;
					challenge: bigint;
					nonce: bigint;
				},
				number,
				readonly Address[],
				bigint,
				{
					intent: number;
					version: bigint;
					data: `0x${string}`;
					allocations: readonly {
						destination: Address;
						token: Address;
						amount: bigint;
					}[];
					sigs: readonly `0x${string}`[];
				}
			];

			return {
				channel,
				status,
				wallets,
				challengeExpiry,
				lastValidState
			};
		} catch (error: any) {
			throw new Error(`Failed to get channel data: ${error.message}`);
		}
	}
}
