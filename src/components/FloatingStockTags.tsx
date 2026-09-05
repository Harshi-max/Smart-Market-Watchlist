"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

export interface StockTagItem {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
  score?: number;
  initialX: number; // percentage (-50 to 50)
  initialY: number; // percentage (-50 to 50)
  driftDirection: "ltr" | "rtl";
  driftDistance: number;
  duration: number;
  delay: number;
  parallaxFactor: number;
}

const STOCK_TAGS: StockTagItem[] = [
  {
    symbol: "RELIANCE",
    price: "₹1,412.60",
    change: "-3.8%",
    up: false,
    score: 91,
    initialX: -36,
    initialY: -32,
    driftDirection: "ltr",
    driftDistance: 16,
    duration: 6.8,
    delay: 0,
    parallaxFactor: 0.7,
  },
  {
    symbol: "TCS",
    price: "₹3,862.40",
    change: "+4.2%",
    up: true,
    score: 88,
    initialX: 38,
    initialY: -36,
    driftDirection: "rtl",
    driftDistance: 18,
    duration: 7.4,
    delay: 0.5,
    parallaxFactor: 0.9,
  },
  {
    symbol: "NIFTY 50",
    price: "24,412.40",
    change: "+0.4%",
    up: true,
    initialX: -40,
    initialY: 6,
    driftDirection: "rtl",
    driftDistance: 14,
    duration: 8.2,
    delay: 1.2,
    parallaxFactor: 0.5,
  },
  {
    symbol: "ICICI",
    price: "₹1,248.30",
    change: "+1.9%",
    up: true,
    initialX: 42,
    initialY: 4,
    driftDirection: "ltr",
    driftDistance: 15,
    duration: 6.2,
    delay: 0.8,
    parallaxFactor: 0.8,
  },
  {
    symbol: "INFY",
    price: "₹1,488.15",
    change: "-1.9%",
    up: false,
    initialX: -32,
    initialY: 38,
    driftDirection: "ltr",
    driftDistance: 18,
    duration: 7.8,
    delay: 1.6,
    parallaxFactor: 0.6,
  },
  {
    symbol: "HDFCBANK",
    price: "₹1,743.20",
    change: "+1.1%",
    up: true,
    initialX: 34,
    initialY: 36,
    driftDirection: "rtl",
    driftDistance: 16,
    duration: 6.5,
    delay: 1.0,
    parallaxFactor: 0.85,
  },
  {
    symbol: "BANKNIFTY",
    price: "52,380.10",
    change: "+0.8%",
    up: true,
    initialX: 0,
    initialY: -44,
    driftDirection: "ltr",
    driftDistance: 12,
    duration: 9.0,
    delay: 0.3,
    parallaxFactor: 0.4,
  },
];

interface FloatingStockTagsProps {
  mousePosition?: { x: number; y: number };
  className?: string;
}

export default function FloatingStockTags({
  mousePosition = { x: 0, y: 0 },
  className = "",
}: FloatingStockTagsProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-20 ${className}`}
      aria-hidden="true"
    >
      {STOCK_TAGS.map((tag) => {
        const driftX = tag.driftDirection === "ltr" ? tag.driftDistance : -tag.driftDistance;
        const parallaxOffsetX = mousePosition.x * tag.parallaxFactor * 22;
        const parallaxOffsetY = mousePosition.y * tag.parallaxFactor * 18;

        return (
          <motion.div
            key={tag.symbol}
            className="absolute left-1/2 top-1/2 pointer-events-auto"
            style={{
              x: `calc(${tag.initialX}% - 50%)`,
              y: `calc(${tag.initialY}% - 50%)`,
            }}
          >
            {/* Continuous drifting & gentle vertical bobbing */}
            <motion.div
              animate={{
                x: [0, driftX, 0],
                y: [0, -8, 0],
              }}
              transition={{
                duration: tag.duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: tag.delay,
              }}
              style={{
                marginLeft: parallaxOffsetX,
                marginTop: parallaxOffsetY,
              }}
              whileHover={{
                scale: 1.1,
                zIndex: 60,
                transition: { duration: 0.2 },
              }}
              className="group cursor-pointer"
            >
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md transition-all duration-300 ${
                  tag.up
                    ? "bg-[#0b1424]/80 border border-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.12)] group-hover:border-emerald-500/50 group-hover:shadow-[0_4px_25px_rgba(16,185,129,0.25)]"
                    : "bg-[#0b1424]/80 border border-rose-500/25 shadow-[0_4px_20px_rgba(244,63,94,0.12)] group-hover:border-rose-500/50 group-hover:shadow-[0_4px_25px_rgba(244,63,94,0.25)]"
                }`}
              >
                {/* Micro logo / status icon */}
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    tag.up ? "bg-emerald-400 shadow-[0_0_6px_#10b981]" : "bg-rose-400 shadow-[0_0_6px_#f43f5e]"
                  }`}
                />

                {/* Symbol & Price */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-white tracking-wider">
                    {tag.symbol}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                    {tag.price}
                  </span>
                </div>

                {/* Change pill */}
                <div
                  className={`flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md ${
                    tag.up ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                  }`}
                >
                  {tag.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  <span>{tag.change}</span>
                </div>

                {/* Significance badge if score exists */}
                {tag.score && (
                  <span className="text-[8px] font-mono bg-[#5c9aff]/20 text-[#5c9aff] px-1 py-0.5 rounded border border-[#5c9aff]/30 hidden md:inline-block">
                    ★{tag.score}
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
