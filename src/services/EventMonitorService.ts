import { ethers } from "ethers";
import { Provider, RpcProvider, hash, num, shortString } from "starknet";
import {
  EventData,
  ChainConfig,
  EventConfig,
  ChainType,
} from "../types/events";
import { Logger } from "../utils/Logger";

export class EventMonitorService {
  private sepoliaProvider: ethers.providers.JsonRpcProvider;
  private starknetProvider: Provider;
  private logger: Logger;
  private isRunning: boolean = false;

  constructor(
    private sepoliaConfig: ChainConfig,
    private starknetConfig: ChainConfig,
    private sepoliaEvents: EventConfig[],
    private starknetEvents: EventConfig[],
    logger: Logger
  ) {
    this.sepoliaProvider = new ethers.providers.JsonRpcProvider(
      sepoliaConfig.rpcUrl
    );
    this.starknetProvider = new RpcProvider({ nodeUrl: starknetConfig.rpcUrl });
    this.logger = logger;
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    await Promise.all([
      this.monitorSepoliaEvents(),
      this.monitorStarknetEvents(), // Uncommented this line
    ]);
  }

  public stop(): void {
    this.isRunning = false;
  }

  private async monitorSepoliaEvents(): Promise<void> {
    const contract = new ethers.Contract(
      this.sepoliaConfig.contractAddress,
      this.getSepoliaAbi(),
      this.sepoliaProvider
    );

    let currentBlock =
      this.sepoliaConfig.startBlock ||
      (await this.sepoliaProvider.getBlockNumber());

    while (this.isRunning) {
      try {
        const latestBlock = await this.sepoliaProvider.getBlockNumber();

        if (latestBlock > currentBlock) {
          for (const eventConfig of this.sepoliaEvents) {
            const events = await contract.queryFilter(
              contract.filters[eventConfig.eventName](),
              currentBlock,
              latestBlock
            );

            for (const event of events) {
              const eventData: EventData = {
                chainId: (await this.sepoliaProvider.getNetwork()).chainId,
                contractAddress: this.sepoliaConfig.contractAddress,
                eventName: eventConfig.eventName,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                args: event.args,
              };

              try {
                await eventConfig.processor.processEvent(eventData);
                this.logger.info(`Processed ${eventConfig.eventName} event`, {
                  eventData,
                });
              } catch (error) {
                this.logger.error(
                  `Error processing ${eventConfig.eventName} event`,
                  {
                    error,
                    eventData,
                  }
                );
              }
            }
          }
          currentBlock = latestBlock;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      } catch (error) {
        this.logger.error("Error monitoring Sepolia events", { error });
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds on error
      }
    }
  }

  private async monitorStarknetEvents(): Promise<void> {
    let currentBlock =
      this.starknetConfig.startBlock ||
      (await this.starknetProvider.getBlock("latest")).block_number;

    while (this.isRunning) {
      try {
        const latestBlock = (await this.starknetProvider.getBlock("latest"))
          .block_number;

        if (latestBlock > currentBlock) {
          for (const eventConfig of this.starknetEvents) {
            let continuationToken: string | undefined;

            do {
              // Convert eventName to Starknet event key
              const eventKey = num.toHex(
                hash.starknetKeccak(eventConfig.eventName)
              );
              // Handle both flat and nested events
              const eventKeys = [[eventKey]]; // Flat event format

              const eventsResponse = await this.starknetProvider.getEvents({
                from_block: { block_number: currentBlock },
                to_block: { block_number: latestBlock },
                address: this.starknetConfig.contractAddress,
                keys: eventKeys,
                chunk_size: 100,
                continuation_token: continuationToken,
              });

              if (eventsResponse && Array.isArray(eventsResponse.events)) {
                for (const event of eventsResponse.events) {
                  try {
                    // Parse the event data - implement parsing based on your event structure
                    console.log("event.data:",event.data);
                   

                    const eventData: EventData = {
                      chainId:
                        Number(await this.starknetProvider.getChainId()) || 0,
                      contractAddress: this.starknetConfig.contractAddress,
                      eventName: eventConfig.eventName,
                      transactionHash: event.transaction_hash,
                      blockNumber: event.block_number,
                      args: event.data,
                    };

                    // Process the event
                    await eventConfig.processor.processEvent(eventData);
                    this.logger.info(
                      `Processed ${eventConfig.eventName} Starknet event`,
                      {
                        eventData,
                        blockNumber: event.block_number,
                      }
                    );
                  } catch (error) {
                    this.logger.error(
                      `Error processing ${eventConfig.eventName} Starknet event`,
                      {
                        error,
                        event,
                      }
                    );
                  }
                }
              }

              // Update continuation token for next chunk
              continuationToken = eventsResponse.continuation_token;
            } while (continuationToken); // Continue while there are more chunks
          }

          // Update current block after processing all events
          currentBlock = latestBlock;
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        this.logger.error("Error monitoring Starknet events", {
          error,
          currentBlock,
          contractAddress: this.starknetConfig.contractAddress,
        });
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  }

  private getSepoliaAbi(): any[] {
    // Add your Sepolia contract ABI here

    return [
      {
        inputs: [
          {
            internalType: "address",
            name: "_callback_sender",
            type: "address",
          },
          {
            internalType: "address",
            name: "_ethUsdPriceFeed",
            type: "address",
          },
          {
            internalType: "address",
            name: "_maticUsdPriceFeed",
            type: "address",
          },
        ],
        stateMutability: "payable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "destinationChain",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "loanAmount",
            type: "uint256",
          },
        ],
        name: "CollateralDeposited",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "CollateralReleased",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "user",
            type: "string",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "loanAmount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "destinationChain",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "interestRate",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "durationInDays",
            type: "uint256",
          },
        ],
        name: "LoanInitiated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "collateralAmount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "loanAmount",
            type: "uint256",
          },
        ],
        name: "LoanLiquidated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "user",
            type: "string",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "loanAmount",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "durationInDays",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "interestRate",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "creditScore",
            type: "uint256",
          },
        ],
        name: "LoanRequested",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "OwnershipTransferred",
        type: "event",
      },
      {
        inputs: [],
        name: "COLLATERALIZATION_RATIO",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_collateralAmount",
            type: "uint256",
          },
        ],
        name: "calculateLoanAmount",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_loanAmount",
            type: "uint256",
          },
        ],
        name: "calculateRequiredCollateral",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "coverDebt",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_borrower",
            type: "string",
          },
        ],
        name: "depositCollateral",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_collateralAmount",
            type: "uint256",
          },
        ],
        name: "getCollateralValue",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getEthPrice",
        outputs: [
          {
            internalType: "int256",
            name: "",
            type: "int256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_user",
            type: "address",
          },
        ],
        name: "getLoanDetails",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getMaticPrice",
        outputs: [
          {
            internalType: "int256",
            name: "",
            type: "int256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "interestRateOracle",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
          {
            internalType: "address",
            name: "_user",
            type: "address",
          },
        ],
        name: "liquidateLoan",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "liquidationThreshold",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        name: "loans",
        outputs: [
          {
            internalType: "uint256",
            name: "collateralAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "loanAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "destinationChain",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "interestRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "creditScore",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "durationInDays",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "ltvRatio",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "pay",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
          {
            internalType: "address",
            name: "_user",
            type: "address",
          },
        ],
        name: "releaseCollateral",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_borrower",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_loanAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_destinationChain",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_durationInDays",
            type: "uint256",
          },
        ],
        name: "requestLoan",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "riskAssessmentModule",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_riskAssessmentModule",
            type: "address",
          },
          {
            internalType: "address",
            name: "_interestRateOracle",
            type: "address",
          },
        ],
        name: "setRiskManagementAddresses",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        stateMutability: "payable",
        type: "receive",
      },
    ];
  }
}