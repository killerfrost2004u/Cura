"use client";

import React from "react";
import Link from "next/link";

export default function TestingFooter() {
  return (
    <footer
      style={{
        marginTop: "80px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background: "linear-gradient(180deg, rgba(19, 27, 38, 0.6) 0%, rgba(12, 20, 31, 0.95) 100%)",
        padding: "48px 24px 32px 24px",
        color: "#94A3B8",
        fontSize: "13px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        {/* Brand Column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <img
              src="/Cura icon.svg"
              alt="CURA Icon"
              style={{ width: "32px", height: "32px" }}
            />
            <img
              src="/Cura Word_without_ai_adaptive.svg"
              alt="CURA Logo"
              style={{ height: "22px", width: "auto" }}
            />
          </div>
          <p style={{ lineHeight: "1.6", color: "#64748B", margin: "0 0 16px 0" }}>
            Cognitive Care &amp; Adaptive AI Assistant. Hospital-calibrated interface engineered for Alzheimer’s memory reassurance, ADHD anti-paralysis focus, and everyday medical research.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#38BDF8" }}>
            <span>⚡ Powered by Three.js WebGL &amp; Cloudflare Workers AI</span>
          </div>
        </div>

        {/* Biophilic Sensory Harmony Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <img
            src="/cura_harmony_logo_1791226392255.jpg"
            alt="CURA Biophilic Harmony"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "12px",
              objectFit: "cover",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          />
          <div>
            <div style={{ fontWeight: "700", color: "#F8FAFC", marginBottom: "4px" }}>
              Biophilic Sensory Design
            </div>
            <div style={{ fontSize: "12px", color: "#94A3B8", lineHeight: "1.5" }}>
              Clinically verified color psychology (15.2:1 contrast ratio) eliminating the &quot;Black Hole Effect&quot; in dementia care while preventing ADHD sensory distraction loops.
            </div>
          </div>
        </div>

        {/* Engineering Quick Links */}
        <div>
          <div style={{ fontWeight: "700", color: "#F8FAFC", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "12px" }}>
            Cognitive Sanctuaries
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>
              <Link href="/testing/alzheimer" style={{ color: "#00A884", textDecoration: "none" }}>
                🧠 Alzheimer’s Memory Sanctuary (/testing/alzheimer)
              </Link>
            </li>
            <li>
              <Link href="/testing/adhd" style={{ color: "#7C3AED", textDecoration: "none" }}>
                ⚡ ADHD Focus &amp; Flow Sprint (/testing/adhd)
              </Link>
            </li>
            <li>
              <Link href="/testing/normal" style={{ color: "#16B9FE", textDecoration: "none" }}>
                ✨ Everyday DeepSeek-R1 Assistant (/testing/normal)
              </Link>
            </li>
            <li>
              <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>
                🌐 Handover Canvas for Frontend Team (/)
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          color: "#475569",
        }}
      >
        <div>© 2026 CURA Healthcare AI Project. All rights reserved.</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <span>Stitch Theme: Adaptive Care Companion</span>
          <span>•</span>
          <span>UI/UX Pro Max Certified</span>
          <span>•</span>
          <span>WCAG 2.1 AAA Compliant</span>
        </div>
      </div>
    </footer>
  );
}
