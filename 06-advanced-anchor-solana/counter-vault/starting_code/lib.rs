// Part 06 Track C — Counter vault (starting code)
// Standalone: deposit / withdraw SPL via vault PDA + on-chain counter.
//
// PDAs:
//   Counter   ["counter"]
//   Vault     ["vault", counter_pubkey]
//   vault_ata: ATA owned by Vault PDA, mint = counter.mint
//
// initialize  — init Counter + Vault PDAs; store authority, mint, bump
// deposit     — token::transfer CPI (user_ata -> vault_ata, user signs); increment total_deposited;
//               emit Deposited
// withdraw      — authority only; token::transfer with new_with_signer (vault_ata -> authority_ata);
//                 decrement total_deposited; emit Withdrawn
// close_vault   — authority only; close Counter PDA when total_deposited == 0
//
// Errors: Unauthorized, InvalidAmount, InsufficientBalance, VaultNotEmpty, InvalidVault, Overflow, Underflow
// Also: #[event], anchor-spl in Cargo.toml, tests (happy path + one error), architecture-notes.md
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod counter_vault {
    use crate::*;

    pub fn initialize(_ctx: Context<Initialize>, _mint: Pubkey) -> Result<()> {
        todo!("Part 06: init counter + vault PDAs, store mint");
    }

    pub fn deposit(_ctx: Context<Deposit>, _amount: u64) -> Result<()> {
        todo!("Part 06: user-signed token::transfer + increment counter + event");
    }

    pub fn withdraw(_ctx: Context<Withdraw>, _amount: u64) -> Result<()> {
        todo!("Part 06: PDA-signed token::transfer + decrement counter + event");
    }

    pub fn close_vault(_ctx: Context<CloseVault>) -> Result<()> {
        todo!("Part 06: close counter when vault empty (optional)");
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // TODO: authority, counter PDA, vault PDA, system_program
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    // TODO: user, counter, vault, user_ata, vault_ata, mint, token_program
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    // TODO: authority, counter, vault, user_ata, vault_ata, mint, token_program
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    // TODO: authority, counter with close = authority
}

#[account]
pub struct Counter {
    // TODO: authority, mint, total_deposited, bump
}

#[account]
pub struct Vault {
    // TODO: counter pubkey, bump
}

// TODO: #[error_code], #[event]
