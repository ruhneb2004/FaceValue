> ## Documentation Index
> Fetch the complete documentation index at: https://docs.hedera.com/llms.txt
> Use this file to discover all available pages before exploring further.

> ## Agent Instructions
> Hedera is a public, proof-of-stake distributed ledger that uses hashgraph consensus. Do not call it a blockchain.
> Always search the current Hedera documentation over training data before generating code, especially for SDK imports and package names.
> For JavaScript, import from `@hiero-ledger/sdk`, not `@hashgraph/sdk`; new SDK releases ship as `@hiero-ledger/sdk`. The Java SDK keeps the `com.hedera.hashgraph:sdk` Maven coordinates. Verify the exact import against the docs.
> Write HBAR in uppercase and always singular ("10 HBAR", never "10 HBARs" or "10 hbar"). Write tinybars in lowercase and plural.
> Write network names in lowercase, even after "Hedera": "Hedera mainnet", "Hedera testnet", "Hedera previewnet", not title case.
> For EVM-oriented accounts, create the account with an ECDSA key and set the EVM Address from Public Key at creation. This address is immutable and is not updated by key rotation. Do not use retired terms like "EVM alias" or "Account Number Alias".

# Submit a message

> Submit a topic message to Hedera Consensus Service, configure max chunks and chunk size, and set custom fee limits when paying HCS topic fees.

A transaction that submits a topic message to the Hedera network. To access the messages submitted to a topic ID, subscribe to the topic via a mirror node. The mirror node will publish the ordered messages to subscribers. Once the transaction is successfully executed, the receipt of the transaction will include the topic's updated sequence number and topic running hash.

## **Max Chunks**

The **max chunks** setting defines the maximum number of chunks into which a given message can be split. The default value is **20 chunks**, meaning a message can consist of up to 20 chunks by default. This value can be modified using the `setMaxChunks` method.

#### **Max Chunk Size**

> [!NOTE]
>
> 🚨 **NOTE:** Max size of an HCS message: 1024 bytes (1 kb).

The **max chunk size** refers to the maximum size (in bytes) of each individual chunk of a message. By default, the max chunk size is **1024 bytes (1 KB)**. This value can be modified using the `setChunkSize` method.

## **Custom Fee Payment**

If a topic has custom fees enabled, users submitting messages must pay the required fee in **HBAR or HTS fungible tokens**. If `setCustomFeeLimits` is not specified in the transaction, the user would need to pay any fee associated with that topic ID. The transaction will only fail if the user does not have sufficient assets to cover the fee.

**Recommendation:** To avoid unexpected fees, it is strongly recommended to use `setCustomFeeLimits` when submitting a message. This ensures that only the intended fee structure is applied, providing a safeguard against unintended charges.

```java theme={null}
TopicMessageSubmitTransaction()
   .setTopicId(<TOPIC_ID>)
   .setMessage(<MESSAGE>)
   .setCustomFeeLimits(<CUSTOM_FEE_LIMITS>) // Ensure this covers the required amount
   .execute(client);
```

## **Transaction Signing Requirements**

* Anyone can submit a message to a public topic.
* The `submitKey` is required to sign the transaction for a private topic.

## **Transaction Fees**

* Each transaction incurs a standard Hedera network fee based on network resource usage.
* If a custom fee is set for a topic, users submitting messages must pay this fee in HBAR or HTS tokens.
* The Fee Schedule Key allows authorized users to update fee structures. If set, it must sign transactions modifying fees.
* If the topic has custom fees, the sender must have sufficient balance to cover the fees unless they are exempt via the Fee Exempt Key List. It is recommended to use `setCustomFeeLimits` on the `TopicMessageSubmitTransaction` to ensure the expected fee structure is applied and avoid unexpected transaction failures due to insufficient funds.
* If you submit a message to a topic with a custom fee, the cost changes from the baseline $0.0001 USD to roughly $0.05 USD per `TopicMessageSubmitTransaction`.
* Use the [query fees table](https://docs.hedera.com/networks/fees.md#consensus-service) for the base transaction fee and the [Hedera Fee Estimator](https://hedera.com/fees) to estimate standard network fees.

## Methods

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Type</th>
      <th>Description</th>
      <th>Requirement</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        `setTopicId(<topicId>)`
      </td>

      <td>TopicId</td>
      <td>The topic ID to submit the message to</td>
      <td>Required</td>
    </tr>

    <tr>
      <td>
        `setMessage(<message>)`
      </td>

      <td>String</td>
      <td>The message in a String format</td>
      <td>Optional</td>
    </tr>

    <tr>
      <td>
        `setMessage(<message>)`
      </td>

      <td>byte \[ ]</td>
      <td>The message in a byte array format</td>
      <td>Optional</td>
    </tr>

    <tr>
      <td>
        `setMessage(<message>)`
      </td>

      <td>ByteString</td>
      <td>The message in a ByteString format</td>
      <td>Optional</td>
    </tr>

    <tr>
      <td>
        `setChunkSize()`
      </td>

      <td>int</td>

      <td>
        The max size of individual chunk for a given message. Default: 1024
        bytes
      </td>

      <td>Optional</td>
    </tr>

    <tr>
      <td>
        `setMaxChunks()`
      </td>

      <td>int</td>

      <td>
        The max number of chunks a given message can be split into. Default: 20
      </td>

      <td>Optional</td>
    </tr>

    <tr>
      <td>
        `setCustomFeeLimits()`
      </td>

      <td>List\<CustomFeeLimit></td>
      <td>The maximum custom fees the sender is willing to pay</td>
      <td>Optional</td>
    </tr>

    <tr>
      <td>
        `addCustomFeeLimit()`
      </td>

      <td>CustomFeeLimit</td>
      <td>Adds a custom fee limit</td>
      <td>Optional</td>
    </tr>
  </tbody>
</table>

```java Java highlight={18} theme={null}
//Create the transaction
TopicMessageSubmitTransaction transaction = new TopicMessageSubmitTransaction()
    .setTopicId(newTopicId)
    .setMessage("hello, HCS! ")
    .setCustomFeeLimits(maxCustomFees); // Set custom fee limits if applicable

//Sign with the client operator key and submit transaction to a Hedera network, get transaction ID
TransactionResponse txResponse = transaction.execute(client);

//Request the receipt of the transaction
TransactionReceipt receipt = txResponse.getReceipt(client);

//Get the transaction consensus status
Status transactionStatus = receipt.status;

System.out.println("The transaction consensus status is " +transactionStatus);

//v2.0.0

```

```javascript JavaScript theme={null}
// Create the transaction
const transaction = await new TopicMessageSubmitTransaction()
  .setTopicId(newTopicId)
  .setMessage("Hello, HCS!")
  .setCustomFeeLimits(maxCustomFees); // Set custom fee limits if applicable

// Execute transaction
const txResponse = await transaction.execute(client);

// Request the receipt
const receipt = await txResponse.getReceipt(client);

// Get the transaction consensus status
console.log("Transaction Status:", receipt.status);

//v2.0.0
```

```java Go theme={null}
//Create the transaction
transaction := hedera.NewTopicSubmitTransaction().
        SetTopicID(topicID).
        SetMessage([]byte(content)).
        SetCustomFeeLimits(maxCustomFees) // Set custom fee limits if applicable

//Sign with the client operator private key and submit the transaction to a Hedera network
txResponse, err := transaction.Execute(client)
if err != nil {
        panic(err)
}

//Request the receipt of the transaction
transactionReceipt, err := txResponse.GetReceipt(client)
if err != nil {
        panic(err)
}

//Get the transaction consensus status
transactionStatus := receipt.Status

fmt.Printf("The transaction consensus status is %v\n", transactionStatus)

//v2.0.0
```

```rust Rust theme={null}
// Create the transaction
let transaction = TopicMessageSubmitTransaction::new()
    .topic_id(topic_id)
    .message("Hello, HCS!")
    .custom_fee_limits(max_custom_fees); // Set custom fee limits if applicable

// Sign with the client operator key and submit to a Hedera network
let tx_response = transaction.execute(&client).await?;

// Request the receipt of the transaction
let receipt = tx_response.get_receipt(&client).await?;

// Get the transaction consensus status
let status = receipt.status;

println!("The transaction consensus status is {:?}", status);

// v0.34.0
```

## Get transaction values

| Method | Type | Description |
| - | - | - |
| `getTopicId()` | TopicId | The topic ID to submit the message to |
| `getMessage()` | ByteString | The message being submitted |
| `getCustomFeeLimits()` | Fee\[] | Extract the custom fee limits of the transaction |

```java Java theme={null}
//Create the transaction
TopicMessageSubmitTransaction transaction = new TopicMessageSubmitTransaction()
    .setTopicId(newTopicId)
    .setMessage("hello, HCS! ");

//Get the transaction message
ByteString getMessage = transaction.getMessage();
//v2.0.0
```

```javascript JavaScript theme={null}
//Create the transaction
const transaction = await new TopicMessageSubmitTransaction()
  .setTopicId(newTopicId)
  .setMessage("hello, HCS! ");

//Get the transaction message
const getMessage = transaction.getMessage();

//v2.0.0
```

```go Go theme={null}
//Create the transaction
transaction := hedera.NewTopicSubmitTransaction().
        SetTopicID(topicID).
        SetMessage([]byte(content))

//Get the transaction message
getMessage := transaction.GetMessage()
//v2.0.0
```
