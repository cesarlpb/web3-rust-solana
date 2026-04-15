/*
  Part 02 client flow that demonstrates:
  1) initialize
  2) getter call before each update
  3) update with before/after logs
  4) getter call after each update
*/
const newAccount = web3.Keypair.generate();
const newAccountPubkey = newAccount.publicKey;

// Helper: run getter instruction and print the "current data" log line.
const runGetter = async (label: string) => {
  const getterTx = await pg.program.methods
    .getData()
    .accounts({
      newAccount: newAccountPubkey,
    })
    .rpc();

  await pg.connection.confirmTransaction(getterTx, "confirmed");
  const details = await pg.connection.getTransaction(getterTx, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  const logs = details?.meta?.logMessages ?? [];
  const getterLine = logs.find((line) => line.includes("current data ="));
  console.log(`${label} getter ->`, getterLine ?? "no getter log found");
};

const initTx = await pg.program.methods
  .initialize(new BN(7))
  .accounts({
    signer: pg.wallet.publicKey,
    newAccount: newAccountPubkey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([newAccount])
  .rpc();

await pg.connection.confirmTransaction(initTx, "confirmed");
console.log("initialized account:", newAccountPubkey.toBase58());

const updates = [11, 42, 99];
for (const value of updates) {
  await runGetter(`before update(${value})`);

  const updateTx = await pg.program.methods
    .update(new BN(value))
    .accounts({
      signer: pg.wallet.publicKey,
      newAccount: newAccountPubkey,
    })
    .rpc();
  await pg.connection.confirmTransaction(updateTx, "confirmed");

  const updateDetails = await pg.connection.getTransaction(updateTx, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  console.log("update logs:", updateDetails?.meta?.logMessages ?? []);

  await runGetter(`after update(${value})`);
}
