# Exercise: Accounts as State (Part 03)

## Goal

Implement a more realistic state lifecycle with multiple field types in one account:

1. initialize profile state
2. read state with a getter instruction
3. apply partial updates (not all fields at once)
4. validate behavior with tests

## Build target

Create a program with these instructions:

- `initialize_profile(name: String, age: u8)`
- `get_profile()`
- `update_name(name: String)`
- `update_age(age: u8)`
- `toggle_active()`

Use one account struct:

- `Profile { name: String, age: u8, is_active: bool }`

## Functional requirements

- `initialize_profile`:
  - creates account (`init`)
  - stores `name` and `age`
  - sets `is_active = true`
- `get_profile` logs all fields (`name`, `age`, `is_active`) with `msg!`.
- `update_name` changes only `name`.
- `update_age` changes only `age`.
- `toggle_active` flips only `is_active`.

## Space sizing requirement

Assume max name length is **5 ASCII chars**:

- discriminator: `8`
- string: `4 + 5`
- `u8`: `1`
- `bool`: `1`

Total:

- `space = 8 + (4 + 5) + 1 + 1 = 19 bytes`

## Suggested client flow

1. Create a new keypair for `profile`.
2. Call `initialize_profile("alice", 20)`.
3. Call `get_profile()` and inspect logs.
4. Call `update_name("bob")`, then getter.
5. Call `update_age(21)`, then getter.
6. Call `toggle_active()`, then getter.

## Recommended implementation order (for students)

Use this order to avoid getting blocked:

1. Complete `lib.rs` first:
   - define `Profile` struct
   - implement `initialize_profile`
   - implement `get_profile`
2. Complete `client.ts` next:
   - run initialize + getter until logs look correct
3. Return to `lib.rs`:
   - implement `update_name`
   - implement `update_age`
   - implement `toggle_active`
4. Complete `anchor.test.ts` last:
   - start with initialize + getter test
   - then add partial update tests
   - finish with toggle test

## Test requirements

Write tests that verify:

1. initialize stores expected values (`name`, `age`, `is_active=true`).
2. getter logs include all current fields.
3. `update_name` changes only `name`.
4. `update_age` changes only `age`.
5. `toggle_active` flips the boolean value.

## Debugging checklist

- Confirm transaction before fetching account state.
- Compare Rust accounts struct with client `.accounts({ ... })`.
- Re-check account `space` math.
- Validate string length before writing.
- Inspect logs before changing code.

## Optional bonus

- Add `authority: Pubkey` and restrict updates to the initializer.
- Add `require!(age <= 120, ...)`.
- Add a negative test for name length > 5.
