# Mini Exercise: Counter with PDA (Part 04)

## Goal

Build a minimal counter using a PDA instead of a random keypair account.
This is a short warm-up before final projects.

## Required instructions

- `initialize()` -> create PDA counter and set `value = 0`
- `increment()` -> increase counter value by 1
- `get_counter()` -> log current value

## PDA requirement

Use this seed pattern:

- `["counter", signer_pubkey]`

That gives each wallet its own deterministic counter PDA.

## Functional checks

- initialize succeeds once per signer
- increment changes value
- getter logs current value
- repeated increment calls keep increasing state

## Test minimum

- initialize counter for a signer
- call increment 3 times
- assert final value is 3
- assert getter logs include current value

## Why this matters before Part 05

- You practice deterministic addressing (`seeds + bump`).
- You practice account constraints matching client accounts.
- You establish a reusable pattern for final project entities (auction, bid, mint state).
