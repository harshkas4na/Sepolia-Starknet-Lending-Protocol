// src/types/chain.ts

export interface LoanRequest {
    borrower: string;
    amount: string;
    interestRate: string;
    durationInDays: string;
    creditScore: string;
  }
  
  export interface LoanFunding {
    borrower: string;
  }
  
  export interface LoanRepayment {
    borrower: string;
    amount: string;
  }
  
  export interface LoanLiquidation {
    borrower: string;
  }
  
  export interface ChainCommunicator {
    requestLoan(params: LoanRequest): Promise<string>;
    fundLoan(params: LoanFunding): Promise<string>;
    repayLoan(params: LoanRepayment): Promise<string>;
    liquidateLoan(params: LoanLiquidation): Promise<string>;
  }
  
  export interface TransactionResponse {
    hash: string;
    wait(): Promise<any>;
  }