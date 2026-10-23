import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        background: "radial-gradient(circle at 50% 20%, #F8FAFC 0%, #FFFFFF 100%)",
        color: "#0F172A",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Logo */}
        <div style={{ marginBottom: "24px" }}>
          <img
            src="/Cura Logo.svg"
            alt="CURA Logo"
            style={{ width: "180px", height: "auto" }}
          />
        </div>

        {/* Brand Title */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "#0F172A",
            margin: "0 0 12px 0",
            letterSpacing: "-0.03em",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          CURA — Adaptive Healthcare AI
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#64748B",
            lineHeight: "1.6",
            margin: "0 0 32px 0",
          }}
        >
          Adaptive Multimodal AI Assistant for Care, Focus, and Everyday Assistance.
          Production frontend workspace reserved for the Frontend &amp; UI/UX Team.
        </p>

        {/* Backend & AI Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 20px",
            background: "#FFFFFF",
            borderRadius: "9999px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
            fontSize: "13px",
            fontWeight: "600",
            color: "#0284C7",
            marginBottom: "36px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10B981",
              boxShadow: "0 0 8px #10B981",
            }}
          />
          Backend &amp; AI Operational • Cloudflare Workers AI GPU (DeepSeek-R1 32B + Whisper)
        </div>

        {/* Actions for AI & Backend Engineer Testing vs Frontend Team */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <Link
            href="/testing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 32px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: "700",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(2, 132, 199, 0.35)",
              transition: "transform 0.2s ease",
            }}
          >
            🧪 Open AI &amp; Backend Verification Cockpit (/testing) →
          </Link>

          <div
            style={{
              marginTop: "24px",
              padding: "20px 24px",
              borderRadius: "16px",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              textAlign: "left",
              fontSize: "13px",
              color: "#475569",
              lineHeight: "1.6",
            }}
          >
            <div style={{ fontWeight: "700", color: "#0F172A", marginBottom: "6px" }}>
              📌 Frontend Team Notice:
            </div>
            All AI cognitive verification pages have been isolated under the{" "}
            <code>/testing</code> route (
            <Link href="/testing/alzheimer" style={{ color: "#0284C7" }}>
              /testing/alzheimer
            </Link>
            ,{" "}
            <Link href="/testing/adhd" style={{ color: "#0284C7" }}>
              /testing/adhd
            </Link>
            ,{" "}
            <Link href="/testing/normal" style={{ color: "#0284C7" }}>
              /testing/normal
            </Link>
            ). The root workspace is clean and ready for your production UI/UX layouts.
            The backend API is accessible at <code>/api/chat</code> and FastAPI backend at{" "}
            <code>/api/v1/voice/interact-text</code>.
          </div>
        </div>
      </div>
    </main>
  );
}
