"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFlask, IconBrain, IconBolt, IconSparkle, IconCpu, IconActivity } from "./CuraIcons";

export default function TestingNavbar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/testing",
      label: "Cockpit Hub",
      Icon: IconFlask,
      accent: "#16B9FE",
    },
    {
      href: "/testing/alzheimer",
      label: "Alzheimer’s Care",
      Icon: IconBrain,
      accent: "#3FEDBA",
    },
    {
      href: "/testing/adhd",
      label: "ADHD Flow",
      Icon: IconBolt,
      accent: "#AF6AFB",
    },
    {
      href: "/testing/normal",
      label: "Everyday Research",
      Icon: IconSparkle,
      accent: "#60EFEB",
    },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        backgroundColor: "rgba(12, 20, 31, 0.82)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "14px 24px",
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
              width: "36px",
              height: "36px",
              filter: "drop-shadow(0 0 12px rgba(22, 185, 254, 0.45))",
            }}
          />
          <img
            src="/Cura Word.svg"
            alt="CURA Wordmark"
            style={{
              height: "22px",
              width: "auto",
            }}
          />
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "rgba(22, 185, 254, 0.12)",
              color: "#38BDF8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#38BDF8",
                boxShadow: "0 0 6px #38BDF8",
              }}
            />
            Testing Cockpit v2.4
          </span>
        </Link>

        {/* Mode Navigation Pills with Apple Tactile Feedback */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(26, 36, 51, 0.65)",
            padding: "4px 6px",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const ItemIcon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: "none",
                  color: isActive ? "#FFFFFF" : "#94A3B8",
                  backgroundColor: isActive
                    ? `${item.accent}24`
                    : "transparent",
                  border: isActive
                    ? `1px solid ${item.accent}66`
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? `0 2px 10px ${item.accent}20`
                    : "none",
                  transition:
                    "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease-out, color 140ms ease-out",
                }}
              >
                <ItemIcon
                  size={16}
                  color={isActive ? item.accent : "#94A3B8"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Telemetry Beacon (Cloudflare GPU + 60fps WebGL) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34D399",
              fontWeight: 600,
            }}
          >
            <IconSparkle size={14} color="#34D399" />
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#10B981",
                boxShadow: "0 0 6px #10B981",
              }}
            />
            Cura AI Neural Core Active
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: "rgba(22, 185, 254, 0.08)",
              border: "1px solid rgba(22, 185, 254, 0.25)",
              color: "#38BDF8",
              fontWeight: 600,
            }}
          >
            <IconActivity size={14} color="#38BDF8" />
            WebGL: 60 FPS
          </div>
        </div>
      </div>
    </header>
  );
}
