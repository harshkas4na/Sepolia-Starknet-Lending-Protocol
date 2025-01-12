// src/services/TransactionProcessor.ts

import { Provider } from 'starknet';
import { ethers } from 'ethers';
import { QueueManager } from './QueueManager';
import { TransactionSource } from '../types/queue';
import { Logger } from '../utils/Logger';

export class TransactionProcessor {
  private queueManager: QueueManager;

  constructor(
    private sepoliaProvider: ethers.providers.JsonRpcProvider,
    private starknetProvider: Provider,
    private logger: Logger
  ) {
    this.queueManager = new QueueManager(
      {
        maxRetries: 3,
        retryDelay: 5000,
        processingTimeout: 300000,
        maxConcurrent: 5
      },
      {
        onItemAdded: (item) => {
          this.logger.info('Transaction queued', { 
            id: item.id, 
            source: item.source, 
            txHash: item.txHash 
          });
        },
        onItemProcessing: (item) => {
          this.logger.info('Processing transaction', { 
            id: item.id, 
            source: item.source, 
            txHash: item.txHash 
          });
        },
        onItemCompleted: (item) => {
          this.logger.info('Transaction processed', { 
            id: item.id, 
            source: item.source, 
            txHash: item.txHash 
          });
        },
        onItemFailed: (item, error) => {
          this.logger.error('Transaction failed', { 
            id: item.id, 
            source: item.source, 
            txHash: item.txHash, 
            error: error.message 
          });
        },
        onItemRetry: (item, attempt) => {
          this.logger.info('Retrying transaction', { 
            id: item.id, 
            source: item.source, 
            txHash: item.txHash, 
            attempt 
          });
        }
      },
      logger
    );
  }

  async queueSepoliaTransaction(txHash: string, data: any): Promise<string> {
    return this.queueManager.addItem(TransactionSource.SEPOLIA, txHash, data);
  }

  async queueStarknetTransaction(txHash: string, data: any): Promise<string> {
    return this.queueManager.addItem(TransactionSource.STARKNET, txHash, data);
  }

  private async waitForSepoliaTransaction(txHash: string): Promise<void> {
    try {
      // Wait for transaction to be mined
      const tx = await this.sepoliaProvider.getTransaction(txHash);
      await tx.wait();

      // Wait for additional confirmations
      const receipt = await this.sepoliaProvider.getTransactionReceipt(txHash);
      if (receipt.status === 0) {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      throw new Error(`Failed to process Sepolia transaction: ${error.message}`);
    }
  }

  private async waitForStarknetTransaction(txHash: string): Promise<void> {
    try {
      await this.starknetProvider.waitForTransaction(txHash, {
        retryInterval: 5000,
      });

      const receipt = await this.starknetProvider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error('Transaction not found');
      }

      // Check transaction status
      const status = await this.starknetProvider.getTransactionStatus(txHash);
      if (status.finality_status !== 'ACCEPTED_ON_L2') {
        throw new Error(`Transaction failed with status: ${status.finality_status}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to process Starknet transaction: ${error.message}`);
    }
  }

  protected async processSepoliaTransaction(txHash: string): Promise<void> {
    await this.waitForSepoliaTransaction(txHash);
  }

  protected async processStarknetTransaction(txHash: string): Promise<void> {
    await this.waitForStarknetTransaction(txHash);
  }

  async getQueuedTransaction(id: string) {
    return this.queueManager.getItem(id);
  }

  async getPendingTransactions() {
    return this.queueManager.getPendingItems();
  }

  async getProcessingTransactions() {
    return this.queueManager.getProcessingItems();
  }
}