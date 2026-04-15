/*
  Basic Part 01 test that validates the `hello` instruction executes.
  - Validates the `hello` instruction executes.
  - Verifies the log string "Hello, Solana!" is present in logs.
*/
describe("hello world", () => {
  it("calls hello and verifies the log string", async () => {
    // send the `hello` instruction:
    const sig = await pg.program.methods.hello().rpc();
    // check if the signature is present:
    if (!sig) throw new Error("no signature");

    // get the transaction details:
    const tx = await pg.connection.getTransaction(sig, {
      commitment: "confirmed", // tx should be confirmed 
      maxSupportedTransactionVersion: 0, // latest transaction version (0 is the latest)
    });

    const logs = tx?.meta?.logMessages ?? []; // get the transaction logs

    // check if the log message "Hello, Solana!" is present in SOME of the 
    // transaction logs:
    const hasHelloLog = logs.some((line) => line.includes("Hello, Solana!"));
    if (!hasHelloLog) throw new Error("expected 'Hello, Solana!' log");
  });
});
