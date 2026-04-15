# Part 05 — Final Projects Statement

Choose one project track (or implement both if time allows).

## Track A: NFT Flow Project

### Objective

Design and implement a minimal NFT-oriented on-chain flow with clear account/state transitions.

### Required scope

- account model with PDA-based addressing
- initialize/config instruction
- mint flow instruction
- at least one read/helper instruction (logs or fetch-oriented)
- baseline tests for happy path + one failure path

### Suggested PDA schema

- `CollectionConfig`: `["config"]`
- `MintState`: `["mint_state", mint_pubkey]`
- optional `UserProfile`: `["profile", user_pubkey]`

## Track B: Auction dApp Project

### Objective

Design and implement a minimal on-chain auction lifecycle with deterministic PDAs.

### Required scope

- account model with PDA-based addressing
- create auction instruction
- place bid instruction
- settle or close instruction
- baseline tests for state transitions and invalid bid path

### Suggested PDA schema

- `Auction`: `["auction", creator_pubkey, auction_id]`
- `Bid`: `["bid", auction_pubkey, bidder_pubkey]`
- optional `Vault`: `["vault", auction_pubkey]`

## Shared deliverables

- `lib.rs` instruction skeleton + constraints
- `client.ts` interaction skeleton
- `anchor.test.ts` baseline tests
- short architecture notes (seed schema + authority model)

## Evaluation criteria

- correctness of account/state model
- safety constraints and authority checks
- quality of tests and failure-case coverage
- clarity of logs and debugging workflow
