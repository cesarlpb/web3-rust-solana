// Part 06 Track A — Auction Vault (final solution)
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod auction_vault {
    use super::*;

    pub fn create_auction(ctx: Context<CreateAuction>, auction_id: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        auction.creator = ctx.accounts.creator.key();
        auction.auction_id = auction_id;
        auction.mint = ctx.accounts.mint.key();
        auction.current_highest = 0;
        auction.highest_bidder = Pubkey::default();
        auction.is_settled = false;
        auction.created_at = Clock::get()?.unix_timestamp;
        auction.bump = ctx.bumps.auction;

        let vault = &mut ctx.accounts.vault;
        vault.auction = auction.key();
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn place_bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        require!(!auction.is_settled, ErrorCode::AuctionEnded);
        require!(amount > auction.current_highest, ErrorCode::BidTooLow);
        require!(ctx.accounts.mint.key() == auction.mint, ErrorCode::InvalidMint);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.bidder_ata.to_account_info(),
                    to: ctx.accounts.vault_ata.to_account_info(),
                    authority: ctx.accounts.bidder.to_account_info(),
                },
            ),
            amount,
        )?;

        let bid = &mut ctx.accounts.bid;
        bid.auction = auction.key();
        bid.bidder = ctx.accounts.bidder.key();
        bid.amount = amount;
        bid.last_bid_at = Clock::get()?.unix_timestamp;
        bid.bump = ctx.bumps.bid;

        auction.current_highest = amount;
        auction.highest_bidder = ctx.accounts.bidder.key();

        emit!(BidPlaced {
            auction: auction.key(),
            bidder: ctx.accounts.bidder.key(),
            amount,
        });
        Ok(())
    }

    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        require!(!auction.is_settled, ErrorCode::AuctionEnded);
        require!(auction.highest_bidder != Pubkey::default(), ErrorCode::NoBids);
        require!(
            ctx.accounts.winner.key() == auction.highest_bidder,
            ErrorCode::Unauthorized
        );

        let amount = auction.current_highest;
        let seeds = &[
            b"vault",
            auction.key().as_ref(),
            &[ctx.accounts.vault.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_ata.to_account_info(),
                    to: ctx.accounts.winner_ata.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        auction.is_settled = true;
        emit!(AuctionSettled {
            auction: auction.key(),
            winner: auction.highest_bidder,
            amount,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(auction_id: u64)]
pub struct CreateAuction<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = creator,
        space = 8 + Auction::INIT_SPACE,
        seeds = [b"auction", creator.key().as_ref(), &auction_id.to_le_bytes()],
        bump
    )]
    pub auction: Account<'info, Auction>,
    #[account(
        init,
        payer = creator,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", auction.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        seeds = [b"vault", auction.key().as_ref()],
        bump = vault.bump,
        has_one = auction @ ErrorCode::InvalidVault
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        init_if_needed,
        payer = bidder,
        space = 8 + Bid::INIT_SPACE,
        seeds = [b"bid", auction.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub bid: Account<'info, Bid>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = bidder
    )]
    pub bidder_ata: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = bidder,
        associated_token::mint = mint,
        associated_token::authority = vault,
    )]
    pub vault_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    pub creator: Signer<'info>,
    #[account(mut, has_one = creator @ ErrorCode::Unauthorized)]
    pub auction: Account<'info, Auction>,
    #[account(
        seeds = [b"vault", auction.key().as_ref()],
        bump = vault.bump,
        has_one = auction @ ErrorCode::InvalidVault
    )]
    pub vault: Account<'info, Vault>,
    /// CHECK: must match auction.highest_bidder (enforced in handler)
    pub winner: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = vault
    )]
    pub vault_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = winner
    )]
    pub winner_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
#[derive(InitSpace)]
pub struct Auction {
    pub creator: Pubkey,
    pub auction_id: u64,
    pub mint: Pubkey,
    pub current_highest: u64,
    pub highest_bidder: Pubkey,
    pub is_settled: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub auction: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bid {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
    pub last_bid_at: i64,
    pub bump: u8,
}

#[event]
pub struct BidPlaced {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct AuctionSettled {
    pub auction: Pubkey,
    pub winner: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Bid must be strictly greater than current highest bid.")]
    BidTooLow,
    #[msg("Auction has ended or is settled.")]
    AuctionEnded,
    #[msg("Only the auction creator can settle.")]
    Unauthorized,
    #[msg("Mint does not match auction mint.")]
    InvalidMint,
    #[msg("Vault does not match auction.")]
    InvalidVault,
    #[msg("No bids to settle.")]
    NoBids,
}
