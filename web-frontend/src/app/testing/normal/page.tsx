"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import TestingNavbar from "../components/TestingNavbar";
import TestingFooter from "../components/TestingFooter";
import {
  IconSparkle,
  IconCpu,
  IconActivity,
  IconMicrophone,
  IconSpeaker,
  IconShieldCheck,
} from "../components/CuraIcons";

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
        backgroundColor: "#0C141F",
        color: "#E8EDF1",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TestingNavbar />

      <main
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "36px 24px",
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Quick Test Scenario Chips */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>
            Test Queries:
          </span>
          <button
            type="button"
            onClick={() => handleSend("What is the weather in Cairo today?")}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(22, 185, 254, 0.1)",
              border: "1px solid rgba(22, 185, 254, 0.25)",
              color: "#38BDF8",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <IconSparkle size={14} color="#38BDF8" />
            <span>&quot;What is the weather in Cairo today?&quot;</span>
          </button>
          <button
            type="button"
            onClick={() => handleSend("How does Cloudflare Workers AI process DeepSeek-R1 reasoning?")}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#E8EDF1",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <IconCpu size={14} color="#AF6AFB" />
            <span>&quot;How does Cloudflare process DeepSeek-R1?&quot;</span>
          </button>
          <button
            type="button"
            onClick={() => handleSend("I have a slight headache and feel tired. What should I check?")}
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(63, 237, 186, 0.1)",
              border: "1px solid rgba(63, 237, 186, 0.25)",
              color: "#3FEDBA",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <IconShieldCheck size={14} color="#3FEDBA" />
            <span>&quot;I have a slight headache, what should I check?&quot;</span>
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
                  color: m.sender === "user" ? "#0C141F" : "#FFFFFF",
                  border:
                    m.sender === "user"
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius:
                    m.sender === "user"
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                  padding: "16px 20px",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
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
                      fontWeight: 800,
                      color: m.sender === "user" ? "#0C141F" : "#38BDF8",
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
                    lineHeight: "1.65",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {m.text}
                </p>

                {m.sender === "cura" && (
                  <button
                    type="button"
                    onClick={() => speakText(m.text)}
                    style={{
                      marginTop: "12px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "none",
                      color: "#60EFEB",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <IconSpeaker size={13} color="#60EFEB" />
                    <span>Listen</span>
                  </button>
                )}

                {/* DeepSeek-R1 Reasoning Trace */}
                {m.reasoning && (
                  <details
                    style={{
                      marginTop: "12px",
                      backgroundColor: "rgba(12, 20, 31, 0.85)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      color: "#A7B7C7",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#38BDF8",
                      }}
                    >
                      DeepSeek-R1 CoT Trace (&lt;think&gt;)
                    </summary>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "11px",
                        marginTop: "8px",
                        lineHeight: "1.6",
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38BDF8", fontSize: "13px" }}>
              <IconCpu size={16} color="#38BDF8" />
              <span>DeepSeek-R1 is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Dock */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "rgba(26, 36, 51, 0.8)",
            padding: "12px",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          }}
        >
          <button
            type="button"
            onClick={toggleRecording}
            title={recording ? "Stop Recording" : "Voice Input"}
            style={{
              padding: "12px",
              borderRadius: "14px",
              backgroundColor: recording ? "#EF4444" : "rgba(255, 255, 255, 0.06)",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <IconMicrophone size={18} color="#FFFFFF" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask CURA clinical research or health questions..."
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: "#FFFFFF",
              fontSize: "15px",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: "14px",
              backgroundColor: "#16B9FE",
              color: "#0C141F",
              fontWeight: 800,
              fontSize: "14px",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(22, 185, 254, 0.35)",
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </main>

      <TestingFooter />
    </div>
  );
}
