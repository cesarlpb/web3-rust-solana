// Part 06 Track A — Auction Vault (starting code)
// Extend Part 05 auction: bids move SPL tokens into a vault PDA; settlement pays the winner.
//
// PDAs:
//   Auction  ["auction", creator, auction_id]
//   Vault    ["vault", auction]
//   Bid      ["bid", auction, bidder]
//   vault_ata: ATA owned by Vault PDA, mint = auction.mint
//
// create_auction — store mint on Auction; init Vault PDA + bump
// place_bid      — token::transfer CPI (bidder_ata -> vault_ata, bidder signs); emit BidPlaced
// settle_auction — creator only; token::transfer with new_with_signer (vault_ata -> winner_ata);
//                  set is_settled; emit AuctionSettled
//
// Errors: BidTooLow, AuctionEnded, Unauthorized, InvalidMint, InvalidVault, NoBids
// Also: #[event], anchor-spl in Cargo.toml, tests (happy path + BidTooLow)
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod auction_vault {
    use crate::*;

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        auction_id: u64,
        _mint: Pubkey,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        auction.creator = ctx.accounts.creator.key();
        auction.auction_id = auction_id;
        auction.current_highest = 0;
        auction.highest_bidder = Pubkey::default();
        auction.is_settled = false;
        auction.created_at = Clock::get()?.unix_timestamp;
        auction.bump = ctx.bumps.auction;

        // TODO Part 06: store mint on auction, init Vault PDA (bump on vault account)
        todo!("Part 06: init vault PDA + store mint on auction");
    }

    pub fn place_bid(ctx: Context<PlaceBid>, amount: u64) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        require!(!auction.is_settled, ErrorCode::AuctionEnded);
        require!(amount > auction.current_highest, ErrorCode::BidTooLow);

        // TODO Part 06: SPL token::transfer CPI (bidder_ata -> vault_ata) before updating state
        // TODO Part 06: emit!(BidPlaced { ... });

        let bid = &mut ctx.accounts.bid;
        bid.auction = auction.key();
        bid.bidder = ctx.accounts.bidder.key();
        bid.amount = amount;
        bid.last_bid_at = Clock::get()?.unix_timestamp;
        bid.bump = ctx.bumps.bid;

        auction.current_highest = amount;
        auction.highest_bidder = ctx.accounts.bidder.key();
        Ok(())
    }

    pub fn settle_auction(_ctx: Context<SettleAuction>) -> Result<()> {
        // TODO Part 06: PDA-signed token::transfer (vault_ata -> winner_ata)
        // TODO Part 06: mark auction settled; emit event if desired
        todo!("Part 06: settle_auction with invoke_signed CPI");
    }
}

#[derive(Accounts)]
#[instruction(auction_id: u64, mint: Pubkey)]
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
    // TODO Part 06: vault PDA init, mint account, token programs as needed
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
    // TODO Part 06: vault, bidder_ata, vault_ata, mint, token_program, associated_token_program
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    pub creator: Signer<'info>,
    #[account(mut, has_one = creator @ ErrorCode::Unauthorized)]
    pub auction: Account<'info, Auction>,
    // TODO Part 06: vault PDA, vault_ata, winner_ata, mint, token_program
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

// TODO Part 06: #[event] BidPlaced { ... }

#[error_code]
pub enum ErrorCode {
    #[msg("Bid must be strictly greater than current highest bid.")]
    BidTooLow,
    #[msg("Auction has ended or is settled.")]
    AuctionEnded,
    #[msg("Only the auction creator can settle.")]
    Unauthorized,
}
