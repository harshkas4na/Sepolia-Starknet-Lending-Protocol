// src/services/QueueManager.ts

import { v4 as uuidv4 } from 'uuid';
import { QueueStorageService } from './QueueStorageService';
import { Logger } from '../utils/Logger';
import { 
  QueueItem, 
  QueueStatus, 
  QueueOptions, 
  QueueEvents,
  TransactionSource 
} from '../types/queue';

export class QueueManager {
  private storage: QueueStorageService;
  private processingItems: Set<string>;
  private isProcessing: boolean;
  private logger: Logger;

  constructor(
    private options: QueueOptions = {},
    private events: QueueEvents = {},
    logger: Logger
  ) {
    this.storage = new QueueStorageService();
    this.processingItems = new Set();
    this.isProcessing = false;
    this.logger = logger;

    // Set default options
    this.options.maxRetries = options.maxRetries || 3;
    this.options.retryDelay = options.retryDelay || 5000;
    this.options.processingTimeout = options.processingTimeout || 300000; // 5 minutes
    this.options.maxConcurrent = options.maxConcurrent || 5;
  }

  async addItem(source: TransactionSource, txHash: string, data: any): Promise<string> {
    const id = uuidv4();
    const item: QueueItem = {
      id,
      source,
      txHash,
      status: QueueStatus.PENDING,
      retryCount: 0,
      maxRetries: this.options.maxRetries!,
      timestamp: Date.now(),
      data
    };

    await this.storage.save(item);
    this.logger.info('Added item to queue', { id, source, txHash });
    this.events.onItemAdded?.(item);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return id;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        // Check if we can process more items
        if (this.processingItems.size >= this.options.maxConcurrent!) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // Get pending items
        const pendingItems = await this.storage.getPendingItems();
        if (pendingItems.length === 0) {
          this.isProcessing = false;
          break;
        }

        // Process each pending item
        for (const item of pendingItems) {
          if (this.processingItems.size >= this.options.maxConcurrent!) break;
          this.processItem(item);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      this.logger.error('Error processing queue', { error });
      this.isProcessing = false;
    }
  }

  private async processItem(item: QueueItem): Promise<void> {
    if (this.processingItems.has(item.id)) return;
    this.processingItems.add(item.id);

    try {
      // Update status to processing
      await this.storage.update(item.id, { 
        status: QueueStatus.PROCESSING 
      });
      this.events.onItemProcessing?.(item);

      // Process based on source
      if (item.source === TransactionSource.SEPOLIA) {
        await this.processSepoliaTransaction(item);
      } else {
        await this.processStarknetTransaction(item);
      }

      // Mark as completed
      await this.storage.update(item.id, { 
        status: QueueStatus.COMPLETED 
      });
      this.events.onItemCompleted?.(item);

    } catch (error: any) {
      this.logger.error('Error processing item', { 
        itemId: item.id, 
        error: error.message 
      });

      if (item.retryCount < item.maxRetries) {
        // Retry the item
        await this.storage.update(item.id, {
          status: QueueStatus.RETRYING,
          retryCount: item.retryCount + 1,
          lastError: error.message
        });
        this.events.onItemRetry?.(item, item.retryCount + 1);

        // Wait before retrying
        await new Promise(resolve => 
          setTimeout(resolve, this.options.retryDelay)
        );

        // Add back to pending
        await this.storage.update(item.id, {
          status: QueueStatus.PENDING
        });
      } else {
        // Mark as failed
        await this.storage.update(item.id, {
          status: QueueStatus.FAILED,
          lastError: error.message
        });
        this.events.onItemFailed?.(item, error);
      }
    } finally {
      this.processingItems.delete(item.id);
    }
  }

  private async processSepoliaTransaction(item: QueueItem): Promise<void> {
    // Implement Sepolia specific processing
    // This would typically involve waiting for transaction confirmation
    // and handling any chain-specific logic
    throw new Error('Not implemented');
  }

  private async processStarknetTransaction(item: QueueItem): Promise<void> {
    // Implement Starknet specific processing
    // This would typically involve waiting for transaction confirmation
    // and handling any chain-specific logic
    throw new Error('Not implemented');
  }

  async getItem(id: string): Promise<QueueItem | null> {
    return this.storage.get(id);
  }

  async removeItem(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async clearQueue(): Promise<void> {
    await this.storage.clearAll();
  }

  async getPendingItems(): Promise<QueueItem[]> {
    return this.storage.getPendingItems();
  }

  async getProcessingItems(): Promise<QueueItem[]> {
    return this.storage.getProcessingItems();
  }
}