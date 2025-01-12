// src/processors/LoanEventProcessors.ts

import { EventProcessor, EventData } from '../types/events';
import { Logger } from '../utils/Logger';
import { CrossChainManager } from '../services/CrossChainManager';

export class LoanRequestedProcessor implements EventProcessor {
  constructor(
    private crossChainManager: CrossChainManager,
    private logger: Logger
  ) {}

  async processEvent(eventData: EventData): Promise<void> {
    try {
      await this.crossChainManager.handleSepoliaLoanRequested(eventData);
    } catch (error) {
      this.logger.error('Error in LoanRequestedProcessor', { error, eventData });
      throw error;
    }
  }
}

export class LoanInitiatedProcessor implements EventProcessor {
  constructor(
    private crossChainManager: CrossChainManager,
    private logger: Logger
  ) {}

  async processEvent(eventData: EventData): Promise<void> {
    try {
      await this.crossChainManager.handleSepoliaLoanInitiated(eventData);
    } catch (error) {
      this.logger.error('Error in LoanInitiatedProcessor', { error, eventData });
      throw error;
    }
  }
}

export class LoanRepaidProcessor implements EventProcessor {
  constructor(
    private crossChainManager: CrossChainManager,
    private logger: Logger
  ) {}

  async processEvent(eventData: EventData): Promise<void> {
    try {
      await this.crossChainManager.handleStarknetLoanRepaid(eventData);
    } catch (error) {
      this.logger.error('Error in LoanRepaidProcessor', { error, eventData });
      throw error;
    }
  }
}

export class LoanLiquidatedProcessor implements EventProcessor {
  constructor(
    private crossChainManager: CrossChainManager,
    private logger: Logger
  ) {}

  async processEvent(eventData: EventData): Promise<void> {
    try {
      await this.crossChainManager.handleStarknetLoanLiquidated(eventData);
    } catch (error) {
      this.logger.error('Error in LoanLiquidatedProcessor', { error, eventData });
      throw error;
    }
  }
}