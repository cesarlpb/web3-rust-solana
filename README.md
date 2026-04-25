# Course exercises (code reference)

Reference copies of the code you build in **Solana Playground** (and later in local Anchor). Paths here are **flat** for easy diffing with slides; in a real Anchor project, `lib.rs` lives under `programs/<name>/src/`, and client/tests follow the template layout.

## Index

| Part | Code folder | Exercise / notes |
|------|-------------|------------------|
| **01** | [`01-introduction/hello_solana/`](01-introduction/hello_solana/) | [`exercise.md`](01-introduction/hello_solana/exercise.md) — minimal `hello`, `client.ts`, test |
| **02** | [`02-anchor-core/`](02-anchor-core/) | [`exercise.md`](02-anchor-core/exercise.md) — `#[program]`, `Context`, `#[derive(Accounts)]`, `init` / `space`; labs: [`initialize_account/`](02-anchor-core/initialize_account/), [`update_account/`](02-anchor-core/update_account/), [`update_account_with_getter/`](02-anchor-core/update_account_with_getter/), [`template_exercise_solution/`](02-anchor-core/template_exercise_solution/) |
| **03** | [`03-accounts-state/`](03-accounts-state/) | [`exercise.md`](03-accounts-state/exercise.md); bases: [`exercise_solution_base/`](03-accounts-state/exercise_solution_base/), full: [`exercise_solution_final/`](03-accounts-state/exercise_solution_final/) |
| **04** | [`04-pdas-project-prep/`](04-pdas-project-prep/) | [`exercise.md`](04-pdas-project-prep/exercise.md) — PDAs, seeds, project prep |
| **05** | [`05-final-projects/`](05-final-projects/) | [`projects.md`](05-final-projects/projects.md); skeletons: [`nft-flow/`](05-final-projects/nft-flow/), [`auction-dapp/`](05-final-projects/auction-dapp/) |

### Slides (Reveal.js)

Not shipped inside this git repo. If you use a workspace where **`course/`** sits next to **`web3-rust-solana/`** (same parent folder), open in the browser:

| Part | `slides.html` |
|------|----------------|
| 01 | [`../course/01-introduction/slides.html`](../course/01-introduction/slides.html) |
| 02 | [`../course/02-introduccion-rust-web3-anchor/slides.html`](../course/02-introduccion-rust-web3-anchor/slides.html) |
| 03 | [`../course/03-accounts-state/slides.html`](../course/03-accounts-state/slides.html) |
| 04 | [`../course/04-pdas-project-prep/slides.html`](../course/04-pdas-project-prep/slides.html) |
| 05 | [`../course/05-final-projects/slides.html`](../course/05-final-projects/slides.html) |

Root-level [`lib.rs`](lib.rs), [`client.ts`](client.ts), [`anchor.test.ts`](anchor.test.ts) are a generic Playground-style template (not tied to one part).

## How to use

1. Open **[Solana Playground](https://playground.solana.com)** → **New project** → **Anchor**.
2. Paste or compare with the files in the matching module folder (e.g. **`01-introduction/hello_solana/`** for Part 01, **`04-pdas-project-prep/`** for Part 04).
3. **Program ID:** the `declare_id!` in `lib.rs` must match the ID shown after **Deploy** in Playground (replace if your template differs).
