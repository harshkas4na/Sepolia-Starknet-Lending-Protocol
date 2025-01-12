// src/services/EventMonitorService.ts

import { ethers } from 'ethers';
import { Provider, RpcProvider } from 'starknet';
import { EventData, ChainConfig, EventConfig, ChainType } from '../types/events';
import { Logger } from '../utils/Logger';

export class EventMonitorService {
  private sepoliaProvider: ethers.providers.JsonRpcProvider;
  private starknetProvider: Provider;
  private logger: Logger;
  private isRunning: boolean = false;

  constructor(
    private sepoliaConfig: ChainConfig,
    private starknetConfig: ChainConfig,
    private sepoliaEvents: EventConfig[],
    private starknetEvents: EventConfig[],
    logger: Logger
  ) {
    this.sepoliaProvider = new ethers.providers.JsonRpcProvider(sepoliaConfig.rpcUrl);
    this.starknetProvider = new RpcProvider({ nodeUrl: starknetConfig.rpcUrl });
    this.logger = logger;
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    await Promise.all([
      this.monitorSepoliaEvents(),
      this.monitorStarknetEvents()
    ]);
  }

  public stop(): void {
    this.isRunning = false;
  }

  private async monitorSepoliaEvents(): Promise<void> {
    const contract = new ethers.Contract(
      this.sepoliaConfig.contractAddress,
      this.getSepoliaAbi(),
      this.sepoliaProvider
    );

    let currentBlock = this.sepoliaConfig.startBlock || await this.sepoliaProvider.getBlockNumber();

    while (this.isRunning) {
      try {
        const latestBlock = await this.sepoliaProvider.getBlockNumber();
        
        if (latestBlock > currentBlock) {
          for (const eventConfig of this.sepoliaEvents) {
            const events = await contract.queryFilter(
              contract.filters[eventConfig.eventName](),
              currentBlock,
              latestBlock
            );

            for (const event of events) {
              const eventData: EventData = {
                chainId: (await this.sepoliaProvider.getNetwork()).chainId,
                contractAddress: this.sepoliaConfig.contractAddress,
                eventName: eventConfig.eventName,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                args: event.args
              };

              try {
                await eventConfig.processor.processEvent(eventData);
                this.logger.info(`Processed ${eventConfig.eventName} event`, { eventData });
              } catch (error) {
                this.logger.error(`Error processing ${eventConfig.eventName} event`, { 
                  error, 
                  eventData 
                });
              }
            }
          }
          currentBlock = latestBlock;
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      } catch (error) {
        this.logger.error('Error monitoring Sepolia events', { error });
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds on error
      }
    }
  }

  private async monitorStarknetEvents(): Promise<void> {
    let currentBlock = this.starknetConfig.startBlock || 
      (await this.starknetProvider.getBlock('latest')).block_number;

    while (this.isRunning) {
      try {
        const latestBlock = (await this.starknetProvider.getBlock('latest')).block_number;

        if (latestBlock > currentBlock) {
          for (const eventConfig of this.starknetEvents) {
            // Convert eventSignature to array if it's a string
            const eventKeys = Array.isArray(eventConfig.eventSignature) 
              ? [eventConfig.eventSignature] // Wrap in outer array
              : [[eventConfig.eventSignature]]; // Wrap in two arrays

            const eventsResponse = await this.starknetProvider.getEvents({
              from_block: { block_number: currentBlock },
              to_block: { block_number: latestBlock },
              address: this.starknetConfig.contractAddress,
              keys: eventKeys,
              chunk_size: 100,
            });

            // Check if events exist and iterate over them
            if (eventsResponse && Array.isArray(eventsResponse.events)) {
              for (const event of eventsResponse.events) {
                const eventData: EventData = {
                  chainId: 0, // Starknet chain ID
                  contractAddress: this.starknetConfig.contractAddress,
                  eventName: eventConfig.eventName,
                  transactionHash: event.transaction_hash,
                  blockNumber: event.block_number,
                  args: event.data // Will need parsing based on event structure
                };

                try {
                  await eventConfig.processor.processEvent(eventData);
                  this.logger.info(`Processed ${eventConfig.eventName} Starknet event`, { eventData });
                } catch (error) {
                  this.logger.error(`Error processing ${eventConfig.eventName} Starknet event`, {
                    error,
                    eventData
                  });
                }
              }
            }
          }
          currentBlock = latestBlock;
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      } catch (error) {
        this.logger.error('Error monitoring Starknet events', { error });
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds on error
      }
    }
  }

  private getSepoliaAbi(): string[] {
    // Add your Sepolia contract ABI here
    return [];
  }
}