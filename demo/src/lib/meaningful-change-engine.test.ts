import test from "node:test";
import assert from "node:assert/strict";
import { classifyChange, type MeaningfulChangeInput, MeaningfulChangeEngine } from "./meaningful-change-engine";
import { isValidStockSymbol, normalizeStockSymbol } from "./watchlist-store";

function buildSignal(overrides: Partial<MeaningfulChangeInput> = {}): MeaningfulChangeInput {
  return {
    symbol: "RELIANCE",
    priceChangePct: 5,
    marketChangePct: 0.4,
    sectorChangePct: 1,
    peerChangePct: 0.8,
    volumeRatio: 1,
    historicalZScore: 0,
    eventSignal: 0,
    userRelevance: 0.5,
    hasData: true,
    isStale: false,
    isDelayed: false,
    hasConflict: false,
    ...overrides,
  };
}

test("a modest move with weak context ranks lower than a context-anchored move with unusual volume", () => {
  const quiet = classifyChange(buildSignal({
    priceChangePct: 5,
    marketChangePct: 4.8,
    sectorChangePct: 4.5,
    peerChangePct: 4.2,
    volumeRatio: 1,
    eventSignal: 0,
  }));

  const notable = classifyChange(buildSignal({
    priceChangePct: 5,
    marketChangePct: 0.4,
    sectorChangePct: 1,
    peerChangePct: 0.8,
    volumeRatio: 2.5,
    historicalZScore: 2.4,
    eventSignal: 0.7,
  }));

  assert.ok(quiet.score < notable.score, `quiet score ${quiet.score} should be lower than notable score ${notable.score}`);
  assert.equal(quiet.level, "MODERATE");
  assert.ok(["HIGH", "CRITICAL"].includes(notable.level));
});

test("no meaningful changes should be reported as a clean and resolved state", () => {
  const result = classifyChange(buildSignal({
    priceChangePct: 0.4,
    marketChangePct: 0.5,
    sectorChangePct: 0.4,
    peerChangePct: 0.3,
    volumeRatio: 0.9,
    eventSignal: 0,
    userRelevance: 0,
  }));

  assert.equal(result.level, "LOW");
  assert.equal(result.isMeaningful, false);
  assert.match(result.summary, /low|minor/i);
});

test("large movement, unusual volume, and historical anomaly all raise significance", () => {
  const result = classifyChange(buildSignal({
    priceChangePct: -8.4,
    marketChangePct: -0.7,
    sectorChangePct: -1.3,
    peerChangePct: -1.1,
    volumeRatio: 3.2,
    historicalZScore: 2.8,
    eventSignal: 0.8,
    userRelevance: 0.8,
  }));

  assert.ok(result.score >= 80, `expected high significance, got ${result.score}`);
  assert.ok(["HIGH", "CRITICAL"].includes(result.level));
});

test("missing data should degrade gracefully and should not fabricate significance", () => {
  const result = classifyChange(buildSignal({
    hasData: false,
    priceChangePct: undefined,
    marketChangePct: undefined,
    sectorChangePct: undefined,
    peerChangePct: undefined,
    volumeRatio: undefined,
    historicalZScore: undefined,
    eventSignal: undefined,
  } as any));

  assert.equal(result.level, "LOW");
  assert.equal(result.isMeaningful, false);
  assert.match(result.summary, /missing|data/i);
});

test("stale and delayed data should be flagged without pretending the signal is live", () => {
  const stale = classifyChange(buildSignal({ isStale: true, volumeRatio: 2.2 }));
  const delayed = classifyChange(buildSignal({ isDelayed: true, priceChangePct: 6 }));

  assert.ok(stale.status.includes("STALE") || stale.status === "DELAYED");
  assert.ok(delayed.status.includes("DELAYED") || delayed.status === "STALE");
});

test("conflicting providers and duplicate symbols should be handled explicitly", () => {
  const conflicting = classifyChange(buildSignal({
    hasConflict: true,
    priceChangePct: 5,
    volumeRatio: 2,
  }));

  const engine = new MeaningfulChangeEngine();
  const deduped = engine.rankSignals([
    buildSignal({ symbol: "RELIANCE", priceChangePct: 5, volumeRatio: 2.4 }),
    buildSignal({ symbol: "RELIANCE", priceChangePct: 5, volumeRatio: 2.4 }),
    buildSignal({ symbol: "TCS", priceChangePct: 3, marketChangePct: 0.6, sectorChangePct: 0.9, volumeRatio: 1.4 }),
  ]);

  assert.ok(conflicting.summary.toLowerCase().includes("conflict") || conflicting.summary.toLowerCase().includes("provider"));
  assert.equal(deduped.length, 2);
});

test("first visit and returning visit states should both be handled gracefully", () => {
  const firstVisit = MeaningfulChangeEngine.buildWelcomeState({ isReturningUser: false, meaningfulCount: 0 });
  const returningVisit = MeaningfulChangeEngine.buildWelcomeState({ isReturningUser: true, meaningfulCount: 4, lastViewedAt: "10:14 AM" });

  assert.match(firstVisit.title, /welcome|watchlist/i);
  assert.match(returningVisit.title, /welcome back|last checked/i);
  assert.equal(returningVisit.meaningfulCount, 4);
});

test("real-world symbol formats should normalize and validate correctly", () => {
  assert.equal(normalizeStockSymbol(" reliance.ns "), "RELIANCE");
  assert.equal(normalizeStockSymbol("tcs"), "TCS");
  assert.equal(normalizeStockSymbol("  hdfc bank "), "HDFCBANK");
  assert.equal(normalizeStockSymbol("reliance"), "RELIANCE");

  assert.equal(isValidStockSymbol("RELIANCE.NS"), true);
  assert.equal(isValidStockSymbol("TCS"), true);
  assert.equal(isValidStockSymbol("HDFC Bank"), true);
  assert.equal(isValidStockSymbol("A"), false);
});
