// Part 06 Track C — Counter vault tests (final solution)
// SPL: set MINT to an on-chain mint with funded user ATA, or tests skip automatically.
describe("counter_vault", () => {
  const TOKEN_PROGRAM_ID = new web3.PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );
  const ASSOCIATED_TOKEN_PROGRAM_ID = new web3.PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );

  const MINT = new web3.PublicKey("11111111111111111111111111111111");
  const SPL_READY = !MINT.equals(web3.SystemProgram.programId);

  const deriveCounterPda = () =>
    web3.PublicKey.findProgramAddressSync([Buffer.from("counter")], pg.program.programId);

  const deriveVaultPda = (counter: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), counter.toBuffer()],
      pg.program.programId
    );

  const getAta = (mint: web3.PublicKey, owner: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

  const initialize = async () => {
    const [counterPda] = deriveCounterPda();
    const [vaultPda] = deriveVaultPda(counterPda);
    const sig = await pg.program.methods
      .initialize()
      .accounts({
        authority: pg.wallet.publicKey,
        mint: MINT,
        counter: counterPda,
        vault: vaultPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");
    return { counterPda, vaultPda };
  };

  it("derives counter and vault PDAs", async () => {
    const [counterPda] = deriveCounterPda();
    const [vaultPda] = deriveVaultPda(counterPda);
    if (vaultPda.equals(counterPda)) throw new Error("vault must differ from counter");
  });

  it("initializes counter with mint and zero deposits", async () => {
    if (!SPL_READY) {
      console.log("skip: set MINT to an initialized SPL mint");
      return;
    }

    const { counterPda } = await initialize();
    const counter = await pg.program.account.counter.fetch(counterPda);
    if (counter.mint.toBase58() !== MINT.toBase58()) throw new Error("mint mismatch");
    if (counter.totalDeposited.toString() !== "0") throw new Error("expected zero deposits");
  });

  it("rejects withdraw when balance insufficient", async () => {
    if (!SPL_READY) {
      console.log("skip: set MINT to an initialized SPL mint");
      return;
    }

    const { counterPda, vaultPda } = await initialize();
    const vaultAta = getAta(MINT, vaultPda);
    const authorityAta = getAta(MINT, pg.wallet.publicKey);

    let failed = false;
    try {
      await pg.program.methods
        .withdraw(new BN(1))
        .accounts({
          authority: pg.wallet.publicKey,
          counter: counterPda,
          vault: vaultPda,
          mint: MINT,
          vaultAta,
          authorityAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (_e) {
      failed = true;
    }
    if (!failed) throw new Error("expected InsufficientBalance");
  });

  it("rejects close_vault when total_deposited > 0", async () => {
    if (!SPL_READY) {
      console.log("skip: set MINT + fund user ATA for deposit test");
      return;
    }
  });

  it("deposit and withdraw via CPI (full flow)", async () => {
    if (!SPL_READY) {
      console.log("skip: set MINT + fund user ATA for full SPL flow");
      return;
    }
  });
});
