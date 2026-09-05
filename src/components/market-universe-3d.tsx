"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Sparkles, ArrowDownRight, ArrowUpRight, Zap, X, ShieldCheck } from "lucide-react";

export type StockNodeData = {
  symbol: string;
  name: string;
  sector: "Technology" | "Banking" | "Energy" | "Auto";
  price: string;
  change: string;
  changePct: number;
  significance: "HIGH" | "MODERATE" | "LOW";
  score: number;
  volumeRatio: string;
  reason: string;
  position: [number, number, number];
  color: string;
  isMeaningful: boolean;
};

export const MARKET_NODES: StockNodeData[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy",
    price: "₹2,841.50",
    change: "-3.8%",
    changePct: -3.8,
    significance: "HIGH",
    score: 91,
    volumeRatio: "2.6x",
    reason: "Diverged from sector with 2.6x volume anomaly and company-specific selling pressure.",
    position: [2.8, -0.4, 0.5],
    color: "#ff5252",
    isMeaningful: true,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "Technology",
    price: "₹3,862.40",
    change: "+4.2%",
    changePct: 4.2,
    significance: "HIGH",
    score: 88,
    volumeRatio: "1.8x",
    reason: "Substantially outperforming NIFTY 50 and tech peers on enterprise deals expansion.",
    position: [-2.6, 1.4, 0.2],
    color: "#10b981",
    isMeaningful: true,
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    sector: "Technology",
    price: "₹1,488.15",
    change: "-1.9%",
    changePct: -1.9,
    significance: "MODERATE",
    score: 58,
    volumeRatio: "1.1x",
    reason: "Movement is in line with broader technology sector index trend today.",
    position: [-3.8, 0.4, -0.6],
    color: "#38bdf8",
    isMeaningful: false,
  },
  {
    symbol: "HCLTECH",
    name: "HCL Technologies",
    sector: "Technology",
    price: "₹1,560.00",
    change: "+0.8%",
    changePct: 0.8,
    significance: "LOW",
    score: 34,
    volumeRatio: "0.9x",
    reason: "Low volume sideways drift aligned with broad tech market.",
    position: [-1.8, 2.3, -0.8],
    color: "#64748b",
    isMeaningful: false,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    sector: "Banking",
    price: "₹1,743.20",
    change: "+1.1%",
    changePct: 1.1,
    significance: "LOW",
    score: 43,
    volumeRatio: "0.9x",
    reason: "Normal market trading activity with no anomalous institutional flows.",
    position: [0.3, -1.8, 1.2],
    color: "#38bdf8",
    isMeaningful: false,
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    sector: "Banking",
    price: "₹1,215.30",
    change: "+0.6%",
    changePct: 0.6,
    significance: "LOW",
    score: 39,
    volumeRatio: "1.0x",
    reason: "Steady session moving synchronously with Bank Nifty.",
    position: [-0.8, -2.5, 0.4],
    color: "#64748b",
    isMeaningful: false,
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    sector: "Banking",
    price: "₹812.60",
    change: "-0.5%",
    changePct: -0.5,
    significance: "LOW",
    score: 41,
    volumeRatio: "0.8x",
    reason: "Quiet session within standard 20-day volatility band.",
    position: [1.6, -2.4, -0.5],
    color: "#64748b",
    isMeaningful: false,
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    sector: "Auto",
    price: "₹984.50",
    change: "+2.7%",
    changePct: 2.7,
    significance: "MODERATE",
    score: 72,
    volumeRatio: "1.6x",
    reason: "Commercial vehicle sales print triggered moderate positive momentum divergence.",
    position: [2.1, 1.8, -1.2],
    color: "#38bdf8",
    isMeaningful: true,
  },
  {
    symbol: "MARUTI",
    name: "Maruti Suzuki India",
    sector: "Auto",
    price: "₹12,450.00",
    change: "+0.3%",
    changePct: 0.3,
    significance: "LOW",
    score: 32,
    volumeRatio: "0.7x",
    reason: "In line with domestic auto benchmark.",
    position: [3.4, 1.2, -1.6],
    color: "#64748b",
    isMeaningful: false,
  },
];

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export default function MarketUniverse3D({ onSelectStock }: { onSelectStock?: (stock: StockNodeData) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoveredStock, setHoveredStock] = useState<{
    stock: StockNodeData;
    x: number;
    y: number;
  } | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<StockNodeData | null>(null);

  const handleStockClick = useCallback((stock: StockNodeData) => {
    setSelectedPreview(stock);
    if (onSelectStock) onSelectStock(stock);
  }, [onSelectStock]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const motionPref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const webglSupport = isWebGLAvailable();
    setReducedMotion(motionPref);
    setHasWebGL(webglSupport);

    if (motionPref || !webglSupport || !canvasRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.08);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x5c9aff, 2.5, 30);
    pointLight.position.set(0, 4, 6);
    scene.add(pointLight);

    const redGlowLight = new THREE.PointLight(0xff5252, 2.2, 15);
    redGlowLight.position.set(2.8, -0.4, 1.5);
    scene.add(redGlowLight);

    // Sector Cluster Hubs
    const sectors = [
      { name: "TECHNOLOGY", pos: [-2.8, 1.2, -0.2], color: 0x38bdf8 },
      { name: "BANKING", pos: [0.4, -2.1, 0.3], color: 0x818cf8 },
      { name: "ENERGY", pos: [2.5, -0.6, 0.2], color: 0xf59e0b },
      { name: "AUTO", pos: [2.6, 1.5, -1.2], color: 0x34d399 },
    ];

    const sectorGroup = new THREE.Group();
    sectors.forEach((sec) => {
      const hubGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const hubMat = new THREE.MeshBasicMaterial({
        color: sec.color,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.position.set(sec.pos[0], sec.pos[1], sec.pos[2]);
      sectorGroup.add(hubMesh);
    });
    scene.add(sectorGroup);

    // Background Particle Field
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 22;
      particlePositions[i + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Stock Nodes
    const nodeMeshes: { mesh: THREE.Mesh; stock: StockNodeData; halo?: THREE.Mesh }[] = [];
    const stockGroup = new THREE.Group();

    MARKET_NODES.forEach((stock) => {
      // Node size scaled to significance score (0.16 to 0.38)
      const radius = 0.16 + (stock.score / 100) * 0.22;
      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);

      const colorHex = new THREE.Color(stock.color);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: stock.isMeaningful ? 0.7 : 0.25,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(...stock.position);
      (mesh as unknown as { __stockData: StockNodeData }).__stockData = stock;
      stockGroup.add(mesh);

      let halo: THREE.Mesh | undefined;
      if (stock.isMeaningful) {
        const haloGeo = new THREE.RingGeometry(radius * 1.35, radius * 1.6, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(...stock.position);
        stockGroup.add(halo);
      }

      nodeMeshes.push({ mesh, stock, halo });
    });
    scene.add(stockGroup);

    // Connection lines between peers
    const linePairs: [number, number][] = [
      [0, 6], // RELIANCE - SBIN
      [1, 2], // TCS - INFY
      [1, 3], // TCS - HCLTECH
      [2, 3], // INFY - HCLTECH
      [4, 5], // HDFCBANK - ICICIBANK
      [4, 6], // HDFCBANK - SBIN
      [7, 8], // TATAMOTORS - MARUTI
      [0, 7], // RELIANCE - TATAMOTORS
    ];

    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    linePairs.forEach(([idxA, idxB]) => {
      const a = MARKET_NODES[idxA];
      const b = MARKET_NODES[idxB];
      if (a && b) {
        linePositions.push(...a.position, ...b.position);
      }
    });
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // Raycasting & Pointer Interactions
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-999, -999);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));

      if (intersects.length > 0) {
        const hit = (intersects[0].object as unknown as { __stockData: StockNodeData }).__stockData;
        container.style.cursor = "pointer";
        setHoveredStock({
          stock: hit,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        container.style.cursor = "default";
        setHoveredStock(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));

      if (intersects.length > 0) {
        const hit = (intersects[0].object as unknown as { __stockData: StockNodeData }).__stockData;
        handleStockClick(hit);
      }
    };

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("click", onClick);

    // Scroll-based camera transition:
    // Stage 1 (top): Market Universe (z=9.5)
    // Stage 2 (scroll 150-500px): Watchlist focus (z=7.5, camera y adjusts)
    // Stage 3 (scroll >500px): Meaningful changes focus (z=6.2, tilted toward Reliance)
    let currentScroll = window.scrollY;
    let targetCameraZ = 9.5;
    let targetCameraX = 0;
    let targetCameraY = 0;

    const onScroll = () => {
      currentScroll = window.scrollY;
      const scrollFactor = Math.min(currentScroll / 800, 1.2);
      targetCameraZ = 9.5 - scrollFactor * 3.5;
      targetCameraX = scrollFactor * 1.1; // move slightly toward right cluster (Reliance)
      targetCameraY = -scrollFactor * 0.4;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // IntersectionObserver: Pause RAF when hero is out of view
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera interpolation
      camera.position.z += (targetCameraZ - camera.position.z) * 0.04;
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;

      // Slow elegant rotation of entire universe
      stockGroup.rotation.y += 0.0018;
      sectorGroup.rotation.y += 0.0018;
      lineSegments.rotation.y += 0.0018;
      particles.rotation.y -= 0.0006;

      // Pulse meaningful nodes
      nodeMeshes.forEach(({ halo, stock }) => {
        if (halo && stock.isMeaningful) {
          const pulse = Math.sin(time * 3.2 + (stock.symbol === "RELIANCE" ? 0 : 1.5)) * 0.25 + 1;
          halo.scale.set(pulse, pulse, pulse);
          (halo.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(time * 3.2) * 0.25;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("click", onClick);

      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      nodeMeshes.forEach((n) => {
        n.mesh.geometry.dispose();
        (n.mesh.material as THREE.Material).dispose();
        if (n.halo) {
          n.halo.geometry.dispose();
          (n.halo.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
    };
  }, [handleStockClick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] lg:h-[620px] overflow-hidden rounded-3xl bg-radial from-[#131b2e]/40 via-[#0a0d16]/80 to-transparent border border-white/5 select-none"
      aria-label="3D Market Intelligence Universe"
    >
      {/* 3D WebGL Canvas */}
      {!reducedMotion && hasWebGL ? (
        <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
      ) : (
        /* Static 2D Elegant Fallback for reduced motion / mobile / unsupported WebGL */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl z-10">
            {MARKET_NODES.slice(0, 4).map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleStockClick(stock)}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#5c9aff]/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-slate-400">{stock.sector}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                      stock.changePct >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                    }`}
                  >
                    {stock.change}
                  </span>
                </div>
                <div className="font-bold text-white text-base group-hover:text-[#5c9aff]">{stock.symbol}</div>
                <div className="text-xs text-slate-400 truncate">{stock.name}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Significance</span>
                  <span className={stock.score > 75 ? "text-rose-400 font-bold" : "text-slate-300"}>
                    {stock.score}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 text-xs text-slate-500 z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive 2D constellation fallback active</span>
          </div>
        </div>
      )}

      {/* Floating Tooltip when hovering over a 3D node */}
      {hoveredStock && (
        <div
          className="absolute pointer-events-none z-30 transition-all duration-75"
          style={{
            left: `${hoveredStock.x + 16}px`,
            top: `${hoveredStock.y - 48}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="px-3.5 py-2.5 rounded-xl bg-[#090d16]/95 backdrop-blur-md border border-white/20 shadow-2xl text-xs space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold text-white tracking-wide">{hoveredStock.stock.symbol}</span>
              <span
                className={`font-mono font-semibold ${
                  hoveredStock.stock.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {hoveredStock.stock.change}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
              <span>{hoveredStock.stock.sector}</span>
              <span
                className={`font-semibold ${
                  hoveredStock.stock.score > 75 ? "text-rose-400" : "text-sky-400"
                }`}
              >
                Score {hoveredStock.stock.score}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-0.5 border-t border-white/10">Click for intelligence trace</div>
          </div>
        </div>
      )}

      {/* Interactive Intelligence Preview Modal when clicking any node */}
      {selectedPreview && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f1d] border border-white/20 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPreview(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>

            <div className="flex items-start justify-between pr-8">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-[#5c9aff] uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5c9aff] animate-ping" />
                  {selectedPreview.sector} CLUSTER
                </span>
                <h3 className="text-2xl font-bold text-white">{selectedPreview.symbol}</h3>
                <p className="text-xs text-slate-400">{selectedPreview.name}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-white">{selectedPreview.price}</div>
                <div
                  className={`text-xs font-mono font-semibold inline-flex items-center justify-end gap-0.5 ${
                    selectedPreview.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {selectedPreview.changePct >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {selectedPreview.change}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Significance Level</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    selectedPreview.score > 75
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  }`}
                >
                  {selectedPreview.significance} ({selectedPreview.score}/100)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Volume vs 20-Day Avg</span>
                <span className="font-mono text-white font-semibold">{selectedPreview.volumeRatio}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" />
                Why it matters:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">
                {selectedPreview.reason}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-400" /> Illustrative Intelligence Sample
              </span>
              <a
                href="/login"
                className="text-[#5c9aff] hover:underline font-semibold flex items-center gap-0.5"
              >
                Track in dashboard &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Visual Corner Badges & Legend */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-[#0b101c]/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#5c9aff]" />
          <span>LIVING MARKET UNIVERSE</span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-black/40 px-2 py-1 rounded-full border border-white/5">
          Hover or click nodes
        </span>
      </div>

      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 text-[11px] text-slate-400 bg-[#090d16]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> High Significance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" /> Technology
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400" /> Banking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Energy
        </span>
      </div>
    </div>
  );
}
