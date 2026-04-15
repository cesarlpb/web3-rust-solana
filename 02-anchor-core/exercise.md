# Exercise: Beyond `u64` (Strings + Flags)

## Goal

Build a small Anchor account that stores **more than one data type**, so you practice sizing, initialization, updates, and reads with a richer state model.

## What you will build

Create an account called `Profile` with:

- `name: String` (fixed max length, e.g. 32 chars)
- `age: u8`
- `is_active: bool`

Then implement:

- `initialize_profile(name, age)` -> creates the account and sets `is_active = true`
- `update_name(name)` -> updates only the name
- `toggle_active()` -> flips `is_active`
- `get_profile()` -> logs current values (`name`, `age`, `is_active`)

---

You already covered setter/getter with `u64`.  
This exercise adds:

- dynamic-like data (`String`) with explicit max size
- small numeric type (`u8`)
- boolean state (`bool`)
- partial updates (only one field at a time)

## Required account sizing

Remember:

- Anchor discriminator: `8` bytes
- `String`: `4` bytes length prefix + max `5` bytes content (max 5 ASCII chars)
- `u8`: `1` byte | **Note:** we cannot allocate less space although boolean is a type that uses only one bit due to the BORSH serializer


If max name length is 5 bytes:

- `space = 8 + (4 + 5) + 1 + 1`
- total: `19` bytes

## Acceptance criteria

- Program builds and deploys.
- `initialize_profile` succeeds with a sample name.
- `get_profile` logs correct initial state.
- `update_name` changes only `name`.
- `toggle_active` changes only `is_active`.
- `age` remains unchanged unless explicitly updated.

## Test requirements

Write tests that verify:

1. initialize stores expected values
2. getter logs include expected values
3. update_name changes `name` only
4. toggle_active flips `is_active` from true -> false (and optionally back)
5. long names above max limit are rejected (if you add validation)

## Optional bonus

- Add an `authority: Pubkey` field and restrict updates to that signer.
- Add `update_age(new_age)` with simple validation (e.g. `new_age <= 120`).
- Emit events for each update.

## Suggested flow in Playground

1. Build + deploy.
2. Run client/test: initialize.
3. Call getter and inspect logs.
4. Run updates and call getter after each step.
5. Confirm state transitions in logs and tests.

You can find a template to get started in [template_exercise_solution](./template_exercise_solution/)