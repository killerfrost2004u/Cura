"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CognitiveNeuralCoreProps {
  isPulse?: boolean;
  accentColor?: string; // e.g. '#16B9FE' (Normal), '#00A884' (Alzheimer), '#7C3AED' (ADHD)
  className?: string;
}

export default function CognitiveNeuralCore({
  isPulse = false,
  accentColor = "#16B9FE",
  className = "",
}: CognitiveNeuralCoreProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL capability per 3d-web-experience validation
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

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    // Limit DPR on mobile to 1.5 for steady 60fps performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // 3. Central Icosahedron Wireframe Sphere
    const colorPrimary = new THREE.Color(accentColor);
    const colorCyan = new THREE.Color("#60EFEB");

    const coreGeometry = new THREE.IcosahedronGeometry(2.1, 3);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner Solid Glow Sphere
    const innerGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: colorCyan,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);

    // 4. Particle Constellation Field (1,200 particle nodes)
    const particleCount = 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Golden ratio spherical distribution
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.sqrt(particleCount * Math.PI) * (2 * Math.PI * (i / particleCount));
      const r = 2.4 + (Math.random() - 0.5) * 0.9;

      positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(theta);

      scales[i] = Math.random();
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: colorCyan,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Orbital Equatorial Rings
    const ringGeometry = new THREE.RingGeometry(3.0, 3.03, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 3;
    ringMesh.rotation.y = Math.PI / 6;
    scene.add(ringMesh);

    const ringGeometry2 = new THREE.RingGeometry(3.3, 3.32, 64);
    const ringMesh2 = new THREE.Mesh(ringGeometry2, ringMaterial);
    ringMesh2.rotation.x = -Math.PI / 4;
    ringMesh2.rotation.y = Math.PI / 4;
    scene.add(ringMesh2);

    // 6. Interactive Mouse Tracking & Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      mouseX = (clientX / width - 0.5) * 2;
      mouseY = (clientY / height - 0.5) * 2;
    };

    container.addEventListener("mousemove", onMouseMove);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", onResize);

    // 7. Animation Loop with 60fps Target
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 1.5;
      camera.position.y = -targetY * 1.5;
      camera.lookAt(scene.position);

      // Continuous rhythmic rotation
      coreMesh.rotation.y = elapsedTime * 0.15;
      coreMesh.rotation.x = elapsedTime * 0.08;

      innerMesh.rotation.y = -elapsedTime * 0.22;
      innerMesh.rotation.z = elapsedTime * 0.1;

      particles.rotation.y = elapsedTime * 0.09;
      particles.rotation.x = -elapsedTime * 0.04;

      ringMesh.rotation.z = elapsedTime * 0.07;
      ringMesh2.rotation.z = -elapsedTime * 0.05;

      // Gentle resting respiration pulse (14 bpm = ~0.23 Hz)
      const breathScale = 1 + Math.sin(elapsedTime * 1.45) * 0.035;
      coreMesh.scale.set(breathScale, breathScale, breathScale);
      particles.scale.set(breathScale, breathScale, breathScale);

      // Emissive pulse on active query state
      if (isPulse) {
        const pulse = 1 + Math.sin(elapsedTime * 8) * 0.08;
        coreMesh.scale.multiplyScalar(pulse);
        particleMaterial.opacity = 0.95;
      } else {
        particleMaterial.opacity = 0.75;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup & Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onMouseMove);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      ringGeometry.dispose();
      ringGeometry2.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, [isPulse, accentColor]);

  if (!webGLSupported) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          width: "100%",
          height: "380px",
          borderRadius: "24px",
          background: "radial-gradient(circle, rgba(22, 185, 254, 0.15) 0%, transparent 70%)",
        }}
      >
        <img
          src="/cura_harmony_logo_1791226392255.jpg"
          alt="CURA Cognitive Harmony"
          style={{ width: "220px", height: "auto", borderRadius: "16px" }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{
        width: "100%",
        height: "380px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
