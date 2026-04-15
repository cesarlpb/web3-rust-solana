/*
  Part 02 client flow that sends `initialize` with required accounts.
  - Sends the `initialize` instruction.
  - Confirms the transaction.
  - Gets the transaction details.
  - Logs the transaction logs (includes "data = 42").
*/
const tx = await pg.program.methods
  .initialize(new BN(42))
  .accounts({
    signer: pg.wallet.publicKey,
    newAccount: newAccountPubkey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// similar to the previous client.ts file, we confirm the transaction and
// get the transaction details to log the transaction logs:
await pg.connection.confirmTransaction(tx, "confirmed");

const details = await pg.connection.getTransaction(tx, {
  commitment: "confirmed",
  maxSupportedTransactionVersion: 0,
});

console.log(details?.meta?.logMessages);

// If you want to check if the log message "data = 42" is present in the
// transaction logs:

// console.log((details?.meta?.logMessages ?? []).some((line) => line.includes("data = 42")));
