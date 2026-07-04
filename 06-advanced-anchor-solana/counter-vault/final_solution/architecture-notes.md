## Counter Vault Architecture Notes (Part 06)

### PDA schema

| Account | Seeds |
|---------|--------|
| `Counter` | `["counter"]` |
| `Vault` | `["vault", counter_pubkey]` |
| Vault ATA | owner = vault PDA, mint = counter.mint |

### CPI flows

```
deposit:
  user (signer) --token::transfer--> vault_ata

withdraw:
  vault PDA (program sign) --token::transfer--> authority_ata
  seeds = ["vault", counter, bump]
```

### Close

- `close_vault` closes **counter** PDA when `total_deposited == 0`
- Vault ATA should be empty before closing counter

### Events

- `Deposited { user, amount }`
- `Withdrawn { authority, amount }`

### Custom errors

`Unauthorized`, `InvalidAmount`, `InsufficientBalance`, `VaultNotEmpty`, `InvalidVault`
