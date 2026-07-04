# Part 06 — Advanced Anchor Labs (statement)

**Prerequisites:** Part 05 final project (or equivalent).  
**Slides:** `../course/06-advanced-anchor-solana/slides.html`

Extend a Part 05 track **or** ship **Track C** standalone. All tracks: `starting_code/` → `final_solution/` under each project folder.

---

## Shared Part 06 requirements (all tracks)

Your updated program must include:

- [ ] At least **one CPI** (SPL `token::transfer` or System `transfer`)
- [ ] At least **one `invoke_signed` / PDA signer** path (`CpiContext::new_with_signer`)
- [ ] **`#[error_code]`** enum used in handlers
- [ ] **`#[event]`** emitted on a success path
- [ ] **`close`** instruction **or** documented why N/A for your track
- [ ] Tests: **happy path** + **one named custom error**
- [ ] **`architecture-notes.md`**: seeds, CPI diagram, authorities

**Playground:** add `anchor-spl` to `Cargo.toml` if missing (`anchor-spl = "0.30.1"` or match your Anchor version).

---

## Track A — `auction-vault/` (extends Auction dApp)

**Starting code:** [`auction-vault/starting_code/`](auction-vault/starting_code/) · **Solution:** [`auction-vault/final_solution/`](auction-vault/final_solution/)

### Objective

Add an **SPL escrow vault** to the Part 05 auction: bids move tokens on-chain; settlement uses **PDA signing**.

### PDA schema (additions)

| Account | Seeds |
|---------|--------|
| `Vault` | `["vault", auction_pubkey]` |
| Vault ATA | Associated token account: owner = vault PDA, mint = auction mint |

### Instructions to implement / extend

| Instruction | Part 06 work |
|-------------|----------------|
| `create_auction` | Store `mint` on auction; init **`Vault`** PDA |
| `place_bid` | **`token::transfer`** CPI (bidder → vault ATA); `emit!(BidPlaced {…})` |
| `settle_auction` | **`new_with_signer`** CPI (vault ATA → winner ATA) |

### Suggested errors

`BidTooLow`, `AuctionEnded`, `InvalidMint`, `Unauthorized`

---

## Track B — `nft-fee-close/` (extends NFT flow)

**Starting code:** [`nft-fee-close/starting_code/`](nft-fee-close/starting_code/) · **Solution:** [`nft-fee-close/final_solution/`](nft-fee-close/final_solution/)

### Objective

Charge a **mint fee** in lamports and allow **authority-only config close** with rent recovery.

### State additions

- `CollectionConfig.mint_price: u64`
- `CollectionConfig.treasury: Pubkey` (receives fees)

### Instructions to implement / extend

| Instruction | Part 06 work |
|-------------|----------------|
| `initialize_config` | Set `mint_price` + `treasury` |
| `mint_nft` | **System CPI** `transfer` fee; `emit!(NftMinted {…})` |
| `close_config` | **`close = authority`** when allowed |

### Suggested errors

`Unauthorized`, `SoldOut`, `InsufficientFee`

---

## Track C — `counter-vault/` (standalone)

**Starting code:** [`counter-vault/starting_code/`](counter-vault/starting_code/) · **Solution:** [`counter-vault/final_solution/`](counter-vault/final_solution/)

### Objective

Minimal program: **deposit / withdraw SPL** through a vault PDA + counter — no Part 05 dependency.

### PDA schema

| Account | Seeds |
|---------|--------|
| `Counter` | `["counter"]` |
| `Vault` | `["vault", counter_pubkey]` |

### Instructions

- `initialize` — counter + vault PDAs; store mint
- `deposit` — user-signed SPL CPI; increment counter; event
- `withdraw` — authority + PDA-signed CPI; decrement counter; event
- `close_vault` — optional `close` when empty

---

## Evaluation criteria

- Correct CPI account lists and signers
- PDA seeds / bumps stored and reused consistently
- Custom errors surfaced in tests (not generic failures)
- Events useful for a client or indexer
- Security: signers, `mut`, `has_one`, token mint/owner checks
