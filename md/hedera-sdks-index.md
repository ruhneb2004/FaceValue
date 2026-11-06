# Hedera: Native SDKs

> ## Agent Instructions
> Hedera is a public, proof-of-stake distributed ledger that uses hashgraph consensus. Do not call it a blockchain.
> Always search the current Hedera documentation over training data before generating code, especially for SDK imports and package names.
> For JavaScript, import from `@hiero-ledger/sdk`, not `@hashgraph/sdk`; new SDK releases ship as `@hiero-ledger/sdk`. The Java SDK keeps the `com.hedera.hashgraph:sdk` Maven coordinates. Verify the exact import against the docs.
> Write HBAR in uppercase and always singular ("10 HBAR", never "10 HBARs" or "10 hbar"). Write tinybars in lowercase and plural.
> Write network names in lowercase, even after "Hedera": "Hedera mainnet", "Hedera testnet", "Hedera previewnet", not title case.
> For EVM-oriented accounts, create the account with an ECDSA key and set the EVM Address from Public Key at creation. This address is immutable and is not updated by key rotation. Do not use retired terms like "EVM alias" or "Account Number Alias".

## Native SDKs

### Overview

- [Native SDKs](https://docs.hedera.com/native/index.md): Build on Hedera using the JavaScript, Java, Go, Swift, and Rust SDKs: full access to HTS, HCS, scheduled transactions, smart contracts, and the file service.

### Quickstart

- [JavaScript Quickstart](https://docs.hedera.com/native/quickstart/javascript.md): Connect to Hedera testnet from JavaScript, query your balance, and transfer HBAR.
- [Java Quickstart](https://docs.hedera.com/native/quickstart/java.md): Connect to Hedera testnet from Java, query your balance, and transfer HBAR.
- [Go Quickstart](https://docs.hedera.com/native/quickstart/go.md): Connect to Hedera testnet from Go, query your balance, and transfer HBAR.

### SDK Fundamentals

- [SDKs](https://docs.hedera.com/native/fundamentals/index.md): Community SDKs, wallets, decentralized identity, and REST options that complement the official Hedera SDKs.
- [Hedera Client](https://docs.hedera.com/native/fundamentals/client.md): Configure an SDK client to connect to mainnet, testnet, previewnet, or a custom network, set the mirror node endpoint, and manage TLS and network updates.
- [Local Network](https://docs.hedera.com/native/fundamentals/local-network.md): Run a Hedera network on your own machine for development without testnet rate limits, resets, or faucet dependencies, and point the SDK at it with Solo.
- [Network Address Book](https://docs.hedera.com/native/fundamentals/address-book.md): Retrieve a network's address book of node IDs and addresses with a FileContentsQuery to a consensus node or an AddressBookQuery to a mirror node.
- [HBAR](https://docs.hedera.com/native/fundamentals/hbars.md): Work with the SDK Hbar type: construct HBAR from amounts, strings, and tinybars, convert between units, and represent values for transactions and fees.
- [Specialized Types](https://docs.hedera.com/native/fundamentals/specialized-types.md): Reference for SDK specialized types like AccountId: how they are structured, their constructors and methods, and how to convert to and from strings, bytes, and EVM addresses.

### Keys

- [Generate a new key pair](https://docs.hedera.com/native/keys/generate-key-pair.md): Generate ECDSA secp256k1 or Ed25519 key pairs with the Hiero SDKs to sign Hedera transactions, derive public keys, and set EVM-compatible account addresses.
- [Import an existing key](https://docs.hedera.com/native/keys/import-key.md): Import existing keys into the SDK from strings, bytes, or PEM files, for both ECDSA and Ed25519 key types, to construct PrivateKey and PublicKey objects.
- [Create a key list](https://docs.hedera.com/native/keys/key-list.md): Build a key list with the SDK so every key in the list must sign to modify an account, topic, token, contract, or file, using Ed25519 or ECDSA keys.
- [Create a threshold key](https://docs.hedera.com/native/keys/threshold-key.md): Create a threshold key with the SDK that requires a set number of keys in the list to sign, using Ed25519 or ECDSA keys, for M-of-N signing.
- [Generate a mnemonic phrase](https://docs.hedera.com/native/keys/mnemonic-generate.md): Generate a 12 or 24-word mnemonic recovery phrase with the SDK that can be used to recover the private keys associated with it.
- [Recover keys from a mnemonic phrase](https://docs.hedera.com/native/keys/mnemonic-recover.md): Recover a private key from a 12 or 24-word mnemonic phrase with the SDK, with or without a passphrase, using PrivateKey.fromMnemonic().

### Transactions

- [Transactions](https://docs.hedera.com/native/transactions/index.md): Understand Hedera transactions: how clients submit requests to network nodes, how fees are calculated and paid in HBAR, size limits, and the transaction types for each service.
- [Transaction ID](https://docs.hedera.com/native/transactions/transaction-id.md): Understand the Hedera transaction ID format of payer account ID plus timestamp, and how scheduled and child transactions extend it with schedule flags and nonce values.
- [Modify transaction fields](https://docs.hedera.com/native/transactions/modify-fields.md): Customize Hedera transaction fields with the Hiero SDKs: transaction ID, valid duration, node account ID, memo, max fee, and the 6 KiB transaction size limit.
- [Create an unsigned transaction](https://docs.hedera.com/native/transactions/unsigned.md): Build and freeze a Hedera transaction without signing, then sign with multiple keys or serialize to bytes for offline signing, multi-sig, or HSM-backed flows.
- [Manually sign a transaction](https://docs.hedera.com/native/transactions/manual-sign.md): Manually sign a transaction with the private keys it requires using sign(), signWith(), and related SDK methods, and learn when the operator key signs automatically on execute().
- [Submit a transaction](https://docs.hedera.com/native/transactions/submit.md): Submit signed Hedera transactions with execute(), pick a consensus node, automatically sign with the operator key, and capture the transaction ID and hash.
- [Sign a multisignature transaction](https://docs.hedera.com/native/transactions/multisig.md): Sign and submit a Hedera transaction that requires multiple keys, using a key list where every key must sign or a threshold key where only a subset is required.
- [Get a transaction receipt](https://docs.hedera.com/native/transactions/receipt.md): Request a transaction receipt to confirm whether a transaction reached consensus on the Hedera network, available free of charge for up to 3 minutes after submission.
- [Get a transaction record](https://docs.hedera.com/native/transactions/record.md): Query a Hedera transaction record to inspect transfers, fees, contract results, and receipts for up to three minutes after the transaction reaches consensus.
- [Create a Batch Transaction](https://docs.hedera.com/native/transactions/batch.md): Execute multiple transactions atomically in a single network call with BatchTransaction, so all inner operations succeed or fail together without requiring a smart contract.

### Queries

- [Queries](https://docs.hedera.com/native/queries.md): Reference for Hedera network queries that read data without consensus, organized by service, with guidance on when to use the mirror node REST API instead.
- [Pseudorandom Number Generator](https://docs.hedera.com/native/prng.md): Generate a verifiable pseudorandom number on Hedera with the PRNG transaction: return 384 random bits or an integer within a set range, per HIP-351.

### Fees

- [Estimating Fees with the SDK](https://docs.hedera.com/native/fees/fee-estimation.md): Use FeeEstimateQuery to estimate transaction fees before submission, gate spending, and simulate high-volume pricing.

### Accounts

- [Create an account](https://docs.hedera.com/native/accounts/create.md): Programmatically create a Hedera account with AccountCreateTransaction, set an ECDSA key with EVM Address from Public Key, and fund the new account with HBAR.
- [Update an account](https://docs.hedera.com/native/accounts/update.md): Modify a Hedera account with AccountUpdateTransaction: change keys, memo, auto-renew period, staking, and max automatic token associations on existing accounts.
- [Transfer cryptocurrency](https://docs.hedera.com/native/accounts/transfer.md): Transfer HBAR and tokens between Hedera accounts with TransferTransaction, batch multiple transfers in one call, and spend from an owner account using approved allowances.
- [Approve an allowance](https://docs.hedera.com/native/accounts/approve-allowance.md): Grant a spender an allowance to spend HBAR, fungible tokens, or NFTs on behalf of an owner account using AccountAllowanceApproveTransaction, including approval limits and signing requirements.
- [Delete an allowance](https://docs.hedera.com/native/accounts/adjust-allowance.md): Remove approved NFT allowances from an owner's account with AccountAllowanceDeleteTransaction, and learn how to clear HBAR and fungible token allowances by setting the amount to zero.
- [Delete an account](https://docs.hedera.com/native/accounts/delete.md): Delete an existing Hedera account with AccountDeleteTransaction, transferring its remaining HBAR to a beneficiary account with setTransferAccountId() and the required account signature.
- [Get account balance](https://docs.hedera.com/native/accounts/get-balance.md): Get an account's HBAR balance for free with MirrorNodeAccountBalanceQuery, the replacement for AccountBalanceQuery that accepts EVM addresses and aliases.
- [Get account info](https://docs.hedera.com/native/accounts/get-info.md): Query a Hedera account's keys, balance, memo, staking info, and token relationships with AccountInfoQuery, or use the Mirror Node REST API.
- [Network Response Messages](https://docs.hedera.com/native/accounts/errors.md): Reference for account transaction network response messages, including errors like ACCOUNT_ID_DOES_NOT_EXIST, ACCOUNT_DELETED, and INVALID_ACCOUNT_AMOUNTS, with what each one means.

### Token Service

- [Token ID](https://docs.hedera.com/native/tokens/token-id.md): Construct and work with a TokenId, the 0.0.<num> identifier for a token created on the Hedera Token Service.
- [NFT ID](https://docs.hedera.com/native/tokens/nft-id.md): Construct an NftId from a token ID and serial number to reference an individual non-fungible token on Hedera.
- [Token types](https://docs.hedera.com/native/tokens/token-types.md): Compare the two Hedera Token Service token types: fungible (FUNGIBLE_COMMON) and non-fungible (NON_FUNGIBLE_UNIQUE) tokens.
- [Create a token](https://docs.hedera.com/native/tokens/define.md): Create a fungible or non-fungible token on Hedera with TokenCreateTransaction, setting its keys, supply, treasury, and other properties.
- [Custom token fees](https://docs.hedera.com/native/tokens/custom-fees.md): Configure fixed, fractional, and royalty custom fees on HTS tokens that pay out automatically to fee collector accounts on every transfer.
- [Update a token](https://docs.hedera.com/native/tokens/update.md): Update an existing token's properties such as name, symbol, treasury, keys, memo, and expiry with TokenUpdateTransaction, signed by the admin key.
- [Update token custom fees](https://docs.hedera.com/native/tokens/update-fee-schedule.md): Change a token's custom fee schedule with TokenFeeScheduleUpdateTransaction, signed by the token's fee schedule key.
- [Update NFT metadata](https://docs.hedera.com/native/tokens/update-nft-metadata.md): Update the metadata of existing NFTs with TokenUpdateNftsTransaction, signed by the metadata key set at token creation.
- [Transfer tokens](https://docs.hedera.com/native/tokens/transfer.md): Transfer HBAR, fungible tokens, and NFTs between accounts in a single atomic TransferTransaction, including approved allowance transfers and tokens with custom fees.
- [Airdrop a token](https://docs.hedera.com/native/tokens/airdrop.md): Send fungible tokens and NFTs to multiple accounts with TokenAirdropTransaction, holding transfers as pending airdrops when recipients aren't associated.
- [Claim a token](https://docs.hedera.com/native/tokens/claim.md): Claim a pending token airdrop as the recipient with TokenClaimAirdropTransaction, associating and transferring the token in a single step.
- [Cancel a token](https://docs.hedera.com/native/tokens/cancel.md): Cancel pending token airdrops you initiated with TokenCancelAirdropTransaction, removing them from network state before recipients claim them.
- [Reject a token](https://docs.hedera.com/native/tokens/reject-airdrop.md): Return unwanted airdropped tokens to the treasury with TokenRejectTransaction, rejecting fungible balances or specific NFT serials without paying custom fees.
- [Delete a token](https://docs.hedera.com/native/tokens/delete.md): Mark a token as deleted with TokenDeleteTransaction, signed by the admin key. Deleted tokens remain in the ledger but block further operations.
- [Mint a token](https://docs.hedera.com/native/tokens/mint.md): Mint new units of a fungible token or create NFTs with unique metadata using TokenMintTransaction, signed by the token's supply key.
- [Burn a token](https://docs.hedera.com/native/tokens/burn.md): Burn fungible tokens or NFTs held by the treasury account with TokenBurnTransaction, decreasing the token's total supply.
- [Freeze an account](https://docs.hedera.com/native/tokens/freeze.md): Freeze token transfers for a specific account with TokenFreezeTransaction, signed by the token's freeze key.
- [Unfreeze an account](https://docs.hedera.com/native/tokens/unfreeze.md): Restore token transfers for a frozen account with TokenUnfreezeTransaction, signed by the token's freeze key.
- [Enable KYC account flag](https://docs.hedera.com/native/tokens/enable-kyc.md): Grant KYC to an account for a specific token with TokenGrantKycTransaction, signed by the token's KYC key.
- [Disable KYC account flag](https://docs.hedera.com/native/tokens/disable-kyc.md): Revoke the KYC flag from an account for a specific token with TokenRevokeKycTransaction, signed by the token's KYC key.
- [Associate tokens to an account](https://docs.hedera.com/native/tokens/associate.md): Associate a Hedera account with one or more tokens using TokenAssociateTransaction so it can receive and hold those tokens.
- [Dissociate tokens from an account](https://docs.hedera.com/native/tokens/dissociate.md): Remove the association between a Hedera account and one or more tokens with TokenDissociateTransaction, freeing token relationships once balances are zero.
- [Pause a token](https://docs.hedera.com/native/tokens/pause.md): Pause a token with TokenPauseTransaction, signed by the pause key, to block all operations on it until it is unpaused.
- [Unpause a token](https://docs.hedera.com/native/tokens/unpause.md): Resume a previously paused token with TokenUnpauseTransaction, signed by the token's pause key, so it can participate in transactions again.
- [Wipe a token](https://docs.hedera.com/native/tokens/wipe.md): Remove fungible or non-fungible tokens from a specific account with TokenWipeTransaction, burning them and decreasing total supply.
- [Atomic swaps](https://docs.hedera.com/native/tokens/atomic-swaps.md): Swap HTS tokens and HBAR between two accounts in a single TransferTransaction, with no third-party exchange or custodian required.
- [Get account token balance](https://docs.hedera.com/native/tokens/get-balance.md): Get an account's token balances on Hedera for free with MirrorNodeTokenBalanceQuery or the Mirror Node REST API. AccountBalanceQuery stopped working with consensus node release v0.77.
- [Get token info](https://docs.hedera.com/native/tokens/get-info.md): Query details about a fungible or non-fungible token with TokenInfoQuery, or use the recommended Mirror Node REST API.
- [Get NFT info](https://docs.hedera.com/native/tokens/get-nft-info.md): Query details about a specific NFT by its NFT ID, including owner, metadata, and any spender allowance, with TokenNftInfoQuery.
- [Network Response Messages](https://docs.hedera.com/native/tokens/errors.md): Reference of Hedera Token Service network response codes and what each status means when a token transaction succeeds or fails.

### Consensus Service

- [Create a topic](https://docs.hedera.com/native/consensus/create-topic.md): Create a new Hedera Consensus Service topic with TopicCreateTransaction, set an admin key, submit key, and memo, and get the new topic ID from the transaction receipt.
- [Update a topic](https://docs.hedera.com/native/consensus/update-topic.md): Update the properties of an existing HCS topic with TopicUpdateTransaction, including the memo, admin key, submit key, auto-renew settings, and fee-related fields.
- [Submit a message](https://docs.hedera.com/native/consensus/submit-message.md): Submit a topic message to Hedera Consensus Service, configure max chunks and chunk size, and set custom fee limits when paying HCS topic fees.
- [Delete a topic](https://docs.hedera.com/native/consensus/delete-topic.md): Delete a topic from the Hedera network with TopicDeleteTransaction, which requires the admin key to sign, and understand how older messages remain accessible via the mirror node.
- [Get topic messages](https://docs.hedera.com/native/consensus/get-message.md): Subscribe to an HCS topic's messages from a mirror node with TopicMessageQuery for free, retrieving all messages or those within a defined start and end time.
- [Get topic info](https://docs.hedera.com/native/consensus/get-info.md): Query an HCS topic's current state with TopicInfoQuery, returning the topic ID, admin key, submit key, sequence number, and other topic properties.
- [Network Response](https://docs.hedera.com/native/consensus/errors.md): Reference for Hedera Consensus Service topic network response messages, including errors like INVALID_TOPIC_ID, TOPIC_DELETED, INVALID_TOPIC_ADMIN_KEY, and UNAUTHORIZED.

### File Service

- [Create a file](https://docs.hedera.com/native/files/create.md): Create a new file on the Hedera File Service with FileCreateTransaction, get its file ID from the receipt, and append larger content with FileAppendTransaction.
- [Append to a file](https://docs.hedera.com/native/files/append.md): Append new content to the end of an existing file on the Hedera File Service with FileAppendTransaction, and sign with the file's key when it differs from the operator account.
- [Update a file](https://docs.hedera.com/native/files/update.md): Update the state of an existing file on the Hedera File Service with FileUpdateTransaction, including signing requirements when changing the keys on the file.
- [Delete a file](https://docs.hedera.com/native/files/delete.md): Delete a file from the Hedera network with FileDeleteTransaction, which truncates its contents to zero length and blocks further updates, appends, and expiration extensions.
- [Get file contents](https://docs.hedera.com/native/files/get-contents.md): Query the contents of a file on the Hedera File Service with FileContentsQuery, retrieving the raw bytes stored in the file without changing its state.
- [Get file info](https://docs.hedera.com/native/files/get-info.md): Query the current state of a file on the Hedera File Service with FileInfoQuery, returning metadata such as size, keys, expiration time, and deletion status.
- [Network Response Messages](https://docs.hedera.com/native/files/errors.md): Reference for Hedera File Service network response messages, including statuses like FILE_DELETED, FILE_CONTENT_EMPTY, and FEE_SCHEDULE_FILE_PART_UPLOADED.

### Scheduled Transactions

- [Schedule ID](https://docs.hedera.com/native/scheduled/schedule-id.md): Understand the ScheduleId that identifies a scheduled transaction entity, formatted as shardNum.realmNum.scheduleNum (for example 0.0.10).
- [Create a schedule transaction](https://docs.hedera.com/native/scheduled/create.md): Create a schedule entity on the Hedera network with ScheduleCreateTransaction, wrap a transaction for deferred multi-party signing, and get the ScheduleID from the receipt.
- [Sign a scheduled transaction](https://docs.hedera.com/native/scheduled/sign.md): Add signatures to a scheduled transaction with ScheduleSignTransaction; once all required signatures are collected, the transaction executes immediately or at its set expiration time.
- [Delete a schedule transaction](https://docs.hedera.com/native/scheduled/delete.md): Remove a scheduled transaction from the network with ScheduleDeleteTransaction, which requires an admin key set at creation and signed by that key, or the delete fails as immutable.
- [Get schedule info](https://docs.hedera.com/native/scheduled/get-info.md): Query a scheduled transaction with ScheduleInfoQuery to return its schedule ID, the scheduled transaction, collected signatures, and admin key.
- [Network Response Messages](https://docs.hedera.com/native/scheduled/response-messages.md): Reference for scheduled transaction network response messages, including errors like INVALID_SCHEDULE_ID, SCHEDULE_IS_IMMUTABLE, NO_NEW_VALID_SIGNATURES, and schedule expiry statuses.

### Smart Contracts

- [Delegate Contract ID](https://docs.hedera.com/native/smart-contracts/delegate-contract-id.md): Understand the delegate contract ID key, a more permissive contract key that treats a contract as a signer even when it runs another contract's code via delegatecall.
- [Create a smart contract](https://docs.hedera.com/native/smart-contracts/create.md): Deploy a new smart contract on Hedera with ContractCreateTransaction or ContractCreateFlow, then get the new contract ID from the receipt.
- [Update a smart contract](https://docs.hedera.com/native/smart-contracts/update.md): Modify a smart contract entity's admin key, auto-renew period, memo, and other mutable properties with ContractUpdateTransaction.
- [Delete a smart contract](https://docs.hedera.com/native/smart-contracts/delete.md): Delete a smart contract with ContractDeleteTransaction, signed by the admin key, transferring any remaining HBAR balance to another account.
- [Call a smart contract function](https://docs.hedera.com/native/smart-contracts/call.md): Execute a state-changing smart contract function with ContractExecuteTransaction, paying gas for computation and any resulting storage.
- [Ethereum transaction](https://docs.hedera.com/native/smart-contracts/ethereum-transaction.md): Execute a raw, RLP-encoded Ethereum transaction (type 0, 1, or 2) on Hedera with EthereumTransaction using existing EVM tooling.
- [Get a smart contract function](https://docs.hedera.com/native/smart-contracts/get-function.md): Call a read-only smart contract function locally with ContractCallQuery to return its result without changing state or reaching consensus.
- [Get smart contract bytecode](https://docs.hedera.com/native/smart-contracts/get-bytecode.md): Query the runtime bytecode of a deployed smart contract with ContractByteCodeQuery from a single node without network consensus.
- [Get smart contract info](https://docs.hedera.com/native/smart-contracts/get-info.md): Query the current state of a smart contract, including its balance, with ContractInfoQuery or the Mirror Node REST API.
- [Hedera Service Solidity Libraries](https://docs.hedera.com/native/smart-contracts/solidity-libraries.md): Solidity source files and libraries for calling the Hedera Token Service and other Hedera services natively from smart contracts.
- [Network Response Messages](https://docs.hedera.com/native/smart-contracts/errors.md): Reference of Hedera Smart Contract Service network response codes and what each status means for contract transactions.

### Signature Provider

- [Provider](https://docs.hedera.com/native/signature-provider/provider.md): Use the Provider interface in the Hedera JavaScript SDK to access a network (previewnet, testnet, or mainnet) and submit any request through its call method.
- [Signer](https://docs.hedera.com/native/signature-provider/signer.md): Use the Signer interface in the Hedera JavaScript SDK, which is responsible for signing requests before they are submitted to a Hedera network.
- [Wallet](https://docs.hedera.com/native/signature-provider/wallet.md): Use the Wallet class in the Hedera JavaScript SDK, which extends Signer to sign requests and works with a Provider that handles communication with a Hedera network.
- [Local Provider](https://docs.hedera.com/native/signature-provider/local-provider.md): Use LocalProvider in the Hedera JavaScript SDK to create a provider from the HEDERA_NETWORK environment variable defined in your project's .env file.

### Tutorials

- [More Tutorials](https://docs.hedera.com/native/tutorials/more/index.md): Browse additional Hedera tutorials across developer tools, the basics, smart contracts, and NFTs and fungible tokens.

#### Getting Started

- [Create and Fund Your Hedera Testnet Account](https://docs.hedera.com/native/tutorials/getting-started/create-fund-account.md): Create and fund a Hedera testnet account with HBAR using the developer portal, the faucet, or the HashPack wallet, so you can pay for transactions and queries.
- [How to Create a Personal Access Token (API Key) on the Hedera Portal](https://docs.hedera.com/native/tutorials/getting-started/create-api-key.md): Create a Personal Access Token in the Hedera Portal to recreate accounts after testnet resets, query account IDs, and authenticate Faucet API requests.
- [Auto-Create Hedera Accounts with HBAR and Token Transfers](https://docs.hedera.com/native/tutorials/getting-started/auto-create-accounts.md): Walkthrough of HIP-32 and HIP-542 auto-account creation on Hedera: send HBAR or HTS tokens to an EVM Address from Public Key to create the account on first transfer.

#### Tokens

- [Create a Token](https://docs.hedera.com/native/tutorials/tokens/create-first-token.md): Launch your first fungible token on Hedera testnet with the Hedera Token Service and the SDK, using your operator account as the treasury.
- [Create and Transfer Your First NFT](https://docs.hedera.com/native/tutorials/tokens/create-transfer-nft.md): Create and transfer your first NFT with the Hedera Token Service and the SDK, from minting serial numbers to associating accounts and transferring ownership.
- [Create and Transfer Your First Fungible Token](https://docs.hedera.com/native/tutorials/tokens/create-transfer-fungible.md): Create and transfer your first fungible token with the Hedera Token Service and the SDK, from token creation through associating accounts and moving balances.
- [Structure Your Token Metadata Using JSON Schema V2](https://docs.hedera.com/native/tutorials/tokens/metadata-schema.md): Structure token metadata with the HIP-412 Token Metadata JSON Schema V2 so explorers and tooling on Hedera can read attributes like NFT rarity.
- [Hedera Token Service - Part 1: How to Mint NFTs](https://docs.hedera.com/native/tutorials/tokens/hts-part1-mint.md): Mint and transfer your first NFT with the Hedera Token Service and the JavaScript SDK, no smart contract required, in part 1 of the HTS tutorial series.
- [Hedera Token Service - Part 2: KYC, Update, and Scheduled Transactions](https://docs.hedera.com/native/tutorials/tokens/hts-part2-kyc.md): Enable and disable a token KYC flag, update token properties on mutable tokens, and schedule token transfers with the Hedera Token Service in part 2 of the HTS series.
- [Hedera Token Service - Part 3: How to Pause, Freeze, Wipe, and Delete NFTs](https://docs.hedera.com/native/tutorials/tokens/hts-part3-admin.md): Manage tokens with HTS admin keys: pause a token, freeze an account, wipe a balance, and delete a token, in part 3 of the Hedera Token Service series.
- [Create Your First Frictionless Airdrop Campaign](https://docs.hedera.com/native/tutorials/tokens/airdrop-campaign.md): Run a Hedera Frictionless Airdrop with TokenAirdropTransaction, TokenClaimAirdropTransaction, and TokenCancelAirdropTransaction to distribute tokens at scale.

#### Consensus

- [Create a Topic](https://docs.hedera.com/native/tutorials/consensus/create-first-topic.md): Create your first Hedera Consensus Service topic on testnet with the JavaScript, Java, Go, or Python SDK, and submit a message to it.
- [Submit Your First Message](https://docs.hedera.com/native/tutorials/consensus/submit-first-message.md): Submit your first message to a Hedera Consensus Service topic with the SDK, and learn how HCS provides fair ordering and transparency for events.
- [Submit Message to Private Topic](https://docs.hedera.com/native/tutorials/consensus/private-topic.md): Create a private HCS topic with a submit key so only authorized signers can post messages, then submit a signed message with the SDK.
- [Batch, anchor, and verify records with HCS](https://docs.hedera.com/native/tutorials/consensus/batch-anchor-verify.md): Learn how to batch records off-chain, compute a Merkle root, and anchor it on Hedera Consensus Service for cost-effective verification.
- [Query Messages with Mirror Node](https://docs.hedera.com/native/tutorials/consensus/query-mirror-node.md): Query the Hedera mirror node API to retrieve and filter messages submitted to an HCS topic, and read them back in consensus order.

#### Scheduled

- [Schedule Your First Transaction](https://docs.hedera.com/native/tutorials/scheduled/schedule-first.md): Create, sign, and execute your first scheduled transaction on Hedera with the SDK, and collect additional signatures with ScheduleSign before it runs.

#### Advanced

- [How to Generate a Random Number on Hedera](https://docs.hedera.com/native/tutorials/advanced/random-number.md): Generate verifiable pseudorandom numbers on Hedera with the JavaScript SDK and Solidity, so anyone can confirm the value came from the network unaltered.
- [How to Configure a Mirror Node and Query Data](https://docs.hedera.com/native/tutorials/advanced/configure-mirror-node.md): A step-by-step guide on how to configure a mirror node and query specific data on the Hedera Network
- [JavaScript Testing](https://docs.hedera.com/native/tutorials/advanced/javascript-testing.md): How to test Javascript, using Javascript
- [Create a Hedera DApp Integrated with WalletConnect](https://docs.hedera.com/native/tutorials/advanced/walletconnect-dapp.md): In the dynamic world of decentralized applications (DApps), catering to users with diverse wallet preferences is important.
- [Building on Hedera (course)](https://docs.hedera.com/native/tutorials/advanced/hashgraphdev.md): A free online course that teaches you how to build applications on Hedera, hosted at hashgraphdev.com.

##### HSM Signing

- [HSM/KMS Signing Solutions](https://docs.hedera.com/native/tutorials/advanced/hsm-signing/index.md): Sign Hedera transactions with keys held in cloud KMS or HSM services so private keys never leave the secure store, using a custom SDK signer function.
- [Sign Hedera Transactions with AWS KMS](https://docs.hedera.com/native/tutorials/advanced/hsm-signing/aws-kms.md): Use an AWS KMS ECC_SECG_P256K1 key to sign Hedera transactions without exposing private keys, with examples for Java, JavaScript, Go, Rust, C++, and Swift SDKs.
- [Sign Hedera Transactions with Azure Key Vault](https://docs.hedera.com/native/tutorials/advanced/hsm-signing/azure-key-vault.md): Set up a secp256k1 signing key in Azure Key Vault and use it to sign Hedera transactions from a Node.js app, keeping private keys out of your application.
- [Sign Hedera Transactions with Google Cloud HSM](https://docs.hedera.com/native/tutorials/advanced/hsm-signing/gcp-kms.md): Sign Hedera transactions using a Google Cloud HSM-backed secp256k1 key so private keys never leave the HSM, with patterns for the Hiero SDKs and HSM-only flows.

##### HCS Fabric Plugin

- [Get Started with the Hedera Consensus Service Fabric Plugin](https://docs.hedera.com/native/tutorials/advanced/hcs-fabric-plugin/index.md): Build a Hyperledger Fabric network that uses the Hedera Consensus Service as its ordering service via the HCS Fabric plugin, with two organizations.
- [Virtual Environment Setup](https://docs.hedera.com/native/tutorials/advanced/hcs-fabric-plugin/virtual-environment.md): Run the HCS Hyperledger Fabric sample network in a virtual environment using Vagrant and VirtualBox, from cloning the pluggable-hcs repository through setup.

### Local Development

- [Local Development](https://docs.hedera.com/native/local-dev/index.md): Run a full Hedera network on your own machine with Solo: consensus node, mirror node, JSON-RPC relay, and explorer, with no faucet, rate limits, or network resets.
- [Set Up a Local Network Using the Solo CLI](https://docs.hedera.com/native/local-dev/setup-cli-npm.md): Install the Solo CLI with npm, deploy a single-node Hedera network locally, verify it is running, and connect your tooling to the generated endpoints and accounts.
