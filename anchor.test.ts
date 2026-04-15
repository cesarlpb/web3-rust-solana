describe("initialize", () => {
  it("sets data", async () => {
    const kp = Keypair.generate();
    const sig = await pg.program.methods
      .initialize(new BN(7))
      .accounts({
        signer: pg.wallet.publicKey,
        newAccount: kp.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([kp])
      .rpc();
    if (!sig) throw new Error("no signature");
  });
});
