"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CognitiveNeuralCoreProps {
  isPulse?: boolean;
  accentColor?: string; // e.g. '#16B9FE' (Normal), '#3FEDBA' (Alzheimer), '#AF6AFB' (ADHD)
  className?: string;
  mode?: "normal" | "alzheimer" | "adhd";
}

export default function CognitiveNeuralCore({
  isPulse = false,
  accentColor = "#16B9FE",
  className = "",
  mode = "normal",
}: CognitiveNeuralCoreProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL capability
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 7;

    // 2. High-Performance WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 3. Central Icosahedron Wireframe Sphere
    const colorPrimary = new THREE.Color(accentColor);
    const colorCyan = new THREE.Color("#60EFEB");

    const coreGeometry = new THREE.IcosahedronGeometry(2.1, 3);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner Luminous Core
    const innerGeometry = new THREE.IcosahedronGeometry(1.5, 2);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: colorCyan,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);

    // 4. Particle Constellation Field (1,200 particle nodes)
    const particleCount = 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution
      const theta = Math.acos(2 * Math.random() - 1);
      const phi =
        Math.sqrt(particleCount * Math.PI) * (2 * Math.PI * (i / particleCount));
      const r = 2.4 + (Math.random() - 0.5) * 0.9;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: colorPrimary,
      size: 0.045,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Apple Fluid Direct Manipulation & Cursor Parallax
    let targetRotationX = 0;
    let targetRotationY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        velocityX = deltaX * 0.005;
        velocityY = deltaY * 0.005;
        targetRotationY += velocityX;
        targetRotationX += velocityY;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;
      } else {
        // Subtle Parallax Tracking
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotationY = normX * 0.4;
        targetRotationX = normY * 0.4;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback for detached pointer
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // 6. Animation Loop with Mode Dynamics
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Inertia & Damping
      if (!isDragging) {
        targetRotationY += 0.0025; // ambient gyroscopic spin
        velocityX *= 0.95;
        velocityY *= 0.95;
      }

      coreMesh.rotation.y += (targetRotationY - coreMesh.rotation.y) * 0.06;
      coreMesh.rotation.x += (targetRotationX - coreMesh.rotation.x) * 0.06;

      innerMesh.rotation.y = -coreMesh.rotation.y * 1.3;
      innerMesh.rotation.x = -coreMesh.rotation.x * 0.9;
      particles.rotation.y = coreMesh.rotation.y * 0.6;
      particles.rotation.x = coreMesh.rotation.x * 0.6;

      // Mode-specific particle breathing & pulse
      const posAttr = particleGeometry.attributes.position;
      const posArray = posAttr.array as Float32Array;

      let pulseMultiplier = 1.0;
      if (isPulse) {
        pulseMultiplier = 1.0 + Math.sin(elapsedTime * 14) * 0.12;
      } else if (mode === "alzheimer") {
        // Calming slow harmonic breathing
        pulseMultiplier = 1.0 + Math.sin(elapsedTime * 1.2) * 0.06;
      } else if (mode === "adhd") {
        // High-focus subtle oscillation
        pulseMultiplier = 1.0 + Math.sin(elapsedTime * 3.5) * 0.03;
      }

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posArray[i3] = basePositions[i3] * pulseMultiplier;
        posArray[i3 + 1] = basePositions[i3 + 1] * pulseMultiplier;
        posArray[i3 + 2] = basePositions[i3 + 2] * pulseMultiplier;
      }
      posAttr.needsUpdate = true;

      // Pulse Core scale
      coreMesh.scale.setScalar(pulseMultiplier);
      innerMesh.scale.setScalar(pulseMultiplier * 0.95);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Resizing
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 8. Lifecycle Teardown
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);

      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [accentColor, isPulse, mode]);

  if (!webGLSupported) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "360px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(19, 27, 38, 0.6)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#94A3B8",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#F8FAFC", marginBottom: "8px" }}>
          Neural Core (Static Fallback)
        </div>
        <div style={{ fontSize: "12px", maxWidth: "280px" }}>
          WebGL context is currently unavailable. Neural telemetry and model inference remain active.
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "380px",
        cursor: "grab",
        touchAction: "none",
        position: "relative",
      }}
    />
  );
}
