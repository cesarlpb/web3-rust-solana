describe("hello world", () => {
  it("calls hello", async () => {
    const sig = await pg.program.methods.hello().rpc();
    if (!sig) throw new Error("no signature");
  });
});
