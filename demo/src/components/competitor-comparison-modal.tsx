"use client";

import { useEffect, useState } from "react";
import {
  X,
  Scale,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
} from "lucide-react";
import {
  getCompetitorProfile,
  competitorDatabase,
  type StockCompetitorProfile,
  type CompetitorMetric,
} from "@/lib/competitor-data";

type Props = {
  initialSymbol: string;
  onClose: () => void;
  onSelectStock: (symbol: string) => void;
  onAskSmartPilot: (question: string) => void;
};

type ViewMode = "performance" | "volume" | "valuation";

export default function CompetitorComparisonModal({
  initialSymbol,
  onClose,
  onSelectStock,
  onAskSmartPilot,
}: Props) {
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol);
  const [mode, setMode] = useState<ViewMode>("performance");

  const profile: StockCompetitorProfile = getCompetitorProfile(activeSymbol);
  const allSymbols = Object.keys(competitorDatabase);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isPositive = profile.priceChangePct >= 0;

  return (
    <div
      className="modal-backdrop competitor-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="competitor-modal-title"
    >
      <div
        className="competitor-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="competitor-modal-header">
          <div className="competitor-header-info">
            <div className="competitor-badge-wrap">
              <span className="competitor-pill">
                <Scale size={13} />
                PEER ISOLATION MATRIX
              </span>
              <span className="competitor-sector-pill">
                {profile.sector.toUpperCase()} SECTOR
              </span>
            </div>
            <h2 id="competitor-modal-title">
              {profile.name} <span className="symbol-tag">({profile.symbol})</span> vs Competitors
            </h2>
            <p>
              Compare company-specific movement against industry peers to separate idiosyncratic signal from sector beta.
            </p>
          </div>

          <button
            className="competitor-close-btn"
            onClick={onClose}
            aria-label="Close comparison"
          >
            <X size={18} />
          </button>
        </header>

        {/* Stock Switcher Bar */}
        <div className="competitor-stock-tabs">
          <span className="tabs-label">COMPARE STOCK:</span>
          {allSymbols.map((sym) => {
            const symProfile = competitorDatabase[sym];
            const symPositive = symProfile.priceChangePct >= 0;
            return (
              <button
                key={sym}
                className={`stock-tab-btn ${activeSymbol === sym ? "active" : ""}`}
                onClick={() => {
                  setActiveSymbol(sym);
                  onSelectStock(sym);
                }}
              >
                <span className="tab-sym">{sym}</span>
                <span className={`tab-change ${symPositive ? "positive" : "negative"}`}>
                  {symPositive ? "+" : ""}
                  {symProfile.priceChangePct.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="competitor-modal-body">
          {/* Top Key Metrics Banner */}
          <section className="competitor-summary-grid">
            <div className="summary-stat-box target-box">
              <span className="stat-eyebrow">OBSERVED MOVEMENT</span>
              <div className="stat-price-line">
                <strong>₹{profile.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                <span className={`stat-pct ${isPositive ? "positive" : "negative"}`}>
                  {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {isPositive ? "+" : ""}
                  {profile.priceChangePct.toFixed(1)}%
                </span>
              </div>
              <p>
                {profile.symbol} on {profile.marketIndex}
              </p>
            </div>

            <div className="summary-stat-box">
              <span className="stat-eyebrow">PEER GROUP MEDIAN</span>
              <div className="stat-val-line">
                <strong className={profile.peerMedianChangePct >= 0 ? "positive" : "negative"}>
                  {profile.peerMedianChangePct >= 0 ? "+" : ""}
                  {profile.peerMedianChangePct.toFixed(1)}%
                </strong>
              </div>
              <p>Median of {profile.competitors.length} direct competitors</p>
            </div>

            <div className="summary-stat-box highlight-box">
              <span className="stat-eyebrow">ISOLATED ALPHA SPREAD</span>
              <div className="stat-val-line">
                <strong className={profile.isolatedAlpha >= 0 ? "positive" : "negative"}>
                  {profile.isolatedAlpha >= 0 ? "+" : ""}
                  {profile.isolatedAlpha.toFixed(1)}pp
                </strong>
              </div>
              <p>Target move minus peer median</p>
            </div>

            <div className="summary-stat-box score-box">
              <span className="stat-eyebrow">SIGNAL ISOLATION</span>
              <div className="stat-score-line">
                <span className="score-ring">{profile.isolationScore}</span>
                <div>
                  <strong>{profile.isolationLevel} Isolation</strong>
                  <small>Score / 100</small>
                </div>
              </div>
              <p>Idiosyncratic fraction of movement</p>
            </div>
          </section>

          {/* SmartPilot Synthesis Callout */}
          <div className="competitor-ai-card">
            <div className="ai-card-header">
              <div className="ai-title-group">
                <span className="pilot-orb">
                  <BrainCircuit size={15} />
                </span>
                <strong>SmartPilot Peer Insight</strong>
                <span className="ai-badge">{profile.synthesis.badge}</span>
              </div>
              <button
                className="ai-ask-btn"
                onClick={() => {
                  onAskSmartPilot(`Compare ${profile.symbol} with its peers`);
                  onClose();
                }}
              >
                <Sparkles size={14} />
                Ask in SmartPilot
              </button>
            </div>
            <h4>{profile.synthesis.verdict}</h4>
            <p>{profile.synthesis.detail}</p>
            <div className="ai-driver-tag">
              <Zap size={13} />
              <span>
                <strong>Key Driver:</strong> {profile.synthesis.keyDriver}
              </span>
            </div>
          </div>

          {/* Mode Switcher & Visual Comparison Chart */}
          <div className="competitor-view-controls">
            <div className="controls-left">
              <BarChart3 size={16} className="text-teal" />
              <h3>Multi-Factor Peer Benchmark</h3>
            </div>
            <div className="metric-pills">
              <button
                className={mode === "performance" ? "active" : ""}
                onClick={() => setMode("performance")}
              >
                1D Performance
              </button>
              <button
                className={mode === "volume" ? "active" : ""}
                onClick={() => setMode("volume")}
              >
                Relative Volume
              </button>
              <button
                className={mode === "valuation" ? "active" : ""}
                onClick={() => setMode("valuation")}
              >
                Valuation (P/E)
              </button>
            </div>
          </div>

          {/* Visual Relative Comparison Bars */}
          <div className="benchmark-bars-card">
            {/* Target Stock Bar */}
            <div className="benchmark-row target">
              <div className="benchmark-meta">
                <span className="tag-target">TARGET</span>
                <strong>{profile.symbol}</strong>
                <small>{profile.name}</small>
              </div>
              <div className="benchmark-bar-wrapper">
                <div
                  className={`benchmark-bar-fill ${isPositive ? "positive-bar" : "negative-bar"}`}
                  style={{
                    width: `${Math.min(
                      Math.max(
                        mode === "performance"
                          ? (Math.abs(profile.priceChangePct) / 6) * 100
                          : mode === "volume"
                          ? (profile.volumeRatio / 3) * 100
                          : 80,
                        12
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="benchmark-value">
                {mode === "performance" && (
                  <b className={isPositive ? "positive" : "negative"}>
                    {isPositive ? "+" : ""}
                    {profile.priceChangePct.toFixed(1)}%
                  </b>
                )}
                {mode === "volume" && <b>{profile.volumeRatio.toFixed(1)}x Vol</b>}
                {mode === "valuation" && <b>P/E --</b>}
              </div>
            </div>

            {/* Direct Competitors */}
            {profile.competitors.map((peer) => {
              const peerPos = peer.priceChangePct >= 0;
              const barWidth = Math.min(
                Math.max(
                  mode === "performance"
                    ? (Math.abs(peer.priceChangePct) / 6) * 100
                    : mode === "volume"
                    ? (peer.volumeRatio / 3) * 100
                    : (peer.peRatio / 35) * 100,
                  10
                ),
                100
              );

              return (
                <div className="benchmark-row" key={peer.symbol}>
                  <div className="benchmark-meta">
                    <span className="tag-peer">PEER</span>
                    <strong>{peer.symbol}</strong>
                    <small>{peer.name}</small>
                  </div>
                  <div className="benchmark-bar-wrapper">
                    <div
                      className={`benchmark-bar-fill ${
                        mode === "performance"
                          ? peerPos
                            ? "positive-bar"
                            : "negative-bar"
                          : "neutral-bar"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="benchmark-value">
                    {mode === "performance" && (
                      <b className={peerPos ? "positive" : "negative"}>
                        {peerPos ? "+" : ""}
                        {peer.priceChangePct.toFixed(1)}%
                      </b>
                    )}
                    {mode === "volume" && <b>{peer.volumeRatio.toFixed(1)}x Vol</b>}
                    {mode === "valuation" && <b>{peer.peRatio.toFixed(1)}x P/E</b>}
                  </div>
                </div>
              );
            })}

            {/* Sector Index Bar */}
            <div className="benchmark-row benchmark-index">
              <div className="benchmark-meta">
                <span className="tag-index">SECTOR</span>
                <strong>{profile.sector} Index</strong>
                <small>Industry Beta</small>
              </div>
              <div className="benchmark-bar-wrapper">
                <div
                  className={`benchmark-bar-fill index-bar ${
                    profile.sectorChangePct >= 0 ? "positive-bar" : "negative-bar"
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max((Math.abs(profile.sectorChangePct) / 6) * 100, 8),
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="benchmark-value">
                <b className={profile.sectorChangePct >= 0 ? "positive" : "negative"}>
                  {profile.sectorChangePct >= 0 ? "+" : ""}
                  {profile.sectorChangePct.toFixed(1)}%
                </b>
              </div>
            </div>

            {/* Market Index Bar */}
            <div className="benchmark-row benchmark-index">
              <div className="benchmark-meta">
                <span className="tag-index">MARKET</span>
                <strong>{profile.marketIndex}</strong>
                <small>Broad Market Beta</small>
              </div>
              <div className="benchmark-bar-wrapper">
                <div
                  className={`benchmark-bar-fill index-bar ${
                    profile.marketChangePct >= 0 ? "positive-bar" : "negative-bar"
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max((Math.abs(profile.marketChangePct) / 6) * 100, 8),
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="benchmark-value">
                <b className={profile.marketChangePct >= 0 ? "positive" : "negative"}>
                  {profile.marketChangePct >= 0 ? "+" : ""}
                  {profile.marketChangePct.toFixed(1)}%
                </b>
              </div>
            </div>
          </div>

          {/* Competitor Matrix Table */}
          <div className="competitor-table-container">
            <table className="competitor-matrix-table">
              <thead>
                <tr>
                  <th>COMPANY / PEER</th>
                  <th>PRICE</th>
                  <th>1D CHANGE</th>
                  <th>DIVERGENCE VS {profile.symbol}</th>
                  <th>VOLUME</th>
                  <th>P/E</th>
                  <th>MARKET CAP</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {/* Target row */}
                <tr className="target-table-row">
                  <td>
                    <div className="table-stock-cell">
                      <span className={`table-mini-logo ${isPositive ? "positive" : "negative"}`}>
                        {profile.symbol.slice(0, 2)}
                      </span>
                      <div>
                        <strong>
                          {profile.symbol}{" "}
                          <span className="current-badge">SELECTED</span>
                        </strong>
                        <small>{profile.name}</small>
                      </div>
                    </div>
                  </td>
                  <td>₹{profile.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className={isPositive ? "positive" : "negative"}>
                    {isPositive ? "+" : ""}
                    {profile.priceChangePct.toFixed(1)}%
                  </td>
                  <td>
                    <span className="divergence-pill baseline">Target Baseline</span>
                  </td>
                  <td>
                    <span className={profile.volumeRatio > 1.5 ? "volume-spike" : ""}>
                      {profile.volumeRatio.toFixed(1)}x
                    </span>
                  </td>
                  <td>--</td>
                  <td>--</td>
                  <td>
                    <button
                      className="table-action-btn"
                      onClick={() => {
                        onAskSmartPilot(`Why is ${profile.symbol} moving today?`);
                        onClose();
                      }}
                    >
                      Analyze
                    </button>
                  </td>
                </tr>

                {/* Peer rows */}
                {profile.competitors.map((peer) => {
                  const peerPositive = peer.priceChangePct >= 0;
                  const divergenceDelta = profile.priceChangePct - peer.priceChangePct;
                  const isDivergencePositive = divergenceDelta >= 0;

                  return (
                    <tr key={peer.symbol}>
                      <td>
                        <div className="table-stock-cell">
                          <span
                            className={`table-mini-logo ${
                              peerPositive ? "positive" : "negative"
                            }`}
                          >
                            {peer.symbol.slice(0, 2)}
                          </span>
                          <div>
                            <strong>{peer.symbol}</strong>
                            <small>{peer.name}</small>
                          </div>
                        </div>
                      </td>
                      <td>₹{peer.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className={peerPositive ? "positive" : "negative"}>
                        {peerPositive ? "+" : ""}
                        {peer.priceChangePct.toFixed(1)}%
                      </td>
                      <td>
                        <span
                          className={`divergence-pill ${
                            isDivergencePositive ? "outperforming" : "lagging"
                          }`}
                        >
                          {isDivergencePositive ? "+" : ""}
                          {divergenceDelta.toFixed(1)}pp {isDivergencePositive ? "ahead" : "behind"}
                        </span>
                      </td>
                      <td>{peer.volumeRatio.toFixed(1)}x</td>
                      <td>{peer.peRatio.toFixed(1)}</td>
                      <td>{peer.marketCap}</td>
                      <td>
                        <button
                          className="table-action-btn"
                          onClick={() => {
                            onAskSmartPilot(
                              `Why did ${profile.symbol} diverge from ${peer.symbol} today?`
                            );
                            onClose();
                          }}
                        >
                          Compare AI
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="competitor-modal-footer">
          <div className="footer-disclaimer">
            <Info size={14} />
            <span>
              Relative movement estimate based on public exchange feeds. Not causal attribution or investment advice.
            </span>
          </div>
          <button className="primary-button" onClick={onClose}>
            Done Exploring
          </button>
        </footer>
      </div>
    </div>
  );
}
