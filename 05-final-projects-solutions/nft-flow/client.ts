/*
  Template only (no final solution):
  Final Project Track A — NFT Flow client skeleton.
*/

const logTx = async (label: string, sig: string) => {
  await pg.connection.confirmTransaction(sig, "confirmed");
  const tx = await pg.connection.getTransaction(sig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  console.log(label, tx?.meta?.logMessages ?? []);
};

const [configPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  pg.program.programId
);

const mint = web3.Keypair.generate();
const [mintStatePda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("mint_state"), mint.publicKey.toBuffer()],
  pg.program.programId
);

const initSig = await pg.program.methods
  .initializeConfig()
  .accounts({
    authority: pg.wallet.publicKey,
    config: configPda,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("initializeConfig logs:", initSig);

const mintSig = await pg.program.methods
  .mintNft()
  .accounts({
    authority: pg.wallet.publicKey,
    config: configPda,
    mint: mint.publicKey,
    mintState: mintStatePda,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("mintNft logs:", mintSig);

const getSig = await pg.program.methods
  .getMintState()
  .accounts({
    mintState: mintStatePda,
  })
  .rpc();
await logTx("getMintState logs:", getSig);

const config = await pg.program.account.collectionConfig.fetch(configPda);
const state = await pg.program.account.mintState.fetch(mintStatePda);
console.log("stored config:", {
  authority: config.authority.toBase58(),
  total_minted: config.totalMinted.toString(),
  max_supply: config.maxSupply.toString(),
});
console.log("stored mint state:", {
  mint: state.mint.toBase58(),
  owner: state.owner.toBase58(),
  is_minted: state.isMinted,
  minted_at: state.mintedAt.toString(),
});
