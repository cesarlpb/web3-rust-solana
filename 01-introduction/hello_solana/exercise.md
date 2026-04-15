# Exercise: Customize `hello_solana`

## Goal

Practice your first end-to-end Anchor change:

1. modify the log string in the program
2. build and deploy
3. run client/test to confirm the new output

## Starting point

Use the files in this folder:

- `lib.rs`
- `client.ts`
- `anchor.test.ts`

## Task

### 1) Change the message in `lib.rs`

In the `hello` instruction, replace:

- `msg!("Hello, Solana!");`

with your own string, for example:

- `msg!("Hello, Borderless!");` for instance

### 2) Build + deploy

In Solana Playground (or local Anchor), run:

- Build
- Deploy

Make sure `declare_id!` matches the deployed Program ID.

### 3) Verify from client or test

Run either:

- `client.ts` (manual run), or
- `anchor.test.ts` (test run)

Then inspect transaction logs and confirm your new message appears.

## Acceptance criteria

- Program compiles successfully.
- Deployment succeeds.
- The new custom message appears in logs.
- Old message (`Hello, Solana!`) is no longer emitted.

## Optional bonus

- Update `anchor.test.ts` to assert the exact new log string.
- Try a second custom message and repeat the same flow.
