"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TestingNavbar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/testing",
      label: "Cockpit Hub",
      icon: "🧪",
      accent: "#0284C7",
    },
    {
      href: "/testing/alzheimer",
      label: "Alzheimer’s Care",
      icon: "🧠",
      accent: "#00A884",
    },
    {
      href: "/testing/adhd",
      label: "ADHD Flow",
      icon: "⚡",
      accent: "#7C3AED",
    },
    {
      href: "/testing/normal",
      label: "Everyday Assistant",
      icon: "✨",
      accent: "#16B9FE",
    },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: "rgba(19, 27, 38, 0.85)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Brand Lockup: Cura icon.svg + Cura Word.svg */}
        <Link
          href="/testing"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          <img
            src="/Cura icon.svg"
            alt="CURA Icon"
            style={{
              width: "38px",
              height: "38px",
              filter: "drop-shadow(0 0 10px rgba(22, 185, 254, 0.4))",
            }}
          />
          <img
            src="/Cura Word.svg"
            alt="CURA Wordmark"
            style={{
              height: "24px",
              width: "auto",
            }}
          />
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              background: "rgba(2, 132, 199, 0.15)",
              color: "#38BDF8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
            }}
          >
            Engineering Test Suite
          </span>
        </Link>

        {/* Central Switcher Pills */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(12, 20, 31, 0.7)",
            padding: "4px 6px",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 16px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: isActive ? "700" : "500",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  backgroundColor: isActive
                    ? link.accent
                    : "transparent",
                  color: isActive ? "#FFFFFF" : "#94A3B8",
                  boxShadow: isActive
                    ? `0 2px 12px ${link.accent}55`
                    : "none",
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Backend & AI Telemetry Pill + Root Handover Link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontSize: "12px",
              color: "#34D399",
              fontWeight: "600",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 8px #10B981",
              }}
            />
            Cloudflare GPU • DeepSeek-R1 32B
          </div>

          <Link
            href="/"
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#94A3B8",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transition: "color 0.2s ease",
            }}
          >
            ← Frontend Root
          </Link>
        </div>
      </div>
    </header>
  );
}
