# Cross-Chain Queue Management System Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Data Structures](#data-structures)
5. [Flow Diagrams](#flow-diagrams)
6. [Implementation Details](#implementation-details)
7. [Configuration](#configuration)
8. [Error Handling](#error-handling)
9. [Monitoring & Logging](#monitoring--logging)
10. [Best Practices](#best-practices)
11. [Integration Guide](#integration-guide)
12. [API Reference](#api-reference)

## Overview

### Purpose
The Cross-Chain Queue Management System is designed to handle and manage transactions between Ethereum Sepolia and Starknet networks reliably. It ensures transactions are processed in order, handles retries, and maintains transaction state across the bridge.

### Key Features
- Reliable transaction processing
- Automatic retry mechanism
- Transaction status tracking
- Cross-chain state management
- Concurrent transaction processing
- Error handling and recovery
- Event-based monitoring

## System Architecture

### High-Level Components
1. **Queue Manager**: Core orchestrator managing the queue operations
2. **Storage Service**: Handles persistence of queue items
3. **Transaction Processor**: Processes transactions for specific chains
4. **Event Monitor**: Monitors blockchain events
5. **Logger**: System-wide logging service

### Component Interactions
```
EventMonitor → QueueManager → TransactionProcessor
     ↑              ↓                ↓
     └──── StorageService ←──── Logger
```

## Core Components

### 1. Queue Manager (`QueueManager.ts`)
- **Purpose**: Orchestrates the entire queue system
- **Responsibilities**:
  - Queue item management
  - Processing coordination
  - Retry handling
  - State management
- **Key Methods**:
  - `addItem()`: Add new transaction to queue
  - `processQueue()`: Process pending items
  - `processItem()`: Handle individual items
  - `getItem()`: Retrieve queue item status

### 2. Storage Service (`QueueStorageService.ts`)
- **Purpose**: Handles data persistence
- **Responsibilities**:
  - Store queue items
  - Retrieve queue items
  - Update item status
  - Maintain queue state
- **Key Methods**:
  - `save()`: Save new item
  - `get()`: Retrieve item
  - `update()`: Update item status
  - `delete()`: Remove item
  - `getAllByStatus()`: Get items by status

### 3. Transaction Processor (`TransactionProcessor.ts`)
- **Purpose**: Handles chain-specific transaction processing
- **Responsibilities**:
  - Transaction confirmation
  - Chain-specific logic
  - Transaction status verification
- **Key Methods**:
  - `queueSepoliaTransaction()`: Queue Sepolia transaction
  - `queueStarknetTransaction()`: Queue Starknet transaction
  - `waitForSepoliaTransaction()`: Monitor Sepolia tx
  - `waitForStarknetTransaction()`: Monitor Starknet tx

### 4. Event Monitor (`EventMonitorService.ts`)
- **Purpose**: Monitors blockchain events
- **Responsibilities**:
  - Event listening
  - Event filtering
  - Event processing
- **Key Methods**:
  - `start()`: Start monitoring
  - `stop()`: Stop monitoring
  - `monitorSepoliaEvents()`: Monitor Sepolia events
  - `monitorStarknetEvents()`: Monitor Starknet events

## Data Structures

### Queue Item
```typescript
interface QueueItem {
  id: string;              // Unique identifier
  source: TransactionSource; // SEPOLIA or STARKNET
  txHash: string;          // Transaction hash
  status: QueueStatus;     // Current status
  retryCount: number;      // Number of retry attempts
  maxRetries: number;      // Maximum retry attempts
  lastError?: string;      // Last error message
  timestamp: number;       // Creation timestamp
  data: any;              // Transaction specific data
}
```

### Queue Status
```typescript
enum QueueStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING'
}
```

### Queue Options
```typescript
interface QueueOptions {
  maxRetries?: number;      // Maximum retry attempts
  retryDelay?: number;      // Delay between retries
  processingTimeout?: number; // Max processing time
  maxConcurrent?: number;    // Max concurrent items
}
```

## Flow Diagrams

### Transaction Processing Flow
```
1. Event Detected → Add to Queue
2. Queue Manager → Check Available Slots
3. Process Transaction → Wait for Confirmation
4. Update Status → Mark Complete/Retry/Fail
```

### Retry Flow
```
1. Transaction Fails → Check Retry Count
2. Under Max Retries → Wait Retry Delay
3. Update Status → Back to Pending
4. Queue Manager → Reprocess
```

## Implementation Details

### Required Information 

1. **Network Configuration**:
   - Sepolia RPC URL
   - Starknet RPC URL
   - Contract addresses
   - Network IDs
   - Chain-specific confirmation requirements
   - Gas settings and limits

2. **Transaction Data**:
   - Transaction hash
   - Source chain
   - Transaction metadata
   - Required confirmations
   - Gas price information
   - Nonce (if applicable)
   - Transaction type (declare/deploy/invoke)

3. **Queue Configuration**:
   - Retry settings
   - Timeout values
   - Concurrency limits
   - Processing intervals
   - Storage configuration
   - Event listener settings

### Event Processing Details

1. **Event Detection**:
   ```typescript
   eventMonitor.on('newEvent', async (event) => {
     const txId = await queueManager.addItem(
       event.source,
       event.txHash,
       {
         type: event.type,
         data: event.data,
         gasPrice: event.gasPrice,
         nonce: event.nonce,
         metadata: {
           blockNumber: event.blockNumber,
           timestamp: event.timestamp
         }
       }
     );
   });
   ```

2. **Transaction Processing Logic**:
   ```typescript
   async processTransaction(item: QueueItem) {
     switch (item.source) {
       case TransactionSource.SEPOLIA:
         return this.processSepoliaTransaction(item);
       case TransactionSource.STARKNET:
         return this.processStarknetTransaction(item);
       default:
         throw new Error('Unknown transaction source');
     }
   }
   ```

3. **Status Updates**:
   ```typescript
   async updateTransactionStatus(item: QueueItem, status: QueueStatus) {
     // Update in-memory state
     await this.storage.update(item.id, { status });
     
     // Emit events
     this.events.emit('statusUpdate', {
       id: item.id,
       oldStatus: item.status,
       newStatus: status,
       timestamp: Date.now()
     });
     
     // Log status change
     this.logger.info('Transaction status updated', {
       id: item.id,
       status,
       txHash: item.txHash
     });
   }
   ```

## Error Handling

### Types of Errors

1. **Network Errors**:
   - Connection timeouts
   - RPC errors
   - Rate limiting
   - Network congestion

   ```typescript
   async handleNetworkError(error: Error, item: QueueItem) {
     if (error.message.includes('timeout')) {
       return this.handleTimeout(item);
     }
     if (error.message.includes('rate limit')) {
       return this.handleRateLimit(item);
     }
     return this.handleGenericNetworkError(item);
   }
   ```

2. **Transaction Errors**:
   - Insufficient funds
   - Invalid nonce
   - Gas estimation failures
   - Contract reverts

   ```typescript
   async handleTransactionError(error: Error, item: QueueItem) {
     if (error.message.includes('insufficient funds')) {
       return this.markAsFailed(item, 'Insufficient funds');
     }
     if (error.message.includes('nonce too low')) {
       return this.handleNonceError(item);
     }
     return this.handleGenericTransactionError(item);
   }
   ```

3. **System Errors**:
   - Storage failures
   - Memory issues
   - Queue corruption
   - Concurrency issues

   ```typescript
   async handleSystemError(error: Error, item: QueueItem) {
     this.logger.error('System error occurred', {
       error,
       item
     });
     
     await this.emergencyRecovery(item);
   }
   ```

### Recovery Strategies

1. **Automatic Retry**:
   ```typescript
   async retryTransaction(item: QueueItem) {
     if (item.retryCount >= item.maxRetries) {
       return this.markAsFailed(item, 'Max retries exceeded');
     }

     const delay = this.calculateRetryDelay(item.retryCount);
     await this.wait(delay);
     
     return this.requeueItem(item);
   }
   ```

2. **Manual Recovery**:
   ```typescript
   async manualRecovery(item: QueueItem) {
     // Log for manual intervention
     this.logger.warn('Manual recovery required', {
       id: item.id,
       txHash: item.txHash,
       error: item.lastError
     });
     
     // Save recovery state
     await this.storage.update(item.id, {
       status: QueueStatus.PENDING,
       needsManualIntervention: true
     });
   }
   ```

## Monitoring & Logging

### Logging Implementation

1. **Transaction Logs**:
   ```typescript
   class TransactionLogger {
     logTransactionEvent(event: string, data: any) {
       this.logger.info(`Transaction ${event}`, {
         ...data,
         timestamp: Date.now(),
         environment: process.env.NODE_ENV
       });
     }
     
     logTransactionError(error: Error, data: any) {
       this.logger.error(`Transaction Error`, {
         ...data,
         error: error.message,
         stack: error.stack,
         timestamp: Date.now()
       });
     }
   }
   ```

2. **System Metrics**:
   ```typescript
   class MetricsCollector {
     private metrics: Map<string, number>;
     
     recordMetric(name: string, value: number) {
       this.metrics.set(name, value);
     }
     
     getQueueMetrics() {
       return {
         queueLength: this.metrics.get('queueLength'),
         processingTime: this.metrics.get('avgProcessingTime'),
         successRate: this.metrics.get('successRate'),
         failureRate: this.metrics.get('failureRate'),
         retryRate: this.metrics.get('retryRate')
       };
     }
   }
   ```

### Performance Monitoring

1. **Queue Health Checks**:
   ```typescript
   class QueueHealthChecker {
     async checkQueueHealth() {
       const metrics = await this.getQueueMetrics();
       
       if (metrics.queueLength > this.maxQueueLength) {
         this.alertQueueOverload();
       }
       
       if (metrics.failureRate > this.maxFailureRate) {
         this.alertHighFailureRate();
       }
       
       return metrics;
     }
   }
   ```

2. **Performance Optimizations**:
   ```typescript
   class QueueOptimizer {
     optimizeConcurrency() {
       const metrics = this.getPerformanceMetrics();
       const newConcurrency = this.calculateOptimalConcurrency(metrics);
       
       this.updateQueueConcurrency(newConcurrency);
     }
     
     calculateOptimalConcurrency(metrics: PerformanceMetrics) {
       // Implementation based on system performance
       const processingTime = metrics.averageProcessingTime;
       const systemLoad = metrics.systemLoadAverage;
       
       return Math.floor(
         Math.min(
           this.maxConcurrency,
           (this.targetThroughput * processingTime) / (1 - systemLoad)
         )
       );
     }
   }
   ```

## Integration Example

### Basic Setup
```typescript
// Initialize providers
const sepoliaProvider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
const starknetProvider = new Provider({ nodeUrl: STARKNET_RPC_URL });

// Initialize logger
const logger = new Logger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'queue.log' })
  ]
});

// Initialize processor
const processor = new TransactionProcessor(
  sepoliaProvider,
  starknetProvider,
  logger
);

// Initialize event monitor
const eventMonitor = new EventMonitorService(
  sepoliaProvider,
  starknetProvider,
  logger
);

// Start monitoring
await eventMonitor.start();
```

### Usage Example
```typescript
// Queue a Sepolia transaction
const sepoliaTxId = await processor.queueSepoliaTransaction(
  '0x123...', // transaction hash
  {
    type: 'bridge',
    amount: '1000000000000000000',
    recipient: '0x456...'
  }
);

// Queue a Starknet transaction
const starknetTxId = await processor.queueStarknetTransaction(
  '0x789...', // transaction hash
  {
    type: 'mint',
    tokenId: '123',
    owner: '0xabc...'
  }
);

// Monitor transaction status
processor.on('transactionComplete', (txId, receipt) => {
  console.log(`Transaction ${txId} completed`);
  // Handle completion
});

processor.on('transactionFailed', (txId, error) => {
  console.error(`Transaction ${txId} failed:`, error);
  // Handle failure
});
```

### System Recovery
```typescript
class SystemRecovery {
  async recoverFromCrash() {
    // Load all incomplete transactions
    const incompleteItems = await this.storage.getAllIncomplete();
    
    // Verify status on respective chains
    for (const item of incompleteItems) {
      const chainStatus = await this.verifyChainStatus(item);
      await this.reconcileStatus(item, chainStatus);
    }
  }
  
  async reconcileStatus(item: QueueItem, chainStatus: ChainStatus) {
    if (chainStatus.isComplete) {
      await this.markAsComplete(item);
    } else if (chainStatus.needsRetry) {
      await this.requeueItem(item);
    } else {
      await this.manualRecovery(item);
    }
  }
}
```

## Conclusion

The Queue Management System provides a robust and reliable way to handle cross-chain transactions between Ethereum Sepolia and Starknet networks. Its key strengths include:

1. **Reliability**
   - Automatic retry mechanism
   - Error recovery strategies
   - Transaction state persistence

2. **Scalability**
   - Concurrent processing
   - Performance optimization
   - Resource management

3. **Maintainability**
   - Clear separation of concerns
   - Comprehensive logging
   - Monitoring capabilities

4. **Extensibility**
   - Modular design
   - Chain-agnostic core
   - Event-driven architecture

When implementing this system, ensure to:

1. Configure appropriate timeouts and retry settings based on network conditions
2. Monitor system performance and adjust concurrency settings accordingly
3. Implement proper error handling and recovery procedures
4. Regularly backup queue data and maintain system health checks
5. Keep detailed logs for debugging and auditing purposes