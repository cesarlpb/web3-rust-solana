/*
  Minimal Anchor program for Part 01 that logs "Hello, Solana!".
  - Declares the program ID.
  - Exposes the `hello` instruction.
  - Defines the `Hello` accounts struct.
*/
use anchor_lang::prelude::*;
use solana_program::msg;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod hello_anchor {
    use super::*;

    // `hello` instruction that logs "Hello, Solana!"
    // the method name "hello" is the instruction name that we will use from 
    // the client.ts file
    pub fn hello(_ctx: Context<Hello>) -> Result<()> {
        msg!("Hello, Solana!");
        Ok(())
    }
}

// `Hello` accounts struct that is empty
// this is the accounts that the `hello` instruction will use
// we will not use any accounts in this example, but we will define the 
// accounts struct to be empty
#[derive(Accounts)]
pub struct Hello {}
