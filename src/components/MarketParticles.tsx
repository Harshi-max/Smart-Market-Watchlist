"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface MarketParticlesProps {
  mousePosition?: { x: number; y: number };
  className?: string;
}

export default function MarketParticles({
  mousePosition = { x: 0, y: 0 },
  className = "",
}: MarketParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(true);

  useEffect(() => {
    mouseRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Number of nodes (fewer on mobile for 60 FPS)
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 22 : 45;
    const particleCount = isMobile ? 35 : 80;

    // 1. Market Node Constellation (nodes with connecting lines)
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities: { x: number; y: number; z: number }[] = [];
    const nodeColors = new Float32Array(nodeCount * 3);

    // Curated fintech colors: cyan, royal blue, emerald, amber
    const palette = [
      new THREE.Color("#38bdf8"), // Cyan
      new THREE.Color("#5c9aff"), // Blue
      new THREE.Color("#10b981"), // Emerald
      new THREE.Color("#60a5fa"), // Soft blue
      new THREE.Color("#a78bfa"), // Violet
    ];

    const boundsX = isMobile ? 12 : 18;
    const boundsY = isMobile ? 8 : 12;
    const boundsZ = 8;

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * boundsX * 2;
      const y = (Math.random() - 0.5) * boundsY * 2;
      const z = (Math.random() - 0.5) * boundsZ * 2;

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.008,
      });

      const color = palette[i % palette.length];
      nodeColors[i * 3] = color.r;
      nodeColors[i * 3 + 1] = color.g;
      nodeColors[i * 3 + 2] = color.b;
    }

    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    // Create custom circle texture for soft glow nodes
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.3, "rgba(92,154,255,0.8)");
      grad.addColorStop(0.7, "rgba(56,189,248,0.25)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const nodeTexture = new THREE.CanvasTexture(canvas);

    const nodeMaterial = new THREE.PointsMaterial({
      size: isMobile ? 1.2 : 1.6,
      vertexColors: true,
      map: nodeTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodePoints);

    // 2. Dynamic Connecting Lines
    const maxLineConnections = nodeCount * 4;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineColors = new Float32Array(maxLineConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // 3. Ambient floating market dust
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * boundsX * 2.2;
      dustPositions[i + 1] = (Math.random() - 0.5) * boundsY * 2.2;
      dustPositions[i + 2] = (Math.random() - 0.5) * boundsZ * 2.5;
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.6,
      color: 0x5c9aff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // 4. Subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 40);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Pause when scrolled off screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisibleRef.current || prefersReducedMotion) {
        return;
      }

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera parallax based on mouse
      const targetCamX = (mouseRef.current.x * 2.5);
      const targetCamY = (-mouseRef.current.y * 2.0);
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Rotate ambient dust slowly
      dustPoints.rotation.y = time * 0.02;
      dustPoints.rotation.x = Math.sin(time * 0.015) * 0.05;

      // Update node positions
      const positions = nodeGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < nodeCount; i++) {
        const vel = nodeVelocities[i];
        positions[i * 3] += vel.x;
        positions[i * 3 + 1] += vel.y;
        positions[i * 3 + 2] += vel.z;

        // Bounce within bounds
        if (Math.abs(positions[i * 3]) > boundsX) vel.x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > boundsY) vel.y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > boundsZ) vel.z *= -1;
      }
      nodeGeometry.attributes.position.needsUpdate = true;

      // Update connecting lines
      let lineIndex = 0;
      const posArray = lineGeometry.attributes.position.array as Float32Array;
      const colArray = lineGeometry.attributes.color.array as Float32Array;
      const connectDist = isMobile ? 5.5 : 7.0;

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (lineIndex >= maxLineConnections) break;

          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectDist) {
            const alpha = 1.0 - dist / connectDist;
            const idx6 = lineIndex * 6;

            posArray[idx6] = positions[i * 3];
            posArray[idx6 + 1] = positions[i * 3 + 1];
            posArray[idx6 + 2] = positions[i * 3 + 2];

            posArray[idx6 + 3] = positions[j * 3];
            posArray[idx6 + 4] = positions[j * 3 + 1];
            posArray[idx6 + 5] = positions[j * 3 + 2];

            // Soft blue/cyan line color
            colArray[idx6] = 0.22 * alpha;
            colArray[idx6 + 1] = 0.6 * alpha;
            colArray[idx6 + 2] = 1.0 * alpha;

            colArray[idx6 + 3] = 0.22 * alpha;
            colArray[idx6 + 4] = 0.6 * alpha;
            colArray[idx6 + 5] = 1.0 * alpha;

            lineIndex++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      nodeTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
