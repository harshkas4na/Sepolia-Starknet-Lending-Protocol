// src/services/StarknetService.ts

import { Provider, Contract, Account, stark, CallData, cairo } from 'starknet';
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
      '0x0586dC82F475599650709d11FcFd4F98Fb31c85E82A122E1c54C092cA2deCE35',
      '0x062059a04d340cc16c14c943d8051e9fdeec044957e8445554e619243e9b91e4'
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
      console.log(calldata);
      console.log(this.contractAddress);

      const tx = await this.account.execute(
        {
          contractAddress: this.contractAddress,
          entrypoint: 'request_loan',
          calldata : CallData.compile({
            borrower: params.borrower,
            amount: cairo.uint256(BigInt(params.amount)),
            interest_rate: cairo.uint256(BigInt(params.interestRate)),
            duration_in_days: cairo.uint256(BigInt(params.durationInDays)),
            credit_score: cairo.uint256(BigInt(params.creditScore))
          })
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