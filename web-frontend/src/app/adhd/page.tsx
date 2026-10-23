"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
  const [aiResponse, setAiResponse] = useState<string | null>(
    "Take a slow, deep breath. Having multiple urgent tasks causes decision freeze, and that is completely okay. Let's ignore the big list and pick just ONE tiny 5-minute action: open your workspace and write down the very first sentence. Ready? Let's start our 15-minute focus sprint together!"
  );
  const [reasoningTrace, setReasoningTrace] = useState<string | null>(
    "1. Intent: Executive dysfunction & task paralysis.\n2. Strategy: Eliminate multi-task overwhelm. Enforce single micro-step isolation.\n3. Reward: Attach dopamine milestone upon kickoff."
  );

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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
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
          mode: "adhd",
          patient_id: "adhd-focus-user",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResponse(json.data.response_text);
        setReasoningTrace(json.data.reasoning_content || null);
        speakText(json.data.response_text);
      }
    } catch {
      setAiResponse("Breathe in slowly. Let's pick one single task and work on it for 5 minutes.");
    } finally {
      setLoading(false);
    }
  };

  const completedCount = microTasks.filter((t) => t.completed).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF8FD",
        color: "#1E293B",
        fontFamily: "'Inter', sans-serif",
        padding: "0 0 60px 0",
      }}
    >
      {/* Top Navigation */}
      <nav
        style={{
          height: "64px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#1E293B",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.02em" }}>
                CURA
              </div>
              <div style={{ fontSize: "11px", color: "#7C3AED", fontWeight: "700" }}>
                ADHD Focus &amp; Flow Sanctuary
              </div>
            </div>
          </Link>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "#F1F5F9",
              fontSize: "13px",
              fontWeight: "600",
              color: "#475569",
              textDecoration: "none",
            }}
          >
            ← Mode Hub
          </Link>
          <Link
            href="/alzheimer"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "#F0F7F4",
              border: "1px solid #B2DFDB",
              fontSize: "13px",
              fontWeight: "600",
              color: "#00A884",
              textDecoration: "none",
            }}
          >
            Alzheimer&apos;s Sanctuary →
          </Link>
          <Link
            href="/normal"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "#F0F9FF",
              border: "1px solid #BAE6FD",
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

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Header Summary */}
        <header style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "#EDE9FE",
              color: "#6D28D9",
              fontSize: "12px",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            Low-Stimulation Neurodivergent Workspace
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#1E1B4B",
              margin: "0 0 10px 0",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Single-Task Clarity &amp; Anti-Paralysis Focus
          </h1>
          <p style={{ fontSize: "16px", color: "#64748B", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            Overcome ADHD decision paralysis by chunking overwhelming projects into 5-minute micro-wins with our visual focus arc.
          </p>
        </header>

        {/* 1. 15-Minute Focus Sprint Arc & Controls */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            border: "2px solid #E9D5FF",
            padding: "36px",
            boxShadow: "0 8px 30px rgba(124, 58, 237, 0.06)",
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#6D28D9", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            15-Minute Focus Sprint
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: "900",
              color: "#4C1D95",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.04em",
              margin: "10px 0 20px",
            }}
          >
            {formatTime(secondsLeft)}
          </div>

          {/* Sprint Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                padding: "14px 32px",
                borderRadius: "16px",
                backgroundColor: isRunning ? "#F59E0B" : "#7C3AED",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
              }}
            >
              {isRunning ? "⏸ Pause Sprint" : "▶ Start 15-Min Sprint"}
            </button>
            <button
              onClick={() => setSecondsLeft(15 * 60)}
              style={{
                padding: "14px 20px",
                borderRadius: "16px",
                backgroundColor: "#F1F5F9",
                color: "#475569",
                fontSize: "15px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            <button
              onClick={() => setSecondsLeft((prev) => prev + 5 * 60)}
              style={{
                padding: "14px 20px",
                borderRadius: "16px",
                backgroundColor: "#EDE9FE",
                color: "#6D28D9",
                fontSize: "15px",
                fontWeight: "700",
                border: "none",
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
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            border: "1px solid #E2E8F0",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1E293B", margin: 0 }}>
                Active Single-Task Breakdown
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0" }}>
                Focus strictly on the top uncompleted micro-step. Everything else is secondary.
              </p>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "#ECFDF5",
                color: "#059669",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              {completedCount} / {microTasks.length} Micro-Wins
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
                  backgroundColor: task.completed ? "#F8FAFC" : "#FAF5FF",
                  border: task.completed ? "1px solid #E2E8F0" : "2px solid #C084FC",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  opacity: task.completed ? 0.65 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      backgroundColor: task.completed ? "#10B981" : "#FFFFFF",
                      border: task.completed ? "none" : "2px solid #7C3AED",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    {task.completed && "✓"}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: task.completed ? "500" : "700",
                        color: task.completed ? "#64748B" : "#1E1B4B",
                        textDecoration: task.completed ? "line-through" : "none",
                      }}
                    >
                      Step {idx + 1}: {task.title}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#7C3AED",
                    backgroundColor: "#EDE9FE",
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
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            border: "1px solid #E2E8F0",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "20px" }}>🧠</span>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1E293B", margin: 0 }}>
              AI Executive Function Coach
            </h2>
          </div>

          {/* Quick-Prompt Pill */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleAskCura("I have 5 urgent tasks and feel paralyzed, what should I do?")}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "#F3E8FF",
                border: "1px solid #C084FC",
                color: "#6D28D9",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ⚡ &quot;I have 5 urgent tasks and feel paralyzed, what should I do?&quot;
            </button>
            <button
              onClick={() => handleAskCura("Help me break down writing a project report into 3 tiny steps")}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                color: "#475569",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              📝 &quot;Break down my project report into 3 tiny steps&quot;
            </button>
          </div>

          {/* Response Box */}
          {aiResponse && (
            <div
              style={{
                backgroundColor: "#FAF5FF",
                border: "1.5px solid #E9D5FF",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "700", color: "#7C3AED", fontSize: "13px" }}>
                  CURA Focus Guidance:
                </span>
                <button
                  onClick={() => speakText(aiResponse)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#7C3AED",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  🔊 Listen
                </button>
              </div>
              <p style={{ fontSize: "15px", lineHeight: "1.6", margin: 0, color: "#1E1B4B" }}>
                {aiResponse}
              </p>
            </div>
          )}

          {/* Collapsible Reasoning */}
          {reasoningTrace && (
            <details
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "14px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#475569",
                marginBottom: "16px",
                border: "1px solid #E2E8F0",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: "600", color: "#6D28D9" }}>
                DeepSeek-R1 Cognitive Triage Trace (&lt;think&gt;)
              </summary>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", marginTop: "8px" }}>
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
              placeholder="Tell CURA what you are stuck on..."
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: "16px",
                border: "2px solid #E2E8F0",
                fontSize: "15px",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleAskCura()}
              disabled={loading}
              style={{
                padding: "14px 24px",
                borderRadius: "16px",
                backgroundColor: "#7C3AED",
                color: "#FFFFFF",
                border: "none",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Unwinding..." : "Get Focus Step"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
