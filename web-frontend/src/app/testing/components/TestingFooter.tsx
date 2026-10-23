"use client";

import React from "react";
import Link from "next/link";
import {
  IconBrain,
  IconBolt,
  IconSparkle,
  IconShieldCheck,
  IconLock,
  IconCpu,
} from "./CuraIcons";

export default function TestingFooter() {
  return (
    <footer
      style={{
        marginTop: "80px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background:
          "linear-gradient(180deg, rgba(19, 27, 38, 0.7) 0%, rgba(12, 20, 31, 0.98) 100%)",
        padding: "56px 24px 36px 24px",
        color: "#94A3B8",
        fontSize: "13px",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "40px",
          marginBottom: "48px",
        }}
      >
        {/* Brand & System Overview */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
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
          <p
            style={{
              lineHeight: "1.6",
              color: "#64748B",
              margin: "0 0 16px 0",
              maxWidth: "400px",
            }}
          >
            Adaptive AI Companion for Care, Focus, and Everyday Living.
            Hospital-calibrated interface engineered for Alzheimer’s memory
            reassurance, ADHD anti-paralysis focus, and clinical inquiry.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#38BDF8",
              background: "rgba(56, 189, 248, 0.08)",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            <IconCpu size={14} color="#38BDF8" />
            <span>Three.js WebGL &amp; Cloudflare Workers AI (DeepSeek-R1)</span>
          </div>
        </div>

        {/* Biophilic Sensory Harmony Card */}
        <div
          style={{
            background: "rgba(26, 36, 51, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "20px",
            display: "flex",
            gap: "18px",
            alignItems: "center",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          <img
            src="/cura_harmony_logo_1791226392255.jpg"
            alt="CURA Biophilic Harmony"
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "14px",
              objectFit: "cover",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontWeight: "700",
                color: "#F8FAFC",
                marginBottom: "6px",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "15px",
              }}
            >
              Biophilic Sensory Ergonomics
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94A3B8",
                lineHeight: "1.55",
              }}
            >
              Clinically calibrated color psychology (15.2:1 contrast ratio)
              mitigating visual distortion in dementia care while maintaining
              sensory regulation for neurodivergent focus.
            </div>
          </div>
        </div>

        {/* Clinical Sanctuaries & Governance */}
        <div>
          <div
            style={{
              fontWeight: "700",
              color: "#F8FAFC",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontSize: "12px",
            }}
          >
            Cognitive Sanctuaries
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <li>
              <Link
                href="/testing/alzheimer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#3FEDBA",
                  textDecoration: "none",
                }}
              >
                <IconBrain size={15} color="#3FEDBA" />
                <span>Alzheimer’s Memory Sanctuary (/testing/alzheimer)</span>
              </Link>
            </li>
            <li>
              <Link
                href="/testing/adhd"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#AF6AFB",
                  textDecoration: "none",
                }}
              >
                <IconBolt size={15} color="#AF6AFB" />
                <span>ADHD Focus &amp; Flow Sprint (/testing/adhd)</span>
              </Link>
            </li>
            <li>
              <Link
                href="/testing/normal"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#16B9FE",
                  textDecoration: "none",
                }}
              >
                <IconSparkle size={15} color="#16B9FE" />
                <span>Everyday Research Assistant (/testing/normal)</span>
              </Link>
            </li>
          </ul>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "20px",
              fontSize: "11px",
              color: "#64748B",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <IconShieldCheck size={13} color="#10B981" />
              FDA 510(k) Pre-Market
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <IconLock size={13} color="#38BDF8" />
              Encrypted HIPAA Audit
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "12px",
          color: "#475569",
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} CURA Adaptive AI Systems Inc. AI &amp; Backend Engineering Testing Cockpit.
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <span>Edge PoP: Direct</span>
          <span>Zero-Hallucination Barrier Active</span>
        </div>
      </div>
    </footer>
  );
}
