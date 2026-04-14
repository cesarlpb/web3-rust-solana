describe("hello world", () => {
  it("calls hello and verifies the log string", async () => {
    const sig = await pg.program.methods.hello().rpc();
    if (!sig) throw new Error("no signature");

    const tx = await pg.connection.getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    const logs = tx?.meta?.logMessages ?? [];
    const hasHelloLog = logs.some((line) => line.includes("Hello, Solana!"));
    if (!hasHelloLog) throw new Error("expected 'Hello, Solana!' log");
  });
});