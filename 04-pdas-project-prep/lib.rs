/*
  Part 04 — Counter with PDA.
  Each signer gets one deterministic counter at:
  seeds = ["counter", signer_pubkey]
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod counter_pda {
    use crate::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value = 0;
        msg!("counter initialized = {}", counter.value);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.value = counter
            .value
            .checked_add(1)
            .ok_or(ErrorCode::CounterOverflow)?;
        msg!("counter updated = {}", counter.value);
        Ok(())
    }

    pub fn get_counter(ctx: Context<GetCounter>) -> Result<()> {
        let counter = &ctx.accounts.counter;
        msg!("counter current = {}", counter.value);
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
        space = Counter::SPACE,
        seeds = [b"counter", signer.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"counter", signer.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct GetCounter<'info> {
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"counter", signer.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub value: u64,
}

impl Counter {
    pub const SPACE: usize = 8 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter overflow.")]
    CounterOverflow,
}
