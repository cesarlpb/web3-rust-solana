/*
  Template only (no final solution):
  Final Project Track B — Auction dApp client skeleton.
*/

const u64Le = (v: bigint) => {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(v);
  return out;
};

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

const bidder = web3.Keypair.generate();
const airdropSig = await pg.connection.requestAirdrop(bidder.publicKey, web3.LAMPORTS_PER_SOL);
await pg.connection.confirmTransaction(airdropSig, "confirmed");

const [bidPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("bid"), auctionPda.toBuffer(), bidder.publicKey.toBuffer()],
  pg.program.programId
);

const createSig = await pg.program.methods
  .createAuction(new BN(auctionId.toString()))
  .accounts({
    creator: pg.wallet.publicKey,
    auction: auctionPda,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("createAuction logs:", createSig);

const bidSig = await pg.program.methods
  .placeBid(new BN(25))
  .accounts({
    bidder: bidder.publicKey,
    auction: auctionPda,
    bid: bidPda,
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
  })
  .rpc();
await logTx("settleAuction logs:", settleSig);

const auction = await pg.program.account.auction.fetch(auctionPda);
console.log("stored auction:", {
  creator: auction.creator.toBase58(),
  auction_id: auction.auctionId.toString(),
  current_highest: auction.currentHighest.toString(),
  highest_bidder: auction.highestBidder.toBase58(),
  is_settled: auction.isSettled,
});
