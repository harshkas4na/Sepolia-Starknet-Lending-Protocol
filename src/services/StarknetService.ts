// src/services/StarknetService.ts

import { Provider, Contract, Account, stark, CallData } from 'starknet';
import { ChainCommunicator, LoanRequest, LoanFunding, LoanRepayment, LoanLiquidation } from '../types/chain';
import { Logger } from '../utils/Logger';

export class StarknetService implements ChainCommunicator {
  private contract: Contract;
  private account: Account;

  constructor(
    private provider: Provider,
    private contractAddress: string,
    private contractAbi: any[],
    private privateKey: string,
    private logger: Logger
  ) {
    this.account = new Account(
      provider,
      contractAddress,
      privateKey
    );
    
    this.contract = new Contract(
      contractAbi,
      contractAddress,
      provider
    );
  }

  async requestLoan(params: LoanRequest): Promise<string> {
    try {
      const calldata = CallData.compile({
        borrower: params.borrower,
        amount: params.amount,
        interest_rate: params.interestRate,
        duration_in_days: params.durationInDays,
        credit_score: params.creditScore
      });

      const tx = await this.account.execute(
        {
          contractAddress: this.contractAddress,
          entrypoint: 'request_loan',
          calldata
        }
      );

      this.logger.info('Starknet: Loan request transaction sent', {
        hash: tx.transaction_hash,
        params
      });

      await this.provider.waitForTransaction(tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      this.logger.error('Starknet: Error requesting loan', { error, params });
      throw error;
    }
  }

  async fundLoan(params: LoanFunding): Promise<string> {
    try {
      const calldata = CallData.compile({
        borrower: params.borrower
      });

      const tx = await this.account.execute(
        {
          contractAddress: this.contractAddress,
          entrypoint: 'fund_loan',
          calldata
        }
      );

      this.logger.info('Starknet: Loan funding transaction sent', {
        hash: tx.transaction_hash,
        params
      });

      await this.provider.waitForTransaction(tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      this.logger.error('Starknet: Error funding loan', { error, params });
      throw error;
    }
  }

  async repayLoan(params: LoanRepayment): Promise<string> {
    try {
      const calldata = CallData.compile({
        amount: params.amount
      });

      const tx = await this.account.execute(
        {
          contractAddress: this.contractAddress,
          entrypoint: 'repay_loan',
          calldata
        }
      );

      this.logger.info('Starknet: Loan repayment transaction sent', {
        hash: tx.transaction_hash,
        params
      });

      await this.provider.waitForTransaction(tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      this.logger.error('Starknet: Error processing loan repayment', { error, params });
      throw error;
    }
  }

  async liquidateLoan(params: LoanLiquidation): Promise<string> {
    try {
      const calldata = CallData.compile({
        borrower: params.borrower
      });

      const tx = await this.account.execute(
        {
          contractAddress: this.contractAddress,
          entrypoint: 'liquidate_loan',
          calldata
        }
      );

      this.logger.info('Starknet: Loan liquidation transaction sent', {
        hash: tx.transaction_hash,
        params
      });

      await this.provider.waitForTransaction(tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      this.logger.error('Starknet: Error liquidating loan', { error, params });
      throw error;
    }
  }
}