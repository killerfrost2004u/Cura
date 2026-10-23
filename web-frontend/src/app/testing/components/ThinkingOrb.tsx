"use client";

import React, { useState, useEffect } from "react";
import { IconCpu, IconSparkle, IconActivity } from "./CuraIcons";

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
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 4);
    }, 1200);

    const timerInterval = setInterval(() => {
      setInternalSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pulseInterval);
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
      if (secondsElapsed < 4) return "استرجاع سجل الرعاية ومواعيد الدواء...";
      if (secondsElapsed < 10) return "صياغة الرد المطمئن بالعامية المصرية...";
      return "التأكد من أمان الجرعات وهدوء المريض...";
    }
    if (mode === "adhd") {
      if (secondsElapsed < 4) return "تحليل التشتت وعزل العقبة الأولى...";
      if (secondsElapsed < 10) return "تفتيت المشروع لمهمة مصغرة (5 دقائق)...";
      return "تجهيز جلسة التركيز وتايمر الدوبامين...";
    }
    // Normal / Research
    if (secondsElapsed < 5) return "DeepSeek-R1 generating chain-of-thought traces...";
    if (secondsElapsed < 12) return "Synthesizing mathematical formulas and clinical logic...";
    return "Refining bilingual output with natural cadence...";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        borderRadius: "20px",
        background: `linear-gradient(135deg, rgba(12, 20, 31, 0.9) 0%, rgba(26, 36, 51, 0.7) 100%)`,
        border: `1.5px solid ${accentColor}44`,
        boxShadow: `0 8px 32px ${accentColor}22, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        backdropFilter: "blur(16px)",
        margin: "12px 0",
        maxWidth: "560px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Animated Energy Glow */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: `radial-gradient(circle at center, ${accentColor}18 0%, transparent 60%)`,
          pointerEvents: "none",
          animation: "rotate 8s linear infinite",
        }}
      />

      {/* Multi-Layered Synaptic Orb */}
      <div
        style={{
          position: "relative",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* Outer Pulsing Wave Ring */}
        <span
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `2px solid ${accentColor}`,
            opacity: pulsePhase % 2 === 0 ? 0.7 : 0.2,
            transform: pulsePhase % 2 === 0 ? "scale(1.25)" : "scale(1.0)",
            transition: "transform 1.2s cubic-bezier(0.23, 1, 0.32, 1), opacity 1.2s ease",
          }}
        />

        {/* Second Concentric Ring */}
        <span
          style={{
            position: "absolute",
            width: "75%",
            height: "75%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}44 0%, transparent 70%)`,
            border: `1px dashed ${accentColor}88`,
            animation: "spin 4s linear infinite",
          }}
        />

        {/* Inner Glowing Core */}
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 18px ${accentColor}`,
          }}
        >
          <IconCpu size={16} color="#0C141F" />
        </div>
      </div>

      {/* Status Details */}
      <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            <IconSparkle size={13} color={accentColor} />
            <span>DeepSeek-R1 Cognitive Processing</span>
          </div>

          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              fontWeight: 800,
              color: accentColor,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            {formatTimer(secondsElapsed)}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#CBD5E1",
            lineHeight: "1.4",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}
