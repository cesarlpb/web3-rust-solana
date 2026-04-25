/*
  Template only (no final solution):
  Final Project Track B — Auction dApp.
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod auction_dapp {
    use crate::*;

    pub fn create_auction(ctx: Context<CreateAuction>, auction_id: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        auction.creator = ctx.accounts.creator.key();
        auction.auction_id = auction_id;
        auction.current_highest = 0;
        auction.highest_bidder = Pubkey::default();
        auction.is_settled = false;
        auction.created_at = Clock::get()?.unix_timestamp;
        auction.bump = ctx.bumps.auction;

        msg!(
            "auction created: creator={}, auction_id={}",
            auction.creator,
            auction.auction_id
        );
        Ok(())
    }

    pub fn place_bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        require!(!auction.is_settled, ErrorCode::AuctionAlreadySettled);
        require!(amount > auction.current_highest, ErrorCode::BidTooLow);

        let bid = &mut ctx.accounts.bid;
        bid.auction = auction.key();
        bid.bidder = ctx.accounts.bidder.key();
        bid.amount = amount;
        bid.last_bid_at = Clock::get()?.unix_timestamp;
        bid.bump = ctx.bumps.bid;

        auction.current_highest = amount;
        auction.highest_bidder = ctx.accounts.bidder.key();

        msg!(
            "bid placed: bidder={}, amount={}, auction={}",
            bid.bidder,
            bid.amount,
            bid.auction
        );
        Ok(())
    }

    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        require!(!auction.is_settled, ErrorCode::AuctionAlreadySettled);
        auction.is_settled = true;

        msg!(
            "auction settled: auction_id={}, winner={}, amount={}",
            auction.auction_id,
            auction.highest_bidder,
            auction.current_highest
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(auction_id: u64)]
pub struct CreateAuction<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = 8 + Auction::INIT_SPACE,
        seeds = [b"auction", creator.key().as_ref(), &auction_id.to_le_bytes()],
        bump
    )]
    pub auction: Account<'info, Auction>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(
        init_if_needed,
        payer = bidder,
        space = 8 + Bid::INIT_SPACE,
        seeds = [b"bid", auction.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub bid: Account<'info, Bid>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    pub creator: Signer<'info>,
    #[account(mut, has_one = creator @ ErrorCode::Unauthorized)]
    pub auction: Account<'info, Auction>,
}

#[account]
#[derive(InitSpace)]
pub struct Auction {
    pub creator: Pubkey,
    pub auction_id: u64,
    pub current_highest: u64,
    pub highest_bidder: Pubkey,
    pub is_settled: bool,
    pub created_at: i64,
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

#[error_code]
pub enum ErrorCode {
    #[msg("Bid must be strictly greater than current highest bid.")]
    BidTooLow,
    #[msg("Auction has already been settled.")]
    AuctionAlreadySettled,
    #[msg("Only the auction creator can settle.")]
    Unauthorized,
}
