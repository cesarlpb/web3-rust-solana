// Part 06 Track C — Counter vault (final solution)
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod counter_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.mint = ctx.accounts.mint.key();
        counter.total_deposited = 0;
        counter.bump = ctx.bumps.counter;

        let vault = &mut ctx.accounts.vault;
        vault.counter = counter.key();
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_ata.to_account_info(),
                    to: ctx.accounts.vault_ata.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        ctx.accounts.counter.total_deposited = ctx
            .accounts
            .counter
            .total_deposited
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        emit!(Deposited {
            user: ctx.accounts.user.key(),
            amount,
        });
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        acc
        require!(
            ctx.accounts.authority.key() == ctx.accounts.counter.authority,
            VaultError::Unauthorized
        );
        require!(
            ctx.accounts.counter.total_deposited >= amount,
            VaultError::InsufficientBalance
        );

        let seeds = &[
            b"vault",
            ctx.accounts.counter.key().as_ref(),
            &[ctx.accounts.vault.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_ata.to_account_info(),
                    to: ctx.accounts.authority_ata.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        ctx.accounts.counter.total_deposited = ctx
            .accounts
            .counter
            .total_deposited
            .checked_sub(amount)
            .ok_or(VaultError::Underflow)?;

        emit!(Withdrawn {
            authority: ctx.accounts.authority.key(),
            amount,
        });
        Ok(())
    }

    pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
        require!(
            ctx.accounts.counter.total_deposited == 0,
            VaultError::VaultNotEmpty
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", counter.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"counter"], bump = counter.bump)]
    pub counter: Account<'info, Counter>,
    #[account(
        seeds = [b"vault", counter.key().as_ref()],
        bump = vault.bump,
        has_one = counter @ VaultError::InvalidVault
    )]
    pub vault: Account<'info, Vault>,
    pub mint: Account<'info, Mint>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = user)]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = vault,
    )]
    pub vault_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"counter"], bump = counter.bump, has_one = authority @ VaultError::Unauthorized)]
    pub counter: Account<'info, Counter>,
    #[account(
        seeds = [b"vault", counter.key().as_ref()],
        bump = vault.bump,
        has_one = counter @ VaultError::InvalidVault
    )]
    pub vault: Account<'info, Vault>,
    pub mint: Account<'info, Mint>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = vault)]
    pub vault_ata: Account<'info, TokenAccount>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = authority)]
    pub authority_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        close = authority,
        seeds = [b"counter"],
        bump = counter.bump,
        has_one = authority @ VaultError::Unauthorized
    )]
    pub counter: Account<'info, Counter>,
    #[account(
        seeds = [b"vault", counter.key().as_ref()],
        bump = vault.bump,
        has_one = counter @ VaultError::InvalidVault
    )]
    pub vault: Account<'info, Vault>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_deposited: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub counter: Pubkey,
    pub bump: u8,
}

#[event]
pub struct Deposited {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct Withdrawn {
    pub authority: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum VaultError {
    #[msg("Only the counter authority can withdraw.")]
    Unauthorized,
    #[msg("Amount must be greater than zero.")]
    InvalidAmount,
    #[msg("Arithmetic overflow.")]
    Overflow,
    #[msg("Arithmetic underflow.")]
    Underflow,
    #[msg("Insufficient deposited balance.")]
    InsufficientBalance,
    #[msg("Vault does not match counter.")]
    InvalidVault,
    #[msg("Withdraw all tokens before closing.")]
    VaultNotEmpty,
}
