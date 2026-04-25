/*
  Template only (no final solution):
  Final Project Track B — Auction dApp tests.
*/
describe("auction_dapp", () => {
  const u64Le = (v: bigint) => {
    const out = Buffer.alloc(8);
    out.writeBigUInt64LE(v);
    return out;
  };

  const deriveAuctionPda = (creator: web3.PublicKey, auctionId: bigint) =>
    web3.PublicKey.findProgramAddressSync(
      [Buffer.from("auction"), creator.toBuffer(), u64Le(auctionId)],
      pg.program.programId
    );

  const deriveBidPda = (auction: web3.PublicKey, bidder: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [Buffer.from("bid"), auction.toBuffer(), bidder.toBuffer()],
      pg.program.programId
    );

  it("creates an auction", async () => {
    const auctionId = 1n;
    const [auctionPda] = deriveAuctionPda(pg.wallet.publicKey, auctionId);

    const sig = await pg.program.methods
      .createAuction(new BN(auctionId.toString()))
      .accounts({
        creator: pg.wallet.publicKey,
        auction: auctionPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");

    const auction = await pg.program.account.auction.fetch(auctionPda);
    if (auction.auctionId.toString() !== "1") throw new Error("auction_id mismatch");
    if (auction.currentHighest.toString() !== "0") throw new Error("current_highest mismatch");
    if (auction.isSettled !== false) throw new Error("auction should be open");
  });

  it("places valid bids in order", async () => {
    const auctionId = 2n;
    const [auctionPda] = deriveAuctionPda(pg.wallet.publicKey, auctionId);

    const createSig = await pg.program.methods
      .createAuction(new BN(auctionId.toString()))
      .accounts({
        creator: pg.wallet.publicKey,
        auction: auctionPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(createSig, "confirmed");

    const bidderA = web3.Keypair.generate();
    const bidderB = web3.Keypair.generate();
    for (const bidder of [bidderA, bidderB]) {
      const sig = await pg.connection.requestAirdrop(bidder.publicKey, web3.LAMPORTS_PER_SOL);
      await pg.connection.confirmTransaction(sig, "confirmed");
    }

    const [bidAPda] = deriveBidPda(auctionPda, bidderA.publicKey);
    const [bidBPda] = deriveBidPda(auctionPda, bidderB.publicKey);

    const bid1 = await pg.program.methods
      .placeBid(new BN(10))
      .accounts({
        bidder: bidderA.publicKey,
        auction: auctionPda,
        bid: bidAPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([bidderA])
      .rpc();
    await pg.connection.confirmTransaction(bid1, "confirmed");

    const bid2 = await pg.program.methods
      .placeBid(new BN(20))
      .accounts({
        bidder: bidderB.publicKey,
        auction: auctionPda,
        bid: bidBPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([bidderB])
      .rpc();
    await pg.connection.confirmTransaction(bid2, "confirmed");

    const auction = await pg.program.account.auction.fetch(auctionPda);
    if (auction.currentHighest.toString() !== "20") throw new Error("highest bid should be 20");
    if (auction.highestBidder.toBase58() !== bidderB.publicKey.toBase58()) {
      throw new Error("highest bidder mismatch");
    }
  });

  it("rejects invalid bid and settles auction", async () => {
    const auctionId = 3n;
    const [auctionPda] = deriveAuctionPda(pg.wallet.publicKey, auctionId);

    const createSig = await pg.program.methods
      .createAuction(new BN(auctionId.toString()))
      .accounts({
        creator: pg.wallet.publicKey,
        auction: auctionPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(createSig, "confirmed");

    const bidderA = web3.Keypair.generate();
    const bidderB = web3.Keypair.generate();
    for (const bidder of [bidderA, bidderB]) {
      const sig = await pg.connection.requestAirdrop(bidder.publicKey, web3.LAMPORTS_PER_SOL);
      await pg.connection.confirmTransaction(sig, "confirmed");
    }

    const [bidAPda] = deriveBidPda(auctionPda, bidderA.publicKey);
    const [bidBPda] = deriveBidPda(auctionPda, bidderB.publicKey);

    const validBidSig = await pg.program.methods
      .placeBid(new BN(15))
      .accounts({
        bidder: bidderA.publicKey,
        auction: auctionPda,
        bid: bidAPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([bidderA])
      .rpc();
    await pg.connection.confirmTransaction(validBidSig, "confirmed");

    let failed = false;
    try {
      await pg.program.methods
        .placeBid(new BN(10))
        .accounts({
          bidder: bidderB.publicKey,
          auction: auctionPda,
          bid: bidBPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([bidderB])
        .rpc();
    } catch (_err) {
      failed = true;
    }
    if (!failed) throw new Error("expected lower bid to fail");

    const settleSig = await pg.program.methods
      .settleAuction()
      .accounts({
        creator: pg.wallet.publicKey,
        auction: auctionPda,
      })
      .rpc();
    await pg.connection.confirmTransaction(settleSig, "confirmed");

    const auction = await pg.program.account.auction.fetch(auctionPda);
    if (!auction.isSettled) throw new Error("auction should be settled");
  });
});
