# Course exercises (code reference)

Reference copies of the code you build in **Solana Playground** (and later in local Anchor). Paths here are **flat** for easy diffing with slides; in a real Anchor project, `lib.rs` lives under `programs/<name>/src/`, and client/tests follow the template layout.

## Index

| Module folder | Exercise | What it covers |
|---------------|----------|----------------|
| [`01-introduction/hello_solana/`](01-introduction/hello_solana/) | **hello_solana** | Minimal Anchor program: `hello` instruction, `client.ts` flow, basic test — matches Part 01 Playground slides. |
| `02-anchor-core/*` | **(Part 02 exercises)** | `#[program]`, handlers, `Context<T>`, `#[derive(Accounts)]`, System Program, `init` / `space`, minimal client + test pattern. |
| `03-accounts-state/*` | **(Part 03)** | Accounts as state, lifecycle (initialize/read/update), mutation with `mut`, logs (`msg!`), and common mistakes (`mut` / `space`). |
| `04-pdas-project-prep/*` | **(Part 04)** | PDA fundamentals (deterministic addresses, seeds, program-owned state) and bridge to NFT / auction project patterns. |
| `05-final-projects/*` | **(Part 05)** | Final projects: NFT mint flow and auction dApp flow, including account/state design and instruction mapping. |

## How to use

1. Open **[Solana Playground](https://playground.solana.com)** → **New project** → **Anchor**.
2. Paste or compare with the files in the matching **`hello_solana`** (or future) folder.
3. **Program ID:** the `declare_id!` in `lib.rs` must match the ID shown after **Deploy** in Playground (replace if your template differs).
