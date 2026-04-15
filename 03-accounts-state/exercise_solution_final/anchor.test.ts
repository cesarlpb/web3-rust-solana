/*
  Starting point for final implementation (copied from exercise_solution_base).
  Complete this file during Part 03.
*/
describe("accounts_state_template", () => {
  const getProfileLogs = async (profilePubkey: web3.PublicKey): Promise<string[]> => {
    const sig = await pg.program.methods
      .getProfile()
      .accounts({ profile: profilePubkey })
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");

    const tx = await pg.connection.getTransaction(sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    return tx?.meta?.logMessages ?? [];
  };

  it("initializes profile and verifies getter logs", async () => {
    const profile = Keypair.generate();

    const sig = await pg.program.methods
      .initializeProfile("alice", 20)
      .accounts({
        signer: pg.wallet.publicKey,
        profile: profile.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([profile])
      .rpc();
    await pg.connection.confirmTransaction(sig, "confirmed");

    const logs = await getProfileLogs(profile.publicKey);
    const joined = logs.join(" | ");
    if (!joined.includes("name=alice")) throw new Error("getter logs missing name=alice");
    if (!joined.includes("age=20")) throw new Error("getter logs missing age=20");
    if (!joined.includes("is_active=true")) {
      throw new Error("getter logs missing is_active=true");
    }
  });

  it("updates name only, then age only", async () => {
    const profile = Keypair.generate();

    const initSig = await pg.program.methods
      .initializeProfile("alice", 20)
      .accounts({
        signer: pg.wallet.publicKey,
        profile: profile.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([profile])
      .rpc();
    await pg.connection.confirmTransaction(initSig, "confirmed");

    const updateNameSig = await pg.program.methods
      .updateName("bob")
      .accounts({
        signer: pg.wallet.publicKey,
        profile: profile.publicKey,
      })
      .rpc();
    await pg.connection.confirmTransaction(updateNameSig, "confirmed");

    const afterName = await pg.program.account.profile.fetch(profile.publicKey);
    if (afterName.name !== "bob") throw new Error(`expected name=bob, got ${afterName.name}`);
    if (afterName.age !== 20) throw new Error(`expected age=20, got ${afterName.age}`);
    if (afterName.isActive !== true) {
      throw new Error(`expected isActive=true, got ${afterName.isActive}`);
    }

    const updateAgeSig = await pg.program.methods
      .updateAge(21)
      .accounts({
        signer: pg.wallet.publicKey,
        profile: profile.publicKey,
      })
      .rpc();
    await pg.connection.confirmTransaction(updateAgeSig, "confirmed");

    const afterAge = await pg.program.account.profile.fetch(profile.publicKey);
    if (afterAge.name !== "bob") throw new Error(`expected name=bob, got ${afterAge.name}`);
    if (afterAge.age !== 21) throw new Error(`expected age=21, got ${afterAge.age}`);
    if (afterAge.isActive !== true) {
      throw new Error(`expected isActive=true, got ${afterAge.isActive}`);
    }
  });

  it("toggles active flag and verifies getter output", async () => {
    const profile = Keypair.generate();

    const initSig = await pg.program.methods
      .initializeProfile("alice", 20)
      .accounts({
        signer: pg.wallet.publicKey,
        profile: profile.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([profile])
      .rpc();
    await pg.connection.confirmTransaction(initSig, "confirmed");

    const toggleSig = await pg.program.methods
      .toggleActive()
      .accounts({
        signer: pg.wallet.publicKey,
        profile: profile.publicKey,
      })
      .rpc();
    await pg.connection.confirmTransaction(toggleSig, "confirmed");

    const stored = await pg.program.account.profile.fetch(profile.publicKey);
    if (stored.isActive !== false) {
      throw new Error(`expected isActive=false, got ${stored.isActive}`);
    }

    const logs = await getProfileLogs(profile.publicKey);
    const joined = logs.join(" | ");
    if (!joined.includes("is_active=false")) {
      throw new Error("getter logs missing is_active=false after toggle");
    }
  });
});
