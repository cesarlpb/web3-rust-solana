// Part 06 Track A — Auction vault tests (starting code)
describe("auction_vault", () => {
  it("creates auction with vault PDA", async () => {
    throw new Error("TODO: create auction + vault, assert mint stored");
  });

  it("places bid with SPL CPI into vault", async () => {
    throw new Error("TODO: fund bidder ATA, place_bid, assert vault balance");
  });

  it("rejects BidTooLow", async () => {
    throw new Error("TODO: assert custom error on low bid");
  });

  it("settles with PDA-signed transfer to winner", async () => {
    throw new Error("TODO: settle_auction, winner ATA receives tokens");
  });
});
