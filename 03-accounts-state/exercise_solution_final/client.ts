/*
  Starting point for final implementation (copied from exercise_solution_base).
  Complete this file during Part 03.
*/

const profile = web3.Keypair.generate();
const profilePubkey = profile.publicKey;

const logTx = async (label: string, sig: string) => {
  await pg.connection.confirmTransaction(sig, "confirmed");
  const tx = await pg.connection.getTransaction(sig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  console.log(label, tx?.meta?.logMessages ?? []);
};

const initSig = await pg.program.methods
  .initializeProfile("alice", 20)
  .accounts({
    signer: pg.wallet.publicKey,
    profile: profilePubkey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([profile])
  .rpc();
await logTx("initializeProfile logs:", initSig);

const getInitialSig = await pg.program.methods
  .getProfile()
  .accounts({ profile: profilePubkey })
  .rpc();
await logTx("getProfile (initial) logs:", getInitialSig);

const updateNameSig = await pg.program.methods
  .updateName("bob")
  .accounts({
    signer: pg.wallet.publicKey,
    profile: profilePubkey,
  })
  .rpc();
await logTx("updateName logs:", updateNameSig);

const getAfterNameSig = await pg.program.methods
  .getProfile()
  .accounts({ profile: profilePubkey })
  .rpc();
await logTx("getProfile (after name) logs:", getAfterNameSig);

const updateAgeSig = await pg.program.methods
  .updateAge(21)
  .accounts({
    signer: pg.wallet.publicKey,
    profile: profilePubkey,
  })
  .rpc();
await logTx("updateAge logs:", updateAgeSig);

const getAfterAgeSig = await pg.program.methods
  .getProfile()
  .accounts({ profile: profilePubkey })
  .rpc();
await logTx("getProfile (after age) logs:", getAfterAgeSig);

const toggleSig = await pg.program.methods
  .toggleActive()
  .accounts({
    signer: pg.wallet.publicKey,
    profile: profilePubkey,
  })
  .rpc();
await logTx("toggleActive logs:", toggleSig);

const getAfterToggleSig = await pg.program.methods
  .getProfile()
  .accounts({ profile: profilePubkey })
  .rpc();
await logTx("getProfile (after toggle) logs:", getAfterToggleSig);

const stored = await pg.program.account.profile.fetch(profilePubkey);
console.log("final profile:", {
  name: stored.name,
  age: stored.age,
  is_active: stored.isActive,
});
