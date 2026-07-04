// Part 06 Track B — NFT fee + close client (final solution)
// Lamports-only — runs in Solana Playground without SPL setup.

const logTx = async (label: string, sig: string) => {
  await pg.connection.confirmTransaction(sig, "confirmed");
  const tx = await pg.connection.getTransaction(sig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  console.log(label, tx?.meta?.logMessages ?? []);
};

const deriveConfigPda = () =>
  web3.PublicKey.findProgramAddressSync([Buffer.from("config")], pg.program.programId);

const deriveMintStatePda = (mint: web3.PublicKey) =>
  web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint_state"), mint.toBuffer()],
    pg.program.programId
  );

const treasury = web3.Keypair.generate();
const mintPrice = new BN(500_000);
const [configPda] = deriveConfigPda();

const initSig = await pg.program.methods
  .initializeConfig(mintPrice, treasury.publicKey)
  .accounts({
    authority: pg.wallet.publicKey,
    config: configPda,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("initializeConfig logs:", initSig);

const mint = web3.Keypair.generate();
const [mintStatePda] = deriveMintStatePda(mint.publicKey);
const treasuryBefore = await pg.connection.getBalance(treasury.publicKey);

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
await logTx("mintNft logs:", mintSig);

const treasuryAfter = await pg.connection.getBalance(treasury.publicKey);
console.log("treasury delta lamports:", treasuryAfter - treasuryBefore);

const getSig = await pg.program.methods
  .getMintState()
  .accounts({ mintState: mintStatePda })
  .rpc();
await logTx("getMintState logs:", getSig);

const config = await pg.program.account.collectionConfig.fetch(configPda);
const state = await pg.program.account.mintState.fetch(mintStatePda);
console.log("stored config:", {
  mint_price: config.mintPrice.toString(),
  treasury: config.treasury.toBase58(),
  total_minted: config.totalMinted.toString(),
});
console.log("stored mint state:", {
  mint: state.mint.toBase58(),
  owner: state.owner.toBase58(),
  is_minted: state.isMinted,
});
