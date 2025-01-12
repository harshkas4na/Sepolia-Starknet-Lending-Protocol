// src/services/SepoliaService.ts

import { ethers } from 'ethers';
import { ChainCommunicator, LoanRequest, LoanFunding, LoanRepayment, LoanLiquidation } from '../types/chain';
import { Logger } from '../utils/Logger';
import { SEPOLIA_CONTRACT_ABI } from '../config/contracts';

export class SepoliaService implements ChainCommunicator {
  private contract: ethers.Contract;
  
  constructor(
    private provider: ethers.providers.JsonRpcProvider,
    private contractAddress: string,
    private contractAbi: any[],
    private wallet: ethers.Wallet,
    private logger: Logger
  ) {
    //Create a signer


    
    this.contract = new ethers.Contract(
      contractAddress,
      SEPOLIA_CONTRACT_ABI,
      this.wallet.connect(provider)
    );
  }

  async requestLoan(params: LoanRequest): Promise<string> {
    try {
      const tx = await this.contract.requestLoan(
        ethers.utils.parseEther(params.amount),
        params.durationInDays,
        {
          gasLimit: 500000
        }
      );

      this.logger.info('Sepolia: Loan request transaction sent', { 
        hash: tx.hash,
        params 
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      this.logger.error('Sepolia: Error requesting loan', { error, params });
      throw error;
    }
  }

  async fundLoan(params: LoanFunding): Promise<string> {
    try {
      const tx = await this.contract.depositCollateral({
        gasLimit: 500000,
        value: ethers.utils.parseEther("1.0") // Replace with actual collateral amount
      });

      this.logger.info('Sepolia: Loan funding transaction sent', {
        hash: tx.hash,
        params
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      this.logger.error('Sepolia: Error funding loan', { error, params });
      throw error;
    }
  }

  async repayLoan(params: LoanRepayment): Promise<string> {
    console.log("params(with this):",params);
    try {
      const tx = await this.contract.releaseCollateral(
        
        params.borrower,
        {
          gasLimit: 500000
        }
      );

      this.logger.info('Sepolia: Loan repayment transaction sent', {
        hash: tx.hash,
        params
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      this.logger.error('Sepolia: Error processing loan repayment', { error, params });
      throw error;
    }
  }

  async liquidateLoan(params: LoanLiquidation): Promise<string> {
    try {
      const tx = await this.contract.liquidateLoan(
        params.borrower,
        {
          gasLimit: 500000
        }
      );

      this.logger.info('Sepolia: Loan liquidation transaction sent', {
        hash: tx.hash,
        params
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      this.logger.error('Sepolia: Error liquidating loan', { error, params });
      throw error;
    }
  }
}