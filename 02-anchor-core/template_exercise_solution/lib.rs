/*
  Template only (no final solution):
  Build a Profile account with:
  - name: String (max 5 ASCII chars)
  - age: u8
  - is_active: bool

  Implement:
  - initialize_profile(name, age)
  - update_name(name)
  - toggle_active()
  - get_profile()  // logs current state
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod solution_template {
    use crate::*;

    pub fn initialize_profile(
        _ctx: Context<InitializeProfile>,
        _name: String,
        _age: u8,
    ) -> Result<()> {
        // TODO:
        // 1) validate name length <= 5 bytes
        // 2) assign name, age
        // 3) set is_active = true
        todo!("student exercise: initialize_profile");
    }

    pub fn update_name(_ctx: Context<UpdateName>, _name: String) -> Result<()> {
        // TODO:
        // 1) validate name length <= 5 bytes
        // 2) update only `name`
        todo!("student exercise: update_name");
    }

    pub fn toggle_active(_ctx: Context<ToggleActive>) -> Result<()> {
        // TODO: flip boolean value
        todo!("student exercise: toggle_active");
    }

    pub fn get_profile(_ctx: Context<GetProfile>) -> Result<()> {
        // TODO: log current fields (name, age, is_active) using msg!
        todo!("student exercise: get_profile");
    }
}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    // TODO:
    // - signer must be mutable
    // - profile account must use init + payer + correct space
    // - include system_program
}

#[derive(Accounts)]
pub struct UpdateName<'info> {
    // TODO: signer + mutable profile account
}

#[derive(Accounts)]
pub struct ToggleActive<'info> {
    // TODO: signer + mutable profile account
}

#[derive(Accounts)]
pub struct GetProfile<'info> {
    // TODO: read-only profile account
}

#[account]
pub struct Profile {
    // TODO:
    // pub name: String,
    // pub age: u8,
    // pub is_active: bool,
}

// Hint for space with max 5 ASCII chars:
// discriminator(8) + string(4 + 5) + u8(1) + bool(1) = 19 bytes
