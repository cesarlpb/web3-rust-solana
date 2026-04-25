/*
  Template only (no final solution):
  Final Project Track A — NFT Flow.
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod nft_flow {
    use crate::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.total_minted = 0;
        config.max_supply = 100;
        config.bump = ctx.bumps.config;

        msg!(
            "config initialized: authority={}, max_supply={}",
            config.authority,
            config.max_supply
        );
        Ok(())
    }

    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(
            config.total_minted < config.max_supply,
            ErrorCode::MaxSupplyReached
        );

        let mint_state = &mut ctx.accounts.mint_state;
        mint_state.mint = ctx.accounts.mint.key();
        mint_state.owner = ctx.accounts.authority.key();
        mint_state.is_minted = true;
        mint_state.minted_at = Clock::get()?.unix_timestamp;
        mint_state.bump = ctx.bumps.mint_state;

        config.total_minted = config
            .total_minted
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        msg!(
            "mint created: mint={}, owner={}, total_minted={}",
            mint_state.mint,
            mint_state.owner,
            config.total_minted
        );
        Ok(())
    }

    pub fn get_mint_state(ctx: Context<GetMintState>) -> Result<()> {
        let mint_state = &ctx.accounts.mint_state;
        msg!(
            "mint_state: mint={}, owner={}, is_minted={}, minted_at={}",
            mint_state.mint,
            mint_state.owner,
            mint_state.is_minted,
            mint_state.minted_at
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + CollectionConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, CollectionConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub config: Account<'info, CollectionConfig>,
    /// CHECK: We only persist this key as a logical mint identifier.
    pub mint: UncheckedAccount<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + MintState::INIT_SPACE,
        seeds = [b"mint_state", mint.key().as_ref()],
        bump
    )]
    pub mint_state: Account<'info, MintState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetMintState<'info> {
    pub mint_state: Account<'info, MintState>,
}

#[account]
#[derive(InitSpace)]
pub struct CollectionConfig {
    pub authority: Pubkey,
    pub total_minted: u64,
    pub max_supply: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct MintState {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub is_minted: bool,
    pub minted_at: i64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Only the config authority can mint.")]
    Unauthorized,
    #[msg("Collection reached max supply.")]
    MaxSupplyReached,
    #[msg("Arithmetic overflow.")]
    ArithmeticOverflow,
}
