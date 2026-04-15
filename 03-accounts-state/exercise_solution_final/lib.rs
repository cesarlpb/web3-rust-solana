/*
  Starting point for final implementation (copied from exercise_solution_base).
  Complete this file during Part 03.
*/
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFLSn");

#[program]
pub mod accounts_state_template {
    use crate::*;

    pub fn initialize_profile(
        ctx: Context<InitializeProfile>,
        name: String,
        age: u8,
    ) -> Result<()> {
        require!(name.as_bytes().len() <= 5, ErrorCode::NameTooLong);

        let profile = &mut ctx.accounts.profile;
        profile.name = name;
        profile.age = age;
        profile.is_active = true;

        msg!(
            "profile initialized: name={}, age={}, is_active={}",
            profile.name,
            profile.age,
            profile.is_active
        );
        Ok(())
    }

    pub fn get_profile(ctx: Context<GetProfile>) -> Result<()> {
        let profile = &ctx.accounts.profile;
        msg!(
            "profile current: name={}, age={}, is_active={}",
            profile.name,
            profile.age,
            profile.is_active
        );
        Ok(())
    }

    pub fn update_name(ctx: Context<UpdateName>, name: String) -> Result<()> {
        require!(name.as_bytes().len() <= 5, ErrorCode::NameTooLong);

        let profile = &mut ctx.accounts.profile;
        let before = profile.name.clone();
        profile.name = name;

        msg!("name before update: {}", before);
        msg!("name after update: {}", profile.name);
        Ok(())
    }

    pub fn update_age(ctx: Context<UpdateAge>, age: u8) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        let before = profile.age;
        profile.age = age;

        msg!("age before update: {}", before);
        msg!("age after update: {}", profile.age);
        Ok(())
    }

    pub fn toggle_active(ctx: Context<ToggleActive>) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        let before = profile.is_active;
        profile.is_active = !profile.is_active;

        msg!("active before toggle: {}", before);
        msg!("active after toggle: {}", profile.is_active);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 19,
    )]
    pub profile: Account<'info, Profile>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetProfile<'info> {
    pub profile: Account<'info, Profile>,
}

#[derive(Accounts)]
pub struct UpdateName<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub profile: Account<'info, Profile>,
}

#[derive(Accounts)]
pub struct UpdateAge<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub profile: Account<'info, Profile>,
}

#[derive(Accounts)]
pub struct ToggleActive<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub profile: Account<'info, Profile>,
}

#[account]
pub struct Profile {
    pub name: String,
    pub age: u8,
    pub is_active: bool,
}

// Hint:
// max 5 ASCII chars for name:
// space = 8 (discriminator) + (4 + 5) + 1 (u8) + 1 (bool) = 19 bytes

#[error_code]
pub enum ErrorCode {
    #[msg("Name must be 5 bytes or less.")]
    NameTooLong,
}
