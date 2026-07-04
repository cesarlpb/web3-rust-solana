// Part 06 Track B — NFT fee + close tests (final solution)
// Lamports-only — runs in Solana Playground without SPL setup.
describe("nft_fee_close", () => {
  const deriveConfigPda = () =>
    web3.PublicKey.findProgramAddressSync([Buffer.from("config")], pg.program.programId);

  const deriveMintStatePda = (mint: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint_state"), mint.toBuffer()],
      pg.program.programId
    );

  it("initializes config with mint_price and treasury", async () => {
    const treasury = web3.Keypair.generate();
    const [configPda] = deriveConfigPda();
    const price = new BN(500_000);

    const sig = await pg.program.methods
      .initializeConfig(price, treasury.publicKey)
      .accounts({
        authority: pg.wallet.publicKey,
        config: configPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");

    const config = await pg.program.account.collectionConfig.fetch(configPda);
    if (config.mintPrice.toString() !== price.toString()) {
      throw new Error("mint_price mismatch");
    }
    if (config.treasury.toBase58() !== treasury.publicKey.toBase58()) {
      throw new Error("treasury mismatch");
    }
  });

  it("charges mint_price to treasury on mint", async () => {
    const treasury = web3.Keypair.generate();
    const [configPda] = deriveConfigPda();
    const price = new BN(250_000);

    const initSig = await pg.program.methods
      .initializeConfig(price, treasury.publicKey)
      .accounts({
        authority: pg.wallet.publicKey,
        config: configPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(initSig, "confirmed");

    const before = await pg.connection.getBalance(treasury.publicKey);
    const mint = web3.Keypair.generate();
    const [mintStatePda] = deriveMintStatePda(mint.publicKey);

    const mintSig = await pg.program.methods
      .mintNft()
      .accounts({
        minter: pg.wallet.publicKey,
        config: configPda,
        mint: mint.publicKey,
        mintState: mintStatePda,
        treasury: treasury.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(mintSig, "confirmed");

    const after = await pg.connection.getBalance(treasury.publicKey);
    if (after - before !== price.toNumber()) {
      throw new Error(`expected treasury +${price}, got +${after - before}`);
    }
  });

  it("rejects close_config when mints exist (ConfigNotEmpty)", async () => {
    const [configPda] = deriveConfigPda();
    const treasury = pg.wallet.publicKey;

    const initSig = await pg.program.methods
      .initializeConfig(new BN(0), treasury)
      .accounts({
        authority: pg.wallet.publicKey,
        config: configPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(initSig, "confirmed");

    const mint = web3.Keypair.generate();
    const [mintStatePda] = deriveMintStatePda(mint.publicKey);
    const mintSig = await pg.program.methods
      .mintNft()
      .accounts({
        minter: pg.wallet.publicKey,
        config: configPda,
        mint: mint.publicKey,
        mintState: mintStatePda,
        treasury,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(mintSig, "confirmed");

    let failed = false;
    try {
      await pg.program.methods
        .closeConfig()
        .accounts({
          authority: pg.wallet.publicKey,
          config: configPda,
        })
        .rpc();
    } catch (_e) {
      failed = true;
    }
    if (!failed) throw new Error("expected ConfigNotEmpty when closing after mint");
  });

  it("closes config and returns rent to authority", async () => {
    const [configPda] = deriveConfigPda();
    const treasury = pg.wallet.publicKey;

    const initSig = await pg.program.methods
      .initializeConfig(new BN(0), treasury)
      .accounts({
        authority: pg.wallet.publicKey,
        config: configPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(initSig, "confirmed");

    const before = await pg.connection.getBalance(pg.wallet.publicKey);
    const closeSig = await pg.program.methods
      .closeConfig()
      .accounts({
        authority: pg.wallet.publicKey,
        config: configPda,
      })
      .rpc();
    await pg.connection.confirmTransaction(closeSig, "confirmed");

    const after = await pg.connection.getBalance(pg.wallet.publicKey);
    if (after <= before) throw new Error("expected rent returned to authority");

    let missing = false;
    try {
      await pg.program.account.collectionConfig.fetch(configPda);
    } catch (_e) {
      missing = true;
    }
    if (!missing) throw new Error("config account should be closed");
  });
});
