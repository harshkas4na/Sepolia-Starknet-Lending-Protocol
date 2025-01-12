// src/types/events.ts

export interface EventData {
    chainId: number;
    contractAddress: string;
    eventName: string;
    transactionHash: string;
    blockNumber: number;
    args: any;
  }
  
  export interface EventProcessor {
    processEvent(eventData: EventData): Promise<void>;
  }
  
  export enum ChainType {
    SEPOLIA = 'SEPOLIA',
    STARKNET = 'STARKNET'
  }
  
  export interface ChainConfig {
    chainType: ChainType;
    rpcUrl: string;
    contractAddress: string;
    startBlock?: number;
  }
  
  export interface EventConfig {
    eventName: string;
    eventSignature: string;
    processor: EventProcessor;
  }