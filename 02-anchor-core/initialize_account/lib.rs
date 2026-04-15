/*
  Part 02 Anchor program that initializes and stores a u64 in a new account.
  - Declares the program ID.
  - Exposes the `initialize` instruction.
  - Defines the `Initialize` accounts struct.
  - Defines the `NewAccount` account struct.
*/
use anchor_lang::prelude::*;

// To generate a new program ID, you can use the following command in the Solana 
// Playground terminal:
// solana-keygen new --no-bip39-passphrase -o program-keypair.json
// then copy the program ID and paste it into the `declare_id!` macro.
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod example {
    use crate::*;

    // `initialize` instruction that initializes the new account with the given data
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        // initialize the new account with the given data
        ctx.accounts.new_account.data = data;
        // log the data
        msg!("data = {}", data);
        // return Ok(()) to indicate that the instruction executed successfully
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // `signer` is the account that will sign the transaction
    #[account(mut)]
    pub signer: Signer<'info>,
    // `new_account` is the account that will be initialized with the given data
    #[account(
        init,
        payer = signer,
        space = 8 + 8,
    )]
    // `new_account` is the account that will be initialized with the given data
    pub new_account: Account<'info, NewAccount>,
    // `system_program` is the system program that will be used to create the new account
    pub system_program: Program<'info, System>,
}

// `NewAccount` is the account that will be initialized with the given data
// it contains a single field `data` of type `u64`
#[account]
pub struct NewAccount {
    pub data: u64,
}
