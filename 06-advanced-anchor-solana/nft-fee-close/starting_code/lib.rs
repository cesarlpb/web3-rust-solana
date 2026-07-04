// Part 06 Track B — NFT mint fee + close (starting code)
// Extend Part 05 NFT flow: charge lamports on mint (System CPI) + authority-only config close.
//
// PDAs:
//   CollectionConfig  ["config"]
//   MintState         ["mint_state", mint_pubkey]
//
// initialize_config — store authority, treasury, mint_price, max_supply
// mint_nft          — require !sold_out; system_program::transfer CPI (minter -> treasury);
//                     init MintState; increment total_minted; emit NftMinted
// close_config      — authority only; close config PDA to authority (rent recovery);
//                     require total_minted == 0
// get_mint_state    — already provided (logs)
//
// Errors: Unauthorized, SoldOut, InvalidTreasury, ConfigNotEmpty, ArithmeticOverflow
// Also: #[event], tests (happy path + SoldOut or Unauthorized), architecture-notes.md
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod nft_fee_close {
    use crate::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        mint_price: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = treasury;
        config.mint_price = mint_price;
        config.total_minted = 0;
        config.max_supply = 100;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require!(
            config.total_minted < config.max_supply,
            ErrorCode::SoldOut
        );

        // TODO Part 06: system_program::transfer CPI (minter -> treasury) for mint_price
        // TODO Part 06: emit!(NftMinted { ... });

        let mint_state = &mut ctx.accounts.mint_state;
        mint_state.mint = ctx.accounts.mint.key();
        mint_state.owner = ctx.accounts.minter.key();
        mint_state.is_minted = true;
        mint_state.minted_at = Clock::get()?.unix_timestamp;
        mint_state.bump = ctx.bumps.mint_state;

        config.total_minted = config
            .total_minted
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        Ok(())
    }

    pub fn close_config(_ctx: Context<CloseConfig>) -> Result<()> {
        // TODO Part 06: close config PDA to authority (rent recovery)
        todo!("Part 06: close_config with close = authority");
    }

    pub fn get_mint_state(ctx: Context<GetMintState>) -> Result<()> {
        let s = &ctx.accounts.mint_state;
        msg!(
            "mint_state: mint={}, owner={}, is_minted={}",
            s.mint,
            s.owner,
            s.is_minted
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
    pub minter: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub config: Account<'info, CollectionConfig>,
    /// CHECK: config authority for has_one; minter may differ in your design
    pub authority: UncheckedAccount<'info>,
    /// CHECK: logical mint id
    pub mint: UncheckedAccount<'info>,
    #[account(
        init,
        payer = minter,
        space = 8 + MintState::INIT_SPACE,
        seeds = [b"mint_state", mint.key().as_ref()],
        bump
    )]
    pub mint_state: Account<'info, MintState>,
    /// CHECK: receives mint_price lamports
    #[account(mut, address = config.treasury @ ErrorCode::InvalidTreasury)]
    pub treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseConfig<'info> {
    // TODO Part 06: authority signer + config with close = authority
}

#[derive(Accounts)]
pub struct GetMintState<'info> {
    pub mint_state: Account<'info, MintState>,
}

#[account]
#[derive(InitSpace)]
pub struct CollectionConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub mint_price: u64,
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

// TODO Part 06: #[event] NftMinted { ... }

#[error_code]
pub enum ErrorCode {
    #[msg("Only the config authority can perform this action.")]
    Unauthorized,
    #[msg("Collection sold out.")]
    SoldOut,
    #[msg("Arithmetic overflow.")]
    ArithmeticOverflow,
    #[msg("Treasury account does not match config.")]
    InvalidTreasury,
}
