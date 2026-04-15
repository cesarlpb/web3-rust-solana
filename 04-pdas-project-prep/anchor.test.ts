/*
  Template only (no final solution):
  Part 04 — Counter with PDA tests.
*/
describe("counter_pda_template", () => {
  const deriveCounterPda = (): web3.PublicKey => {
    const [counterPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("counter"), pg.wallet.publicKey.toBuffer()],
      pg.program.programId
    );
    return counterPda;
  };

  const ensureInitialized = async (counterPda: web3.PublicKey) => {
    try {
      const sig = await pg.program.methods
        .initialize()
        .accounts({
          signer: pg.wallet.publicKey,
          counter: counterPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      await pg.connection.confirmTransaction(sig, "confirmed");
    } catch (_err) {
      // PDA may already exist from a previous run; that's fine for iterative playground tests.
    }
  };

  it("initializes counter PDA", async () => {
    const counterPda = deriveCounterPda();
    await ensureInitialized(counterPda);

    const counter = await pg.program.account.counter.fetch(counterPda);
    if (counter.value.toNumber() < 0) {
      throw new Error(`counter should exist with non-negative value, got ${counter.value.toString()}`);
    }
  });

  it("increments counter and verifies final value", async () => {
    const counterPda = deriveCounterPda();
    await ensureInitialized(counterPda);
    const before = await pg.program.account.counter.fetch(counterPda);
    const beforeValue = before.value.toNumber();

    for (let i = 0; i < 3; i += 1) {
      const sig = await pg.program.methods
        .increment()
        .accounts({
          signer: pg.wallet.publicKey,
          counter: counterPda,
        })
        .rpc();
      await pg.connection.confirmTransaction(sig, "confirmed");
    }

    const counter = await pg.program.account.counter.fetch(counterPda);
    const afterValue = counter.value.toNumber();
    if (afterValue !== beforeValue + 3) {
      throw new Error(
        `expected final value ${beforeValue + 3}, got ${afterValue}`
      );
    }
  });

  it("logs current value in getter", async () => {
    const counterPda = deriveCounterPda();

    const sig = await pg.program.methods
      .getCounter()
      .accounts({
        signer: pg.wallet.publicKey,
        counter: counterPda,
      })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");

    const tx = await pg.connection.getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    const logs = tx?.meta?.logMessages ?? [];
    const hasCounterLog = logs.some((line) => line.includes("counter"));
    if (!hasCounterLog) {
      throw new Error("expected getter logs to include counter value");
    }
  });
});
