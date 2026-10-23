"use client";

import React, { useState, useRef } from "react";
import { IconMicrophone } from "./CuraIcons";

interface VoiceMicButtonProps {
  onTranscript: (transcript: string) => void;
  accentColor?: string;
  size?: number;
  title?: string;
  lang?: string;
}

export default function VoiceMicButton({
  onTranscript,
  accentColor = "#16B9FE",
  size = 18,
  title = "Click to Speak (Cloudflare Whisper GPU)",
}: VoiceMicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Microphone access is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Determine supported mimeType
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });

        // Send to Cloudflare Workers AI Whisper STT
        await uploadAndTranscribe(audioBlob);
      };

      recorder.start(250); // Slice chunks every 250ms
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone permission error:", err);
      setIsRecording(false);
      alert("Please allow microphone access in your browser to speak to CURA.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadAndTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "voice_input.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.text && data.text.trim()) {
        onTranscript(data.text.trim());
      } else if (!data.success) {
        console.warn("Transcription failed:", data.error);
      }
    } catch (err) {
      console.error("Failed to upload audio to Whisper:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTranscribing}
      title={
        isRecording
          ? "Recording your voice... Click to Stop & Transcribe"
          : isTranscribing
          ? "Transcribing on GPU Whisper..."
          : title
      }
      style={{
        padding: "12px",
        borderRadius: "14px",
        backgroundColor: isRecording
          ? "#EF4444"
          : isTranscribing
          ? "rgba(22, 185, 254, 0.2)"
          : "rgba(255, 255, 255, 0.06)",
        border: isRecording
          ? "2px solid #EF4444"
          : isTranscribing
          ? "1px solid #16B9FE"
          : "1px solid rgba(255, 255, 255, 0.12)",
        color: isRecording ? "#FFFFFF" : isTranscribing ? "#16B9FE" : accentColor,
        cursor: isTranscribing ? "wait" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 140ms cubic-bezier(0.23, 1, 0.32, 1)",
        boxShadow: isRecording
          ? "0 0 18px rgba(239, 68, 68, 0.6)"
          : isTranscribing
          ? "0 0 14px rgba(22, 185, 254, 0.4)"
          : "none",
        position: "relative",
      }}
    >
      <IconMicrophone
        size={size}
        color={isRecording ? "#FFFFFF" : isTranscribing ? "#16B9FE" : accentColor}
      />

      {/* Recording Pulse Animation */}
      {isRecording && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#EF4444",
            boxShadow: "0 0 10px #EF4444",
            animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />
      )}

      {/* Transcribing Indicator */}
      {isTranscribing && (
        <span
          style={{
            position: "absolute",
            bottom: "-6px",
            fontSize: "9px",
            fontWeight: 800,
            color: "#16B9FE",
            backgroundColor: "#0C141F",
            padding: "0 4px",
            borderRadius: "4px",
          }}
        >
          AI...
        </span>
      )}
    </button>
  );
}
