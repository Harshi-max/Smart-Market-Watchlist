import { NextRequest, NextResponse } from "next/server";
import { addSymbol, createWatchlist, deleteWatchlist, readWatchlists, removeSymbol, renameWatchlist, reorderSymbols, setLastViewedAt } from "@/lib/watchlist-store";
import { createMarketDataProvider } from "@/lib/market-data";
import { classifyChange } from "@/lib/meaningful-change-engine";

function userId(request: NextRequest) {
  const session = request.cookies.get("smartpilot_session")?.value || "";
  return session.startsWith("user:") ? session.slice(5) : "demo-user";
}

export async function GET(request: NextRequest) {
  const provider = createMarketDataProvider();
  const data = await readWatchlists(userId(request));
  const list = data.watchlists.find((watchlist) => watchlist.id === data.defaultWatchlistId) ?? data.watchlists[0];
  const quotes = (await Promise.all(list.items.map(async (item) => provider.getQuote(item.symbol)))).filter((quote): quote is NonNullable<typeof quote> => quote !== null);
  const changes = quotes.map((quote) => classifyChange({ ...quote, hasData: true, isStale: quote.status === "STALE", isDelayed: quote.status === "DELAYED", hasConflict: quote.status === "PARTIAL" }));
  return NextResponse.json({ watchlists: data.watchlists, selectedWatchlistId: list.id, lastViewedAt: data.lastViewedAt, quotes, changes, dataState: quotes.some((quote) => quote?.status === "OBSERVED") ? "OBSERVED" : "UNAVAILABLE", updatedAt: new Date().toISOString() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = userId(request);
  try {
    let result;
    switch (body?.action) {
      case "create": result = await createWatchlist(id, typeof body.name === "string" ? body.name : "New Watchlist"); break;
      case "add": result = await addSymbol(id, body.watchlistId, body.symbol); break;
      case "remove": result = await removeSymbol(id, body.watchlistId, body.symbol); break;
      case "rename": result = await renameWatchlist(id, body.watchlistId, body.name); break;
      case "delete": result = await deleteWatchlist(id, body.watchlistId); break;
      case "reorder": result = await reorderSymbols(id, body.watchlistId, Array.isArray(body.symbols) ? body.symbols : []); break;
      case "viewed": result = await setLastViewedAt(id); break;
      default: return NextResponse.json({ error: "Unsupported watchlist action." }, { status: 400 });
    }
    return NextResponse.json(result || { saved: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save watchlist." }, { status: 400 });
  }
}