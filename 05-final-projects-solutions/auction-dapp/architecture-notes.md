## Auction dApp Architecture Notes

- PDA schema
  - `Auction`: seeds `["auction", creator_pubkey, auction_id]`
  - `Bid`: seeds `["bid", auction_pubkey, bidder_pubkey]`
- Authority model
  - Creator owns the auction and is the only signer allowed to settle.
  - Any signer can place bids while auction is open.
- State transitions
  - `create_auction` -> initializes auction lifecycle and defaults.
  - `place_bid` -> enforces strictly increasing bid and updates highest state.
  - `settle_auction` -> marks auction as settled and blocks future bids.
- Safety checks
  - Reject bids that are not strictly higher than current highest.
  - Reject bids after settlement.
  - Enforce creator-only settlement with `has_one = creator`.
