const tx = await pg.program.methods
  .initialize(new BN(42))
  .accounts({
    signer: pg.wallet.publicKey,
    newAccount: newAccountPubkey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

await pg.connection.confirmTransaction(tx, "confirmed");
