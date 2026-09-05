"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ExternalLink, Layers, Sparkles, Activity } from "lucide-react";

export interface DashboardCardItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  score: string;
  initialPos: {
    x: number; // percentage or px offset
    y: number;
    z: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    scale: number;
  };
  floatSpeed: number;
  floatDelay: number;
}

const DASHBOARD_CARDS: DashboardCardItem[] = [
  {
    id: "card-overview",
    title: "Overview & Signal Intelligence",
    subtitle: "Real-time context & attention budget",
    image: "/images/dashboard-overview.png",
    tag: "LIVE INTELLIGENCE",
    score: "91 SCORE",
    initialPos: {
      x: 0,
      y: 0,
      z: 40,
      rotateX: 6,
      rotateY: -8,
      rotateZ: -1.5,
      scale: 1,
    },
    floatSpeed: 4.5,
    floatDelay: 0,
  },
  {
    id: "card-watchlist",
    title: "Smart Watchlist Matrix",
    subtitle: "Relative divergence vs peer average",
    image: "/images/dashboard-watchlist.png",
    tag: "ISOLATION 88%",
    score: "+4.2% TCS",
    initialPos: {
      x: 45,
      y: -28,
      z: 15,
      rotateX: 8,
      rotateY: -14,
      rotateZ: 2,
      scale: 0.88,
    },
    floatSpeed: 5.2,
    floatDelay: 0.6,
  },
  {
    id: "card-smartpilot",
    title: "SmartPilot AI Agent",
    subtitle: "Autonomous context reasoning",
    image: "/images/dashboard-smartpilot.png",
    tag: "AI COPILOT",
    score: "VALIDATED",
    initialPos: {
      x: -42,
      y: 35,
      z: 25,
      rotateX: 4,
      rotateY: -4,
      rotateZ: -2.5,
      scale: 0.86,
    },
    floatSpeed: 4.8,
    floatDelay: 1.2,
  },
  {
    id: "card-isolation",
    title: "Noise Filter Engine",
    subtitle: "Company-specific signal isolation",
    image: "/images/dashboard-isolation.png",
    tag: "NOISE FILTER",
    score: "78/100",
    initialPos: {
      x: 35,
      y: 42,
      z: 5,
      rotateX: 10,
      rotateY: -12,
      rotateZ: 1.5,
      scale: 0.82,
    },
    floatSpeed: 5.6,
    floatDelay: 1.8,
  },
];

interface DashboardCards3DProps {
  mousePosition?: { x: number; y: number };
  containerScrollProgress?: MotionValue<number>;
}

export default function DashboardCards3D({
  mousePosition = { x: 0, y: 0 },
  containerScrollProgress,
}: DashboardCards3DProps) {
  const [activeCard, setActiveCard] = useState<string>("card-overview");

  // Fallback scroll if none passed
  const { scrollYProgress } = useScroll();
  const scrollProg = containerScrollProgress || scrollYProgress;

  // Scroll transforms: cards move slightly deeper into 3D space
  const scrollDepth = useTransform(scrollProg, [0, 0.4], [0, -90]);
  const scrollRotateX = useTransform(scrollProg, [0, 0.4], [0, 12]);
  const scrollScale = useTransform(scrollProg, [0, 0.4], [1, 0.94]);

  return (
    <div
      className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] flex items-center justify-center pointer-events-auto select-none"
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      {DASHBOARD_CARDS.map((card, idx) => {
        const isPrimary = card.id === activeCard;
        // Parallax multipliers
        const parallaxX = mousePosition.x * (idx === 0 ? 24 : 14 * (idx + 1));
        const parallaxY = mousePosition.y * (idx === 0 ? 18 : 12 * (idx + 1));
        const tiltX = -mousePosition.y * 10;
        const tiltY = mousePosition.x * 12;

        return (
          <motion.div
            key={card.id}
            onClick={() => setActiveCard(card.id)}
            className="absolute cursor-pointer transition-shadow"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{
              opacity: 1,
              x: `${card.initialPos.x}%`,
              y: `${card.initialPos.y}%`,
              scale: isPrimary ? 1.02 : card.initialPos.scale,
              rotateX: card.initialPos.rotateX + tiltX,
              rotateY: card.initialPos.rotateY + tiltY,
              rotateZ: card.initialPos.rotateZ,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
            }}
            whileHover={{
              scale: 1.05,
              zIndex: 50,
              transition: { duration: 0.25 },
            }}
            style={{
              zIndex: isPrimary ? 30 : 20 - idx,
              transformStyle: "preserve-3d",
              width: "min(92%, 580px)",
              // Parallax and scroll depth
              marginLeft: parallaxX,
              marginTop: parallaxY,
              translateZ: scrollDepth,
            }}
          >
            {/* Floating sine bobbing wrapper */}
            <motion.div
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: card.floatSpeed,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: card.floatDelay,
              }}
              className="relative group rounded-2xl p-[1px] transition-all duration-300"
            >
              {/* Glassmorphism Outer Border with soft blue glow */}
              <div
                className={`absolute -inset-[1px] rounded-2xl transition-opacity duration-500 blur-sm pointer-events-none ${
                  isPrimary
                    ? "bg-gradient-to-r from-[#5c9aff]/50 via-[#38bdf8]/40 to-emerald-400/30 opacity-100"
                    : "bg-gradient-to-r from-white/15 via-white/5 to-transparent opacity-40 group-hover:opacity-80"
                }`}
              />

              {/* Card Container */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0a0f1d]/90 backdrop-blur-xl border border-white/15 shadow-[0_25px_60px_-15px_rgba(5,15,35,0.85)] group-hover:shadow-[0_30px_70px_-10px_rgba(92,154,255,0.25)] transition-all duration-300">
                {/* Subtle glass reflection sheen */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)",
                  }}
                />

                {/* Top bar header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.03] border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 font-semibold tracking-wide ml-1.5">
                      {card.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#5c9aff]/15 text-[#5c9aff] border border-[#5c9aff]/30">
                      {card.tag}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold hidden sm:inline-block">
                      {card.score}
                    </span>
                  </div>
                </div>

                {/* Dashboard Screenshot Image with lazy loading */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#070b16]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 580px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {/* Soft bottom gradient to blend */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d]/60 via-transparent to-transparent pointer-events-none" />

                  {/* Highlight pill on hover */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-200">
                      <Activity size={10} className="text-[#38bdf8]" />
                      <span>{card.subtitle}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#5c9aff] bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-[#5c9aff]/20">
                      <span>Interactive Preview</span>
                      <ExternalLink size={10} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Ambient subtle floor glow underneath the suspended cards */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-24 bg-gradient-to-t from-[#5c9aff]/15 via-[#38bdf8]/5 to-transparent blur-3xl pointer-events-none rounded-full"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
