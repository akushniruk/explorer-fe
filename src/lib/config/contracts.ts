import type { Address } from 'viem';

export interface ContractDeployment {
	deployer: Address;
	deployedTo: Address;
	transactionHash: `0x${string}`;
	commit: string;
	timestamp: number;
	chainId: number;
	contractPath: string;
	constructorArgs: any[];
	comment: string;
}

export const CUSTODY_DEPLOYMENTS: ContractDeployment[] = [
	{
		deployer: '0x2025E9c0F85E34A2B141E99557355C5b3Ea1e244',
		deployedTo: '0x490fb189DdE3a01B00be9BA5F41e3447FbC838b6',
		transactionHash: '0x2beb2f8c77fb88db9b031a6e88d354f575b33048b756114bc6f26a5a267cfad7',
		commit: 'f9791c146e11e3715da8d96a4b7296b5ab7dada6',
		timestamp: 1755702612,
		chainId: 8453,
		contractPath: './src/Custody.sol:Custody',
		constructorArgs: [],
		comment: 'PROD v0.3.0'
	},
	{
		deployer: '0x2025E9c0F85E34A2B141E99557355C5b3Ea1e244',
		deployedTo: '0x6F71a38d919ad713D0AfE0eB712b95064Fc2616f',
		transactionHash: '0x31a8195cbb50a80ad04bfff2b66b457be25c9076721ac115be1ac33dba18541a',
		commit: '6cc315209fae6057553845c49df6a4bf02c35413',
		timestamp: 1754488692,
		chainId: 137,
		contractPath: './src/Custody.sol:Custody',
		constructorArgs: [],
		comment: 'PROD v0.3.0'
	},
	{
		deployer: '0x1cc434634dcc1f4c92552057d18d205b919def4a',
		deployedTo: '0x783d72Fb71289e788905DB4bcb9FDeD7e1c7f150',
		transactionHash: '0x2ab3b44c5416fad206056c3eeef8d97710e23d061013ea5dc38ca90c4c68d6f8',
		commit: '2fe44ff73bd780a1252e7b437f675d62a0a248a5',
		timestamp: 1749643348,
		chainId: 137,
		contractPath: './src/Custody.sol:Custody',
		constructorArgs: [],
		comment: 'PROD 0.2.12'
	},
	{
		deployer: '0xcFdC977a4b75B77E47a80C0D2b2aB7ade72ABD2b',
		deployedTo: '0x4C8Bd8877C3b403BA9f9ECfaAD910AF0d8CA2c4D',
		transactionHash: '0xf62eba4875fa503804b433d615a3a490ad3b6104522b5bbc43655844cbe7045c',
		commit: '43628d3315bce677764f361b0f1f6d43e2b553c6',
		timestamp: 1748530187,
		chainId: 137,
		contractPath: './src/Custody.sol:Custody',
		constructorArgs: [],
		comment: 'PROD v0.2.6'
	},
	{
		deployer: '0xcFdC977a4b75B77E47a80C0D2b2aB7ade72ABD2b',
		deployedTo: '0xc2F8Fca0A2dFa200728D3dae130dF6065b7da986',
		transactionHash: '0x4cdab4529b1fed3c05733ee9702c79a8d2d76f9d0366c63c4f1aa97230699baa',
		commit: '6c5683231447df80db300bab2171ac99f12628cb',
		timestamp: 1748249124,
		chainId: 137,
		contractPath: './src/Custody.sol:Custody',
		constructorArgs: [],
		comment: 'PROD v0.2.0'
	},
	{
		deployer: '0xcfdc977a4b75b77e47a80c0d2b2ab7ade72abd2b',
		deployedTo: '0x3b21e4a6aB2eb42cE2918B1C7E63BA0c9915B34E',
		transactionHash: '0x231acafdad502d14f152a5ffb2bed32253badf19aaac459e1d2a9210c62e1532',
		commit: 'b88581ad65aa0b27066a4ae0c4ddaa1644bec057',
		timestamp: 1747821392,
		chainId: 137,
		contractPath: './src/Custody.sol:Custody',
		constructorArgs: [],
		comment: 'PROD'
	}
];

// Chain IDs that support custody state in different versions
const BASE_CHAIN_ID = 8453;
const XRPL_EVM_CHAIN_ID = 1440002; // XRPL EVM Sidechain

// Version parsing helper
function parseVersion(comment: string): { major: number; minor: number; patch: number } | null {
	const versionMatch = comment.match(/v?(\d+)\.(\d+)\.(\d+)/);
	if (!versionMatch) return null;

	return {
		major: parseInt(versionMatch[1]),
		minor: parseInt(versionMatch[2]),
		patch: parseInt(versionMatch[3])
	};
}

// Version comparison helper
function isVersionAtLeast(
	version: { major: number; minor: number; patch: number },
	target: { major: number; minor: number; patch: number }
): boolean {
	if (version.major > target.major) return true;
	if (version.major < target.major) return false;

	if (version.minor > target.minor) return true;
	if (version.minor < target.minor) return false;

	return version.patch >= target.patch;
}

/**
 * Check if custody state is supported for a given chain and contract version
 */
export function isCustodyStateSupported(chainId: number, contractComment: string): boolean {
	const version = parseVersion(contractComment);
	if (!version) return false;

	// Base and XRPL EVM require v0.3.0+
	if (chainId === BASE_CHAIN_ID || chainId === XRPL_EVM_CHAIN_ID) {
		return isVersionAtLeast(version, { major: 0, minor: 3, patch: 0 });
	}

	// All other chains require v0.2.12+
	return isVersionAtLeast(version, { major: 0, minor: 2, patch: 12 });
}

/**
 * Get the latest custody contract deployment for a given chain that supports custody state
 */
export function getLatestCustodyContract(chainId: number): ContractDeployment | null {
	const deploymentsForChain = CUSTODY_DEPLOYMENTS.filter(
		(deployment) =>
			deployment.chainId === chainId && isCustodyStateSupported(chainId, deployment.comment)
	).sort((a, b) => b.timestamp - a.timestamp);

	return deploymentsForChain[0] || null;
}

/**
 * Get custody contract that was active at a specific timestamp and supports custody state
 */
export function getCustodyContractForTimestamp(
	chainId: number,
	timestamp: number
): ContractDeployment | null {
	const deploymentsForChain = CUSTODY_DEPLOYMENTS.filter(
		(deployment) =>
			deployment.chainId === chainId && isCustodyStateSupported(chainId, deployment.comment)
	).sort((a, b) => a.timestamp - b.timestamp); // Sort ascending

	// Find the contract that was active at the given timestamp
	// (the latest deployment before or at the timestamp)
	let activeContract = null;
	for (const deployment of deploymentsForChain) {
		if (deployment.timestamp <= timestamp) {
			activeContract = deployment;
		} else {
			break;
		}
	}

	return activeContract || deploymentsForChain[0]; // Fallback to earliest if none found
}

/**
 * Get custody contract by specific address
 */
export function getCustodyContractByAddress(address: Address): ContractDeployment | null {
	return (
		CUSTODY_DEPLOYMENTS.find(
			(deployment) => deployment.deployedTo.toLowerCase() === address.toLowerCase()
		) || null
	);
}
