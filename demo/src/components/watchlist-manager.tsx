"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, RefreshCw, Trash2 } from "lucide-react";

type Watchlist = { id: string; name: string; items: { symbol: string; addedAt: string }[] };
type Quote = { symbol: string; price: number; priceChangePct: number; marketChangePct: number; volumeRatio: number; sector: string; freshness: string; status: string; source: string };
type Change = { symbol: string; score: number; level: string; summary: string };

export default function WatchlistManager() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [lastViewedAt, setLastViewedAt] = useState<string>();
  const [symbol, setSymbol] = useState("");
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/watchlist", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) setMessage(result.error || "Unable to load your watchlist.");
    else { setWatchlists(result.watchlists); setSelectedId(result.selectedWatchlistId); setQuotes(result.quotes || []); setChanges(result.changes || []); setLastViewedAt(result.lastViewedAt); }
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/watchlist", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!active) return;
      if (!response.ok) setMessage(result.error || "Unable to load your watchlist.");
      else {
        setWatchlists(result.watchlists); setSelectedId(result.selectedWatchlistId); setQuotes(result.quotes || []); setChanges(result.changes || []); setLastViewedAt(result.lastViewedAt);
        void fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "viewed" }) });
      }
      setLoading(false);
    }).catch(() => { if (active) { setMessage("Unable to load your watchlist."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const selected = watchlists.find((list) => list.id === selectedId);
  const save = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) setMessage(result.error || "Unable to save that change."); else { setMessage("Saved"); await load(); }
  };

  const add = async () => { if (!symbol.trim() || !selected) return; await save({ action: "add", watchlistId: selected.id, symbol }); setSymbol(""); };
  const move = async (index: number, direction: -1 | 1) => {
    if (!selected) return;
    const symbols = selected.items.map((item) => item.symbol);
    const target = index + direction;
    if (target < 0 || target >= symbols.length) return;
    [symbols[index], symbols[target]] = [symbols[target], symbols[index]];
    await save({ action: "reorder", watchlistId: selected.id, symbols });
  };

  if (loading) return <div className="watchlist-manager"><p>Loading your watchlist...</p></div>;
  return <div className="watchlist-manager">
    <div className="watchlist-toolbar"><div className="watchlist-selects">{watchlists.map((list) => <button key={list.id} className={list.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(list.id)}>{list.name} <small>{list.items.length}</small></button>)}</div><div className="watchlist-create"><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="New watchlist name" /><button onClick={async () => { await save({ action: "create", name: newName }); setNewName(""); }}><Plus size={15} /> Create</button></div></div>
    {selected && <><div className="watchlist-manager-heading"><div><span className="eyebrow">{selected.name.toUpperCase()} · {selected.items.length} STOCKS</span><h2>Latest market information</h2><p>{lastViewedAt ? `Last viewed ${new Date(lastViewedAt).toLocaleString()}. Changes below are compared with your saved view.` : "Your first view is now being recorded."}</p></div><div className="watchlist-heading-actions">{renaming ? <><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={selected.name} /><button onClick={async () => { await save({ action: "rename", watchlistId: selected.id, name: newName }); setNewName(""); setRenaming(false); }}>Save name</button></> : <button onClick={() => { setNewName(selected.name); setRenaming(true); }}>Rename</button>}<button onClick={() => load()}><RefreshCw size={15} /> Refresh</button></div></div>
      {changes.length > 0 && <div className="watchlist-returning"><strong>{changes.length} meaningful change{changes.length === 1 ? "" : "s"} since your last view</strong><span>Scores use price, market, sector, peer, volume, historical, and event context.</span></div>}
      <div className="watchlist-add"><input value={symbol} onChange={(event) => setSymbol(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") add(); }} placeholder="Add a symbol, e.g. TCS" /><button onClick={add}><Plus size={15} /> Add stock</button></div>
      <div className="watchlist-rows">{selected.items.length === 0 && <div className="watchlist-empty">Your watchlist is empty. Add a symbol to start tracking live context.</div>}{selected.items.map((item, index) => { const quote = quotes.find((entry) => entry.symbol === item.symbol); const change = changes.find((entry) => entry.symbol === item.symbol); return <article className="watchlist-row" key={item.symbol}><div className="watchlist-symbol"><strong>{item.symbol}</strong><span>{quote?.sector || "Unavailable"}</span></div>{quote ? <><div><span className="watchlist-label">PRICE</span><strong>₹{quote.price.toLocaleString("en-IN")}</strong></div><div className={quote.priceChangePct >= 0 ? "positive" : "negative"}><span className="watchlist-label">CHANGE</span><strong>{quote.priceChangePct >= 0 ? "+" : ""}{quote.priceChangePct.toFixed(1)}%</strong></div><div><span className="watchlist-label">CONTEXT</span><strong>{change?.level || "LOW"} · {change?.score || 0}</strong><small>{quote.volumeRatio.toFixed(1)}x volume</small></div><div><span className="watchlist-label">FRESHNESS</span><strong>{quote.status}</strong><small>{quote.freshness} · {quote.source}</small></div></> : <div className="watchlist-unavailable">Market data unavailable for this symbol.</div>}<div className="watchlist-actions"><button disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move ${item.symbol} up`}><ArrowUp size={15} /></button><button disabled={index === selected.items.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${item.symbol} down`}><ArrowDown size={15} /></button><button onClick={() => save({ action: "remove", watchlistId: selected.id, symbol: item.symbol })} aria-label={`Remove ${item.symbol}`}><Trash2 size={15} /></button></div></article>; })}</div>
    </>}
    {message && <div className="watchlist-message">{message}</div>}
  </div>;
}