/*
  Part 02 Anchor program that can initialize and then update account data.
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod example_update {
    use crate::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("initialized data = {}", data);
        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("updated data = {}", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + 8,
    )]
    pub new_account: Account<'info, NewAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub new_account: Account<'info, NewAccount>,
}

#[account]
pub struct NewAccount {
    pub data: u64,
}
