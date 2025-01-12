import { Provider, Contract, Account, stark, CallData, cairo } from 'starknet';
import { ChainCommunicator, LoanRequest, LoanFunding, LoanRepayment, LoanLiquidation } from '../types/chain';
import { Logger } from '../utils/Logger';
import { STARKNET_CONTRACT_ABI } from '../config/contracts';

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
    console.log("provider(with this):",this.provider);
    console.log("contractAddress(withoy this):",contractAddress);
    console.log("contractAbi(with this):",this.contractAddress);
    // Initialize account
    this.account = new Account(
      this.provider,
      '0x0586dC82F475599650709d11FcFd4F98Fb31c85E82A122E1c54C092cA2deCE35',
      '0x062059a04d340cc16c14c943d8051e9fdeec044957e8445554e619243e9b91e4'
    );
    
    // Initialize contract with account
    this.contract = new Contract(
      STARKNET_CONTRACT_ABI,
      this.contractAddress,
      this.account
    );
  }

  async requestLoan(params: LoanRequest): Promise<string> {
    console.log("params:",params);
    try {
      const tx = await this.contract.invoke("request_loan", [
        params.borrower,
        params.amount,
        params.interestRate,
        params.durationInDays,
        params.creditScore
      ]);

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
      const tx = await this.contract.invoke("fund_loan", [
        params.borrower
      ]);

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
      const tx = await this.contract.invoke("repay_loan", [
        params.amount
      ]);

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
      const tx = await this.contract.invoke("liquidate_loan", [
        params.borrower
      ]);

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