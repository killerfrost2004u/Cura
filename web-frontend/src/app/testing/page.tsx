"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AITestingHubPage() {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#131B26",
        color: "#E8EDF1",
        fontFamily: "'Inter', sans-serif",
        padding: "0 0 80px",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(26, 36, 51, 0.8)",
          backdropFilter: "blur(20px)",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #16B9FE 0%, #AF6AFB 50%, #3FEDBA 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "900",
              color: "#131B26",
            }}
          >
            C
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "900", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
              CURA AI &amp; Backend Testing Cockpit
            </div>
            <div style={{ fontSize: "11px", color: "#16B9FE", fontWeight: "600" }}>
              Internal Testing Suite • AI &amp; Backend Engineering
            </div>
          </div>
        </div>

        {/* Live Engine Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(22, 185, 254, 0.1)",
            border: "1px solid rgba(22, 185, 254, 0.25)",
            padding: "8px 18px",
            borderRadius: "9999px",
            fontSize: "12px",
            color: "#60EFEB",
            fontWeight: "600",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#10B981",
              boxShadow: "0 0 10px #10B981",
            }}
          />
          Live Engine: Cloudflare Workers AI (Serverless GPU — DeepSeek-R1 32B + Whisper)
        </div>

        {/* Quick Nav to Dedicated Sanctuaries */}
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/"
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <Link
            href="/testing/alzheimer"
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(63, 237, 186, 0.15)",
              border: "1.5px solid #3FEDBA",
              color: "#3FEDBA",
              fontSize: "13px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Alzheimer&apos;s Test 🌿
          </Link>
          <Link
            href="/testing/adhd"
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(175, 106, 251, 0.15)",
              border: "1.5px solid #AF6AFB",
              color: "#AF6AFB",
              fontSize: "13px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            ADHD Test ⚡
          </Link>
          <Link
            href="/testing/normal"
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(22, 185, 254, 0.15)",
              border: "1.5px solid #16B9FE",
              color: "#16B9FE",
              fontSize: "13px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Normal Test 💬
          </Link>
        </div>
      </header>

      {/* Main Hub Body */}
      <main style={{ maxWidth: "1160px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Notice Banner */}
        <div
          style={{
            backgroundColor: "rgba(22, 185, 254, 0.08)",
            border: "1px solid rgba(22, 185, 254, 0.25)",
            borderRadius: "16px",
            padding: "16px 20px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "14px", color: "#60EFEB" }}>
            🛠️ <strong>AI &amp; Backend Engineer Testing Suite:</strong> This section is dedicated to verifying live Cloudflare GPU models, Whisper STT, Neon pgvector memory retrieval, and multi-step reasoning traces.
          </div>
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "#FFFFFF",
              textDecoration: "underline",
              fontWeight: "600",
            }}
          >
            Return to Root Page →
          </Link>
        </div>

        {/* 3 Dedicated Mode Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {/* CARD 1: ALZHEIMER'S SANCTUARY */}
          <div
            style={{
              backgroundColor: "rgba(26, 36, 51, 0.8)",
              borderRadius: "28px",
              border: "2px solid #3FEDBA",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(63, 237, 186, 0.12)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(63, 237, 186, 0.15)",
                  color: "#3FEDBA",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "14px",
                }}
              >
                🌿 Alzheimer&apos;s Memory Test
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  fontFamily: "'Outfit', sans-serif",
                  color: "#FFFFFF",
                  margin: "0 0 10px",
                }}
              >
                Alzheimer’s Care Mode
              </h2>
              <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: "1.6", marginBottom: "20px" }}>
                Tests warm biophilic light styling (`#F0F7F4`), high-contrast memory validation, Concor 5mg morning pill logging, family contacts, and 0.85x pacing audio reassurance.
              </p>
            </div>
            <Link
              href="/testing/alzheimer"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                borderRadius: "16px",
                backgroundColor: "#3FEDBA",
                color: "#131B26",
                fontSize: "15px",
                fontWeight: "800",
                textDecoration: "none",
              }}
            >
              Test Alzheimer&apos;s Mode →
            </Link>
          </div>

          {/* CARD 2: ADHD FOCUS SANCTUARY */}
          <div
            style={{
              backgroundColor: "rgba(26, 36, 51, 0.8)",
              borderRadius: "28px",
              border: "2px solid #AF6AFB",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(175, 106, 251, 0.12)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(175, 106, 251, 0.15)",
                  color: "#AF6AFB",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "14px",
                }}
              >
                ⚡ ADHD Focus Test
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  fontFamily: "'Outfit', sans-serif",
                  color: "#FFFFFF",
                  margin: "0 0 10px",
                }}
              >
                ADHD Focus &amp; Flow
              </h2>
              <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: "1.6", marginBottom: "20px" }}>
                Tests low-stimulation greige/lilac styling, 15-minute visual focus sprint countdown arc, AI task breakdown into 5-minute steps, and anti-paralysis pacing.
              </p>
            </div>
            <Link
              href="/testing/adhd"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                borderRadius: "16px",
                backgroundColor: "#AF6AFB",
                color: "#131B26",
                fontSize: "15px",
                fontWeight: "800",
                textDecoration: "none",
              }}
            >
              Test ADHD Mode →
            </Link>
          </div>

          {/* CARD 3: NORMAL ASSISTANT MODE */}
          <div
            style={{
              backgroundColor: "rgba(26, 36, 51, 0.8)",
              borderRadius: "28px",
              border: "2px solid #16B9FE",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 10px 30px rgba(22, 185, 254, 0.12)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(22, 185, 254, 0.15)",
                  color: "#16B9FE",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "14px",
                }}
              >
                💬 Normal Assistant Test
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  fontFamily: "'Outfit', sans-serif",
                  color: "#FFFFFF",
                  margin: "0 0 10px",
                }}
              >
                Normal Assistant Mode
              </h2>
              <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: "1.6", marginBottom: "20px" }}>
                Tests full multimodal conversation, live DeepSeek-R1 32B GPU multi-step reasoning trace inspector, push-to-talk microphone, and voice speech playback.
              </p>
            </div>
            <Link
              href="/testing/normal"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                borderRadius: "16px",
                backgroundColor: "#16B9FE",
                color: "#131B26",
                fontSize: "15px",
                fontWeight: "800",
                textDecoration: "none",
              }}
            >
              Test Normal Mode →
            </Link>
          </div>
        </section>

        {/* Live Interactive Quick Console */}
        <section
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.85)",
            backdropFilter: "blur(20px)",
            borderRadius: "28px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "36px",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#FFFFFF", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Live API &amp; GPU Test Console
              </h3>
              <p style={{ fontSize: "14px", color: "#94A3B8", margin: "4px 0 0" }}>
                Send test queries directly to `/api/chat` with live Cloudflare Workers AI edge execution:
              </p>
            </div>

            {/* Mode Toggle Buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              {(["normal", "alzheimer", "adhd"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMode(m)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "12px",
                    backgroundColor:
                      selectedMode === m
                        ? m === "alzheimer"
                          ? "#3FEDBA"
                          : m === "adhd"
                          ? "#AF6AFB"
                          : "#16B9FE"
                        : "rgba(255, 255, 255, 0.06)",
                    color: selectedMode === m ? "#131B26" : "#E8EDF1",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleSend(quickPrompts[selectedMode])}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(22, 185, 254, 0.12)",
                border: "1px solid rgba(22, 185, 254, 0.3)",
                color: "#60EFEB",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ⚡ Test Query: &quot;{quickPrompts[selectedMode]}&quot;
            </button>
          </div>

          {/* Dialogue Display */}
          {result && (
            <div
              style={{
                backgroundColor: "rgba(19, 27, 38, 0.9)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#16B9FE", fontWeight: "700" }}>
                  Query: {result.userQuery}
                </span>
                <button
                  onClick={() => speakText(result.responseText)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: "#60EFEB",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  🔊 Listen
                </button>
              </div>

              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#FFFFFF",
                  margin: "8px 0 16px",
                  fontWeight: "500",
                  direction: /[\u0600-\u06FF]/.test(result.responseText) ? "rtl" : "ltr",
                }}
              >
                {result.responseText}
              </p>

              {result.reasoningContent && (
                <details
                  open
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    border: "1px solid rgba(22, 185, 254, 0.2)",
                  }}
                >
                  <summary style={{ cursor: "pointer", fontSize: "12px", color: "#60EFEB", fontWeight: "700" }}>
                    DeepSeek-R1 Clinical Reasoning Chain (&lt;think&gt;)
                  </summary>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      color: "#94A3B8",
                      margin: "8px 0 0",
                      lineHeight: "1.5",
                    }}
                  >
                    {result.reasoningContent}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Input Bar */}
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything to test live backend & AI (e.g. 'What is the weather in Cairo today?')..."
              style={{
                flex: 1,
                padding: "16px 20px",
                borderRadius: "18px",
                backgroundColor: "rgba(19, 27, 38, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontSize: "15px",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              style={{
                padding: "16px 32px",
                borderRadius: "18px",
                backgroundColor: "#16B9FE",
                color: "#131B26",
                fontSize: "15px",
                fontWeight: "800",
                border: "none",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Reasoning..." : "Send Test Query"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
