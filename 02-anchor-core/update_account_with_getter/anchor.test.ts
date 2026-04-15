/*
  Tests for getter_update_account:
  - verify getter logs initial value
  - verify updates change state
  - verify getter logs the updated value after each change
*/
describe("getter_update_account", () => {
  // Helper: executes getData and returns the numeric value parsed from logs.
  const callGetterAndParseValue = async (pubkey: web3.PublicKey): Promise<number> => {
    const sig = await pg.program.methods
      .getData()
      .accounts({
        newAccount: pubkey,
      })
      .rpc();

    await pg.connection.confirmTransaction(sig, "confirmed");
    const tx = await pg.connection.getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    const logs = tx?.meta?.logMessages ?? [];
    const line = logs.find((entry) => entry.includes("current data ="));
    if (!line) throw new Error("getter log not found");

    const match = line.match(/current data = (\d+)/);
    if (!match) throw new Error(`could not parse getter value from log: ${line}`);
    return Number(match[1]);
  };

  it("validates getter before and after each update", async () => {
    const kp = web3.Keypair.generate();

    const initSig = await pg.program.methods
      .initialize(new BN(7))
      .accounts({
        signer: pg.wallet.publicKey,
        newAccount: kp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([kp])
      .rpc();
    await pg.connection.confirmTransaction(initSig, "confirmed");

    const initialGetterValue = await callGetterAndParseValue(kp.publicKey);
    if (initialGetterValue !== 7) {
      throw new Error(`expected initial getter value 7, got ${initialGetterValue}`);
    }

    const updates = [11, 42, 99];
    let expected = 7;

    for (const value of updates) {
      const beforeValue = await callGetterAndParseValue(kp.publicKey);
      if (beforeValue !== expected) {
        throw new Error(`before update expected ${expected}, got ${beforeValue}`);
      }

      const updateSig = await pg.program.methods
        .update(new BN(value))
        .accounts({
          signer: pg.wallet.publicKey,
          newAccount: kp.publicKey,
        })
        .rpc();
      await pg.connection.confirmTransaction(updateSig, "confirmed");

      const afterValue = await callGetterAndParseValue(kp.publicKey);
      if (afterValue !== value) {
        throw new Error(`after update expected ${value}, got ${afterValue}`);
      }

      expected = value;
    }
  });
});
