/*
  Part 02 client flow that sends `initialize` with required accounts.
  - Sends the `initialize` instruction.
  - Confirms the transaction.
  - Gets the transaction details.
  - Logs the transaction logs (includes "data = 42").
*/

// generate a new keypair for the new account (PDA-less account)
const newAccount = web3.Keypair.generate();
const newAccountPubkey = newAccount.publicKey;
// log the new account pubkey
console.log("new account pubkey:", newAccountPubkey.toBase58());
// send the `initialize` instruction with the signer and new account
// we need to pass the signer and new account to the instruction, and the 
// system program is required for the instruction to be executed (CPI flow):

const tx = await pg.program.methods
  .initialize(new BN(42))
  .accounts({
    signer: pg.wallet.publicKey,
    newAccount: newAccountPubkey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([newAccount])
  .rpc();

// similar to the previous client.ts file, we confirm the transaction and
// get the transaction details to log the transaction logs:
await pg.connection.confirmTransaction(tx, "confirmed");

const stored = await pg.program.account.newAccount.fetch(newAccountPubkey);
console.log("stored data:", stored.data.toString());

const details = await pg.connection.getTransaction(tx, {
  commitment: "confirmed",
  maxSupportedTransactionVersion: 0,
});

console.log(details?.meta?.logMessages);

// If you want to check if the log message "data = 42" is present in the
// transaction logs:

// console.log((details?.meta?.logMessages ?? []).some((line) => line.includes("data = 42")));
