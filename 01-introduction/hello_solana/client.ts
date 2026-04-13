const tx = await pg.program.methods.hello().rpc();

await pg.connection.confirmTransaction(tx, "confirmed");

const details = await pg.connection.getTransaction(tx, {
  commitment: "confirmed",
  maxSupportedTransactionVersion: 0,
});

console.log(details?.meta?.logMessages);
