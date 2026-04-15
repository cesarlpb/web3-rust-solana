/*
  Template only (no final solution):
  Part 03 — Accounts as state lifecycle.

  Build:
  - initialize_profile(name: String, age: u8)
  - get_profile()
  - update_name(name: String)
  - update_age(age: u8)
  - toggle_active()
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod accounts_state_template {
    use crate::*;

    pub fn initialize_profile(
        _ctx: Context<InitializeProfile>,
        _name: String,
        _age: u8,
    ) -> Result<()> {
        // TODO:
        // 1) validate name length <= 5 bytes (ASCII assumption)
        // 2) set profile.name and profile.age
        // 3) set profile.is_active = true
        // 4) log initialized values
        todo!("student exercise: initialize_profile");
    }

    pub fn get_profile(_ctx: Context<GetProfile>) -> Result<()> {
        // TODO:
        // 1) read all fields: name, age, is_activef´´´ç
        // 2) log full current profile with msg!
        todo!("student exercise: get_profile");
    }

    pub fn update_name(_ctx: Context<UpdateName>, _name: String) -> Result<()> {
        // TODO:
        // 1) validate name length <= 5 bytes
        // 2) update only profile.name
        // 3) keep age and is_active unchanged
        // 4) log before/after name
        todo!("student exercise: update_name");
    }

    pub fn update_age(_ctx: Context<UpdateAge>, _age: u8) -> Result<()> {
        // TODO:
        // 1) update only profile.age
        // 2) keep name and is_active unchanged
        // 3) log before/after age
        todo!("student exercise: update_age");
    }

    pub fn toggle_active(_ctx: Context<ToggleActive>) -> Result<()> {
        // TODO:
        // 1) flip profile.is_active
        // 2) log before/after active flag
        todo!("student exercise: toggle_active");
    }
}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    // TODO:
    // - mutable signer
    // - init profile account with payer + space
    // - include system_program
}

#[derive(Accounts)]
pub struct GetProfile<'info> {
    // TODO: read-only profile account
}

#[derive(Accounts)]
pub struct UpdateName<'info> {
    // TODO:
    // - signer
    // - mutable profile account
}

#[derive(Accounts)]
pub struct UpdateAge<'info> {
    // TODO:
    // - signer
    // - mutable profile account
}

#[derive(Accounts)]
pub struct ToggleActive<'info> {
    // TODO:
    // - signer
    // - mutable profile account
}

#[account]
pub struct Profile {
    // TODO:
    // pub name: String,
    // pub age: u8,
    // pub is_active: bool,
}

// Hint:
// max 5 ASCII chars for name:
// space = 8 (discriminator) + (4 + 5) + 1 (u8) + 1 (bool) = 19 bytes
