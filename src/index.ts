// src/index.ts

import { config } from 'dotenv';
import { ethers } from 'ethers';
import { Provider, RpcProvider } from 'starknet';
import { EventMonitorService } from './services/EventMonitorService';
import { StarknetService } from './services/StarknetService';
import { CrossChainManager } from './services/CrossChainManager';
import { 
  LoanRequestedProcessor, 
  LoanInitiatedProcessor,
  LoanRepaidProcessor,
  LoanLiquidatedProcessor 
} from './processors/LoanEventProcessors';
import { Logger } from './utils/Logger';
import { ChainConfig, ChainType, EventConfig } from './types/events';
import { SEPOLIA_CONTRACT_ABI, STARKNET_CONTRACT_ABI } from './config/contracts';
import { SepoliaService } from './services/SeploiaService';

// Load environment variables
config();

async function main() {
  const logger = new Logger();

  // Initialize providers
  const sepoliaProvider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const starknetProvider = new RpcProvider({
    nodeUrl:
      "https://starknet-sepolia.infura.io/v3/a4f144f3378f4e70821b6f28a428e429",
  });

  // Initialize wallets
  const sepoliaWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY!, sepoliaProvider);
  console.log("sepoliaWallet(with this):",sepoliaWallet);

  // Initialize chain services
const sepoliaService = new SepoliaService(
    sepoliaProvider,
    process.env.SEPOLIA_CONTRACT_ADDRESS!,
    SEPOLIA_CONTRACT_ABI,
    sepoliaWallet,
    logger
  );

  const starknetService = new StarknetService(
    starknetProvider,
    process.env.STARKNET_CONTRACT_ADDRESS!,
    STARKNET_CONTRACT_ABI,
    process.env.STARKNET_PRIVATE_KEY!,
    logger
  );

  // Initialize cross-chain manager
  const crossChainManager = new CrossChainManager(
    sepoliaService,
    starknetService,
    logger
  );

  // Initialize chain configs
  const sepoliaConfig: ChainConfig = {
    chainType: ChainType.SEPOLIA,
    rpcUrl: process.env.SEPOLIA_RPC_URL!,
    contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS!,
    startBlock: parseInt(process.env.SEPOLIA_START_BLOCK || '0')
  };

  const starknetConfig: ChainConfig = {
    chainType: ChainType.STARKNET,
    rpcUrl: process.env.STARKNET_RPC_URL!,
    contractAddress: process.env.STARKNET_CONTRACT_ADDRESS!,
    startBlock: parseInt(process.env.STARKNET_START_BLOCK || '0')
  };

  // Initialize event processors with cross-chain manager
  const loanRequestedProcessor = new LoanRequestedProcessor(crossChainManager, logger);
  const loanInitiatedProcessor = new LoanInitiatedProcessor(crossChainManager, logger);
  const loanRepaidProcessor = new LoanRepaidProcessor(crossChainManager, logger);
  const loanLiquidatedProcessor = new LoanLiquidatedProcessor(crossChainManager, logger);

  // Configure events to monitor
  const sepoliaEvents: EventConfig[] = [
    {
      eventName: 'LoanRequested',
      eventSignature: 'LoanRequested(string,uint256,uint256,uint256,uint256)',
      processor: loanRequestedProcessor
    },
    {
      eventName: 'LoanInitiated',
      eventSignature: 'LoanInitiated(string,uint256,uint256,uint256,uint256)',
      processor: loanInitiatedProcessor
    }
  ];

  const starknetEvents: EventConfig[] = [
    {
      eventName: 'LoanFullyRepaid',
      eventSignature: '0x59bd56f70adeefb0cd83dca0f34f066bed6ee442068f3d07b5fc974b944d5aa6',
      processor: loanRepaidProcessor
    },
    {
      eventName: 'LoanLiquidated',
      eventSignature: '0xd75168f1c9346a6c18eaeba0d3c95ea70b5dc2c0c280274a670c97cb8e4f415b',
      processor: loanLiquidatedProcessor
    }
  ];

  // Initialize and start event monitor service
  const eventMonitorService = new EventMonitorService(
    sepoliaConfig,
    starknetConfig,
    sepoliaEvents,
    starknetEvents,
    logger
  );

  try {
    logger.info('Starting cross-chain monitoring service');
    await eventMonitorService.start();
  } catch (error) {
    logger.error('Error starting cross-chain monitoring service', { error });
    process.exit(1);
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down cross-chain monitoring service');
    eventMonitorService.stop();
    process.exit(0);
  });
}

// Start the application
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});