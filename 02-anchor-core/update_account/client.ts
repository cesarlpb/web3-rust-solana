/*
  Part 02 client flow that initializes and then updates one account.
  - Generates a new keypair for the new account (PDA-less account).
  - Sends the `initialize` instruction with the signer and new account.
  - Confirms the transaction.
  - Sends the `update` instruction with the signer and new account.
  - Confirms the transaction.
  - Gets the transaction details.
  - Logs the transaction logs (includes "data = 42").
*/

// generate a new keypair for the new account (PDA-less account)
const newAccount = web3.Keypair.generate();
// log the new account pubkey
const newAccountPubkey = newAccount.publicKey;
// log the new account pubkey
console.log("new account pubkey:", newAccountPubkey.toBase58());

// send the `initialize` instruction with the signer and new account
// we need to pass the signer and new account to the instruction, and the 
// system program is required for the instruction to be executed (CPI flow):
const initTx = await pg.program.methods
  .initialize(new BN(7))
  .accounts({
    signer: pg.wallet.publicKey,
    newAccount: newAccountPubkey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([newAccount])
  .rpc();

// confirm the transaction
await pg.connection.confirmTransaction(initTx, "confirmed");

// send the `update` instruction with the signer and new account
// we need to pass the signer and new account to the instruction, and the 
// system program is required for the instruction to be executed (CPI flow):
const updates = [11, 42, 99];
for (const value of updates) {
  // send the `update` instruction with the signer and new account
  // we need to pass the signer and new account to the instruction, and the 
  // system program is required for the instruction to be executed (CPI flow):
  const updateTx = await pg.program.methods
    .update(new BN(value))
    .accounts({
      signer: pg.wallet.publicKey,
      newAccount: newAccountPubkey,
    })
    .rpc();

  // confirm the transaction
  await pg.connection.confirmTransaction(updateTx, "confirmed");
  // get the stored data
  const stored = await pg.program.account.newAccount.fetch(newAccountPubkey);
  // log the stored data
  console.log(
    `update tx ${updateTx} -> data=${stored.data.toString()}`
  );

  // get the transaction details
  const txDetails = await pg.connection.getTransaction(updateTx, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  console.log(txDetails?.meta?.logMessages);
}
