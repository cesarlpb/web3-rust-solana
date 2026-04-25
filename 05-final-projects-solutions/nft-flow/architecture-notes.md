## NFT Flow Architecture Notes

- PDA schema
  - `CollectionConfig`: seeds `["config"]`
  - `MintState`: seeds `["mint_state", mint_pubkey]`
- Authority model
  - `initialize_config` stores the signer as `authority`.
  - `mint_nft` requires `has_one = authority` on config.
- State transitions
  - `initialize_config` -> sets static config (`max_supply = 100`, `total_minted = 0`).
  - `mint_nft` -> initializes per-mint state and increments counter.
  - `get_mint_state` -> read/helper instruction with logs for debugging.
- Safety checks
  - Reject mint if `total_minted >= max_supply`.
  - Prevent silent overflow on mint counter increment.
