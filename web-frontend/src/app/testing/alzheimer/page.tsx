"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AlzheimerSanctuaryPage() {
  const [medTaken, setMedTaken] = useState(false);
  const [playingStory, setPlayingStory] = useState(false);
  const [currentTime, setCurrentTime] = useState("10:30 AM");
  const [currentDate, setCurrentDate] = useState("Monday, May 20");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    "صباح الخير يا فندم! متقلقش خالص، كل أمورك مستقرة وصحتك كويسة جداً. قرص دواء الضغط (كونكور 5 مجم) متسجل إنه تم أخذه الساعة 9:00 صباحاً مع بنتك سارة."
  );
  const [reasoningTrace, setReasoningTrace] = useState<string | null>(
    "1. Intent: Memory check regarding morning medication.\n2. Verification: Verified Concor 5mg logged at 09:00 AM alongside Sarah Vance.\n3. Safety: Strict reassurance protocol to prevent double-dosing hazard."
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const speakText = (text: string, isArabic = false) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Calming, unhurried pacing for elderly comprehension
      utterance.pitch = 1.0;
      if (isArabic) {
        utterance.lang = "ar-EG";
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAskCura = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: "alzheimer",
          patient_id: "arthur-vance-4092",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResponse(json.data.response_text);
        setReasoningTrace(json.data.reasoning_content || null);
        const isAr = /[\u0600-\u06FF]/.test(json.data.response_text);
        speakText(json.data.response_text, isAr);
      }
    } catch {
      const fallback =
        "صباح الخير! كل حاجة بخير ومتسجلة عندنا. متقلقش خالص يا فندم.";
      setAiResponse(fallback);
      speakText(fallback, true);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationClick = () => {
    setMedTaken(true);
    speakText(
      "Thank you! Your morning medicine has been marked as taken. Good job!",
      false
    );
  };

  const handleStoryToggle = () => {
    if (playingStory) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingStory(false);
    } else {
      setPlayingStory(true);
      speakText(
        "Now playing your favorite memory: The Big Sur coastline trip in 1984 with Clara. The ocean breeze was cool, and Clara was smiling as you walked along the cliffs.",
        false
      );
    }
  };

  const handleSosClick = () => {
    speakText(
      "Calling your caregiver right now. Please remain seated and calm. Help is connecting.",
      false
    );
    alert("Connecting instant two-way video link to Caregiver Sarah Vance...");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0F7F4",
        color: "#0D1F2D",
        fontFamily: "'Lexend', 'Atkinson Hyperlegible', sans-serif",
        padding: "0 0 60px 0",
      }}
    >
      {/* Top Clinical Navigation Bar */}
      <nav
        style={{
          height: "64px",
          backgroundColor: "#E6F0EC",
          borderBottom: "2px solid #B2DFDB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#0D1F2D",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "#00A884",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              ♥
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.02em" }}>
                CURA
              </div>
              <div style={{ fontSize: "11px", color: "#00A884", fontWeight: "700" }}>
                Alzheimer&apos;s Memory Care Sanctuary
              </div>
            </div>
          </Link>
        </div>

        {/* Mode Switcher Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/testing"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #B2DFDB",
              fontSize: "13px",
              fontWeight: "600",
              color: "#2D3748",
              textDecoration: "none",
            }}
          >
            ← Testing Hub
          </Link>
          <Link
            href="/testing/adhd"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #B2DFDB",
              fontSize: "13px",
              fontWeight: "600",
              color: "#7C3AED",
              textDecoration: "none",
            }}
          >
            ADHD Focus Mode →
          </Link>
          <Link
            href="/testing/normal"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #B2DFDB",
              fontSize: "13px",
              fontWeight: "600",
              color: "#0284C7",
              textDecoration: "none",
            }}
          >
            Normal Assistant →
          </Link>
        </div>
      </nav>

      {/* Main Sanctuary Container */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 20px" }}>
        {/* 1. Grounding Hero Orientation Card */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #B2DFDB",
            borderRadius: "28px",
            padding: "36px 32px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#00A884",
                fontSize: "14px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "8px",
              }}
            >
              <span>🏡</span> Safe Home Sanctuary
            </div>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "900",
                color: "#0D1F2D",
                margin: "0 0 6px 0",
                letterSpacing: "-0.03em",
              }}
            >
              {currentTime}
            </h1>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#2D3748" }}>
              {currentDate}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#F0F7F4",
              border: "2px solid #B2DFDB",
              borderRadius: "20px",
              padding: "20px 24px",
              maxWidth: "520px",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0D1F2D", marginBottom: "6px" }}>
              Good morning, Arthur.
            </div>
            <p style={{ fontSize: "16px", color: "#2D3748", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>
              You are at home in your quiet house in Mill Valley. The weather is clear and 68°F. You are safe, comfortable, and well looked after.
            </p>
          </div>
        </section>

        {/* 2. Interactive Voice Reassurance & Dialogue Console */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #00A884",
            borderRadius: "28px",
            padding: "28px",
            boxShadow: "0 6px 20px rgba(0, 168, 132, 0.08)",
            marginBottom: "28px",
          }}
        >
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#00A884",
                  boxShadow: "0 0 10px #00A884",
                }}
              />
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#0D1F2D" }}>
                Ask CURA (Voice & Reassurance Console)
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#00A884",
                backgroundColor: "#E6F0EC",
                padding: "6px 14px",
                borderRadius: "9999px",
                border: "1px solid #B2DFDB",
              }}
            >
              15.2:1 WCAG AAA Contrast • Gentle 0.85x Pacing
            </span>
          </div>

          {/* Quick-Tap Prompt Buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleAskCura("أنا أخدت دواء الضغط النهاردة ولا لسه؟")}
              style={{
                padding: "10px 18px",
                borderRadius: "14px",
                backgroundColor: "#F0F7F4",
                border: "2px solid #00A884",
                color: "#00A884",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "'Atkinson Hyperlegible', sans-serif",
              }}
            >
              🩺 &quot;أنا أخدت دواء الضغط النهاردة ولا لسه؟&quot;
            </button>
            <button
              onClick={() => handleAskCura("Who is visiting me today?")}
              style={{
                padding: "10px 18px",
                borderRadius: "14px",
                backgroundColor: "#F0F7F4",
                border: "2px solid #B2DFDB",
                color: "#2D3748",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              👥 &quot;Who is visiting me today?&quot;
            </button>
            <button
              onClick={() => handleAskCura("What is on my schedule for today?")}
              style={{
                padding: "10px 18px",
                borderRadius: "14px",
                backgroundColor: "#F0F7F4",
                border: "2px solid #B2DFDB",
                color: "#2D3748",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🗓️ &quot;What is on my schedule for today?&quot;
            </button>
          </div>

          {/* Response Box */}
          {aiResponse && (
            <div
              style={{
                backgroundColor: "#F0F7F4",
                border: "2px solid #B2DFDB",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontWeight: "800", color: "#00A884", fontSize: "14px" }}>
                  CURA Voice Reassurance:
                </div>
                <button
                  onClick={() => {
                    const isAr = /[\u0600-\u06FF]/.test(aiResponse);
                    speakText(aiResponse, isAr);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#00A884",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  🔊 Listen Aloud
                </button>
              </div>
              <p
                style={{
                  fontSize: "17px",
                  lineHeight: "1.7",
                  margin: 0,
                  color: "#0D1F2D",
                  fontWeight: "600",
                  direction: /[\u0600-\u06FF]/.test(aiResponse) ? "rtl" : "ltr",
                }}
              >
                {aiResponse}
              </p>
            </div>
          )}

          {/* Reasoning Trace Collapsible */}
          {reasoningTrace && (
            <details
              style={{
                backgroundColor: "#E6F0EC",
                borderRadius: "14px",
                padding: "12px 16px",
                fontSize: "13px",
                color: "#2D3748",
                marginBottom: "16px",
                border: "1px solid #B2DFDB",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: "700", color: "#00A884" }}>
                DeepSeek-R1 Clinical Reasoning Trace (&lt;think&gt;)
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  marginTop: "8px",
                  color: "#1E293B",
                }}
              >
                {reasoningTrace}
              </pre>
            </details>
          )}

          {/* Input Bar */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskCura()}
              placeholder="Type your question or reassuring memory here..."
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: "16px",
                border: "2px solid #B2DFDB",
                fontSize: "16px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => handleAskCura()}
              disabled={loading}
              style={{
                padding: "14px 28px",
                borderRadius: "16px",
                backgroundColor: "#00A884",
                color: "#FFFFFF",
                border: "none",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "wait" : "pointer",
                minWidth: "120px",
              }}
            >
              {loading ? "Thinking..." : "Ask CURA"}
            </button>
          </div>
        </section>

        {/* 3. Tactile 2x2 Memory & Care Matrix */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          {/* CARD 1: FAMILY CONTACTS */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #B2DFDB",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#0D1F2D" }}>
                  Your Family
                </div>
                <span style={{ fontSize: "12px", color: "#00A884", backgroundColor: "#E6F0EC", padding: "4px 10px", borderRadius: "9999px", fontWeight: "700" }}>
                  3 Nearby
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", textAlign: "center" }}>
                <div style={{ backgroundColor: "#F0F7F4", padding: "12px 6px", borderRadius: "16px", border: "1px solid #B2DFDB" }}>
                  <div style={{ fontSize: "32px", marginBottom: "4px" }}>👩</div>
                  <div style={{ fontWeight: "800", fontSize: "15px" }}>Sarah</div>
                  <div style={{ fontSize: "12px", color: "#00A884", fontWeight: "700" }}>Daughter</div>
                </div>
                <div style={{ backgroundColor: "#F0F7F4", padding: "12px 6px", borderRadius: "16px", border: "1px solid #B2DFDB" }}>
                  <div style={{ fontSize: "32px", marginBottom: "4px" }}>👨</div>
                  <div style={{ fontWeight: "800", fontSize: "15px" }}>David</div>
                  <div style={{ fontSize: "12px", color: "#0284C7", fontWeight: "700" }}>Son</div>
                </div>
                <div style={{ backgroundColor: "#F0F7F4", padding: "12px 6px", borderRadius: "16px", border: "1px solid #B2DFDB" }}>
                  <div style={{ fontSize: "32px", marginBottom: "4px" }}>👦👧</div>
                  <div style={{ fontWeight: "800", fontSize: "15px" }}>Grandkids</div>
                  <div style={{ fontSize: "12px", color: "#7C3AED", fontWeight: "700" }}>Leo &amp; Mia</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => speakText("Calling Sarah, your daughter, right now.", false)}
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "#F0F7F4",
                border: "2px solid #00A884",
                color: "#0D1F2D",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              📞 Call Sarah Now
            </button>
          </div>

          {/* CARD 2: MORNING MEDICINE */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #B2DFDB",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#0D1F2D" }}>
                  Morning Medicine
                </div>
                <span style={{ fontSize: "12px", color: "#00A884", backgroundColor: "#E6F0EC", padding: "4px 10px", borderRadius: "9999px", fontWeight: "700" }}>
                  Concor 5mg
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#F0F7F4",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "1px solid #B2DFDB",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div style={{ fontSize: "36px" }}>💊</div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "16px", color: "#0D1F2D" }}>
                    Blood Pressure Capsule
                  </div>
                  <div style={{ fontSize: "13px", color: "#4A5568", marginTop: "2px" }}>
                    1 tablet with a glass of water on the dining table
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleMedicationClick}
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: medTaken ? "#E6F0EC" : "#00A884",
                color: medTaken ? "#00A884" : "#FFFFFF",
                border: medTaken ? "2px solid #00A884" : "none",
                fontSize: "17px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {medTaken ? "✓ Marked as Taken (Thank you, Arthur!)" : "✓ Mark as Taken"}
            </button>
          </div>

          {/* CARD 3: TODAY'S GENTLE SCHEDULE */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #B2DFDB",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0D1F2D", marginBottom: "16px" }}>
              Today&apos;s Schedule
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "12px 14px", backgroundColor: "#F0F7F4", borderRadius: "14px", border: "1px solid #B2DFDB" }}>
                <div style={{ fontWeight: "800", fontSize: "15px", color: "#0D1F2D" }}>
                  11:30 AM — Walk in the Garden
                </div>
                <div style={{ fontSize: "13px", color: "#4A5568" }}>Strolling the flowers with Sarah</div>
              </div>
              <div style={{ padding: "12px 14px", backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: "800", fontSize: "15px", color: "#0D1F2D" }}>
                  01:00 PM — Lunch &amp; Warm Soup
                </div>
                <div style={{ fontSize: "13px", color: "#4A5568" }}>Roasted tomato soup and warm bread</div>
              </div>
              <div style={{ padding: "12px 14px", backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: "800", fontSize: "15px", color: "#0D1F2D" }}>
                  03:00 PM — Classical Music &amp; Rest
                </div>
                <div style={{ fontSize: "13px", color: "#4A5568" }}>Mozart string quartets in the armchair</div>
              </div>
            </div>
          </div>

          {/* CARD 4: MEMORIES & STORY NARRATION */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #B2DFDB",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#0D1F2D", marginBottom: "8px" }}>
                Memory Album
              </div>
              <div style={{ fontSize: "13px", color: "#4A5568", marginBottom: "14px" }}>
                Pacific Coast Highway, 1984 with Clara
              </div>
              <div
                style={{
                  height: "120px",
                  borderRadius: "16px",
                  backgroundColor: "#E6F0EC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                  border: "2px solid #B2DFDB",
                }}
              >
                🌊🌅
              </div>
            </div>
            <button
              onClick={handleStoryToggle}
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "#F0F7F4",
                border: "2px solid #7C3AED",
                color: "#7C3AED",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {playingStory ? "⏸ Stop Narration" : "▶ Listen to Story Narration"}
            </button>
          </div>
        </section>

        {/* 4. Large Emergency SOS Button */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #DC2626",
            borderRadius: "28px",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "0 6px 20px rgba(220, 38, 38, 0.12)",
          }}
        >
          <div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#DC2626", marginBottom: "4px" }}>
              Need immediate help or feeling unsure?
            </div>
            <div style={{ fontSize: "15px", color: "#4A5568" }}>
              Press the red button anytime. Dedicated nurse Maria is 2 minutes away.
            </div>
          </div>
          <button
            onClick={handleSosClick}
            style={{
              padding: "20px 36px",
              borderRadius: "20px",
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              border: "none",
              fontSize: "20px",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(220, 38, 38, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            🚨 SOS CALL CAREGIVER
          </button>
        </section>
      </main>
    </div>
  );
}
