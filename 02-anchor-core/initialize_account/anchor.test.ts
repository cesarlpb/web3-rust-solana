/*
  Part 02 test that verifies `initialize` runs with signer and new account.
  - Generates a new keypair for the new account.
  - Sends the `initialize` instruction with the signer and new account.
  - Verifies the transaction signature is present.
*/
describe("initialize", () => {
  it("sets data", async () => {
    // generate a new keypair for the new account (PDA-less account)
    // we are not using PDAs in this example, so we are generating a new keypair:
    const kp = Keypair.generate();
    // send the `initialize` instruction with the signer and new account
    // we need to pass the signer and new account to the instruction, and the 
    // system program is required for the instruction to be executed (CPI flow):
    const sig = await pg.program.methods
      .initialize(new BN(7))
      .accounts({
        signer: pg.wallet.publicKey,
        newAccount: kp.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([kp])
      .rpc();
    // check if the signature is present, if it's not, throw an error:
    if (!sig) throw new Error("no signature");
    // if the signature is present, the test passes
  });
});
