// src/config/contracts.ts

export const SEPOLIA_CONTRACT_ABI = [
    "function requestLoan(uint256 _loanAmount, uint256 _destinationChain, uint256 _durationInDays) external nonReentrant",
    "function depositCollateral() external payable nonReentrant",
    "function releaseCollateral(address sender, address _user) external",
    "function liquidateLoan(address sender, address _user) external",
    "event LoanRequested(address indexed user, uint256 indexed loanAmount, uint256 indexed durationInDays, uint256 interestRate, uint256 creditScore)",
    "event LoanInitiated(address indexed user, uint256 loanAmount, uint256 destinationChain, uint256 interestRate, uint256 durationInDays)",
  ];
  
  export const STARKNET_CONTRACT_ABI = [
    {
      name: "request_loan",
      type: "function",
      inputs: [
        { name: "borrower", type: "felt" },
        { name: "amount", type: "felt" },
        { name: "interest_rate", type: "felt" },
        { name: "duration_in_days", type: "felt" },
        { name: "credit_score", type: "felt" }
      ],
      outputs: []
    },
    {
      name: "fund_loan",
      type: "function",
      inputs: [
        { name: "borrower", type: "felt" }
      ],
      outputs: []
    },
    {
      name: "repay_loan",
      type: "function",
      inputs: [
        { name: "amount", type: "felt" }
      ],
      outputs: []
    },
    {
      name: "liquidate_loan",
      type: "function",
      inputs: [
        { name: "borrower", type: "felt" }
      ],
      outputs: []
    }
  ];