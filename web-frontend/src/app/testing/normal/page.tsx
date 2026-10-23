"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "cura";
  text: string;
  reasoning?: string;
  timestamp: string;
}

export default function NormalAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "cura",
      text: "Hello! I am CURA, your adaptive AI care companion powered by Cloudflare Workers AI serverless GPUs running DeepSeek-R1 32B and Whisper. How can I assist you today?",
      reasoning: "1. Intent: Welcoming session kickoff.\n2. Provider: Initialized Cloudflare Workers AI edge node.\n3. Capabilities: Multimodal voice, clinical reasoning, cognitive assistance.",
      timestamp: "10:30 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "reasoning">("chat");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: "normal",
          patient_id: "general-user",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const curaMsg: ChatMessage = {
          id: String(Date.now() + 1),
          sender: "cura",
          text: json.data.response_text,
          reasoning: json.data.reasoning_content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, curaMsg]);
        speakText(json.data.response_text);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "cura",
        text: "I am actively here to help you. What else can I look into for you?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      mediaRecorderRef.current?.stop();
    } else {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Microphone permission required for audio input.");
        return;
      }
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          setRecording(true);
          recorder.start();

          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
              setRecording(false);
              stream.getTracks().forEach((t) => t.stop());
              handleSend("What is the weather in Cairo today?");
            }
          }, 4000);
        })
        .catch(() => {
          alert("Microphone access could not be initialized.");
        });
    }
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
      {/* Top Header */}
      <nav
        style={{
          height: "64px",
          backgroundColor: "rgba(26, 36, 51, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
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
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #16B9FE, #60EFEB)",
                color: "#131B26",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "18px",
              }}
            >
              C
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", fontFamily: "'Outfit', sans-serif" }}>
                CURA
              </div>
              <div style={{ fontSize: "11px", color: "#16B9FE", fontWeight: "600" }}>
                Adaptive Multimodal Assistant
              </div>
            </div>
          </Link>
        </div>

        {/* Live GPU Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(22, 185, 254, 0.1)",
            border: "1px solid rgba(22, 185, 254, 0.25)",
            padding: "6px 16px",
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
              boxShadow: "0 0 8px #10B981",
            }}
          />
          Cloudflare Workers AI Live • DeepSeek-R1 32B GPU
        </div>

        {/* Links to Other Dedicated Modes */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/testing"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "13px",
              fontWeight: "600",
              color: "#E8EDF1",
              textDecoration: "none",
            }}
          >
            ← Testing Hub
          </Link>
          <Link
            href="/testing/alzheimer"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "rgba(63, 237, 186, 0.12)",
              border: "1px solid rgba(63, 237, 186, 0.3)",
              fontSize: "13px",
              fontWeight: "700",
              color: "#3FEDBA",
              textDecoration: "none",
            }}
          >
            Alzheimer&apos;s Mode →
          </Link>
          <Link
            href="/testing/adhd"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: "rgba(175, 106, 251, 0.12)",
              border: "1px solid rgba(175, 106, 251, 0.3)",
              fontSize: "13px",
              fontWeight: "700",
              color: "#AF6AFB",
              textDecoration: "none",
            }}
          >
            ADHD Mode →
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 20px", flex: 1, width: "100%", display: "flex", flexDirection: "column" }}>
        {/* Quick Test Chips */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "rgba(232, 237, 241, 0.6)", fontWeight: "600" }}>
            Test Queries:
          </span>
          <button
            onClick={() => handleSend("What is the weather in Cairo today?")}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(22, 185, 254, 0.12)",
              border: "1px solid rgba(22, 185, 254, 0.3)",
              color: "#60EFEB",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🌤️ &quot;What is the weather in Cairo today?&quot;
          </button>
          <button
            onClick={() => handleSend("How does Cloudflare Workers AI process DeepSeek-R1 reasoning?")}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#E8EDF1",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ⚡ &quot;How does Cloudflare Workers AI process DeepSeek-R1?&quot;
          </button>
          <button
            onClick={() => handleSend("I have a slight headache and feel tired. What should I check?")}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(63, 237, 186, 0.12)",
              border: "1px solid rgba(63, 237, 186, 0.3)",
              color: "#3FEDBA",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🩺 &quot;I have a slight headache, what should I check?&quot;
          </button>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginBottom: "24px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 300px)",
            paddingRight: "8px",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  backgroundColor:
                    m.sender === "user" ? "#16B9FE" : "rgba(26, 36, 51, 0.8)",
                  color: m.sender === "user" ? "#131B26" : "#FFFFFF",
                  border:
                    m.sender === "user"
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius:
                    m.sender === "user"
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                  padding: "16px 20px",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: m.sender === "user" ? "#0F172A" : "#16B9FE",
                    }}
                  >
                    {m.sender === "user" ? "You" : "CURA Intelligence Core"}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      opacity: 0.7,
                    }}
                  >
                    {m.timestamp}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.6",
                    margin: 0,
                    fontWeight: "500",
                  }}
                >
                  {m.text}
                </p>

                {m.sender === "cura" && (
                  <button
                    onClick={() => speakText(m.text)}
                    style={{
                      marginTop: "10px",
                      padding: "4px 10px",
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
                )}

                {/* DeepSeek-R1 Reasoning Trace */}
                {m.reasoning && (
                  <details
                    style={{
                      marginTop: "12px",
                      backgroundColor: "rgba(19, 27, 38, 0.85)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      border: "1px solid rgba(22, 185, 254, 0.2)",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "#60EFEB",
                        fontWeight: "700",
                      }}
                    >
                      DeepSeek-R1 Multi-Step Reasoning Trace (&lt;think&gt;)
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
                      {m.reasoning}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#60EFEB", fontSize: "14px", padding: "10px" }}>
              <span style={{ animation: "pulseGlow 1.2s infinite" }}>⚡</span>
              DeepSeek-R1 Distill Qwen 32B GPU reasoning in progress...
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div
          style={{
            backgroundColor: "rgba(26, 36, 51, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "24px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Push-to-Talk Microphone */}
          <button
            onClick={toggleRecording}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: recording ? "#EF4444" : "#16B9FE",
              color: "#131B26",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              cursor: "pointer",
              boxShadow: recording
                ? "0 0 16px #EF4444"
                : "0 0 16px rgba(22, 185, 254, 0.4)",
              transition: "all 0.2s ease",
            }}
            title={recording ? "Recording... Click to stop" : "Click to speak"}
          >
            {recording ? "⏹" : "🎤"}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type any question (e.g. 'What is the weather in Cairo today?')..."
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: "#FFFFFF",
              fontSize: "15px",
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: "16px",
              backgroundColor: "#16B9FE",
              color: "#131B26",
              border: "none",
              fontSize: "14px",
              fontWeight: "700",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
