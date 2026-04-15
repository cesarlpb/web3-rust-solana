/*
  Template only (no final solution):
  Suggested flow:
  1) generate profile keypair
  2) initialize_profile("alice", 20)
  3) get_profile()
  4) update_name("bob"), then getter
  5) update_age(21), then getter
  6) toggle_active(), then getter
*/

// TODO: create keypair for profile account
// const profile = web3.Keypair.generate();
// const profilePubkey = profile.publicKey;

// TODO: initialize profile
// await pg.program.methods
//   .initializeProfile("alice", 20)
//   .accounts({
//     signer: pg.wallet.publicKey,
//     profile: profilePubkey,
//     systemProgram: web3.SystemProgram.programId,
//   })
//   .signers([profile])
//   .rpc();

// TODO: call getProfile() and inspect logs
// TODO: call updateName("bob"), then getProfile()
// TODO: call updateAge(21), then getProfile()
// TODO: call toggleActive(), then getProfile()
// TODO: after each tx, confirm and print logMessages

throw new Error("TODO: complete 03-accounts-state/template_exercise_solution/client.ts");
