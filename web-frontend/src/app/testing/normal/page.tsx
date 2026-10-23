"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import TestingNavbar from "../components/TestingNavbar";
import TestingFooter from "../components/TestingFooter";
import VoiceMicButton from "../components/VoiceMicButton";
import { speakNaturalText, stopSpeaking, isArabicText } from "../utils/speech";
import {
  IconSparkle,
  IconCpu,
  IconActivity,
  IconSpeaker,
  IconShieldCheck,
  IconClock,
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
      text: "Hello! I am CURA, your adaptive AI care companion powered by Cloudflare Workers AI serverless GPUs running DeepSeek-R1 32B and Whisper. How can I assist your health and research today?",
      reasoning: "1. Intent: Welcoming research session kickoff.\n2. Provider: Cloudflare Workers AI edge node.\n3. Capabilities: Multimodal voice, deep mathematical reasoning, bilingual clinical assistance.",
      timestamp: "10:30 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Timer for reasoning latency display
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

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      setCurrentlySpeakingId(null);
      return;
    }

    setCurrentlySpeakingId(msgId);
    speakNaturalText(text, {
      preferEgyptian: true,
      onEnd: () => setCurrentlySpeakingId(null),
      onError: () => setCurrentlySpeakingId(null),
    });
  };

  const handleSend = async (textToSend?: string, isFromMic = false) => {
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
        const curaMsgId = String(Date.now() + 1);
        const curaMsg: ChatMessage = {
          id: curaMsgId,
          sender: "cura",
          text: json.data.response_text,
          reasoning: json.data.reasoning_content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, curaMsg]);

        // Only auto-speak if user explicitly requested voice (via mic) or enabled autoSpeak toggle
        if (isFromMic || autoSpeak) {
          handleSpeakMessage(curaMsgId, json.data.response_text);
        }
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "cura",
        text: isArabicText(text)
          ? "أنا معك هنا للمساعدة في أي استفسار طبي أو بحثي. كيف أستطيع خدمتك الآن؟"
          : "I am actively here to help you. What else can I look into for you?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const isInputArabic = isArabicText(inputText);

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
        {/* Header Controls: Auto-Speak Toggle & DeepSeek Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "rgba(26, 36, 51, 0.6)",
            padding: "12px 18px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#16B9FE",
                boxShadow: "0 0 10px #16B9FE",
              }}
            />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
              Everyday Research &amp; Clinical Reasoning
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#94A3B8",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              Cloudflare DeepSeek-R1 (10-15s CoT)
            </span>
          </div>

          {/* Auto-Voice Replies Toggle Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "12px",
                color: autoSpeak ? "#16B9FE" : "#94A3B8",
                fontWeight: 600,
              }}
            >
              <span>Auto-Voice Replies:</span>
              <button
                type="button"
                onClick={() => setAutoSpeak(!autoSpeak)}
                style={{
                  width: "42px",
                  height: "22px",
                  borderRadius: "9999px",
                  backgroundColor: autoSpeak ? "#16B9FE" : "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background-color 150ms ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: autoSpeak ? "23px" : "3px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    transition: "left 150ms ease",
                  }}
                />
              </button>
            </label>
          </div>
        </div>

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
          {/* Math Comparison Test */}
          <button
            type="button"
            onClick={() => handleSend("tell me the difference a square root and cubic root")}
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
            }}
          >
            <IconSparkle size={14} color="#38BDF8" />
            <span>&quot;Square Root vs Cubic Root&quot;</span>
          </button>
          {/* Arabic Math Comparison Test */}
          <button
            type="button"
            onClick={() => handleSend("ما هو الفرق بين الجذر التربيعي والتكعيبي؟")}
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
              direction: "rtl",
            }}
          >
            <IconSparkle size={14} color="#3FEDBA" />
            <span>&quot;ما الفرق بين الجذر التربيعي والتكعيبي؟&quot;</span>
          </button>
          {/* Cairo Weather */}
          <button
            type="button"
            onClick={() => handleSend("What is the weather in Cairo today?")}
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
            }}
          >
            <IconCpu size={14} color="#AF6AFB" />
            <span>&quot;Weather in Cairo&quot;</span>
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
          {messages.map((m) => {
            const isMsgArabic = isArabicText(m.text);
            const isSpeaking = currentlySpeakingId === m.id;

            return (
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
                    direction: isMsgArabic ? "rtl" : "ltr",
                    textAlign: isMsgArabic ? "right" : "left",
                    fontFamily: isMsgArabic
                      ? "'Cairo', 'Segoe UI', Tahoma, sans-serif"
                      : "'Inter', sans-serif",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "14px",
                      marginBottom: "8px",
                      direction: "ltr", // keep metadata bar unified
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
                      lineHeight: "1.7",
                      margin: 0,
                      fontWeight: 500,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.text}
                  </p>

                  {m.sender === "cura" && (
                    <div
                      style={{
                        marginTop: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        direction: "ltr",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(m.id, m.text)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          backgroundColor: isSpeaking
                            ? "rgba(96, 239, 235, 0.25)"
                            : "rgba(255, 255, 255, 0.08)",
                          border: isSpeaking
                            ? "1px solid #60EFEB"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          color: "#60EFEB",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 140ms ease",
                        }}
                      >
                        <IconSpeaker size={14} color="#60EFEB" />
                        <span>{isSpeaking ? "Pause Audio" : isMsgArabic ? "استمع بالصوت المصري" : "Listen (Neural Voice)"}</span>
                      </button>
                    </div>
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
                        direction: isArabicText(m.reasoning) ? "rtl" : "ltr",
                        textAlign: isArabicText(m.reasoning) ? "right" : "left",
                      }}
                    >
                      <summary
                        style={{
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "#38BDF8",
                          direction: "ltr",
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
                          color: "#CBD5E1",
                        }}
                      >
                        {m.reasoning}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                color: "#38BDF8",
                fontSize: "13px",
                padding: "10px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(22, 185, 254, 0.08)",
                border: "1px solid rgba(22, 185, 254, 0.2)",
                alignSelf: "flex-start",
              }}
            >
              <IconCpu size={16} color="#38BDF8" />
              <span>DeepSeek-R1 is thinking on Cloudflare GPU...</span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  backgroundColor: "rgba(22, 185, 254, 0.2)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {elapsedSeconds}s
              </span>
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
            alignItems: "center",
          }}
        >
          {/* Real Microphone with Egyptian Arabic & English Web Speech */}
          <VoiceMicButton
            onTranscript={(transcript) => {
              setInputText(transcript);
              handleSend(transcript, true);
            }}
            accentColor="#16B9FE"
            size={18}
            title="Speak in Arabic or English"
          />

          {/* Dynamic RTL & BiDi Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              isInputArabic
                ? "اسأل CURA عن الأبحاث الطبية، المفاهيم الرياضية، أو صحتك..."
                : "Ask CURA clinical research, math, or health questions..."
            }
            dir={isInputArabic ? "rtl" : "ltr"}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              color: "#FFFFFF",
              fontSize: "15px",
              outline: "none",
              textAlign: isInputArabic ? "right" : "left",
              fontFamily: isInputArabic
                ? "'Cairo', 'Segoe UI', Tahoma, sans-serif"
                : "'Inter', sans-serif",
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
