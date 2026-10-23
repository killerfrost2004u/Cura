"use client";

import React, { useState, useEffect } from "react";
import { IconSparkle } from "./CuraIcons";

interface ThinkingOrbProps {
  accentColor?: string;
  mode?: "normal" | "alzheimer" | "adhd";
  secondsElapsed?: number;
}

export default function ThinkingOrb({
  accentColor = "#16B9FE",
  mode = "normal",
  secondsElapsed: externalSeconds,
}: ThinkingOrbProps) {
  const [internalSeconds, setInternalSeconds] = useState(0);
  const secondsElapsed = externalSeconds !== undefined ? externalSeconds : internalSeconds;
  const [breathPhase, setBreathPhase] = useState(0);

  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase((prev) => (prev + 1) % 100);
    }, 50);

    const timerInterval = setInterval(() => {
      setInternalSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(breathInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getStatusText = () => {
    if (mode === "alzheimer") {
      if (secondsElapsed < 4) return "كيورا يراجع سجل الرعاية ومواعيد الدواء...";
      if (secondsElapsed < 10) return "صياغة الرد المطمئن بالعامية المصرية الودودة...";
      return "التأكد من أمان الجرعات وهدوء المريض التام...";
    }
    if (mode === "adhd") {
      if (secondsElapsed < 4) return "عزل التشتت واستخراج أول خطوة بسيطة...";
      if (secondsElapsed < 10) return "تفتيت المشروع لمهمة مصغرة مدتها 5 دقائق...";
      return "تجهيز جلسة التركيز وتايمر الدوبامين...";
    }
    // Normal / Research
    if (secondsElapsed < 4) return "Cura AI is reflecting on your message...";
    if (secondsElapsed < 10) return "Synthesizing clinical and daily care context...";
    return "Polishing response with warm, empathetic cadence...";
  };

  // Color palettes tailored for Apple Intelligence-style fluid luminescence
  const getGradientHues = () => {
    if (mode === "alzheimer") {
      return {
        primary: "#3FEDBA",
        secondary: "#16B9FE",
        tertiary: "#60EFEB",
        glow: "rgba(63, 237, 186, 0.28)",
      };
    }
    if (mode === "adhd") {
      return {
        primary: "#AF6AFB",
        secondary: "#FF6584",
        tertiary: "#38BDF8",
        glow: "rgba(175, 106, 251, 0.28)",
      };
    }
    return {
      primary: "#16B9FE",
      secondary: "#60EFEB",
      tertiary: "#818CF8",
      glow: "rgba(22, 185, 254, 0.28)",
    };
  };

  const hues = getGradientHues();

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "16px 22px",
        borderRadius: "24px",
        background: "linear-gradient(135deg, rgba(13, 22, 35, 0.88) 0%, rgba(20, 31, 48, 0.72) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: `0 12px 40px ${hues.glow}, 0 0 0 1px rgba(255, 255, 255, 0.05) inset`,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        margin: "14px 0",
        maxWidth: "580px",
        overflow: "hidden",
      }}
    >
      {/* Apple Intelligence Style Flowing Perimeter Ribbon */}
      <div
        style={{
          position: "absolute",
          inset: "-1px",
          borderRadius: "24px",
          padding: "1.5px",
          background: `linear-gradient(${breathPhase * 3.6}deg, ${hues.primary} 0%, ${hues.secondary} 35%, transparent 65%, ${hues.tertiary} 100%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          opacity: 0.85,
        }}
      />

      {/* Ambient Breathing Background Blur */}
      <div
        style={{
          position: "absolute",
          top: "-60%",
          left: "-20%",
          width: "140%",
          height: "220%",
          background: `radial-gradient(circle at 30% 50%, ${hues.glow} 0%, transparent 60%)`,
          pointerEvents: "none",
          opacity: 0.7,
        }}
      />

      {/* Organic Fluid Prismatic Orb */}
      <div
        style={{
          position: "relative",
          width: "46px",
          height: "46px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer Expanding Fluid Halo */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hues.primary}55 0%, transparent 70%)`,
            transform: `scale(${1 + Math.sin(breathPhase * 0.08) * 0.18})`,
            transition: "transform 0.1s linear",
            filter: "blur(6px)",
          }}
        />

        {/* Morphing Liquid Membrane */}
        <div
          style={{
            position: "absolute",
            width: "36px",
            height: "36px",
            borderRadius: "44% 56% 52% 48% / 55% 42% 58% 45%",
            background: `linear-gradient(${breathPhase * 4}deg, ${hues.primary} 0%, ${hues.secondary} 50%, ${hues.tertiary} 100%)`,
            transform: `rotate(${breathPhase * 2}deg) scale(${0.96 + Math.cos(breathPhase * 0.06) * 0.08})`,
            boxShadow: `0 0 20px ${hues.primary}99, inset 0 0 10px rgba(255, 255, 255, 0.4)`,
            filter: "contrast(1.15)",
          }}
        />

        {/* Luminous Core Glow */}
        <div
          style={{
            position: "relative",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 0 12px #FFFFFF, 0 0 24px #60EFEB",
            opacity: 0.95,
          }}
        />
      </div>

      {/* Information & Status */}
      <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            <IconSparkle size={14} color={hues.primary} />
            <span>Cura AI</span>
          </div>

          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              color: hues.primary,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: `1px solid ${hues.primary}33`,
              padding: "2px 8px",
              borderRadius: "8px",
            }}
          >
            {formatTimer(secondsElapsed)}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#D1D5DB",
            lineHeight: "1.4",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "'Cairo', 'Inter', sans-serif",
          }}
        >
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}
