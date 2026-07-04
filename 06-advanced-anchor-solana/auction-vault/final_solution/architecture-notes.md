## Auction Vault Architecture Notes (Part 06)

### PDA schema

| Account | Seeds |
|---------|--------|
| `Auction` | `["auction", creator, auction_id_le]` |
| `Vault` | `["vault", auction_pubkey]` |
| `Bid` | `["bid", auction_pubkey, bidder_pubkey]` |
| Vault ATA | Associated token: owner = **vault PDA**, mint = auction.mint |

### CPI flows

```
place_bid:
  bidder (signer) --token::transfer--> vault_ata
  authority = bidder

settle_auction:
  vault PDA (program sign) --token::transfer--> winner_ata
  seeds = ["vault", auction, bump]
```

### Authority model

- **Creator** settles (`has_one = creator`).
- **Winner** account must match `auction.highest_bidder`.
- **Bidder** signs `place_bid` and funds vault ATA.

### Events

- `BidPlaced { auction, bidder, amount }`
- `AuctionSettled { auction, winner, amount }`

### Custom errors

`BidTooLow`, `AuctionEnded`, `InvalidMint`, `InvalidVault`, `NoBids`, `Unauthorized`

### Testing note

SPL integration tests need an initialized **mint** and funded **bidder ATA**. Use local `anchor test` with `@solana/spl-token` or create a mint in Playground before running tests.

### Lab vs real auction

This lab releases vault tokens to the winner to practice PDA-signed CPI. In production, the winner should receive the **auctioned item** (e.g. NFT) and the seller should receive **payment**. See [`../extension-research.md`](../extension-research.md) for optional investigation.
