/*
  Part 02 test that validates initialize + multiple update values.
*/
describe("update_account", () => {
  it("applies updates 11, 42, 99 in order", async () => {
    // generate a new keypair for the new account (PDA-less account)
    const kp = web3.Keypair.generate();

    // send the `initialize` instruction with the signer and new account
    // we need to pass the signer and new account to the instruction, and the 
    // system program is required for the instruction to be executed (CPI flow):
    const initSig = await pg.program.methods
      .initialize(new BN(7))
      .accounts({
        signer: pg.wallet.publicKey,
        newAccount: kp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([kp])
      .rpc();
    // check if the signature is present, if it's not, throw an error:
    if (!initSig) throw new Error("missing initialize signature");
    // confirm the transaction
    await pg.connection.confirmTransaction(initSig, "confirmed");

    // send the `update` instruction with the signer and new account
    // we need to pass the signer and new account to the instruction, and the 
    // system program is required for the instruction to be executed (CPI flow):
    const updates = [11, 42, 99];
    for (const value of updates) {
      // send the `update` instruction with the signer and new account
      // we need to pass the signer and new account to the instruction, and the 
      // system program is required for the instruction to be executed (CPI flow):
      const updateSig = await pg.program.methods
        .update(new BN(value))
        .accounts({
          signer: pg.wallet.publicKey,
          newAccount: kp.publicKey,
        })
        .rpc();
      if (!updateSig) throw new Error(`missing update signature for value ${value}`);
      await pg.connection.confirmTransaction(updateSig, "confirmed");

      // check if the stored data is the expected value
      const stored = await pg.program.account.newAccount.fetch(kp.publicKey);
      // if the stored data is not the expected value, throw an error:
      if (stored.data.toNumber() !== value) {
        throw new Error(`expected ${value}, got ${stored.data.toNumber()}`);
      }
    }
  });
});
