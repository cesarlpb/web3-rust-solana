/*
  Template only (no final solution):
  Suggested client flow:
  1) create keypair for profile account
  2) call initialize_profile("alice", 20)
  3) call get_profile()
  4) call update_name("bob")
  5) call get_profile()
  6) call toggle_active()
  7) call get_profile()
*/

// TODO: create keypair and public key
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

// TODO: call getter/update/toggle in sequence
// Tip: after each tx, confirm and inspect logs:
// const txDetails = await pg.connection.getTransaction(sig, {
//   commitment: "confirmed",
//   maxSupportedTransactionVersion: 0,
// });
// console.log(txDetails?.meta?.logMessages);

throw new Error("TODO: complete client.ts");
