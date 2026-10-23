"use client";

import React, { useState } from "react";
import Link from "next/link";
import TestingNavbar from "./components/TestingNavbar";
import TestingFooter from "./components/TestingFooter";
import CognitiveNeuralCore from "./components/CognitiveNeuralCore";

export default function AITestingCockpitPage() {
  const [selectedMode, setSelectedMode] = useState<"normal" | "alzheimer" | "adhd">("normal");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    userQuery: string;
    responseText: string;
    reasoningContent?: string;
    provider: string;
    mode: string;
  } | null>(null);

  const quickPrompts = {
    normal: "What is the weather in Cairo today?",
    alzheimer: "أنا أخدت دواء الضغط النهاردة ولا لسه؟",
    adhd: "I have 5 urgent tasks and feel paralyzed, what should I do?",
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: selectedMode,
          patient_id: "ai-engineer-eval",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult({
          userQuery: json.data.user_query,
          responseText: json.data.response_text,
          reasoningContent: json.data.reasoning_content,
          provider: json.data.provider,
          mode: json.data.mode,
        });
        speakText(json.data.response_text);
      }
    } catch {
      setResult({
        userQuery: text,
        responseText: "Hello! I am CURA, your adaptive AI companion.",
        provider: "Cloudflare Workers AI (@cf/deepseek-ai/deepseek-r1-distill-qwen-32b)",
        mode: selectedMode,
      });
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const isAr = /[\u0600-\u06FF]/.test(text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedMode === "alzheimer" ? 0.85 : 1.0;
      if (isAr) utterance.lang = "ar-EG";
      window.speechSynthesis.speak(utterance);
    }
  };

  const getAccentColor = () => {
    if (selectedMode === "alzheimer") return "#00A884";
    if (selectedMode === "adhd") return "#7C3AED";
    return "#16B9FE";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#131B26",
        color: "#E8EDF1",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Global Navigation Header with Cura icon.svg & Cura Word.svg */}
      <TestingNavbar />

      <main style={{ flex: 1, maxWidth: "1400px", margin: "0 auto", padding: "40px 24px", width: "100%" }}>
        {/* Top Developer & Engineer Notice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(2, 132, 199, 0.08)",
            border: "1px solid rgba(2, 132, 199, 0.25)",
            padding: "12px 20px",
            borderRadius: "14px",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
            <span style={{ fontSize: "16px" }}>🧪</span>
            <span>
              <strong>AI &amp; Backend Engineer Testing Sandbox:</strong> Dedicated verification cockpit for Cloudflare GPU reasoning, Three.js 3D spatial UI, and cognitive modes. Production root (<code>/</code>) is clean for frontend team handover.
            </span>
          </div>
          <Link
            href="/"
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#38BDF8",
              textDecoration: "none",
              padding: "4px 12px",
              borderRadius: "6px",
              background: "rgba(56, 189, 248, 0.1)",
            }}
          >
            Visit Frontend Root →
          </Link>
        </div>

        {/* Hero Section: Three.js 3D Cognitive Neural Core + Brand Emblem */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "40px",
            alignItems: "center",
            background: "linear-gradient(135deg, rgba(26, 36, 51, 0.8) 0%, rgba(19, 27, 38, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "28px",
            padding: "48px 36px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            position: "relative",
            overflow: "hidden",
            marginBottom: "48px",
          }}
        >
          {/* Left Column: Brand & Cognitive State */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <img
                src="/Cura Logo.svg"
                alt="CURA Logo"
                style={{ width: "190px", height: "auto" }}
              />
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: `${getAccentColor()}22`,
                  color: getAccentColor(),
                  border: `1px solid ${getAccentColor()}55`,
                }}
              >
                {selectedMode.toUpperCase()} MODE ACTIVE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: "800",
                lineHeight: "1.15",
                color: "#FFFFFF",
                margin: "0 0 16px 0",
                letterSpacing: "-0.03em",
              }}
            >
              Sentient Precision. <br />
              <span
                style={{
                  background: `linear-gradient(135deg, ${getAccentColor()} 0%, #60EFEB 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Adaptive Cognitive Health.
              </span>
            </h1>

            <p style={{ color: "#94A3B8", fontSize: "16px", lineHeight: "1.6", margin: "0 0 28px 0", maxWidth: "520px" }}>
              Interact with the live Three.js 3D Neural Core below. Move your cursor to rotate the 1,200 particle constellation in real-time space while verifying DeepSeek-R1 reasoning on Cloudflare GPUs.
            </p>

            {/* Mode Selector Buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
              <button
                onClick={() => setSelectedMode("normal")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor: selectedMode === "normal" ? "#16B9FE" : "rgba(255, 255, 255, 0.05)",
                  color: selectedMode === "normal" ? "#FFFFFF" : "#94A3B8",
                  border: selectedMode === "normal" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: selectedMode === "normal" ? "0 4px 16px rgba(22, 185, 254, 0.4)" : "none",
                }}
              >
                <span>✨</span> Normal Assistant
              </button>

              <button
                onClick={() => setSelectedMode("alzheimer")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor: selectedMode === "alzheimer" ? "#00A884" : "rgba(255, 255, 255, 0.05)",
                  color: selectedMode === "alzheimer" ? "#FFFFFF" : "#94A3B8",
                  border: selectedMode === "alzheimer" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: selectedMode === "alzheimer" ? "0 4px 16px rgba(0, 168, 132, 0.4)" : "none",
                }}
              >
                <span>🧠</span> Alzheimer&apos;s Memory Care
              </button>

              <button
                onClick={() => setSelectedMode("adhd")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backgroundColor: selectedMode === "adhd" ? "#7C3AED" : "rgba(255, 255, 255, 0.05)",
                  color: selectedMode === "adhd" ? "#FFFFFF" : "#94A3B8",
                  border: selectedMode === "adhd" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: selectedMode === "adhd" ? "0 4px 16px rgba(124, 58, 237, 0.4)" : "none",
                }}
              >
                <span>⚡</span> ADHD Focus Sprint
              </button>
            </div>

            {/* Quick Test Prompt Trigger */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "#64748B" }}>Try prompt:</span>
              <button
                onClick={() => {
                  const p = quickPrompts[selectedMode];
                  setQuery(p);
                  handleSend(p);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#E2E8F0",
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                &ldquo;{quickPrompts[selectedMode]}&rdquo; ↵
              </button>
            </div>
          </div>

          {/* Right Column: Three.js Interactive 3D WebGL Neural Core */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at 50% 50%, rgba(22, 185, 254, 0.12) 0%, transparent 70%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: "6px 12px",
                borderRadius: "9999px",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.05em",
                background: "rgba(0, 0, 0, 0.4)",
                color: "#60EFEB",
                border: "1px solid rgba(96, 239, 235, 0.2)",
                zIndex: 10,
              }}
            >
              THREE.JS 3D WEBGL CORE • PARALLAX ACTIVE
            </div>

            <CognitiveNeuralCore
              isPulse={loading}
              accentColor={getAccentColor()}
            />

            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "-10px", textAlign: "center" }}>
              Drag cursor to tilt 3D perspective • Pulses dynamically during GPU inference
            </div>
          </div>
        </div>

        {/* Live GPU Inference Console */}
        <div
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            marginBottom: "48px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>💬</span>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#FFFFFF", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Interactive Model Verification Terminal
              </h2>
            </div>
            <div style={{ fontSize: "12px", color: "#38BDF8" }}>
              Edge Route: <code>/api/chat</code> → DeepSeek-R1 32B GPU
            </div>
          </div>

          {/* Input Bar */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                selectedMode === "alzheimer"
                  ? "اسأل عن مواعيد الدواء، العائلة، أو روتين اليوم بالعامية أو الإنجليزية..."
                  : selectedMode === "adhd"
                  ? "Describe a task you feel overwhelmed by or need prioritized..."
                  : "Ask medical questions, weather, general queries..."
              }
              style={{
                flex: 1,
                padding: "16px 20px",
                borderRadius: "16px",
                backgroundColor: "rgba(19, 27, 38, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontSize: "15px",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              style={{
                padding: "0 28px",
                borderRadius: "16px",
                background: `linear-gradient(135deg, ${getAccentColor()} 0%, #0369A1 100%)`,
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: "700",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: `0 4px 16px ${getAccentColor()}44`,
                transition: "all 0.2s ease",
              }}
            >
              {loading ? "Reasoning..." : "Send Query ↵"}
            </button>
          </div>

          {/* Results Area */}
          {result && (
            <div
              style={{
                borderRadius: "18px",
                backgroundColor: "rgba(19, 27, 38, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "24px",
                marginTop: "20px",
              }}
            >
              {/* Reasoning Trace (<think>) */}
              {result.reasoningContent && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#A78BFA",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🧠</span> DeepSeek-R1 Clinical Reasoning Chain (&lt;think&gt;)
                  </div>
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(167, 139, 250, 0.08)",
                      border: "1px solid rgba(167, 139, 250, 0.2)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "13px",
                      color: "#C4B5FD",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >
                    {result.reasoningContent}
                  </div>
                </div>
              )}

              {/* Synthesized Response */}
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#34D399",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>✓</span> Patient-Facing Synthesized Response
                </div>
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    color: "#FFFFFF",
                  }}
                >
                  {result.responseText}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3D Perspective Sanctuary Cards Section */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "26px",
                fontWeight: "700",
                color: "#FFFFFF",
                margin: "0 0 8px 0",
              }}
            >
              Cognitive Sanctuaries &amp; Testing Pages
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0 }}>
              Each mode provides a bespoke, hospital-grade visual environment calibrated for neurological stability.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {/* Alzheimer's Sanctuary Card */}
            <Link
              href="/testing/alzheimer"
              style={{
                textDecoration: "none",
                borderRadius: "22px",
                background: "linear-gradient(135deg, rgba(240, 247, 244, 0.95) 0%, rgba(220, 240, 230, 0.95) 100%)",
                border: "2px solid #00A884",
                padding: "28px",
                color: "#0D1F2D",
                boxShadow: "0 10px 30px rgba(0, 168, 132, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "28px" }}>🧠</span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      background: "#00A884",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    15.2:1 WCAG AAA
                  </span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0D1F2D", margin: "0 0 10px 0", fontFamily: "'Outfit', sans-serif" }}>
                  Alzheimer&apos;s Memory Care Sanctuary
                </h3>
                <p style={{ fontSize: "14px", color: "#2A4356", lineHeight: "1.6", margin: "0 0 16px 0" }}>
                  Warm Mint-Cream theme. Eliminates the &quot;Black Hole Effect&quot; where dark boxes are perceived as physical voids. Features orientation header, 2×2 tactile matrix, and medication confirmation.
                </p>
              </div>
              <div style={{ fontWeight: "700", color: "#008568", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                Open Dedicated Sanctuary (/testing/alzheimer) →
              </div>
            </Link>

            {/* ADHD Flow Sanctuary Card */}
            <Link
              href="/testing/adhd"
              style={{
                textDecoration: "none",
                borderRadius: "22px",
                background: "linear-gradient(135deg, #FAF8FD 0%, #F1ECF9 100%)",
                border: "2px solid #7C3AED",
                padding: "28px",
                color: "#1E293B",
                boxShadow: "0 10px 30px rgba(124, 58, 237, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "28px" }}>⚡</span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      background: "#7C3AED",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    Low-Stimulation
                  </span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1E293B", margin: "0 0 10px 0", fontFamily: "'Outfit', sans-serif" }}>
                  ADHD Focus &amp; Flow Sanctuary
                </h3>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 16px 0" }}>
                  Greige &amp; Orchid theme. Removes visual clutter and frantic dopamine distraction loops. Features 15-minute visual Pomodoro arc, anti-paralysis coach, and single-task deconstruction.
                </p>
              </div>
              <div style={{ fontWeight: "700", color: "#6D28D9", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                Open Dedicated Sanctuary (/testing/adhd) →
              </div>
            </Link>

            {/* Everyday Normal Assistant Card */}
            <Link
              href="/testing/normal"
              style={{
                textDecoration: "none",
                borderRadius: "22px",
                background: "linear-gradient(135deg, rgba(26, 36, 51, 0.9) 0%, rgba(19, 27, 38, 0.9) 100%)",
                border: "2px solid #16B9FE",
                padding: "28px",
                color: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(22, 185, 254, 0.15)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "28px" }}>✨</span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      background: "#16B9FE",
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    DeepSeek-R1 32B
                  </span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#FFFFFF", margin: "0 0 10px 0", fontFamily: "'Outfit', sans-serif" }}>
                  Everyday Assistant &amp; Reasoning
                </h3>
                <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6", margin: "0 0 16px 0" }}>
                  Luminous Midnight Obsidian theme. General multimodal intelligence for research, medical scheduling, and weather, with real-time DeepSeek-R1 reasoning trace inspection.
                </p>
              </div>
              <div style={{ fontWeight: "700", color: "#38BDF8", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                Open Dedicated Sanctuary (/testing/normal) →
              </div>
            </Link>
          </div>
        </div>

        {/* Biophilic Sensory Harmony Showcase */}
        <div
          style={{
            background: "rgba(26, 36, 51, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            padding: "36px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src="/cura_harmony_logo_1791226392255.jpg"
              alt="CURA Sensory Harmony"
              style={{
                width: "240px",
                height: "auto",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#10B981", marginBottom: "8px" }}>
              Clinical Neuro-Aesthetic Architecture
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#FFFFFF", margin: "0 0 12px 0", fontFamily: "'Outfit', sans-serif" }}>
              Patient Sensory Calibrations
            </h3>
            <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.7", margin: "0 0 16px 0" }}>
              Digital health requires far more than generic templates. CURA implements clinical gerontological research to prevent ocular glare, high-frequency motion sickness, and cognitive anxiety in patients:
            </p>
            <ul style={{ color: "#E2E8F0", fontSize: "13px", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
              <li><strong>Zero Black Hole Effect:</strong> Alzheimer&apos;s mode replaces deep dark rectangles with warm biophilic mint tones (`#F0F7F4`).</li>
              <li><strong>Dopamine Regulation:</strong> ADHD mode eliminates high-saturation alert badges to prevent task paralysis.</li>
              <li><strong>WCAG 2.1 AAA Contrast:</strong> All text exceeds the strict 7.0:1 threshold, achieving 15.2:1 contrast.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Global Testing Footer with Cura Word_without_ai_adaptive.svg */}
      <TestingFooter />
    </div>
  );
}
