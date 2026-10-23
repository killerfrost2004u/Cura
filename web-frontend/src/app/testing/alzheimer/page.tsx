"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TestingNavbar from "../components/TestingNavbar";
import TestingFooter from "../components/TestingFooter";
import {
  IconBrain,
  IconShieldCheck,
  IconSpeaker,
  IconCheckCircle,
  IconClock,
  IconActivity,
  IconWaveform,
} from "../components/CuraIcons";

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
        backgroundColor: "#0C141F",
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        padding: "0 0 60px 0",
      }}
    >
      <TestingNavbar />

      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "32px 24px" }}>
        {/* 1. Grounding Hero Orientation Card */}
        <section
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.8)",
            border: "2px solid rgba(63, 237, 186, 0.4)",
            borderRadius: "28px",
            padding: "36px 32px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
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
                color: "#3FEDBA",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "8px",
              }}
            >
              <IconShieldCheck size={16} color="#3FEDBA" />
              <span>Safe Home Sanctuary &bull; 15.2:1 Contrast</span>
            </div>
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#FFFFFF",
                margin: "0 0 6px 0",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              {currentTime}
            </h1>
            <div style={{ fontSize: "22px", fontWeight: 600, color: "#E8EDF1" }}>
              {currentDate}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(12, 20, 31, 0.8)",
              border: "1px solid rgba(63, 237, 186, 0.3)",
              borderRadius: "20px",
              padding: "22px 26px",
              maxWidth: "520px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "6px",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Good morning, Arthur.
            </div>
            <p
              style={{
                fontSize: "16px",
                color: "#E8EDF1",
                lineHeight: "1.6",
                margin: 0,
                fontWeight: 400,
              }}
            >
              You are at home in your quiet house in Mill Valley. The weather is clear and 68&deg;F. You are safe, comfortable, and well looked after.
            </p>
          </div>
        </section>

        {/* 2. Interactive Voice Reassurance & Dialogue Console */}
        <section
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.8)",
            border: "2px solid #3FEDBA",
            borderRadius: "28px",
            padding: "28px",
            boxShadow: "0 8px 30px rgba(63, 237, 186, 0.12)",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
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
                  backgroundColor: "#3FEDBA",
                  boxShadow: "0 0 10px #3FEDBA",
                }}
              />
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Ask CURA (Voice &amp; Reassurance Console)
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#3FEDBA",
                backgroundColor: "rgba(63, 237, 186, 0.12)",
                padding: "6px 14px",
                borderRadius: "9999px",
                border: "1px solid rgba(63, 237, 186, 0.3)",
              }}
            >
              15.2:1 WCAG AAA Contrast &bull; Gentle 0.85x Pacing
            </span>
          </div>

          {/* Quick-Tap Prompt Buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleAskCura("أنا أخدت دواء الضغط النهاردة ولا لسه؟")}
              style={{
                padding: "12px 20px",
                borderRadius: "14px",
                backgroundColor: "rgba(63, 237, 186, 0.12)",
                border: "2px solid #3FEDBA",
                color: "#3FEDBA",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <IconShieldCheck size={16} color="#3FEDBA" />
              <span>&quot;أنا أخدت دواء الضغط النهاردة ولا لسه؟&quot;</span>
            </button>
            <button
              type="button"
              onClick={() => handleAskCura("Who is visiting me today?")}
              style={{
                padding: "12px 20px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#E8EDF1",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <IconBrain size={16} color="#38BDF8" />
              <span>&quot;Who is visiting me today?&quot;</span>
            </button>
            <button
              type="button"
              onClick={() => handleAskCura("What is on my schedule for today?")}
              style={{
                padding: "12px 20px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#E8EDF1",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <IconClock size={16} color="#AF6AFB" />
              <span>&quot;What is on my schedule for today?&quot;</span>
            </button>
          </div>

          {/* Response Box */}
          {aiResponse && (
            <div
              style={{
                backgroundColor: "rgba(12, 20, 31, 0.8)",
                border: "1px solid rgba(63, 237, 186, 0.3)",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#3FEDBA", fontSize: "14px" }}>
                  CURA Voice Reassurance:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const isAr = /[\u0600-\u06FF]/.test(aiResponse);
                    speakText(aiResponse, isAr);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#3FEDBA",
                    color: "#0C141F",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <IconSpeaker size={15} color="#0C141F" />
                  <span>Listen Aloud</span>
                </button>
              </div>
              <p
                style={{
                  fontSize: "18px",
                  lineHeight: "1.7",
                  margin: 0,
                  color: "#FFFFFF",
                  fontWeight: 500,
                  direction: /[\u0600-\u06FF]/.test(aiResponse) ? "rtl" : "ltr",
                }}
              >
                {aiResponse}
              </p>
            </div>
          )}

          {/* Reasoning Trace */}
          {reasoningTrace && (
            <details
              style={{
                backgroundColor: "rgba(12, 20, 31, 0.6)",
                borderRadius: "14px",
                padding: "12px 16px",
                fontSize: "12px",
                color: "#94A3B8",
                marginBottom: "18px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 700, color: "#3FEDBA" }}>
                DeepSeek-R1 Clinical Reasoning Trace (&lt;think&gt;)
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  marginTop: "8px",
                  color: "#A7B7C7",
                }}
              >
                {reasoningTrace}
              </pre>
            </details>
          )}

          {/* Input Bar */}
          <div style={{ display: "flex", gap: "12px" }}>
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
                background: "rgba(12, 20, 31, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontSize: "16px",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => handleAskCura()}
              disabled={loading}
              style={{
                padding: "14px 28px",
                borderRadius: "16px",
                backgroundColor: "#3FEDBA",
                color: "#0C141F",
                border: "none",
                fontSize: "16px",
                fontWeight: 800,
                cursor: loading ? "wait" : "pointer",
                minWidth: "130px",
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
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
              backgroundColor: "rgba(26, 36, 51, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "24px",
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
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", fontFamily: "'Outfit', sans-serif" }}>
                  Your Family
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#3FEDBA",
                    backgroundColor: "rgba(63, 237, 186, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                  }}
                >
                  3 Nearby
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", textAlign: "center" }}>
                <div style={{ backgroundColor: "rgba(12, 20, 31, 0.8)", padding: "14px 8px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#FFFFFF" }}>Sarah</div>
                  <div style={{ fontSize: "12px", color: "#3FEDBA", fontWeight: 600 }}>Daughter</div>
                </div>
                <div style={{ backgroundColor: "rgba(12, 20, 31, 0.8)", padding: "14px 8px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#FFFFFF" }}>David</div>
                  <div style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>Son</div>
                </div>
                <div style={{ backgroundColor: "rgba(12, 20, 31, 0.8)", padding: "14px 8px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#FFFFFF" }}>Grandkids</div>
                  <div style={{ fontSize: "12px", color: "#AF6AFB", fontWeight: 600 }}>Leo &amp; Mia</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => speakText("Calling Sarah, your daughter, right now.", false)}
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "rgba(63, 237, 186, 0.12)",
                border: "2px solid #3FEDBA",
                color: "#3FEDBA",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <IconShieldCheck size={18} color="#3FEDBA" />
              <span>Call Sarah Now</span>
            </button>
          </div>

          {/* CARD 2: MORNING MEDICINE */}
          <div
            style={{
              backgroundColor: "rgba(26, 36, 51, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "24px",
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
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", fontFamily: "'Outfit', sans-serif" }}>
                  Morning Medicine
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#3FEDBA",
                    backgroundColor: "rgba(63, 237, 186, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                  }}
                >
                  Concor 5mg
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(12, 20, 31, 0.8)",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <IconCheckCircle size={28} color="#3FEDBA" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "#FFFFFF" }}>
                    Blood Pressure Capsule
                  </div>
                  <div style={{ fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
                    1 tablet with a glass of water on the dining table
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleMedicationClick}
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: medTaken ? "rgba(63, 237, 186, 0.2)" : "#3FEDBA",
                color: medTaken ? "#3FEDBA" : "#0C141F",
                border: medTaken ? "2px solid #3FEDBA" : "none",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <IconCheckCircle size={18} color={medTaken ? "#3FEDBA" : "#0C141F"} />
              <span>{medTaken ? "Marked as Taken (Thank you, Arthur!)" : "Mark as Taken"}</span>
            </button>
          </div>

          {/* CARD 3: TODAY'S GENTLE SCHEDULE */}
          <div
            style={{
              backgroundColor: "rgba(26, 36, 51, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "24px",
              padding: "24px",
            }}
          >
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px", fontFamily: "'Outfit', sans-serif" }}>
              Today&apos;s Schedule
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(12, 20, 31, 0.8)", borderRadius: "14px", border: "1px solid rgba(63, 237, 186, 0.3)" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#3FEDBA" }}>
                  11:30 AM &bull; Walk in the Garden
                </div>
                <div style={{ fontSize: "13px", color: "#94A3B8" }}>Strolling the flowers with Sarah</div>
              </div>
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(12, 20, 31, 0.8)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#FFFFFF" }}>
                  01:00 PM &bull; Lunch &amp; Warm Soup
                </div>
                <div style={{ fontSize: "13px", color: "#94A3B8" }}>Roasted tomato soup and warm bread</div>
              </div>
              <div style={{ padding: "12px 14px", backgroundColor: "rgba(12, 20, 31, 0.8)", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#FFFFFF" }}>
                  03:00 PM &bull; Classical Music &amp; Rest
                </div>
                <div style={{ fontSize: "13px", color: "#94A3B8" }}>Mozart string quartets in the armchair</div>
              </div>
            </div>
          </div>

          {/* CARD 4: MEMORIES & STORY NARRATION */}
          <div
            style={{
              backgroundColor: "rgba(26, 36, 51, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "24px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px", fontFamily: "'Outfit', sans-serif" }}>
                Memory Album
              </div>
              <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "14px" }}>
                Pacific Coast Highway, 1984 with Clara
              </div>
              <div
                style={{
                  height: "120px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(12, 20, 31, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <IconWaveform size={40} color="#3FEDBA" />
              </div>
            </div>
            <button
              type="button"
              onClick={handleStoryToggle}
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "rgba(175, 106, 251, 0.12)",
                border: "2px solid #AF6AFB",
                color: "#AF6AFB",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <IconSpeaker size={18} color="#AF6AFB" />
              <span>{playingStory ? "Stop Narration" : "Listen to Story Narration"}</span>
            </button>
          </div>
        </section>

        {/* 4. Large Emergency SOS Button */}
        <section
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.12)",
            border: "2px solid #EF4444",
            borderRadius: "28px",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "0 6px 20px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#EF4444", marginBottom: "4px", fontFamily: "'Outfit', sans-serif" }}>
              Need immediate help or feeling unsure?
            </div>
            <div style={{ fontSize: "15px", color: "#E8EDF1" }}>
              Press the red button anytime. Dedicated nurse Maria is 2 minutes away.
            </div>
          </div>
          <button
            type="button"
            onClick={handleSosClick}
            style={{
              padding: "18px 36px",
              borderRadius: "20px",
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              border: "none",
              fontSize: "18px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(239, 68, 68, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <IconShieldCheck size={20} color="#FFFFFF" />
            <span>SOS CALL CAREGIVER</span>
          </button>
        </section>
      </main>

      <TestingFooter />
    </div>
  );
}
