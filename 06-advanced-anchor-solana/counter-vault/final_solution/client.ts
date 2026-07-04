// Part 06 Track C — Counter vault client (final solution)
// Requires: SPL mint on-chain + funded user ATA before deposit.
// Set MINT to your mint pubkey before running.

const TOKEN_PROGRAM_ID = new web3.PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new web3.PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const MINT = new web3.PublicKey("11111111111111111111111111111111");

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

const [counterPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  pg.program.programId
);
const [vaultPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), counterPda.toBuffer()],
  pg.program.programId
);

const initSig = await pg.program.methods
  .initialize()
  .accounts({
    authority: pg.wallet.publicKey,
    mint: MINT,
    counter: counterPda,
    vault: vaultPda,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("initialize logs:", initSig);

const userAta = getAta(MINT, pg.wallet.publicKey);
const vaultAta = getAta(MINT, vaultPda);
const authorityAta = getAta(MINT, pg.wallet.publicKey);

const depositSig = await pg.program.methods
  .deposit(new BN(50))
  .accounts({
    user: pg.wallet.publicKey,
    counter: counterPda,
    vault: vaultPda,
    mint: MINT,
    userAta,
    vaultAta,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("deposit logs:", depositSig);

const withdrawSig = await pg.program.methods
  .withdraw(new BN(50))
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
await logTx("withdraw logs:", withdrawSig);

const closeSig = await pg.program.methods
  .closeVault()
  .accounts({
    authority: pg.wallet.publicKey,
    counter: counterPda,
    vault: vaultPda,
  })
  .rpc();
await logTx("closeVault logs:", closeSig);

let counterGone = false;
try {
  await pg.program.account.counter.fetch(counterPda);
} catch (_e) {
  counterGone = true;
}
console.log("counter closed:", counterGone);
