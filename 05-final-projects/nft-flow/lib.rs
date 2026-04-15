/*
  Template only (no final solution):
  Final Project Track A — NFT Flow.
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod nft_flow {
    use crate::*;

    pub fn initialize_config(_ctx: Context<InitializeConfig>) -> Result<()> {
        // TODO: initialize config state
        todo!("student project: initialize_config");
    }

    pub fn mint_nft(_ctx: Context<MintNft>) -> Result<()> {
        // TODO: implement minimal mint state transition
        todo!("student project: mint_nft");
    }

    pub fn get_mint_state(_ctx: Context<GetMintState>) -> Result<()> {
        // TODO: log current mint state fields
        todo!("student project: get_mint_state");
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    // TODO: signer + config PDA init + system_program
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    // TODO: signer + config PDA + mint state PDA (+ other required accounts)
}

#[derive(Accounts)]
pub struct GetMintState<'info> {
    // TODO: read-only mint state account
}

#[account]
pub struct CollectionConfig {
    // TODO: authority, counters, limits, etc.
}

#[account]
pub struct MintState {
    // TODO: mint key, owner, status flags, timestamps, etc.
}
