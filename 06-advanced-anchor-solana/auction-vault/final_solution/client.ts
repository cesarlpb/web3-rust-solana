// Part 06 Track A — Auction vault client (final solution)
// Requires: SPL mint on-chain + funded bidder ATA (Playground Token tab or local spl-token).
// Set MINT to your mint pubkey before running.

const TOKEN_PROGRAM_ID = new web3.PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new web3.PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

// Replace with an initialized mint (fund bidder ATA before placeBid):
const MINT = new web3.PublicKey("11111111111111111111111111111111");

const u64Le = (v: bigint) => {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(v);
  return out;
};

const getAta = (mint: web3.PublicKey, owner: web3.PublicKey) =>
  web3.PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

const logTx = async (label: string, sig: string) => {
  await pg.connection.confirmTransaction(sig, "confirmed");
  const tx = await pg.connection.getTransaction(sig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  console.log(label, tx?.meta?.logMessages ?? []);
};

const auctionId = 42n;
const [auctionPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("auction"), pg.wallet.publicKey.toBuffer(), u64Le(auctionId)],
  pg.program.programId
);
const [vaultPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), auctionPda.toBuffer()],
  pg.program.programId
);

const bidder = web3.Keypair.generate();
const airdropSig = await pg.connection.requestAirdrop(
  bidder.publicKey,
  web3.LAMPORTS_PER_SOL
);
await pg.connection.confirmTransaction(airdropSig, "confirmed");

const [bidPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("bid"), auctionPda.toBuffer(), bidder.publicKey.toBuffer()],
  pg.program.programId
);

const vaultAta = getAta(MINT, vaultPda);
const bidderAta = getAta(MINT, bidder.publicKey);
const winnerAta = getAta(MINT, bidder.publicKey);

const createSig = await pg.program.methods
  .createAuction(new BN(auctionId.toString()))
  .accounts({
    creator: pg.wallet.publicKey,
    mint: MINT,
    auction: auctionPda,
    vault: vaultPda,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("createAuction logs:", createSig);

const bidSig = await pg.program.methods
  .placeBid(new BN(25))
  .accounts({
    bidder: bidder.publicKey,
    auction: auctionPda,
    vault: vaultPda,
    bid: bidPda,
    mint: MINT,
    bidderAta,
    vaultAta,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([bidder])
  .rpc();
await logTx("placeBid logs:", bidSig);

const settleSig = await pg.program.methods
  .settleAuction()
  .accounts({
    creator: pg.wallet.publicKey,
    auction: auctionPda,
    vault: vaultPda,
    winner: bidder.publicKey,
    mint: MINT,
    vaultAta,
    winnerAta,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  })
  .rpc();
await logTx("settleAuction logs:", settleSig);

const auction = await pg.program.account.auction.fetch(auctionPda);
console.log("stored auction:", {
  mint: auction.mint.toBase58(),
  current_highest: auction.currentHighest.toString(),
  highest_bidder: auction.highestBidder.toBase58(),
  is_settled: auction.isSettled,
});
