"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TestingNavbar from "../components/TestingNavbar";
import TestingFooter from "../components/TestingFooter";
import VoiceMicButton from "../components/VoiceMicButton";
import ThinkingOrb from "../components/ThinkingOrb";
import { speakNaturalText, stopSpeaking, isArabicText } from "../utils/speech";
import {
  IconBolt,
  IconCheckCircle,
  IconBrain,
  IconSpeaker,
  IconClock,
  IconShieldCheck,
  IconActivity,
  IconCrosshair,
  IconCpu,
} from "../components/CuraIcons";

interface MicroTask {
  id: string;
  title: string;
  minutes: number;
  completed: boolean;
}

export default function AdhdFocusSanctuaryPage() {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([
    { id: "1", title: "Open your workspace & close unused browser tabs", minutes: 3, completed: true },
    { id: "2", title: "Write down the single first bullet point", minutes: 5, completed: false },
    { id: "3", title: "Review for 2 minutes and take a sip of water", minutes: 2, completed: false },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    "Take a slow, deep breath. Having multiple urgent tasks causes decision freeze, and that is completely okay. Let's ignore the big list and pick just ONE tiny 5-minute action: open your workspace and write down the very first sentence. Ready? Let's start our 15-minute focus sprint together!"
  );
  const [reasoningTrace, setReasoningTrace] = useState<string | null>(
    "1. Intent: Executive dysfunction & task paralysis.\n2. Strategy: Eliminate multi-task overwhelm. Enforce single micro-step isolation.\n3. Reward: Attach dopamine milestone upon kickoff."
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const toggleTask = (id: string) => {
    setMicroTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const speakText = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speakNaturalText(text, {
      preferEgyptian: true,
      rate: 0.95,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleAskCura = async (textToSend?: string, isFromMic = false) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: "adhd",
          patient_id: "adhd-focus-user",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResponse(json.data.response_text);
        setReasoningTrace(json.data.reasoning_content || null);
        if (isFromMic) {
          speakText(json.data.response_text);
        }
      }
    } catch {
      const fallback = isArabicText(text)
        ? "تنفس بهدوء. مش لازم نخلص كل حاجة النهاردة، هنبدأ بخطوة واحدة بسيطة مدتها 5 دقائق."
        : "Breathe in slowly. Let's pick one single task and work on it for 5 minutes.";
      setAiResponse(fallback);
      if (isFromMic) {
        speakText(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  const completedCount = microTasks.filter((t) => t.completed).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0C141F",
        color: "#E8EDF1",
        fontFamily: "'Inter', sans-serif",
        padding: "0 0 60px 0",
      }}
    >
      <TestingNavbar />

      <main style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 24px" }}>
        {/* Header Summary */}
        <header style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(175, 106, 251, 0.12)",
              color: "#AF6AFB",
              fontSize: "12px",
              fontWeight: 700,
              border: "1px solid rgba(175, 106, 251, 0.3)",
              marginBottom: "14px",
            }}
          >
            <IconBolt size={14} color="#AF6AFB" />
            <span>Low-Stimulation Neurodivergent Workspace</span>
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: "0 0 10px 0",
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Single-Task Clarity &amp; Anti-Paralysis Focus
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#94A3B8",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Overcome executive dysfunction by chunking overwhelming projects into 5-minute micro-wins with our visual focus arc.
          </p>
        </header>

        {/* 1. 15-Minute Focus Sprint Arc & Controls */}
        <section
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.8)",
            borderRadius: "28px",
            border: "2px solid rgba(175, 106, 251, 0.35)",
            padding: "36px",
            boxShadow: "0 10px 30px rgba(175, 106, 251, 0.12)",
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#AF6AFB",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            15-Minute Focus Sprint
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              color: "#FFFFFF",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.04em",
              margin: "6px 0 20px",
            }}
          >
            {formatTime(secondsLeft)}
          </div>

          {/* Sprint Buttons with Apple-Style Physics */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              style={{
                padding: "14px 32px",
                borderRadius: "16px",
                backgroundColor: isRunning ? "#F59E0B" : "#AF6AFB",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: isRunning
                  ? "0 4px 16px rgba(245, 158, 11, 0.3)"
                  : "0 4px 16px rgba(175, 106, 251, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <IconActivity size={16} color="#FFFFFF" />
              <span>{isRunning ? "Pause Sprint" : "Start 15-Min Sprint"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSecondsLeft(15 * 60)}
              style={{
                padding: "14px 22px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "#E8EDF1",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setSecondsLeft((prev) => prev + 5 * 60)}
              style={{
                padding: "14px 22px",
                borderRadius: "16px",
                backgroundColor: "rgba(175, 106, 251, 0.12)",
                color: "#AF6AFB",
                fontSize: "14px",
                fontWeight: 700,
                border: "1px solid rgba(175, 106, 251, 0.3)",
                cursor: "pointer",
              }}
            >
              +5 Minutes
            </button>
          </div>
        </section>

        {/* 2. Micro-Task Breakdown & Dopamine Wins */}
        <section
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.75)",
            borderRadius: "28px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "28px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  margin: 0,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Active Single-Task Breakdown
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0" }}>
                Focus strictly on the top uncompleted micro-step. Secondary items stay muted.
              </p>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34D399",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              {completedCount} / {microTasks.length} Micro-Wins Completed
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {microTasks.map((task, idx) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: "18px",
                  backgroundColor: task.completed
                    ? "rgba(12, 20, 31, 0.5)"
                    : "rgba(175, 106, 251, 0.08)",
                  border: task.completed
                    ? "1px solid rgba(255, 255, 255, 0.06)"
                    : "1.5px solid #AF6AFB",
                  cursor: "pointer",
                  transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), opacity 140ms ease",
                  opacity: task.completed ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "8px",
                      backgroundColor: task.completed ? "#10B981" : "transparent",
                      border: task.completed ? "none" : "2px solid #AF6AFB",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {task.completed && <IconCheckCircle size={18} color="#FFFFFF" />}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: task.completed ? 400 : 600,
                        color: task.completed ? "#64748B" : "#FFFFFF",
                        textDecoration: task.completed ? "line-through" : "none",
                      }}
                    >
                      Step {idx + 1}: {task.title}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#AF6AFB",
                    backgroundColor: "rgba(175, 106, 251, 0.12)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                  }}
                >
                  {task.minutes} min
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. AI Anti-Paralysis Assistant */}
        <section
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.75)",
            borderRadius: "28px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "28px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <IconBrain size={20} color="#AF6AFB" />
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              AI Executive Function Coach
            </h2>
          </div>

          {/* Quick-Prompt Pills */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleAskCura("I have 5 urgent tasks and feel paralyzed, what should I do?")}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(175, 106, 251, 0.12)",
                border: "1px solid rgba(175, 106, 251, 0.3)",
                color: "#AF6AFB",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <IconBolt size={14} color="#AF6AFB" />
              <span>&quot;I have 5 urgent tasks and feel paralyzed, what should I do?&quot;</span>
            </button>
            <button
              type="button"
              onClick={() => handleAskCura("Help me break down writing a project report into 3 tiny steps")}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94A3B8",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <IconCrosshair size={14} color="#38BDF8" />
              <span>&quot;Break down my project report into 3 tiny steps&quot;</span>
            </button>
          </div>

          {/* Response Box */}
          {aiResponse && (
            <div
              style={{
                backgroundColor: "rgba(12, 20, 31, 0.8)",
                border: "1px solid rgba(175, 106, 251, 0.25)",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontWeight: 700, color: "#AF6AFB", fontSize: "13px" }}>
                  CURA Focus Guidance:
                </span>
                <button
                  type="button"
                  onClick={() => speakText(aiResponse)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: isSpeaking
                      ? "rgba(175, 106, 251, 0.3)"
                      : "rgba(175, 106, 251, 0.15)",
                    color: "#AF6AFB",
                    border: isSpeaking
                      ? "1px solid #AF6AFB"
                      : "1px solid rgba(175, 106, 251, 0.3)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 140ms ease",
                  }}
                >
                  <IconSpeaker size={14} color="#AF6AFB" />
                  <span>
                    {isSpeaking
                      ? "Pause"
                      : isArabicText(aiResponse)
                      ? "استمع بالصوت المصري"
                      : "Listen"}
                  </span>
                </button>
              </div>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.7",
                  margin: 0,
                  color: "#FFFFFF",
                  direction: isArabicText(aiResponse) ? "rtl" : "ltr",
                  textAlign: isArabicText(aiResponse) ? "right" : "left",
                  fontFamily: isArabicText(aiResponse)
                    ? "'Cairo', 'Segoe UI', Tahoma, sans-serif"
                    : "'Inter', sans-serif",
                }}
              >
                {aiResponse}
              </p>
            </div>
          )}

          {/* Collapsible Reasoning */}
          {reasoningTrace && (
            <details
              style={{
                backgroundColor: "rgba(12, 20, 31, 0.6)",
                borderRadius: "14px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#94A3B8",
                marginBottom: "16px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                direction: isArabicText(reasoningTrace) ? "rtl" : "ltr",
                textAlign: isArabicText(reasoningTrace) ? "right" : "left",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 600, color: "#AF6AFB", direction: "ltr" }}>
                Cura AI Cognitive Pacing Trace (&lt;think&gt;)
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  marginTop: "8px",
                  color: "#CBD5E1",
                  lineHeight: "1.6",
                }}
              >
                {reasoningTrace}
              </pre>
            </details>
          )}

          {/* Thinking State */}
          {loading && (
            <div style={{ marginBottom: "16px" }}>
              <ThinkingOrb
                mode="adhd"
                accentColor="#AF6AFB"
                secondsElapsed={elapsedSeconds}
              />
            </div>
          )}

          {/* Input Bar with VoiceMicButton */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <VoiceMicButton
              onTranscript={(transcript) => {
                setQuery(transcript);
                handleAskCura(transcript, true);
              }}
              accentColor="#AF6AFB"
              lang="auto"
              size={18}
              title="Voice dictate your thoughts"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskCura()}
              placeholder={
                isArabicText(query)
                  ? "قول لـ CURA إيه اللي موقفك أو مسبب لك تشتت..."
                  : "Tell CURA what you are stuck on..."
              }
              dir={isArabicText(query) ? "rtl" : "ltr"}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: "16px",
                background: "rgba(12, 20, 31, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "15px",
                outline: "none",
                textAlign: isArabicText(query) ? "right" : "left",
                fontFamily: isArabicText(query)
                  ? "'Cairo', 'Segoe UI', Tahoma, sans-serif"
                  : "'Inter', sans-serif",
              }}
            />
            <button
              type="button"
              onClick={() => handleAskCura()}
              disabled={loading}
              style={{
                padding: "14px 26px",
                borderRadius: "16px",
                backgroundColor: "#AF6AFB",
                color: "#FFFFFF",
                border: "none",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 4px 16px rgba(175, 106, 251, 0.35)",
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              {loading ? "Unwinding..." : "Get Focus Step"}
            </button>
          </div>
        </section>
      </main>

      <TestingFooter />
    </div>
  );
}
