// src/config/contracts.ts

export const SEPOLIA_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_callback_sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_ethUsdPriceFeed",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_maticUsdPriceFeed",
				"type": "address"
			}
		],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "destinationChain",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			}
		],
		"name": "CollateralDeposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "CollateralReleased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "user",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "destinationChain",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "durationInDays",
				"type": "uint256"
			}
		],
		"name": "LoanInitiated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			}
		],
		"name": "LoanLiquidated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "user",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "durationInDays",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "creditScore",
				"type": "uint256"
			}
		],
		"name": "LoanRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "COLLATERALIZATION_RATIO",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_collateralAmount",
				"type": "uint256"
			}
		],
		"name": "calculateLoanAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_loanAmount",
				"type": "uint256"
			}
		],
		"name": "calculateRequiredCollateral",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "coverDebt",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_borrower",
				"type": "string"
			}
		],
		"name": "depositCollateral",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_collateralAmount",
				"type": "uint256"
			}
		],
		"name": "getCollateralValue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getEthPrice",
		"outputs": [
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getLoanDetails",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMaticPrice",
		"outputs": [
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "interestRateOracle",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "liquidateLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "liquidationThreshold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "loans",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "destinationChain",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "interestRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creditScore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "durationInDays",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ltvRatio",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "pay",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "releaseCollateral",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_borrower",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_loanAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_destinationChain",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_durationInDays",
				"type": "uint256"
			}
		],
		"name": "requestLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "riskAssessmentModule",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_riskAssessmentModule",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_interestRateOracle",
				"type": "address"
			}
		],
		"name": "setRiskManagementAddresses",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]
  
  export const STARKNET_CONTRACT_ABI =[
	{
	  "type": "impl",
	  "name": "IDestinationContract",
	  "interface_name": "destination_starknet::DestinationContract::IDestinationContract"
	},
	{
	  "type": "struct",
	  "name": "core::integer::u256",
	  "members": [
		{
		  "name": "low",
		  "type": "core::integer::u128"
		},
		{
		  "name": "high",
		  "type": "core::integer::u128"
		}
	  ]
	},
	{
	  "type": "enum",
	  "name": "core::bool",
	  "variants": [
		{
		  "name": "False",
		  "type": "()"
		},
		{
		  "name": "True",
		  "type": "()"
		}
	  ]
	},
	{
	  "type": "interface",
	  "name": "destination_starknet::DestinationContract::IDestinationContract",
	  "items": [
		{
		  "type": "function",
		  "name": "request_loan",
		  "inputs": [
			{
			  "name": "borrower_eth",
			  "type": "core::felt252"
			},
			{
			  "name": "borrower",
			  "type": "core::starknet::contract_address::ContractAddress"
			},
			{
			  "name": "amount",
			  "type": "core::integer::u256"
			},
			{
			  "name": "interest_rate",
			  "type": "core::integer::u256"
			},
			{
			  "name": "duration_in_days",
			  "type": "core::integer::u256"
			},
			{
			  "name": "credit_score",
			  "type": "core::integer::u256"
			}
		  ],
		  "outputs": [],
		  "state_mutability": "external"
		},
		{
		  "type": "function",
		  "name": "fund_loan",
		  "inputs": [
			{
			  "name": "borrower",
			  "type": "core::starknet::contract_address::ContractAddress"
			}
		  ],
		  "outputs": [],
		  "state_mutability": "external"
		},
		{
		  "type": "function",
		  "name": "get_loan_status",
		  "inputs": [
			{
			  "name": "borrower",
			  "type": "core::starknet::contract_address::ContractAddress"
			}
		  ],
		  "outputs": [
			{
			  "type": "(core::bool, core::bool, core::integer::u256, core::integer::u256)"
			}
		  ],
		  "state_mutability": "view"
		},
		{
		  "type": "function",
		  "name": "repay_loan",
		  "inputs": [
			{
			  "name": "amount",
			  "type": "core::integer::u256"
			}
		  ],
		  "outputs": [],
		  "state_mutability": "external"
		},
		{
		  "type": "function",
		  "name": "liquidate_loan",
		  "inputs": [
			{
			  "name": "borrower",
			  "type": "core::starknet::contract_address::ContractAddress"
			}
		  ],
		  "outputs": [],
		  "state_mutability": "external"
		},
		{
		  "type": "function",
		  "name": "calculate_total_due",
		  "inputs": [
			{
			  "name": "borrower",
			  "type": "core::starknet::contract_address::ContractAddress"
			}
		  ],
		  "outputs": [
			{
			  "type": "core::integer::u256"
			}
		  ],
		  "state_mutability": "view"
		},
		{
		  "type": "function",
		  "name": "get_loan_details",
		  "inputs": [
			{
			  "name": "borrower",
			  "type": "core::starknet::contract_address::ContractAddress"
			}
		  ],
		  "outputs": [
			{
			  "type": "(core::integer::u256, core::integer::u256, core::integer::u256, core::integer::u256, core::integer::u256, core::bool, core::bool)"
			}
		  ],
		  "state_mutability": "view"
		},
		{
		  "type": "function",
		  "name": "withdraw_tokens",
		  "inputs": [
			{
			  "name": "amount",
			  "type": "core::integer::u256"
			}
		  ],
		  "outputs": [],
		  "state_mutability": "external"
		}
	  ]
	},
	{
	  "type": "impl",
	  "name": "OwnableImpl",
	  "interface_name": "openzeppelin_access::ownable::interface::IOwnable"
	},
	{
	  "type": "interface",
	  "name": "openzeppelin_access::ownable::interface::IOwnable",
	  "items": [
		{
		  "type": "function",
		  "name": "owner",
		  "inputs": [],
		  "outputs": [
			{
			  "type": "core::starknet::contract_address::ContractAddress"
			}
		  ],
		  "state_mutability": "view"
		},
		{
		  "type": "function",
		  "name": "transfer_ownership",
		  "inputs": [
			{
			  "name": "new_owner",
			  "type": "core::starknet::contract_address::ContractAddress"
			}
		  ],
		  "outputs": [],
		  "state_mutability": "external"
		},
		{
		  "type": "function",
		  "name": "renounce_ownership",
		  "inputs": [],
		  "outputs": [],
		  "state_mutability": "external"
		}
	  ]
	},
	{
	  "type": "constructor",
	  "name": "constructor",
	  "inputs": [
		{
		  "name": "lending_token",
		  "type": "core::starknet::contract_address::ContractAddress"
		},
		{
		  "name": "owner",
		  "type": "core::starknet::contract_address::ContractAddress"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "destination_starknet::DestinationContract::DestinationContract::LoanRequested",
	  "kind": "struct",
	  "members": [
		{
		  "name": "borrower",
		  "type": "core::starknet::contract_address::ContractAddress",
		  "kind": "data"
		},
		{
		  "name": "amount",
		  "type": "core::integer::u256",
		  "kind": "data"
		},
		{
		  "name": "interest_rate",
		  "type": "core::integer::u256",
		  "kind": "data"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "destination_starknet::DestinationContract::DestinationContract::LoanFunded",
	  "kind": "struct",
	  "members": [
		{
		  "name": "borrower",
		  "type": "core::starknet::contract_address::ContractAddress",
		  "kind": "data"
		},
		{
		  "name": "amount",
		  "type": "core::integer::u256",
		  "kind": "data"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "destination_starknet::DestinationContract::DestinationContract::LoanRepaid",
	  "kind": "struct",
	  "members": [
		{
		  "name": "borrower_eth",
		  "type": "core::felt252",
		  "kind": "data"
		},
		{
		  "name": "amount",
		  "type": "core::integer::u256",
		  "kind": "data"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "destination_starknet::DestinationContract::DestinationContract::LoanFullyRepaid",
	  "kind": "struct",
	  "members": [
		{
		  "name": "borrower_eth",
		  "type": "core::felt252",
		  "kind": "data"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "destination_starknet::DestinationContract::DestinationContract::LoanLiquidated",
	  "kind": "struct",
	  "members": [
		{
		  "name": "borrower_eth",
		  "type": "core::felt252",
		  "kind": "data"
		},
		{
		  "name": "amount",
		  "type": "core::integer::u256",
		  "kind": "data"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
	  "kind": "struct",
	  "members": [
		{
		  "name": "previous_owner",
		  "type": "core::starknet::contract_address::ContractAddress",
		  "kind": "key"
		},
		{
		  "name": "new_owner",
		  "type": "core::starknet::contract_address::ContractAddress",
		  "kind": "key"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
	  "kind": "struct",
	  "members": [
		{
		  "name": "previous_owner",
		  "type": "core::starknet::contract_address::ContractAddress",
		  "kind": "key"
		},
		{
		  "name": "new_owner",
		  "type": "core::starknet::contract_address::ContractAddress",
		  "kind": "key"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
	  "kind": "enum",
	  "variants": [
		{
		  "name": "OwnershipTransferred",
		  "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
		  "kind": "nested"
		},
		{
		  "name": "OwnershipTransferStarted",
		  "type": "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
		  "kind": "nested"
		}
	  ]
	},
	{
	  "type": "event",
	  "name": "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
	  "kind": "enum",
	  "variants": []
	},
	{
	  "type": "event",
	  "name": "destination_starknet::DestinationContract::DestinationContract::Event",
	  "kind": "enum",
	  "variants": [
		{
		  "name": "LoanRequested",
		  "type": "destination_starknet::DestinationContract::DestinationContract::LoanRequested",
		  "kind": "nested"
		},
		{
		  "name": "LoanFunded",
		  "type": "destination_starknet::DestinationContract::DestinationContract::LoanFunded",
		  "kind": "nested"
		},
		{
		  "name": "LoanRepaid",
		  "type": "destination_starknet::DestinationContract::DestinationContract::LoanRepaid",
		  "kind": "nested"
		},
		{
		  "name": "LoanFullyRepaid",
		  "type": "destination_starknet::DestinationContract::DestinationContract::LoanFullyRepaid",
		  "kind": "nested"
		},
		{
		  "name": "LoanLiquidated",
		  "type": "destination_starknet::DestinationContract::DestinationContract::LoanLiquidated",
		  "kind": "nested"
		},
		{
		  "name": "OwnableEvent",
		  "type": "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
		  "kind": "flat"
		},
		{
		  "name": "ReentrancyGuardEvent",
		  "type": "openzeppelin_security::reentrancyguard::ReentrancyGuardComponent::Event",
		  "kind": "flat"
		}
	  ]
	}
  ]