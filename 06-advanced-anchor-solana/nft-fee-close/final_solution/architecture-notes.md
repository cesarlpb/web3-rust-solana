## NFT Fee + Close Architecture Notes (Part 06)

### PDA schema

| Account | Seeds |
|---------|--------|
| `CollectionConfig` | `["config"]` |
| `MintState` | `["mint_state", mint_pubkey]` |

### CPI flow (mint fee)

```
mint_nft:
  minter (signer) --system_program::transfer--> treasury
  amount = config.mint_price
```

### Close

- `close_config`: `close = authority` on config PDA
- Requires `total_minted == 0` (no mints yet)

### Events

- `NftMinted { mint, minter, fee_paid }`

### Custom errors

`Unauthorized`, `SoldOut`, `InvalidTreasury`, `ConfigNotEmpty`, `ArithmeticOverflow`

### Extension ideas

- SPL-denominated fee via `token::transfer` instead of System CPI
- Graduated pricing by `total_minted`
