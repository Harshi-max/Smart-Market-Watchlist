import { promises as fs } from "node:fs";
import path from "node:path";

const stockAliasMap: Record<string, string> = {
  RELIANCEINDUSTRIES: "RELIANCE",
  RELIANCE: "RELIANCE",
  TCS: "TCS",
  TATACONSULTANCYSERVICES: "TCS",
  INFOSYS: "INFY",
  INFY: "INFY",
  HDFCBANK: "HDFCBANK",
  HDFC: "HDFCBANK",
  ICICIBANK: "ICICIBANK",
  AXISBANK: "AXISBANK",
  SBI: "SBIN",
  STATEBANKOFINDIA: "SBIN",
};

export function normalizeStockSymbol(input: string): string {
  const raw = input.trim();
  if (!raw) return "";
  const compact = raw.replace(/\s+/g, "").replace(/[^A-Za-z0-9.]/g, "").toUpperCase();
  if (!compact) return "";

  const withSuffix = compact.includes(".") ? compact : compact;
  const base = withSuffix.replace(/\.(NS|NSE|BSE|BO|BOM|NSEI|MCX|NYSE|NASDAQ)$/i, "");
  const aliasKey = base.replace(/[^A-Z0-9]/g, "");
  return stockAliasMap[aliasKey] ?? base;
}

export function isValidStockSymbol(input: string): boolean {
  const normalized = normalizeStockSymbol(input);
  if (!normalized) return false;
  return normalized.length >= 2 && normalized.length <= 20 && /^[A-Z0-9]+$/.test(normalized);
}

export type WatchlistItem = {
  symbol: string;
  addedAt: string;
  lastViewedAt?: string;
};

export type Watchlist = {
  id: string;
  name: string;
  items: WatchlistItem[];
};

export type UserWatchlists = {
  userId: string;
  defaultWatchlistId: string;
  watchlists: Watchlist[];
  lastViewedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "watchlists.json");

const seed: Record<string, UserWatchlists> = {
  "demo-user": {
    userId: "demo-user",
    defaultWatchlistId: "watchlist-1",
    lastViewedAt: new Date().toISOString(),
    watchlists: [
      {
        id: "watchlist-1",
        name: "My Watchlist",
        items: [
          { symbol: "RELIANCE", addedAt: "2026-09-03T09:15:00.000Z", lastViewedAt: "2026-09-04T14:32:00.000Z" },
          { symbol: "TCS", addedAt: "2026-09-03T09:15:00.000Z", lastViewedAt: "2026-09-04T14:32:00.000Z" },
          { symbol: "INFY", addedAt: "2026-09-03T09:15:00.000Z", lastViewedAt: "2026-09-04T14:32:00.000Z" },
          { symbol: "HDFCBANK", addedAt: "2026-09-03T09:15:00.000Z", lastViewedAt: "2026-09-04T14:32:00.000Z" },
        ],
      },
      {
        id: "watchlist-2",
        name: "Growth Monitor",
        items: [
          { symbol: "TCS", addedAt: "2026-09-03T10:00:00.000Z", lastViewedAt: "2026-09-04T13:45:00.000Z" },
          { symbol: "INFY", addedAt: "2026-09-03T10:05:00.000Z", lastViewedAt: "2026-09-04T13:45:00.000Z" },
        ],
      },
    ],
  },
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

export async function readWatchlists(userId = "demo-user") {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}") as Record<string, UserWatchlists>;
  const user = parsed[userId] ?? seed[userId] ?? { userId, defaultWatchlistId: "watchlist-1", watchlists: [] };
  if (!user.watchlists.length) {
    user.watchlists = [{ id: "watchlist-1", name: "My Watchlist", items: [] }];
    user.defaultWatchlistId = "watchlist-1";
  }
  return user;
}

export async function writeWatchlists(userId: string, next: UserWatchlists) {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8").catch(() => "{}");
  const parsed = JSON.parse(raw || "{}") as Record<string, UserWatchlists>;
  parsed[userId] = next;
  await fs.writeFile(DATA_FILE, JSON.stringify(parsed, null, 2), "utf8");
  return next;
}

export async function createWatchlist(userId = "demo-user", name = "New Watchlist") {
  const user = await readWatchlists(userId);
  const nextId = `watchlist-${Date.now()}`;
  const next: UserWatchlists = { ...user, watchlists: [...user.watchlists, { id: nextId, name: name.trim() || "New Watchlist", items: [] }], defaultWatchlistId: user.defaultWatchlistId || nextId };
  return writeWatchlists(userId, next);
}

export async function renameWatchlist(userId: string, watchlistId: string, name: string) {
  const user = await readWatchlists(userId);
  const watchlists = user.watchlists.map((list) => list.id === watchlistId ? { ...list, name: name.trim() || list.name } : list);
  return writeWatchlists(userId, { ...user, watchlists });
}

export async function deleteWatchlist(userId: string, watchlistId: string) {
  const user = await readWatchlists(userId);
  const remaining = user.watchlists.filter((list) => list.id !== watchlistId);
  if (!remaining.length) {
    remaining.push({ id: "watchlist-1", name: "My Watchlist", items: [] });
  }
  return writeWatchlists(userId, { ...user, watchlists: remaining, defaultWatchlistId: remaining[0].id });
}

export async function addSymbol(userId: string, watchlistId: string, symbol: string) {
  const normalized = normalizeStockSymbol(symbol);
  if (!isValidStockSymbol(normalized)) throw new Error("Invalid stock symbol");
  const user = await readWatchlists(userId);
  const watchlists = user.watchlists.map((list) => {
    if (list.id !== watchlistId) return list;
    const exists = list.items.some((item) => item.symbol === normalized);
    if (exists) return list;
    return { ...list, items: [...list.items, { symbol: normalized, addedAt: new Date().toISOString(), lastViewedAt: new Date().toISOString() }] };
  });
  return writeWatchlists(userId, { ...user, watchlists, lastViewedAt: new Date().toISOString() });
}

export async function removeSymbol(userId: string, watchlistId: string, symbol: string) {
  const user = await readWatchlists(userId);
  const normalized = normalizeStockSymbol(symbol);
  const watchlists = user.watchlists.map((list) => list.id === watchlistId ? { ...list, items: list.items.filter((item) => item.symbol !== normalized) } : list);
  return writeWatchlists(userId, { ...user, watchlists, lastViewedAt: new Date().toISOString() });
}

export async function reorderSymbols(userId: string, watchlistId: string, symbols: string[]) {
  const user = await readWatchlists(userId);
  const watchlists = user.watchlists.map((list) => {
    if (list.id !== watchlistId) return list;
    const normalized = symbols.map((symbol) => normalizeStockSymbol(symbol));
    const existing = list.items.filter((item) => normalized.includes(item.symbol));
    const merged = normalized.map((symbol) => existing.find((item) => item.symbol === symbol) ?? { symbol, addedAt: new Date().toISOString() });
    return { ...list, items: merged };
  });
  return writeWatchlists(userId, { ...user, watchlists, lastViewedAt: new Date().toISOString() });
}

export async function setLastViewedAt(userId = "demo-user", at = new Date().toISOString()) {
  const user = await readWatchlists(userId);
  return writeWatchlists(userId, { ...user, lastViewedAt: at });
}
