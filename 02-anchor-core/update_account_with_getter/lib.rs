/*
  Part 02 Anchor program that initializes, reads (getter), and updates account data.
  The goal is to make reads explicit and to log before/after values on updates.
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod getter_update_account {
    use crate::*;

    // Creates a new account and stores the initial value.
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("initialized data = {}", data);
        Ok(())
    }

    // Getter-like instruction: logs current value without modifying account state.
    pub fn get_data(ctx: Context<GetData>) -> Result<()> {
        let current = ctx.accounts.new_account.data;
        msg!("current data = {}", current);
        Ok(())
    }

    // Updates account state and logs before/after for easier debugging.
    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        let before = ctx.accounts.new_account.data;
        msg!("before update data = {}", before);

        ctx.accounts.new_account.data = data;

        let after = ctx.accounts.new_account.data;
        msg!("after update data = {}", after);
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
pub struct GetData<'info> {
    pub new_account: Account<'info, NewAccount>,
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
