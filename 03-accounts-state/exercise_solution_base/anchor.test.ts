/*
  Template only (no final solution):
  Tests should verify the Part 03 lifecycle:
  - initialize_profile
  - get_profile
  - partial updates (name/age)
  - toggle_active
*/
describe("accounts_state_template", () => {
  it("initializes profile and verifies getter logs", async () => {
    // TODO:
    // 1) create keypair
    // 2) call initializeProfile("alice", 20)
    // 3) call getProfile()
    // 4) assert logs contain name/age/is_active=true
    throw new Error("TODO: implement initialize_profile + getter test");
  });

  it("updates name only, then age only", async () => {
    // TODO:
    // 1) initialize profile
    // 2) call updateName("bob")
    // 3) assert only name changed
    // 4) call updateAge(21)
    // 5) assert only age changed
    throw new Error("TODO: implement partial update assertions");
  });

  it("toggles active flag and verifies getter output", async () => {
    // TODO:
    // 1) initialize profile (active=true)
    // 2) call toggleActive()
    // 3) call getProfile()
    // 4) assert logs now show is_active=false
    throw new Error("TODO: implement toggle_active assertions");
  });
});
