/*
  Template only (no final solution):
  Final Project Track A — NFT Flow tests.
*/
describe("nft_flow", () => {
  const deriveConfigPda = () =>
    web3.PublicKey.findProgramAddressSync([Buffer.from("config")], pg.program.programId);

  const deriveMintStatePda = (mint: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint_state"), mint.toBuffer()],
      pg.program.programId
    );

  it("initializes config", async () => {
    const [configPda] = deriveConfigPda();

    const sig = await pg.program.methods
      .initializeConfig()
      .accounts({
        authority: pg.wallet.publicKey,
        config: configPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");

    const config = await pg.program.account.collectionConfig.fetch(configPda);
    if (config.authority.toBase58() !== pg.wallet.publicKey.toBase58()) {
      throw new Error("config authority mismatch");
    }
    if (config.totalMinted.toString() !== "0") throw new Error("expected totalMinted = 0");
    if (config.maxSupply.toString() !== "100") throw new Error("expected maxSupply = 100");
  });

  it("runs mint flow", async () => {
    const [configPda] = deriveConfigPda();
    const mint = web3.Keypair.generate();
    const [mintStatePda] = deriveMintStatePda(mint.publicKey);

    const sig = await pg.program.methods
      .mintNft()
      .accounts({
        authority: pg.wallet.publicKey,
        config: configPda,
        mint: mint.publicKey,
        mintState: mintStatePda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");

    const mintState = await pg.program.account.mintState.fetch(mintStatePda);
    if (mintState.owner.toBase58() !== pg.wallet.publicKey.toBase58()) {
      throw new Error("mint owner mismatch");
    }
    if (!mintState.isMinted) throw new Error("expected minted state to be true");

    const configAfter = await pg.program.account.collectionConfig.fetch(configPda);
    if (configAfter.totalMinted.toString() !== "1") {
      throw new Error(`expected totalMinted = 1, got ${configAfter.totalMinted.toString()}`);
    }
  });

  it("fails on invalid mint path", async () => {
    const [configPda] = deriveConfigPda();
    const mint = web3.Keypair.generate();
    const [mintStatePda] = deriveMintStatePda(mint.publicKey);

    let failed = false;
    try {
      await pg.program.methods
        .mintNft()
        .accounts({
          authority: pg.wallet.publicKey,
          config: configPda,
          mint: mint.publicKey,
          mintState: mintStatePda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    } catch (_err) {
      failed = true;
    }
    if (!failed) throw new Error("expected mint with same mint key to fail");
  });
});
