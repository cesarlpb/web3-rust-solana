// Part 06 Track B — NFT mint fee + close (final solution)
use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod nft_fee_close {
    use super::*;

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

        let price = config.mint_price;
        if price > 0 {
            let cpi = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.minter.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            );
            system_program::transfer(cpi, price)?;
        }

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

        emit!(NftMinted {
            mint: mint_state.mint,
            minter: mint_state.owner,
            fee_paid: price,
        });
        Ok(())
    }

    pub fn close_config(ctx: Context<CloseConfig>) -> Result<()> {
        let config = &ctx.accounts.config;
        require!(config.total_minted == 0, ErrorCode::ConfigNotEmpty);
        Ok(())
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
    #[account(mut, seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, CollectionConfig>,
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
    /// CHECK: treasury from config
    #[account(mut, address = config.treasury @ ErrorCode::InvalidTreasury)]
    pub treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        close = authority,
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub config: Account<'info, CollectionConfig>,
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

#[event]
pub struct NftMinted {
    pub mint: Pubkey,
    pub minter: Pubkey,
    pub fee_paid: u64,
}

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
    #[msg("Close config only when total_minted is zero.")]
    ConfigNotEmpty,
}
