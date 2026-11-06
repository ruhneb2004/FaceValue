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

# About x402 on Hedera

> Use Hedera's official x402 payment scheme to settle HBAR and HTS token payments inside HTTP requests for apps, APIs, and AI agent transactions.

[x402](https://www.x402.org/) is an open payment standard that reuses the existing HTTP `402 Payment Required` status code to let a server ask for payment, and let a client pay, inside an ordinary HTTP request/response cycle. It turns a payment into something a client can satisfy as easily as it follows a redirect — no checkout page, account signup, or API-key dance required.

Hedera contributes its own [**`exact` payment scheme**](https://docs.hedera.com/solutions/ai/x402/exact-scheme) and a reference implementation to the official [x402 repository](https://github.com/x402-foundation/x402), so applications and AI agents can settle payments in HBAR or HTS tokens over x402 with the speed and low, predictable fees of the Hedera network.

> [!NOTE]
>
> For the background story and Hedera's perspective on why this matters, read the announcement: [**Hedera and the x402 Payment Standard**](https://hedera.com/blog/hedera-and-the-x402-payment-standard/).

## What x402 actually is (and what it is not)

x402 is best understood as **the missing payment layer of the web**: HTTP can move information instantly, but it has never had a native, standardized way to move money. x402 fills exactly that gap — and nothing more.

It is easy to over-read x402 as a magic switch that suddenly lets "agents use crypto" for anything. The real scope is much narrower then that and spans multiple use-cases.

> [card] What x402 IS
>
> * An **HTTP-native standard** for a single, discrete request → pay → response handshake
> * **Stateless and per-request** — each payment is self-verifying, with no billing session or subscription
> * **Settlement-agnostic** — works across chains and assets; on Hedera it settles in HBAR or HTS tokens
> * A **shared rulebook** so any wallet or service can negotiate value the same way it negotiates data

> [card] What x402 is NOT
>
> * **Not a blockchain or a new payment network** — it lives on top of existing rails
> * **Not a custodial processor** — facilitators verify and submit, but can never move funds without a signed authorization
> * **Not for streaming or multi-hop routing** — it is optimized for discrete request/response cycles, not continuous value flows
> * **Not a general "agentic wallet"** — it is one well-scoped primitive, not an autonomy framework

## Who uses it and what it is useful for

x402 shines whenever value needs to change hands **per request, at machine speed, without a human in the loop**:

* **AI agents** paying for API calls, context, datasets, inference, or tool use on demand
* **Paid APIs and per-request metering** — bill for exactly what is consumed instead of selling subscriptions or API keys
* **Pay-per-view digital content** — articles, reports, research papers, sensor feeds, OCR, translations
* **Micropayments at internet scale** — amounts too small to justify a checkout flow or a card fee

Because the payment is just an HTTP exchange, it composes cleanly with the web technologies you are already familiar with — reverse proxies, CDNs, TLS, and REST or GraphQL APIs.

## Resources

> [card] [Hedera and the x402 Payment Standard](https://hedera.com/blog/hedera-and-the-x402-payment-standard/)
>
> Hedera's announcement blog covering the what and why.

> [card] [Hedera exact scheme spec](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_hedera.md)
>
> The authoritative definition of the Hedera scheme.

> [card] [@x402/hedera reference implementation](https://github.com/x402-foundation/x402/tree/main/typescript/packages/mechanisms/hedera)
>
> The official TypeScript package for client and server.

> [card] [x402 whitepaper](https://www.x402.org/x402-whitepaper.pdf)
>
> The protocol's design and rationale.

> [card] [x402: The Missing Payment Layer of the Web](https://blockyresearch.com/en/reports/x402-the-missing-payment-layer-of-the-web)
>
> Blocky Research's deep-dive report on x402's scope, users, and limits.

> [card] [Blocky402 facilitator](https://blocky402.com/)
>
> An open x402 facilitator with Hedera support.
