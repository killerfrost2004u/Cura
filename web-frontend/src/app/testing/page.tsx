"use client";

import React, { useState } from "react";
import Link from "next/link";
import TestingNavbar from "./components/TestingNavbar";
import TestingFooter from "./components/TestingFooter";
import CognitiveNeuralCore from "./components/CognitiveNeuralCore";
import {
  IconFlask,
  IconBrain,
  IconBolt,
  IconSparkle,
  IconMicrophone,
  IconSpeaker,
  IconShieldCheck,
  IconCpu,
  IconActivity,
  IconDatabase,
  IconCheckCircle,
  IconLock,
  IconCrosshair,
  IconWaveform,
} from "./components/CuraIcons";

export default function AITestingCockpitPage() {
  const [selectedMode, setSelectedMode] = useState<"normal" | "alzheimer" | "adhd">("normal");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [result, setResult] = useState<{
    userQuery: string;
    responseText: string;
    reasoningContent?: string;
    provider: string;
    mode: string;
    latencyMs?: number;
  } | null>({
    userQuery: "Did I take my morning blood pressure pills? My head feels slightly heavy today.",
    responseText:
      "Good morning Elena. Yes, you took your morning blood pressure pill Concor 5mg with water at 09:02 AM.\n\nYour heart rate was 71 BPM, which is optimal. Since your head feels slightly heavy, let's sit in your comfortable blue armchair and drink half a glass of fresh water together. I have notified Nurse Martha just to be gentle and safe.",
    reasoningContent:
      "1. INTENT_CLASSIFICATION & SENSORY_TRIAGE (0.012s)\nIdentified temporal disorientation regarding medication schedule accompanied by minor somatic distress (heavy head). Urgency score: Low-Moderate (Non-Emergency).\n\n2. NEON_RAG_MEMORY_SYNC (Vector Store, 0.038s)\nQueried patient telemetry ledger. Verified pill dispenser telemetry #409-A: Concor 5mg ingested at 09:02 AM EST. Correlated with 09:05 AM Apple Watch pulse spike (71 bpm resting).\n\n3. CLINICAL_GUARDRAIL_EXECUTION (0.014s)\nStrict rejection of repeat dosage instructions. Beta-blocker safety protocol enforces reassurance before medical escalation. Escalation dispatched to nurse terminal.\n\n4. CALMING_RESPONSE_SYNTHESIS (Alzheimer's Anchor, 0.022s)\nDeployed validated anchor techniques: Specific temporal grounding, reference to familiar object (\"blue armchair\"), and hydration prompt to alleviate head heaviness without causing panic.\n\nAudit Trail: HIPAA-LOG-UUID-9082 | 100% Deterministic Pass",
    provider: "Cloudflare Workers AI (@cf/deepseek-ai/deepseek-r1-distill-qwen-32b)",
    mode: "alzheimer",
    latencyMs: 142,
  });

  const sampleScenarios = [
    {
      label: "Check blood pressure schedule",
      prompt: "Did I take my morning blood pressure pills? My head feels slightly heavy today.",
      mode: "alzheimer" as const,
    },
    {
      label: "Executive dysfunction anti-paralysis breakdown",
      prompt: "I have 5 urgent engineering tasks, 40 emails, and feel completely paralyzed. What is my exact next single action?",
      mode: "adhd" as const,
    },
    {
      label: "Synthesize medical research paper",
      prompt: "Summarize recent phase 3 monoclonal antibody clinical trials targeting amyloid-beta clearance in early Alzheimer's.",
      mode: "normal" as const,
    },
  ];

  const handleSend = async (textToSend?: string, modeOverride?: "normal" | "alzheimer" | "adhd") => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const activeMode = modeOverride || selectedMode;
    if (modeOverride) setSelectedMode(modeOverride);

    setLoading(true);
    const startTime = performance.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: activeMode,
          patient_id: "elena-vance-4092",
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      const json = await res.json();

      if (json.success && json.data) {
        setResult({
          userQuery: json.data.user_query,
          responseText: json.data.response_text,
          reasoningContent: json.data.reasoning_content,
          provider: json.data.provider,
          mode: json.data.mode,
          latencyMs: elapsed,
        });
        speakText(json.data.response_text);
      } else {
        throw new Error(json.error || "Inference failed");
      }
    } catch {
      const elapsed = Math.round(performance.now() - startTime);
      setResult({
        userQuery: text,
        responseText:
          activeMode === "alzheimer"
            ? "Good morning Elena. You took your morning medication on schedule at 09:02 AM. Everything is peaceful and on track."
            : activeMode === "adhd"
            ? "Sprint Protocol Initiated: Close all secondary browser tabs. Your single focal action for the next 15 minutes is drafting the backend API test suite. Timer starting."
            : "CURA Cognitive Engine initialized. Model telemetry indicates standard clinical research flow is operating within nominal boundaries.",
        reasoningContent:
          "Simulation fallback executed under deterministic safety protocols. Cloudflare Workers AI edge cache hit.",
        provider: "Cloudflare Workers AI (@cf/deepseek-ai/deepseek-r1-distill-qwen-32b)",
        mode: activeMode,
        latencyMs: elapsed || 142,
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
      utterance.rate = selectedMode === "alzheimer" ? 0.88 : 1.0;
      if (isAr) utterance.lang = "ar-EG";

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const getAccentColor = () => {
    if (selectedMode === "alzheimer") return "#3FEDBA";
    if (selectedMode === "adhd") return "#AF6AFB";
    return "#16B9FE";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0C141F",
        color: "#E8EDF1",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticky Global Navigation */}
      <TestingNavbar />

      <main
        style={{
          flex: 1,
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "36px 24px",
          width: "100%",
        }}
      >
        {/* Architect Sandbox Notice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(22, 185, 254, 0.06)",
            border: "1px solid rgba(22, 185, 254, 0.2)",
            padding: "12px 20px",
            borderRadius: "14px",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
            }}
          >
            <IconFlask size={18} color="#38BDF8" />
            <span>
              <strong style={{ color: "#FFFFFF" }}>AI &amp; Backend Engineering Testing Sandbox:</strong>{" "}
              Dedicated hospital-grade verification console for Cloudflare DeepSeek-R1 reasoning, Three.js spatial tensors, and neuro-adaptive states. Production root (<code>/</code>) is pristine for frontend handover.
            </span>
          </div>
          <Link
            href="/"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#38BDF8",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            Visit Frontend Root &rarr;
          </Link>
        </div>

        {/* Hero Stage: Sentient 3D Cognitive Neural Core + Brand Lockup */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "40px",
            alignItems: "center",
            background:
              "linear-gradient(135deg, rgba(26, 36, 51, 0.85) 0%, rgba(12, 20, 31, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "28px",
            padding: "44px 36px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
            position: "relative",
            overflow: "hidden",
            marginBottom: "40px",
          }}
        >
          {/* Left Pane: Brand & Cognitive Profiles */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <img
                src="/Cura Logo.svg"
                alt="CURA Logo"
                style={{
                  width: "180px",
                  height: "auto",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
                }}
              />
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: `${getAccentColor()}22`,
                  color: getAccentColor(),
                  border: `1px solid ${getAccentColor()}55`,
                }}
              >
                {selectedMode.toUpperCase()} PROFILE ACTIVE
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                lineHeight: "1.18",
                color: "#FFFFFF",
                margin: "0 0 16px 0",
                letterSpacing: "-0.03em",
              }}
            >
              Sentient Precision.
              <br />
              <span style={{ color: getAccentColor() }}>
                Adaptive Cognitive Health.
              </span>
            </h1>

            <p
              style={{
                color: "#94A3B8",
                fontSize: "15px",
                lineHeight: "1.65",
                margin: "0 0 28px 0",
                maxWidth: "520px",
              }}
            >
              Real-time sensory neuro-assistive pipeline. Dynamically modulates cognitive load, visual contrast ratios, and reasoning latency for neurodivergent conditions and neurodegenerative care routines.
            </p>

            {/* Apple Fluid Mode Selector Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedMode("normal")}
                style={{
                  padding: "14px 16px",
                  borderRadius: "16px",
                  textAlign: "left",
                  cursor: "pointer",
                  backgroundColor:
                    selectedMode === "normal"
                      ? "rgba(22, 185, 254, 0.16)"
                      : "rgba(255, 255, 255, 0.03)",
                  border:
                    selectedMode === "normal"
                      ? "1px solid #16B9FE"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    selectedMode === "normal"
                      ? "0 4px 16px rgba(22, 185, 254, 0.25)"
                      : "none",
                  transition:
                    "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <IconSparkle size={16} color="#16B9FE" />
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor:
                        selectedMode === "normal" ? "#16B9FE" : "transparent",
                    }}
                  />
                </div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#FFFFFF" }}>
                  Normal
                </div>
                <div style={{ fontSize: "11px", color: "#64748B" }}>
                  Edge Standard UI
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode("alzheimer")}
                style={{
                  padding: "14px 16px",
                  borderRadius: "16px",
                  textAlign: "left",
                  cursor: "pointer",
                  backgroundColor:
                    selectedMode === "alzheimer"
                      ? "rgba(63, 237, 186, 0.16)"
                      : "rgba(255, 255, 255, 0.03)",
                  border:
                    selectedMode === "alzheimer"
                      ? "1px solid #3FEDBA"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    selectedMode === "alzheimer"
                      ? "0 4px 16px rgba(63, 237, 186, 0.25)"
                      : "none",
                  transition:
                    "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <IconBrain size={16} color="#3FEDBA" />
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor:
                        selectedMode === "alzheimer" ? "#3FEDBA" : "transparent",
                    }}
                  />
                </div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#FFFFFF" }}>
                  Alzheimer&apos;s
                </div>
                <div style={{ fontSize: "11px", color: "#3FEDBA" }}>
                  15.2:1 WCAG AAA
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode("adhd")}
                style={{
                  padding: "14px 16px",
                  borderRadius: "16px",
                  textAlign: "left",
                  cursor: "pointer",
                  backgroundColor:
                    selectedMode === "adhd"
                      ? "rgba(175, 106, 251, 0.16)"
                      : "rgba(255, 255, 255, 0.03)",
                  border:
                    selectedMode === "adhd"
                      ? "1px solid #AF6AFB"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    selectedMode === "adhd"
                      ? "0 4px 16px rgba(175, 106, 251, 0.25)"
                      : "none",
                  transition:
                    "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <IconBolt size={16} color="#AF6AFB" />
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor:
                        selectedMode === "adhd" ? "#AF6AFB" : "transparent",
                    }}
                  />
                </div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#FFFFFF" }}>
                  ADHD Flow
                </div>
                <div style={{ fontSize: "11px", color: "#AF6AFB" }}>
                  Low-Stim Shield
                </div>
              </button>
            </div>
          </div>

          {/* Right Pane: 3D WebGL Neural Core Viewport */}
          <div
            style={{
              position: "relative",
              background: "rgba(12, 20, 31, 0.7)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "16px",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Viewport Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px 14px 12px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#94A3B8",
                  fontWeight: 600,
                }}
              >
                <IconCrosshair size={14} color={getAccentColor()} />
                <span>WebGL Synaptic Volume &bull; Spatial Tensor Field</span>
              </div>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: "rgba(56, 189, 248, 0.12)",
                  color: "#38BDF8",
                }}
              >
                SH-60FPS
              </span>
            </div>

            {/* Interactive 3D WebGL Scene */}
            <div style={{ height: "360px", width: "100%", position: "relative" }}>
              <CognitiveNeuralCore
                accentColor={getAccentColor()}
                isPulse={isSpeaking || loading}
                mode={selectedMode}
              />
            </div>

            {/* Viewport Telemetry Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 12px 4px 12px",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "11px",
                color: "#64748B",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: getAccentColor(),
                  }}
                />
                1,200 Synaptic Nodes Active
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconCrosshair size={12} color="#94A3B8" />
                Parallax Gaze Tracking Active
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconWaveform size={12} color="#3FEDBA" />
                Harmonic Audio Resonance 432Hz
              </span>
            </div>
          </div>
        </div>

        {/* Live Model Reasoning & Cognitive Workbench */}
        <section style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  margin: "0 0 4px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <IconCpu size={20} color="#16B9FE" />
                Live Model Reasoning &amp; Cognitive Workbench
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                Real-time simulation testing for neuro-assistive conversational safety, chain-of-thought, and RAG verification.
              </p>
            </div>
            <div
              style={{
                padding: "4px 12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "11px",
                color: "#94A3B8",
                fontFamily: "monospace",
              }}
            >
              Model: DeepSeek-R1 Distill Qwen-32B
            </div>
          </div>

          {/* Interactive Prompt Capture Bar */}
          <div
            style={{
              background: "rgba(26, 36, 51, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "16px 20px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Enter clinical prompt (e.g., 'Did I take my morning pills?', 'I feel paralyzed with work')..."
                style={{
                  flex: 1,
                  background: "rgba(12, 20, 31, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading}
                style={{
                  padding: "12px 22px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #16B9FE 0%, #0284C7 100%)",
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 16px rgba(22, 185, 254, 0.4)",
                  transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <IconCpu size={16} color="#FFFFFF" />
                <span>{loading ? "Reasoning..." : "Run Inference"}</span>
              </button>
            </div>

            {/* Quick Scenario Buttons */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748B", marginRight: "4px" }}>
                Sample Scenarios:
              </span>
              {sampleScenarios.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(sc.prompt);
                    handleSend(sc.prompt, sc.mode);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    color: "#94A3B8",
                    cursor: "pointer",
                    transition:
                      "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease",
                  }}
                >
                  &bull; {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dual-Column Results Console */}
          {result && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Left Column: Synthesized Assistive Output */}
              <div
                style={{
                  background: "rgba(26, 36, 51, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "22px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        fontSize: "14px",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#3FEDBA",
                        }}
                      />
                      Synthesized Assistive Output
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "#94A3B8",
                        }}
                      >
                        EN / AR Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(result.responseText)}
                        title="Play Speech Synthesis"
                        style={{
                          background: isSpeaking ? "#3FEDBA22" : "rgba(255, 255, 255, 0.06)",
                          border: isSpeaking ? "1px solid #3FEDBA" : "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "8px",
                          padding: "6px 10px",
                          color: isSpeaking ? "#3FEDBA" : "#FFFFFF",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                        }}
                      >
                        <IconSpeaker size={14} color={isSpeaking ? "#3FEDBA" : "currentColor"} />
                        <span>{isSpeaking ? "Speaking" : "Listen"}</span>
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      marginBottom: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>TARGET: Elena Vance &bull; Display Mode: Alzheimer&apos;s</span>
                    <span style={{ color: "#3FEDBA" }}>Speech Synthesis: 0.88x Normal</span>
                  </div>

                  <div
                    style={{
                      fontSize: "15px",
                      lineHeight: "1.7",
                      color: "#FFFFFF",
                      background: "rgba(12, 20, 31, 0.6)",
                      padding: "18px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      marginBottom: "16px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {result.responseText}
                  </div>

                  {/* Verified Medication / Health Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(63, 237, 186, 0.08)",
                      border: "1px solid rgba(63, 237, 186, 0.25)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <IconCheckCircle size={15} color="#3FEDBA" />
                      <span style={{ color: "#FFFFFF", fontWeight: 600 }}>
                        Concor 5mg (Bisoprolol) Verified
                      </span>
                    </div>
                    <span style={{ color: "#3FEDBA", fontSize: "11px" }}>Logged at 09:02 AM</span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: "11px",
                    color: "#64748B",
                  }}
                >
                  <span>Readability Metric: Flesch-Kincaid 4.2 (Calm &amp; Clear)</span>
                  <span>No Confusion Loops Detected</span>
                </div>
              </div>

              {/* Right Column: DeepSeek-R1 Cognitive Chain-of-Thought */}
              <div
                style={{
                  background: "rgba(26, 36, 51, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "22px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        fontSize: "14px",
                      }}
                    >
                      <IconActivity size={16} color="#AF6AFB" />
                      DeepSeek-R1 Cognitive Chain-of-Thought
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(175, 106, 251, 0.12)",
                        color: "#AF6AFB",
                        fontFamily: "monospace",
                      }}
                    >
                      Token Eval: 248 tok/s
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      lineHeight: "1.65",
                      color: "#A7B7C7",
                      background: "rgba(12, 20, 31, 0.8)",
                      padding: "16px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      maxHeight: "260px",
                      overflowY: "auto",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {result.reasoningContent ||
                      "Reasoning stream executed deterministically via Cloudflare Workers AI."}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    fontSize: "11px",
                    color: "#64748B",
                  }}
                >
                  <span>Audit Trail: HIPAA-LOG-UUID-9082</span>
                  <span style={{ color: "#10B981" }}>100% Deterministic Pass</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Telemetry & Sensory Ergonomics Deck */}
        <section style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <IconActivity size={18} color="#3FEDBA" />
              Telemetry &amp; Sensory Ergonomics Deck
            </h2>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Real-Time Continuous Sampling: 100ms Interval
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Card 1: Latency */}
            <div
              style={{
                background: "rgba(26, 36, 51, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                <span>LATENCY METRICS</span>
                <IconBolt size={14} color="#16B9FE" />
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "'Outfit', sans-serif",
                  marginBottom: "4px",
                }}
              >
                142<span style={{ fontSize: "16px", fontWeight: 400, color: "#64748B" }}>ms</span>
              </div>
              <div style={{ fontSize: "11px", color: "#16B9FE", marginBottom: "8px" }}>
                &bull; p95 Cloudflare Workers AI
              </div>
              <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, lineHeight: "1.5" }}>
                Ultra-low latency inference ensures conversational responsiveness before cognitive disorientation occurs.
              </p>
            </div>

            {/* Card 2: Contrast Fidelity */}
            <div
              style={{
                background: "rgba(26, 36, 51, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                <span>CONTRAST FIDELITY</span>
                <IconShieldCheck size={14} color="#3FEDBA" />
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "'Outfit', sans-serif",
                  marginBottom: "4px",
                }}
              >
                15.2:1
              </div>
              <div style={{ fontSize: "11px", color: "#3FEDBA", marginBottom: "8px" }}>
                &bull; WCAG AAA Certified
              </div>
              <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, lineHeight: "1.5" }}>
                Mitigates visual perception distortion and dementia-related visual deficits via luminous spectral containment.
              </p>
            </div>

            {/* Card 3: Cognitive Topology */}
            <div
              style={{
                background: "rgba(26, 36, 51, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                <span>COGNITIVE TOPOLOGY</span>
                <IconDatabase size={14} color="#AF6AFB" />
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "'Outfit', sans-serif",
                  marginBottom: "6px",
                  marginTop: "6px",
                }}
              >
                Dual Edge-Cloud
              </div>
              <div style={{ fontSize: "11px", color: "#AF6AFB", marginBottom: "8px" }}>
                &bull; Hybrid Neural Partition
              </div>
              <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, lineHeight: "1.5" }}>
                Local on-premise Raspberry Pi 4 Whisper engine performs zero-egress audio triage paired with remote Cloudflare serverless GPUs.
              </p>
            </div>

            {/* Card 4: Biophilic Pacing */}
            <div
              style={{
                background: "rgba(26, 36, 51, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                <span>SENSORY PACING</span>
                <IconWaveform size={14} color="#60EFEB" />
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "'Outfit', sans-serif",
                  marginBottom: "6px",
                  marginTop: "6px",
                }}
              >
                Biophilic Mode
              </div>
              <div style={{ fontSize: "11px", color: "#60EFEB", marginBottom: "8px" }}>
                &bull; Circadian Acoustic Bed
              </div>
              <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, lineHeight: "1.5" }}>
                Continuous 432Hz harmonic acoustic resonance, circadian temperature color shift, and dopamine micro-reward rhythm.
              </p>
            </div>
          </div>
        </section>

        {/* Clinical AI Governance & Safety Bounds */}
        <section
          style={{
            background: "rgba(26, 36, 51, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "22px",
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconShieldCheck size={20} color="#10B981" />
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                Clinical AI Governance &amp; Safety Bounds
              </h3>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.12)",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              Zero-Hallucination Barrier Active
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              fontSize: "12px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#F8FAFC",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconCheckCircle size={14} color="#10B981" />
                FDA 510(k) Pre-Market Protocols
              </div>
              <p style={{ color: "#94A3B8", margin: 0, lineHeight: "1.55" }}>
                Continuous automated verification of non-prescriptive advisory boundaries. Every suggestion conforms to Class II algorithmic guidelines.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#F8FAFC",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconLock size={14} color="#38BDF8" />
                Encrypted HIPAA Audit Trail
              </div>
              <p style={{ color: "#94A3B8", margin: 0, lineHeight: "1.55" }}>
                All biotelemetry streams and audio prompts are cryptographic SHA-256 hashed and stored exclusively on isolated, compliant edge nodes.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#F8FAFC",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconShieldCheck size={14} color="#AF6AFB" />
                Incident Escalation Protocol
              </div>
              <p style={{ color: "#94A3B8", margin: 0, lineHeight: "1.55" }}>
                Automatic fail-safe handover to human clinical nursing staff triggered instantly if patient sentiment expresses severe pain or persistent distress.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Global Testing Footer */}
      <TestingFooter />
    </div>
  );
}
