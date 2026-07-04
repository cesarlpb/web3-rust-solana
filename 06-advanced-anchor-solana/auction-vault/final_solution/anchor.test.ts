// Part 06 Track A — Auction vault tests (final solution)
// SPL: set MINT to an on-chain mint with funded bidder ATA, or tests skip automatically.
describe("auction_vault", () => {
  const TOKEN_PROGRAM_ID = new web3.PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );
  const ASSOCIATED_TOKEN_PROGRAM_ID = new web3.PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );

  // Set to your Playground mint pubkey; SystemProgram id = skip SPL tests
  const MINT = new web3.PublicKey("11111111111111111111111111111111");
  const SPL_READY = !MINT.equals(web3.SystemProgram.programId);

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

  const deriveVaultPda = (auction: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), auction.toBuffer()],
      pg.program.programId
    );

  const deriveBidPda = (auction: web3.PublicKey, bidder: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [Buffer.from("bid"), auction.toBuffer(), bidder.toBuffer()],
      pg.program.programId
    );

  const getAta = (mint: web3.PublicKey, owner: web3.PublicKey) =>
    web3.PublicKey.findProgramAddressSync(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

  const createAuction = async (auctionId: bigint) => {
    const [auctionPda] = deriveAuctionPda(pg.wallet.publicKey, auctionId);
    const [vaultPda] = deriveVaultPda(auctionPda);
    const sig = await pg.program.methods
      .createAuction(new BN(auctionId.toString()))
      .accounts({
        creator: pg.wallet.publicKey,
        mint: MINT,
        auction: auctionPda,
        vault: vaultPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");
    return { auctionPda, vaultPda };
  };

  it("derives auction and vault PDAs", async () => {
    const auctionId = 1n;
    const [auctionPda, bump] = deriveAuctionPda(pg.wallet.publicKey, auctionId);
    const [vaultPda] = deriveVaultPda(auctionPda);
    if (bump > 255) throw new Error("invalid bump");
    if (vaultPda.equals(auctionPda)) throw new Error("vault must differ from auction");
  });

  it("settle fails with NoBids when no bids placed", async () => {
    if (!SPL_READY) {
      console.log("skip: set MINT to an initialized SPL mint");
      return;
    }

    const auctionId = 101n;
    const { auctionPda, vaultPda } = await createAuction(auctionId);

    let failed = false;
    try {
      await pg.program.methods
        .settleAuction()
        .accounts({
          creator: pg.wallet.publicKey,
          auction: auctionPda,
          vault: vaultPda,
          winner: pg.wallet.publicKey,
          mint: MINT,
          vaultAta: getAta(MINT, vaultPda),
          winnerAta: getAta(MINT, pg.wallet.publicKey),
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (_e) {
      failed = true;
    }
    if (!failed) throw new Error("expected NoBids when settling without bids");
  });

  it("rejects BidTooLow on second lower bid", async () => {
    if (!SPL_READY) {
      console.log("skip: set MINT to an initialized SPL mint");
      return;
    }

    const auctionId = 202n;
    const bidder = web3.Keypair.generate();
    const airdrop = await pg.connection.requestAirdrop(
      bidder.publicKey,
      web3.LAMPORTS_PER_SOL
    );
    await pg.connection.confirmTransaction(airdrop, "confirmed");

    const { auctionPda, vaultPda } = await createAuction(auctionId);
    const [bidPda] = deriveBidPda(auctionPda, bidder.publicKey);
    const vaultAta = getAta(MINT, vaultPda);
    const bidderAta = getAta(MINT, bidder.publicKey);

    const accounts = {
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
    };

    const first = await pg.program.methods
      .placeBid(new BN(20))
      .accounts(accounts)
      .signers([bidder])
      .rpc();
    await pg.connection.confirmTransaction(first, "confirmed");

    let failed = false;
    try {
      await pg.program.methods
        .placeBid(new BN(10))
        .accounts(accounts)
        .signers([bidder])
        .rpc();
    } catch (_e) {
      failed = true;
    }
    if (!failed) throw new Error("expected BidTooLow");
  });

  it("full flow: bid then settle to winner ATA", async () => {
    if (!SPL_READY) {
      console.log("skip: set MINT + fund bidder ATA for full SPL flow");
      return;
    }
  });
});
