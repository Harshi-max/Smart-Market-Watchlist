"use client";

import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const searchableStocks = [
  ["RELIANCE", "Reliance Industries", "Energy"],
  ["TCS", "Tata Consultancy Services", "Technology"],
  ["INFY", "Infosys", "Technology"],
  ["HDFCBANK", "HDFC Bank", "Financials"],
  ["ICICIBANK", "ICICI Bank", "Financials"],
  ["SBIN", "State Bank of India", "Financials"],
  ["ITC", "ITC Limited", "Consumer"],
  ["HCLTECH", "HCL Technologies", "Technology"],
  ["WIPRO", "Wipro", "Technology"],
];

export default function StockSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const matches = query.trim().length < 1 ? [] : searchableStocks.filter(([symbol, name, sector]) => `${symbol} ${name} ${sector}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  const openStock = (symbol: string) => {
    setQuery("");
    router.push(`/watchlist?symbol=${symbol}`);
  };

  return <div className="search-box search-component"><Search size={16} /><input aria-label="Search stocks" placeholder="Search stocks, indices, ETFs..." value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && matches[0]) openStock(matches[0][0]); }} /><kbd>⌘ K</kbd>{matches.length > 0 && <div className="search-results">{matches.map(([symbol, name, sector]) => <button key={symbol} onMouseDown={(event) => event.preventDefault()} onClick={() => openStock(symbol)}><span><strong>{symbol}</strong><small>{name} · {sector}</small></span><ArrowUpRight size={14} /></button>)}</div>}{query && matches.length === 0 && <div className="search-empty">No matching stock found</div>}</div>;
}
