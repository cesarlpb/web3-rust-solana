/*
  Template only (no final solution):
  Final Project Track B — Auction dApp.
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod auction_dapp {
    use crate::*;

    pub fn create_auction(_ctx: Context<CreateAuction>, _auction_id: u64) -> Result<()> {
        // TODO: initialize auction state
        todo!("student project: create_auction");
    }

    pub fn place_bid(_ctx: Context<PlaceBid>, _amount: u64) -> Result<()> {
        // TODO: validate and store bid state
        todo!("student project: place_bid");
    }

    pub fn settle_auction(_ctx: Context<SettleAuction>) -> Result<()> {
        // TODO: finalize auction and enforce end-state rules
        todo!("student project: settle_auction");
    }
}

#[derive(Accounts)]
pub struct CreateAuction<'info> {
    // TODO: signer + auction PDA init + system_program
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    // TODO: bidder signer + auction account + bid PDA (+ optional vault)
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    // TODO: authority/signer + auction state + bid/vault accounts
}

#[account]
pub struct Auction {
    // TODO: creator, auction_id, current_highest, status, etc.
}

#[account]
pub struct Bid {
    // TODO: auction, bidder, amount, timestamp, etc.
}
