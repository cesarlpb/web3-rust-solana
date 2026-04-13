# Course exercises (code reference)

Reference copies of the code you build in **Solana Playground** (and later in local Anchor). Paths here are **flat** for easy diffing with slides; in a real Anchor project, `lib.rs` lives under `programs/<name>/src/`, and client/tests follow the template layout.

## Index

| Module folder | Exercise | What it covers |
|---------------|----------|----------------|
| [`01-introduction/hello_solana/`](01-introduction/hello_solana/) | **hello_solana** | Minimal Anchor program: `hello` instruction, `client.ts` flow, basic test — matches Part 01 Playground slides. |

*More rows will be added as new modules ship (e.g. Part 02, accounts, `init` / `space`, etc.).*

## How to use

1. Open **[Solana Playground](https://playground.solana.com)** → **New project** → **Anchor**.
2. Paste or compare with the files in the matching **`hello_solana`** (or future) folder.
3. **Program ID:** the `declare_id!` in `lib.rs` must match the ID shown after **Deploy** in Playground (replace if your template differs).
