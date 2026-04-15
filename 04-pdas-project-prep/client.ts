/*
  Template only (no final solution):
  Part 04 — Counter with PDA client flow.
*/

const [counterPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("counter"), pg.wallet.publicKey.toBuffer()],
  pg.program.programId
);

const logTx = async (label: string, sig: string) => {
  await pg.connection.confirmTransaction(sig, "confirmed");
  const tx = await pg.connection.getTransaction(sig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  console.log(label, tx?.meta?.logMessages ?? []);
};

console.log("counter PDA:", counterPda.toBase58());

const initSig = await pg.program.methods
  .initialize()
  .accounts({
    signer: pg.wallet.publicKey,
    counter: counterPda,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();
await logTx("initialize logs:", initSig);

for (let i = 0; i < 3; i += 1) {
  const incSig = await pg.program.methods
    .increment()
    .accounts({
      signer: pg.wallet.publicKey,
      counter: counterPda,
    })
    .rpc();
  await logTx(`increment #${i + 1} logs:`, incSig);
}

const getterSig = await pg.program.methods
  .getCounter()
  .accounts({
    signer: pg.wallet.publicKey,
    counter: counterPda,
  })
  .rpc();
await logTx("getCounter logs:", getterSig);

const counterState = await pg.program.account.counter.fetch(counterPda);
console.log("final counter value:", counterState.value.toString());
