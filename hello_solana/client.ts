/*
  Client call for Part 01: invokes `hello` and inspects transaction logs.
  - Sends the `hello` instruction.
  - Confirms the transaction.
  - Gets the transaction details.
  - Logs the transaction logs (includes "Hello, Solana!").
*/
const tx = await pg.program.methods.hello().rpc();

await pg.connection.confirmTransaction(tx, "confirmed");

// we confirm the transaction and get the transaction details to log the 
// transaction logs (array of strings that includes "Hello, Solana!"):
const details = await pg.connection.getTransaction(tx, {
  commitment: "confirmed",
  maxSupportedTransactionVersion: 0,
});

console.log(details?.meta?.logMessages);
// console.log((details?.meta?.logMessages ?? []).some((line) => line.includes("Hello, Solana!")));


