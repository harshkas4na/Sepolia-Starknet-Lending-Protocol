// src/services/CrossChainManager.ts

import { SepoliaService } from './SeploiaService';
import { StarknetService } from './StarknetService';
import { EventData } from '../types/events';
import { Logger } from '../utils/Logger';
import { LoanRequest, LoanFunding, LoanRepayment, LoanLiquidation } from '../types/chain';

export class CrossChainManager {
  constructor(
    private sepoliaService: SepoliaService,
    private starknetService: StarknetService,
    private logger: Logger
  ) {}

  async handleSepoliaLoanRequested(eventData: EventData): Promise<void> {
    try {
      const { args } = eventData;
      
      const loanRequest: LoanRequest = {
        borrower_eth: "0x941b727Ad8ACF020558Ce58CD7Cb65b48B958DB1",
        borrower: args.user,
        amount: args.loanAmount.toString(),
        interestRate: args.interestRate.toString(),
        durationInDays: args.durationInDays.toString(),
        creditScore: args.creditScore.toString()
      };
      

      await this.starknetService.requestLoan(loanRequest);
      this.logger.info('Successfully processed Sepolia LoanRequested event', { eventData });
    } catch (error) {
      this.logger.error('Error processing Sepolia LoanRequested event', { error, eventData });
      throw error;
    }
  }

  async handleSepoliaLoanInitiated(eventData: EventData): Promise<void> {

    try {
      const { args } = eventData;
      
      const loanFunding: LoanFunding = {
        borrower: args.user
      };

      await this.starknetService.fundLoan(loanFunding);
      this.logger.info('Successfully processed Sepolia LoanInitiated event', { eventData });
    } catch (error) {
      this.logger.error('Error processing Sepolia LoanInitiated event', { error, eventData });
      throw error;
    }
  }

  async handleStarknetLoanRepaid(eventData: EventData): Promise<void> {
    try {
      
      console.log("args(with this):",eventData.args);
      const loanRepayment: LoanRepayment = {
        borrower: eventData.args[0],
        amount: 1
      };
      console.log("loanRepayment(with this):",loanRepayment);

      await this.sepoliaService.repayLoan(loanRepayment);
      this.logger.info('Successfully processed Starknet LoanRepaid event', { eventData });
    } catch (error) {
      this.logger.error('Error processing Starknet LoanRepaid event', { error, eventData });
      throw error;
    }
  }

  async handleStarknetLoanLiquidated(eventData: EventData): Promise<void> {
    try {
      const { args } = eventData;
      
      const loanLiquidation: LoanLiquidation = {
        borrower: args.borrower
      };

      await this.sepoliaService.liquidateLoan(loanLiquidation);
      this.logger.info('Successfully processed Starknet LoanLiquidated event', { eventData });
    } catch (error) {
      this.logger.error('Error processing Starknet LoanLiquidated event', { error, eventData });
      throw error;
    }
  }
}