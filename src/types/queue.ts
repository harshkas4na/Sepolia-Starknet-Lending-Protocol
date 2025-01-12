// src/types/queue.ts

export enum QueueStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    RETRYING = 'RETRYING'
  }
  
  export enum TransactionSource {
    SEPOLIA = 'SEPOLIA',
    STARKNET = 'STARKNET'
  }
  
  export interface QueueItem {
    id: string;
    source: TransactionSource;
    txHash: string;
    status: QueueStatus;
    retryCount: number;
    maxRetries: number;
    lastError?: string;
    timestamp: number;
    data: any; // Transaction specific data
  }
  
  export interface QueueOptions {
    maxRetries?: number;
    retryDelay?: number;
    processingTimeout?: number;
    maxConcurrent?: number;
  }
  
  export interface QueueEvents {
    onItemAdded?: (item: QueueItem) => void;
    onItemProcessing?: (item: QueueItem) => void;
    onItemCompleted?: (item: QueueItem) => void;
    onItemFailed?: (item: QueueItem, error: Error) => void;
    onItemRetry?: (item: QueueItem, attempt: number) => void;
  }