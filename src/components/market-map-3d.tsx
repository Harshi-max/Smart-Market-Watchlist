"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Activity, Layers, RotateCcw, Sparkles, X, ChevronRight } from "lucide-react";

export type MarketMapNode = {
  symbol: string;
  name: string;
  sector: "Technology" | "Banking" | "Energy" | "Healthcare" | "Consumer" | "Auto";
  price: string;
  change: string;
  changePct: number;
  score: number;
  volume: string;
  eventPulse?: boolean;
  position: [number, number, number];
  color: string;
};

const SECTORS_6 = [
  { name: "Technology", color: 0x38bdf8, hex: "#38bdf8", center: [-3.2, 1.6, 0] },
  { name: "Banking", color: 0x818cf8, hex: "#818cf8", center: [0, -2.6, 0.4] },
  { name: "Energy", color: 0xf59e0b, hex: "#f59e0b", center: [3.4, -0.6, 0.2] },
  { name: "Healthcare", color: 0x10b981, hex: "#10b981", center: [-2.6, -1.8, -1.2] },
  { name: "Consumer", color: 0xec4899, hex: "#ec4899", center: [2.8, 2.1, -0.8] },
  { name: "Auto", color: 0x06b6d4, hex: "#06b6d4", center: [0.4, 2.8, 1.1] },
];

const MAP_NODES_DATA: MarketMapNode[] = [
  // Tech
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "Technology", price: "₹3,862.40", change: "+4.2%", changePct: 4.2, score: 88, volume: "1.8x", eventPulse: true, position: [-3.6, 2.2, 0.4], color: "#10b981" },
  { symbol: "INFY", name: "Infosys Ltd", sector: "Technology", price: "₹1,488.15", change: "-1.9%", changePct: -1.9, score: 58, volume: "1.1x", position: [-2.8, 1.2, -0.4], color: "#38bdf8" },
  { symbol: "HCLTECH", name: "HCL Technologies", sector: "Technology", price: "₹1,560.00", change: "+0.8%", changePct: 0.8, score: 34, volume: "0.9x", position: [-3.8, 0.8, 0.1], color: "#64748b" },
  { symbol: "WIPRO", name: "Wipro Ltd", sector: "Technology", price: "₹482.30", change: "-0.4%", changePct: -0.4, score: 28, volume: "0.8x", position: [-2.4, 2.4, -0.3], color: "#64748b" },

  // Banking
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: "₹1,743.20", change: "+1.1%", changePct: 1.1, score: 43, volume: "0.9x", position: [-0.4, -2.2, 0.8], color: "#818cf8" },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", price: "₹1,215.30", change: "+0.6%", changePct: 0.6, score: 39, volume: "1.0x", position: [0.6, -3.1, 0.2], color: "#818cf8" },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", price: "₹812.60", change: "-0.5%", changePct: -0.5, score: 41, volume: "0.8x", position: [-0.8, -3.0, 0.1], color: "#64748b" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", price: "₹1,780.00", change: "+0.2%", changePct: 0.2, score: 31, volume: "0.7x", position: [0.8, -2.0, 0.6], color: "#64748b" },

  // Energy
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", price: "₹2,841.50", change: "-3.8%", changePct: -3.8, score: 91, volume: "2.6x", eventPulse: true, position: [3.6, -0.4, 0.6], color: "#ff5252" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", sector: "Energy", price: "₹298.40", change: "-0.9%", changePct: -0.9, score: 48, volume: "1.2x", position: [2.9, -1.2, -0.2], color: "#f59e0b" },
  { symbol: "NTPC", name: "NTPC Ltd", sector: "Energy", price: "₹412.00", change: "+1.4%", changePct: 1.4, score: 52, volume: "1.3x", position: [4.0, -1.0, 0.1], color: "#10b981" },

  // Healthcare
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Healthcare", price: "₹1,820.00", change: "+1.9%", changePct: 1.9, score: 64, volume: "1.4x", position: [-2.8, -1.4, -1.6], color: "#10b981" },
  { symbol: "CIPLA", name: "Cipla Ltd", sector: "Healthcare", price: "₹1,540.00", change: "+0.5%", changePct: 0.5, score: 36, volume: "0.9x", position: [-2.2, -2.3, -0.8], color: "#64748b" },

  // Consumer
  { symbol: "ITC", name: "ITC Ltd", sector: "Consumer", price: "₹504.20", change: "+0.7%", changePct: 0.7, score: 42, volume: "1.1x", position: [2.4, 2.5, -0.5], color: "#ec4899" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "Consumer", price: "₹2,720.00", change: "-1.1%", changePct: -1.1, score: 49, volume: "1.0x", position: [3.3, 1.7, -1.1], color: "#ec4899" },

  // Auto
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", price: "₹984.50", change: "+2.7%", changePct: 2.7, score: 72, volume: "1.6x", eventPulse: true, position: [0.2, 3.2, 1.4], color: "#38bdf8" },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", price: "₹12,450.00", change: "+0.3%", changePct: 0.3, score: 32, volume: "0.7x", position: [1.0, 2.5, 0.7], color: "#64748b" },
];

export default function MarketMap3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ node: MarketMapNode; x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<MarketMapNode | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = window.innerWidth < 768;
    setIsMobile(checkMobile);

    const testCanvas = document.createElement("canvas");
    const webglOk = Boolean(window.WebGLRenderingContext && (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl")));
    setHasWebGL(webglOk);

    if (checkMobile || !webglOk || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a12, 0.07);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x5c9aff, 3, 35);
    pointLight.position.set(2, 5, 8);
    scene.add(pointLight);

    // Sector Clusters
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    SECTORS_6.forEach((sec) => {
      const ringGeo = new THREE.RingGeometry(0.9, 0.95, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: sec.color, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(sec.center[0], sec.center[1], sec.center[2]);
      rootGroup.add(ringMesh);
    });

    // Stock Nodes
    const nodeMeshes: { mesh: THREE.Mesh; node: MarketMapNode; pulseMesh?: THREE.Mesh }[] = [];

    MAP_NODES_DATA.forEach((node) => {
      const radius = 0.15 + (node.score / 100) * 0.2;
      const sphereGeo = new THREE.SphereGeometry(radius, 20, 20);
      const colorHex = new THREE.Color(node.color);

      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: node.eventPulse ? 0.8 : 0.3,
        roughness: 0.25,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(...node.position);
      (mesh as unknown as { __nodeData: MarketMapNode }).__nodeData = node;
      rootGroup.add(mesh);

      let pulseMesh: THREE.Mesh | undefined;
      if (node.eventPulse) {
        const pGeo = new THREE.RingGeometry(radius * 1.4, radius * 1.7, 24);
        const pMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
        pulseMesh = new THREE.Mesh(pGeo, pMat);
        pulseMesh.position.set(...node.position);
        rootGroup.add(pulseMesh);
      }

      nodeMeshes.push({ mesh, node, pulseMesh });
    });

    // Peer Relationship Lines
    const linesPairs: [number, number][] = [
      [0, 1], [0, 2], [1, 3], // Tech
      [4, 5], [4, 6], [5, 7], // Banks
      [8, 9], [8, 10],        // Energy
      [11, 12],               // Healthcare
      [13, 14],               // Consumer
      [15, 16],               // Auto
      [0, 4], [8, 15], [0, 8] // Cross-sector interlocks
    ];

    const lineGeo = new THREE.BufferGeometry();
    const lineCoords: number[] = [];
    linesPairs.forEach(([a, b]) => {
      if (MAP_NODES_DATA[a] && MAP_NODES_DATA[b]) {
        lineCoords.push(...MAP_NODES_DATA[a].position, ...MAP_NODES_DATA[b].position);
      }
    });
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineCoords, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    rootGroup.add(lines);

    // Mouse / Touch Drag Orbiting
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodeMeshes.map((m) => m.mesh));

      if (hits.length > 0) {
        const hitData = (hits[0].object as unknown as { __nodeData: MarketMapNode }).__nodeData;
        container.style.cursor = "pointer";
        setHoveredNode({ node: hitData, x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        container.style.cursor = isDragging ? "grabbing" : "grab";
        setHoveredNode(null);
      }

      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rotationVelocityY = deltaX * 0.005;
      rotationVelocityX = deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(nodeMeshes.map((m) => m.mesh));
      if (hits.length > 0) {
        const hitData = (hits[0].object as unknown as { __nodeData: MarketMapNode }).__nodeData;
        setSelectedNode(hitData);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(Math.max(camera.position.z + e.deltaY * 0.008, 6), 16);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);
    container.addEventListener("wheel", onWheel, { passive: false });

    // IntersectionObserver to pause when out of viewport
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => { isVisible = entries[0].isIntersecting; }, { threshold: 0.1 });
    observer.observe(container);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const time = clock.getElapsedTime();

      // Inertial damping
      rootGroup.rotation.y += rotationVelocityY;
      rootGroup.rotation.x += rotationVelocityX;
      rotationVelocityY *= 0.92;
      rotationVelocityX *= 0.92;

      // Base rotation
      if (!isDragging) {
        rootGroup.rotation.y += 0.0012;
      }

      // Pulse animation
      nodeMeshes.forEach(({ pulseMesh, node }) => {
        if (pulseMesh && node.eventPulse) {
          const s = 1 + Math.sin(time * 3) * 0.22;
          pulseMesh.scale.set(s, s, s);
          (pulseMesh.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 3) * 0.3;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);
      container.removeEventListener("wheel", onWheel);

      lineGeo.dispose();
      lineMat.dispose();
      nodeMeshes.forEach((m) => {
        m.mesh.geometry.dispose();
        (m.mesh.material as THREE.Material).dispose();
        if (m.pulseMesh) {
          m.pulseMesh.geometry.dispose();
          (m.pulseMesh.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  const filteredNodes = activeSector
    ? MAP_NODES_DATA.filter((n) => n.sector === activeSector)
    : MAP_NODES_DATA;

  return (
    <div className="relative w-full h-[580px] rounded-3xl bg-[#080c16] border border-white/10 overflow-hidden select-none">
      {/* 3D Canvas (Desktop / WebGL) */}
      {!isMobile && hasWebGL ? (
        <div ref={containerRef} className="w-full h-full relative cursor-grab">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      ) : (
        /* 2D Interactive Sector Grid Fallback for Mobile / Non-WebGL */
        <div className="w-full h-full p-6 overflow-y-auto space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSector(null)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                !activeSector ? "bg-[#5c9aff] text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              All Sectors
            </button>
            {SECTORS_6.map((sec) => (
              <button
                key={sec.name}
                onClick={() => setActiveSector(sec.name)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeSector === sec.name
                    ? "bg-[#5c9aff] text-white font-bold"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredNodes.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => setSelectedNode(stock)}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#5c9aff]/50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{stock.symbol}</span>
                    <span className="text-[11px] text-slate-400">{stock.sector}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-1">{stock.price}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono text-xs font-semibold ${
                      stock.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {stock.change}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Score {stock.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none z-30 transition-transform duration-75"
          style={{
            left: `${hoveredNode.x + 14}px`,
            top: `${hoveredNode.y - 40}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="px-3 py-2 rounded-xl bg-[#090d16]/95 backdrop-blur-md border border-white/20 shadow-2xl text-xs space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-white">{hoveredNode.node.symbol}</span>
              <span
                className={`font-mono font-semibold ${
                  hoveredNode.node.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {hoveredNode.node.change}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{hoveredNode.node.name}</div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
              <span>{hoveredNode.node.sector}</span>
              <span className="text-sky-400 font-semibold">Significance {hoveredNode.node.score}</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Intelligence Preview Modal */}
      {selectedNode && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#090e1a] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <div>
              <span className="text-[10px] font-mono text-[#5c9aff] uppercase tracking-wider">{selectedNode.sector}</span>
              <h3 className="text-xl font-bold text-white">{selectedNode.symbol}</h3>
              <p className="text-xs text-slate-400">{selectedNode.name}</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block">Price</span>
                <strong className="text-white font-mono text-sm">{selectedNode.price}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Day Change</span>
                <strong className={`font-mono text-sm ${selectedNode.changePct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {selectedNode.change}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Significance</span>
                <strong className="text-sky-400 font-mono text-sm">{selectedNode.score}/100</strong>
              </div>
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-400 block mb-1">Volume Anomaly:</span>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-[11px]">
                Trading at <b className="text-white">{selectedNode.volume}</b> normal volume. Linked with {selectedNode.sector} cluster peers.
              </div>
            </div>
            <a
              href="/login"
              className="w-full py-2.5 rounded-xl bg-[#5c9aff] hover:bg-[#4a88ee] text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              View Full Insights in Dashboard <ChevronRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Overlay Badges */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-[#0a0f1d]/80 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Activity size={13} className="text-[#5c9aff]" />
          <span>LIVING MARKET MAP (6 SECTORS)</span>
        </div>
        <span className="hidden md:inline-block text-[11px] text-slate-400 bg-black/40 px-2 py-1 rounded-full border border-white/5">
          Drag to rotate &bull; Scroll to zoom
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <span className="text-[11px] text-slate-500 font-mono">Illustrative real-time cluster map</span>
      </div>
    </div>
  );
}
