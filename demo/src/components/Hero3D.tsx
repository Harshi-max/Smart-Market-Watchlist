"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import MarketParticles from "./MarketParticles";
import DashboardCards3D from "./DashboardCards3D";
import FloatingStockTags from "./FloatingStockTags";

interface Hero3DProps {
  className?: string;
}

export default function Hero3D({ className = "" }: Hero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tracking with normalized (-1 to 1) coordinates
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  // Framer Motion Scroll Animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Smooth springs for scroll transformations
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  // Subtle hero scaling down and sinking into depth on scroll
  const heroScale = useTransform(smoothScroll, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(smoothScroll, [0, 0.85, 1], [1, 0.9, 0.4]);
  const heroY = useTransform(smoothScroll, [0, 1], [0, 40]);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        scale: heroScale,
        opacity: heroOpacity,
        y: heroY,
      }}
      className={`relative w-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#080d1e]/80 via-[#070b18]/90 to-[#050811] shadow-[0_20px_80px_-20px_rgba(56,189,248,0.15)] ${className}`}
    >
      {/* 1. Subtle Radial Ambient Lighting inside container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#5c9aff]/10 via-[#38bdf8]/5 to-transparent rounded-full blur-3xl transition-transform duration-700 ease-out"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 40}px), calc(-50% + ${mousePos.y * 30}px))`,
          }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Three.js Background: Market Nodes, Connecting Lines, Ambient Particles */}
      <MarketParticles mousePosition={mousePos} />

      {/* 3. Floating Stock Tags drifting around dashboard */}
      <FloatingStockTags mousePosition={mousePos} />

      {/* 4. Layered 3D Floating Dashboard Showcase */}
      <div className="relative z-10 py-6 sm:py-10 px-2 sm:px-6">
        <DashboardCards3D
          mousePosition={mousePos}
          containerScrollProgress={smoothScroll}
        />
      </div>

      {/* 5. Sleek Minimal Interactive Cue at bottom of container */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-t border-white/[0.06] bg-white/[0.01] backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive 3D Stage · Mouse Parallax Active</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-500">
          <span>Click cards to focus</span>
          <span className="text-slate-700">|</span>
          <span className="text-[#5c9aff]">60 FPS GPU-accelerated</span>
        </div>
      </div>
    </motion.div>
  );
}
